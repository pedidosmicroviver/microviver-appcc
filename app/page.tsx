"use client";

import { useState, useEffect } from "react";
import { TabId } from "./lib/types";
import {
  DEMO_MATERIAS_PRIMAS,
  DEMO_FERMENTACIONES,
  DEMO_PRODUCTOS,
  DEMO_PCCS_COMPLEMENTOS,
  DEMO_PCCS_ALIMENTOS,
  DEMO_INCIDENCIAS,
  DEMO_PRODUCCIONES,
  DEMO_ENVASADOS,
} from "./lib/data";
import { loadData, saveData } from "./lib/storage";
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

  const [materiasPrimas, setMateriasPrimas] = useState(DEMO_MATERIAS_PRIMAS);
  const [fermentaciones, setFermentaciones] = useState(DEMO_FERMENTACIONES);
  const [productos, setProductos] = useState(DEMO_PRODUCTOS);
  const [pccsComp, setPccsComp] = useState(DEMO_PCCS_COMPLEMENTOS);
  const [pccsAlim, setPccsAlim] = useState(DEMO_PCCS_ALIMENTOS);
  const [incidencias, setIncidencias] = useState(DEMO_INCIDENCIAS);
  const [producciones, setProducciones] = useState(DEMO_PRODUCCIONES);
  const [envasados, setEnvasados] = useState(DEMO_ENVASADOS);

  useEffect(() => {
    setMateriasPrimas(loadData("materiasPrimas", DEMO_MATERIAS_PRIMAS));
    setFermentaciones(loadData("fermentaciones", DEMO_FERMENTACIONES));
    setProductos(loadData("productos", DEMO_PRODUCTOS));
    setPccsComp(loadData("pccsComp", DEMO_PCCS_COMPLEMENTOS));
    setPccsAlim(loadData("pccsAlim", DEMO_PCCS_ALIMENTOS));
    setIncidencias(loadData("incidencias", DEMO_INCIDENCIAS));
    setProducciones(loadData("producciones", DEMO_PRODUCCIONES));
    setEnvasados(loadData("envasados", DEMO_ENVASADOS));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveData("materiasPrimas", materiasPrimas);
  }, [materiasPrimas, mounted]);

  useEffect(() => {
    if (!mounted) return;
    saveData("fermentaciones", fermentaciones);
  }, [fermentaciones, mounted]);

  useEffect(() => {
    if (!mounted) return;
    saveData("productos", productos);
  }, [productos, mounted]);

  useEffect(() => {
    if (!mounted) return;
    saveData("pccsComp", pccsComp);
  }, [pccsComp, mounted]);

  useEffect(() => {
    if (!mounted) return;
    saveData("pccsAlim", pccsAlim);
  }, [pccsAlim, mounted]);

  useEffect(() => {
    if (!mounted) return;
    saveData("incidencias", incidencias);
  }, [incidencias, mounted]);

  useEffect(() => {
    if (!mounted) return;
    saveData("producciones", producciones);
  }, [producciones, mounted]);

  useEffect(() => {
    if (!mounted) return;
    saveData("envasados", envasados);
  }, [envasados, mounted]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">&#127807;</div>
          <p className="text-lg text-slate-600">Cargando Microviver APPCC...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
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
          </div>
        </div>
      </header>

      {/* Content */}
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
          <MateriasPrimas data={materiasPrimas} onChange={setMateriasPrimas} />
        )}
        {activeTab === "camara" && (
          <CamaraFermentacion
            data={fermentaciones}
            onChange={setFermentaciones}
            materiasPrimas={materiasPrimas}
          />
        )}
        {activeTab === "produccion" && (
          <HojasProduccion
            data={producciones}
            onChange={setProducciones}
            materiasPrimas={materiasPrimas}
            fermentaciones={fermentaciones}
          />
        )}
        {activeTab === "envasado" && (
          <HojasEnvasado
            data={envasados}
            onChange={setEnvasados}
            producciones={producciones}
          />
        )}
        {activeTab === "pcc_comp" && (
          <PCCModule pccs={pccsComp} onChange={setPccsComp} tipo="complemento" />
        )}
        {activeTab === "pcc_alim" && (
          <PCCModule pccs={pccsAlim} onChange={setPccsAlim} tipo="alimento" />
        )}
        {activeTab === "stock" && (
          <Stock productos={productos} onChange={setProductos} />
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
          <Incidencias data={incidencias} onChange={setIncidencias} />
        )}
        {activeTab === "formacion" && <CursoFormacion />}
        {activeTab === "firma" && <FirmaDigital />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as TabId)} />
    </div>
  );
}
