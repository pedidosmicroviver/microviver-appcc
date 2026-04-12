"use client";

import { useState, useEffect, useCallback } from "react";
import { TabId, MateriaPrima, Fermentacion, ProductoStock, PCC, Incidencia, HojaProduccion, HojaEnvasado, Envase, PlanLimpieza } from "./lib/types";
import {
  loadFromSupabase,
  loadFermentaciones,
  loadPCCs,
  loadLimpieza,
  saveToSupabase,
  deleteFromSupabase,
  toSnakeCase,
} from "./lib/storage";
import { supabase } from "./lib/supabase";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import MateriasPrimas from "./components/MateriasPrimas";
import CamaraFermentacion from "./components/CamaraFermentacion";
import HojasProduccion from "./components/HojasProduccion";
import HojasEnvasado from "./components/HojasEnvasado";
import PCCModule from "./components/PCCModule";
import Stock from "./components/Stock";
import Trazabilidad from "./components/Trazabilidad";
import Incidencias from "./components/Incidencias";
import EnvasesComponent from "./components/Envases";
import Limpieza from "./components/Limpieza";
import CursoFormacion from "./components/CursoFormacion";
import FirmaDigital from "./components/FirmaDigital";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([]);
  const [fermentaciones, setFermentaciones] = useState<Fermentacion[]>([]);
  const [productos, setProductos] = useState<ProductoStock[]>([]);
  const [pccsComp, setPccsComp] = useState<PCC[]>([]);
  const [pccsAlim, setPccsAlim] = useState<PCC[]>([]);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [producciones, setProducciones] = useState<HojaProduccion[]>([]);
  const [envasados, setEnvasados] = useState<HojaEnvasado[]>([]);
  const [envases, setEnvases] = useState<Envase[]>([]);
  const [planesLimpieza, setPlanesLimpieza] = useState<PlanLimpieza[]>([]);

  const loadAllData = useCallback(async () => {
    try {
      const [mp, ferm, prod, pccC, pccA, inc, prods, envs, envasesData, limpData] = await Promise.all([
        loadFromSupabase<MateriaPrima>("materias_primas", { orderBy: "created_at" }),
        loadFermentaciones(),
        loadFromSupabase<ProductoStock>("productos", { orderBy: "nombre" }),
        loadPCCs("complemento"),
        loadPCCs("alimento"),
        loadFromSupabase<Incidencia>("incidencias", { orderBy: "fecha" }),
        loadFromSupabase<HojaProduccion>("producciones", { orderBy: "fecha" }),
        loadFromSupabase<HojaEnvasado>("envasados", { orderBy: "fecha" }),
        loadFromSupabase<Envase>("envases", { orderBy: "created_at" }),
        loadLimpieza(),
      ]);
      setMateriasPrimas(mp);
      setFermentaciones(ferm);
      setProductos(prod);
      setPccsComp(pccC);
      setPccsAlim(pccA);
      setIncidencias(inc);
      setProducciones(prods);
      setEnvasados(envs);
      setEnvases(envasesData);
      setPlanesLimpieza(limpData);
    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadAllData();
  }, [loadAllData]);

  // Generic sync function: saves full array to Supabase
  const syncArray = useCallback(async (
    table: string,
    newData: Record<string, unknown>[],
    oldData: Record<string, unknown>[]
  ) => {
    // Find deleted items
    const newIds = new Set(newData.map(d => d.id));
    const deletedItems = oldData.filter(d => !newIds.has(d.id));

    // Delete removed items
    for (const item of deletedItems) {
      await deleteFromSupabase(table, item.id as string);
    }

    // Upsert all current items (exclude nested objects that belong to other tables)
    for (const item of newData) {
      const cleanItem = { ...item };
      // Remove nested arrays that are stored in separate tables
      delete cleanItem.controles;
      await saveToSupabase(table, cleanItem);
    }
  }, []);

  // Handlers that sync to Supabase
  const handleMPChange = useCallback(async (newData: MateriaPrima[]) => {
    const old = materiasPrimas;
    setMateriasPrimas(newData);
    await syncArray("materias_primas", newData as unknown as Record<string, unknown>[], old as unknown as Record<string, unknown>[]);
  }, [materiasPrimas, syncArray]);

  const handleFermentacionesChange = useCallback(async (newData: Fermentacion[]) => {
    const old = fermentaciones;
    setFermentaciones(newData);
    // Sync fermentaciones (without controles)
    const newIds = new Set(newData.map(d => d.id));
    const deleted = old.filter(d => !newIds.has(d.id));
    for (const item of deleted) {
      await deleteFromSupabase("fermentaciones", item.id);
    }
    for (const item of newData) {
      const { controles, ...rest } = item;
      await saveToSupabase("fermentaciones", rest as unknown as Record<string, unknown>);
      // Sync controles
      if (controles) {
        for (const control of controles) {
          const snakeControl = toSnakeCase({ ...control, fermentacionId: item.id } as unknown as Record<string, unknown>);
          await supabase.from("controles_fermentacion").upsert(snakeControl);
        }
      }
    }
  }, [fermentaciones]);

  const handleProductosChange = useCallback(async (newData: ProductoStock[]) => {
    const old = productos;
    setProductos(newData);
    await syncArray("productos", newData as unknown as Record<string, unknown>[], old as unknown as Record<string, unknown>[]);
  }, [productos, syncArray]);

  const handlePccsCompChange = useCallback(async (newData: PCC[]) => {
    const old = pccsComp;
    setPccsComp(newData);
    const newIds = new Set(newData.map(d => d.id));
    const deleted = old.filter(d => !newIds.has(d.id));
    for (const item of deleted) {
      await deleteFromSupabase("pccs", item.id);
    }
    for (const item of newData) {
      const { controles, ...rest } = item;
      await saveToSupabase("pccs", rest as unknown as Record<string, unknown>);
      if (controles) {
        for (const control of controles) {
          const snakeControl = toSnakeCase(control as unknown as Record<string, unknown>);
          await supabase.from("controles_pcc").upsert(snakeControl);
        }
      }
    }
  }, [pccsComp]);

  const handlePccsAlimChange = useCallback(async (newData: PCC[]) => {
    const old = pccsAlim;
    setPccsAlim(newData);
    const newIds = new Set(newData.map(d => d.id));
    const deleted = old.filter(d => !newIds.has(d.id));
    for (const item of deleted) {
      await deleteFromSupabase("pccs", item.id);
    }
    for (const item of newData) {
      const { controles, ...rest } = item;
      await saveToSupabase("pccs", rest as unknown as Record<string, unknown>);
      if (controles) {
        for (const control of controles) {
          const snakeControl = toSnakeCase(control as unknown as Record<string, unknown>);
          await supabase.from("controles_pcc").upsert(snakeControl);
        }
      }
    }
  }, [pccsAlim]);

  const handleIncidenciasChange = useCallback(async (newData: Incidencia[]) => {
    const old = incidencias;
    setIncidencias(newData);
    await syncArray("incidencias", newData as unknown as Record<string, unknown>[], old as unknown as Record<string, unknown>[]);
  }, [incidencias, syncArray]);

  const handleProduccionesChange = useCallback(async (newData: HojaProduccion[]) => {
    const old = producciones;
    setProducciones(newData);
    await syncArray("producciones", newData as unknown as Record<string, unknown>[], old as unknown as Record<string, unknown>[]);
  }, [producciones, syncArray]);

  const handleEnvasadosChange = useCallback(async (newData: HojaEnvasado[]) => {
    const old = envasados;
    setEnvasados(newData);
    await syncArray("envasados", newData as unknown as Record<string, unknown>[], old as unknown as Record<string, unknown>[]);
  }, [envasados, syncArray]);

  const handleEnvasesChange = useCallback(async (newData: Envase[]) => {
    const old = envases;
    setEnvases(newData);
    await syncArray("envases", newData as unknown as Record<string, unknown>[], old as unknown as Record<string, unknown>[]);
  }, [envases, syncArray]);

  const handleLimpiezaChange = useCallback(async (newData: PlanLimpieza[]) => {
    const old = planesLimpieza;
    setPlanesLimpieza(newData);
    // Sync planes (without registros)
    const newIds = new Set(newData.map(d => d.id));
    const deleted = old.filter(d => !newIds.has(d.id));
    for (const item of deleted) {
      await deleteFromSupabase("planes_limpieza", item.id);
    }
    for (const item of newData) {
      const { registros, ...rest } = item;
      await saveToSupabase("planes_limpieza", rest as unknown as Record<string, unknown>);
      if (registros) {
        for (const reg of registros) {
          const snakeReg = toSnakeCase({ ...reg, planId: item.id } as unknown as Record<string, unknown>);
          await supabase.from("registros_limpieza").upsert(snakeReg);
        }
      }
    }
  }, [planesLimpieza]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
            M
          </div>
          <p className="text-lg font-semibold text-slate-700">Microviver APPCC</p>
          <p className="text-sm text-slate-400 mt-1">Conectando con base de datos...</p>
          <div className="mt-4 w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabId)} />

      {/* Main content */}
      <div className="flex-1 md:ml-56 flex flex-col h-screen overflow-hidden pt-14 md:pt-0">
        {/* Header - hidden on mobile (mobile has top bar) */}
        <header className="hidden md:block bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {activeTab === "dashboard" && "Panel de Control"}
                {activeTab === "mp" && "Materias Primas"}
                {activeTab === "camara" && "Camara de Fermentacion"}
                {activeTab === "produccion" && "Hojas de Produccion"}
                {activeTab === "envasado" && "Hojas de Envasado"}
                {activeTab === "pcc_comp" && "PCC Complementos"}
                {activeTab === "pcc_alim" && "PCC Alimentos"}
                {activeTab === "stock" && "Control de Stock"}
                {activeTab === "trazabilidad" && "Trazabilidad"}
                {activeTab === "incidencias" && "Incidencias"}
                {activeTab === "envases" && "Envases y Material de Envasado"}
                {activeTab === "limpieza" && "Limpieza y Desinfeccion"}
                {activeTab === "formacion" && "Curso de Formacion"}
                {activeTab === "firma" && "Firma Digital"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Sistema de Autocontrol y Trazabilidad</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            {activeTab === "dashboard" && (
              <Dashboard
                materiasPrimas={materiasPrimas}
                fermentaciones={fermentaciones}
                productos={productos}
                incidencias={incidencias}
              />
            )}
            {activeTab === "mp" && (
              <MateriasPrimas data={materiasPrimas} onChange={handleMPChange} />
            )}
            {activeTab === "camara" && (
              <CamaraFermentacion
                data={fermentaciones}
                onChange={handleFermentacionesChange}
                materiasPrimas={materiasPrimas}
              />
            )}
            {activeTab === "produccion" && (
              <HojasProduccion
                data={producciones}
                onChange={handleProduccionesChange}
                materiasPrimas={materiasPrimas}
                fermentaciones={fermentaciones}
              />
            )}
            {activeTab === "envasado" && (
              <HojasEnvasado
                data={envasados}
                onChange={handleEnvasadosChange}
                producciones={producciones}
              />
            )}
            {activeTab === "pcc_comp" && (
              <PCCModule pccs={pccsComp} onChange={handlePccsCompChange} tipo="complemento" />
            )}
            {activeTab === "pcc_alim" && (
              <PCCModule pccs={pccsAlim} onChange={handlePccsAlimChange} tipo="alimento" />
            )}
            {activeTab === "stock" && (
              <Stock productos={productos} onChange={handleProductosChange} />
            )}
            {activeTab === "trazabilidad" && (
              <Trazabilidad
                productos={productos}
                fermentaciones={fermentaciones}
                materiasPrimas={materiasPrimas}
                producciones={producciones}
                envasados={envasados}
              />
            )}
            {activeTab === "incidencias" && (
              <Incidencias data={incidencias} onChange={handleIncidenciasChange} />
            )}
            {activeTab === "envases" && (
              <EnvasesComponent data={envases} onChange={handleEnvasesChange} />
            )}
            {activeTab === "limpieza" && (
              <Limpieza data={planesLimpieza} onChange={handleLimpiezaChange} />
            )}
            {activeTab === "formacion" && <CursoFormacion />}
            {activeTab === "firma" && <FirmaDigital />}
          </div>
        </main>
      </div>
    </div>
  );
}
