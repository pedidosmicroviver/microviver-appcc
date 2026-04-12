"use client";

import { useState, useEffect, useCallback } from "react";
import { TabId, MateriaPrima, Fermentacion, ProductoStock, PCC, Incidencia, HojaProduccion, HojaEnvasado } from "./lib/types";
import {
  loadFromSupabase,
  loadFermentaciones,
  loadPCCs,
  saveToSupabase,
  deleteFromSupabase,
  toSnakeCase,
} from "./lib/storage";
import { supabase } from "./lib/supabase";
import BottomNav from "./components/BottomNav";
import Dashboard from "./components/Dashboard";
import MateriasPrimas from "./components/MateriasPrimas";
import CamaraFermentacion from "./components/CamaraFermentacion";
import HojasProduccion from "./components/HojasProduccion";
import HojasEnvasado from "./components/HojasEnvasado";
import PCCModule from "./components/PCCModule";
import Stock from "./components/Stock";
import Trazabilidad from "./components/Trazabilidad";
import Incidencias from "./components/Incidencias";
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

  const loadAllData = useCallback(async () => {
    try {
      const [mp, ferm, prod, pccC, pccA, inc, prods, envs] = await Promise.all([
        loadFromSupabase<MateriaPrima>("materias_primas", { orderBy: "created_at" }),
        loadFermentaciones(),
        loadFromSupabase<ProductoStock>("productos", { orderBy: "nombre" }),
        loadPCCs("complemento"),
        loadPCCs("alimento"),
        loadFromSupabase<Incidencia>("incidencias", { orderBy: "fecha" }),
        loadFromSupabase<HojaProduccion>("producciones", { orderBy: "fecha" }),
        loadFromSupabase<HojaEnvasado>("envasados", { orderBy: "fecha" }),
      ]);
      setMateriasPrimas(mp);
      setFermentaciones(ferm);
      setProductos(prod);
      setPccsComp(pccC);
      setPccsAlim(pccA);
      setIncidencias(inc);
      setProducciones(prods);
      setEnvasados(envs);
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

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">&#127807;</div>
          <p className="text-lg text-slate-600">Cargando Microviver APPCC...</p>
          <p className="text-sm text-slate-400 mt-2">Conectando con base de datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-green-700 text-white px-4 py-3 sticky top-0 z-40 shadow-md">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">Microviver APPCC</h1>
            <p className="text-green-200 text-xs">
              Sistema de Autocontrol y Trazabilidad
            </p>
          </div>
          <div className="text-right text-xs text-green-200">
            <div>{new Date().toLocaleDateString("es-ES")}</div>
            <div className="text-green-300">Supabase</div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
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
        {activeTab === "formacion" && <CursoFormacion />}
        {activeTab === "firma" && <FirmaDigital />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabId)} />
    </div>
  );
}
