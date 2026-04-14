"use client";

import { useState } from "react";
import type { StockIntermedio } from "../lib/types";
import { generateId } from "../lib/storage";
import PhotoUpload from "./PhotoUpload";

interface StockIntermedioProps {
  data: StockIntermedio[];
  onChange: (data: StockIntermedio[]) => void;
}

const FORMATO_LABELS: Record<StockIntermedio["formato"], string> = {
  bidon_30l: "Bidon 30L",
  bidon_60l: "Bidon 60L",
  bidon_120l: "Bidon 120L",
  garrafa_20l: "Garrafa 20L",
  bote_125ml: "Bote 125ml",
  bote_250ml: "Bote 250ml",
  bote_500ml: "Bote 500ml",
};

const ESTADO_STYLES: Record<StockIntermedio["estado"], { bg: string; text: string; label: string }> = {
  en_almacen: { bg: "bg-green-100", text: "text-green-800", label: "En Almacen" },
  en_proceso: { bg: "bg-yellow-100", text: "text-yellow-800", label: "En Proceso" },
  agotado: { bg: "bg-gray-100", text: "text-gray-500", label: "Agotado" },
};

type TabKey = "bidones" | "garrafas" | "botes";

const TABS: { key: TabKey; label: string; formatos: StockIntermedio["formato"][] }[] = [
  { key: "bidones", label: "Bidones", formatos: ["bidon_30l", "bidon_60l", "bidon_120l"] },
  { key: "garrafas", label: "Garrafas 20L", formatos: ["garrafa_20l"] },
  { key: "botes", label: "Botes", formatos: ["bote_125ml", "bote_250ml", "bote_500ml"] },
];

// Conversion rules: source formato -> target formato + ratio (how many targets per 1 source)
const CONVERSIONS: Record<string, { target: StockIntermedio["formato"]; ratio: number }> = {
  bidon_30l: { target: "garrafa_20l", ratio: 1.5 },
  bidon_60l: { target: "garrafa_20l", ratio: 3 },
  bidon_120l: { target: "garrafa_20l", ratio: 6 },
  garrafa_20l: { target: "bote_125ml", ratio: 160 },
};

const EMPTY_FORM = {
  producto: "",
  lote: "",
  formato: "bidon_60l" as StockIntermedio["formato"],
  cantidad: 1,
  fecha: new Date().toISOString().split("T")[0],
  notas: "",
  fotos: [] as string[],
};

export default function StockIntermedioComponent({ data, onChange }: StockIntermedioProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("bidones");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [trasvasarId, setTrasvasarId] = useState<string | null>(null);
  const [trasvasarCantidad, setTrasvasarCantidad] = useState(1);

  // Counts for flow visualization
  const countByGroup = (formatos: StockIntermedio["formato"][]) =>
    data.filter((d) => formatos.includes(d.formato) && d.estado !== "agotado").reduce((sum, d) => sum + d.cantidad, 0);

  const bidonCount = countByGroup(["bidon_30l", "bidon_60l", "bidon_120l"]);
  const garrafaCount = countByGroup(["garrafa_20l"]);
  const boteCount = countByGroup(["bote_125ml", "bote_250ml", "bote_500ml"]);

  const handleAdd = () => {
    const newItem: StockIntermedio = {
      id: generateId("si"),
      producto: form.producto,
      lote: form.lote,
      formato: form.formato,
      cantidad: form.cantidad,
      unidad: "uds",
      origenId: "",
      origenTipo: "",
      fecha: form.fecha,
      estado: "en_almacen",
      notas: form.notas,
      fotos: form.fotos,
    };
    onChange([...data, newItem]);
    setForm({ ...EMPTY_FORM, fecha: new Date().toISOString().split("T")[0] });
    setShowForm(false);
  };

  const handleTrasvasar = (item: StockIntermedio) => {
    const conv = CONVERSIONS[item.formato];
    if (!conv) return;

    const cantidadOrigen = trasvasarCantidad;
    if (cantidadOrigen <= 0 || cantidadOrigen > item.cantidad) return;

    const cantidadTarget = Math.floor(cantidadOrigen * conv.ratio);
    const remaining = item.cantidad - cantidadOrigen;

    const updatedData = data.map((d) => {
      if (d.id === item.id) {
        return {
          ...d,
          cantidad: remaining,
          estado: (remaining <= 0 ? "agotado" : d.estado) as StockIntermedio["estado"],
        };
      }
      return d;
    });

    const newItem: StockIntermedio = {
      id: generateId("si"),
      producto: item.producto,
      lote: item.lote,
      formato: conv.target,
      cantidad: cantidadTarget,
      unidad: "uds",
      origenId: item.id,
      origenTipo: item.formato,
      fecha: new Date().toISOString().split("T")[0],
      estado: "en_almacen",
      notas: `Trasvasado desde ${FORMATO_LABELS[item.formato]} (${cantidadOrigen} uds)`,
      fotos: [],
    };

    onChange([...updatedData, newItem]);
    setTrasvasarId(null);
    setTrasvasarCantidad(1);
  };

  const currentTab = TABS.find((t) => t.key === activeTab)!;
  const filteredItems = data.filter((d) => currentTab.formatos.includes(d.formato));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Stock Intermedio - Flujo de Producto</h2>
      </div>

      {/* Visual Flow */}
      <div className="bg-gradient-to-r from-amber-50 via-blue-50 to-green-50 rounded-2xl p-5 border border-slate-200">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {/* Bidon */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 border-2 border-amber-400 rounded-2xl flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-amber-700">{bidonCount}</span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-amber-700 mt-1">Bidones</span>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center">
            <svg width="32" height="24" viewBox="0 0 32 24" fill="none" className="text-slate-400">
              <path d="M2 12H28M28 12L20 4M28 12L20 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] text-slate-400 mt-0.5">Trasvasar</span>
          </div>

          {/* Garrafa */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 border-2 border-blue-400 rounded-2xl flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-blue-700">{garrafaCount}</span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-blue-700 mt-1">Garrafas 20L</span>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center">
            <svg width="32" height="24" viewBox="0 0 32 24" fill="none" className="text-slate-400">
              <path d="M2 12H28M28 12L20 4M28 12L20 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] text-slate-400 mt-0.5">Envasar</span>
          </div>

          {/* Bote */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 border-2 border-green-400 rounded-2xl flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-green-700">{boteCount}</span>
            </div>
            <span className="text-xs sm:text-sm font-medium text-green-700 mt-1">Botes</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* + Nuevo button */}
      <button
        onClick={() => {
          setForm({ ...EMPTY_FORM, formato: currentTab.formatos[0], fecha: new Date().toISOString().split("T")[0] });
          setShowForm(true);
        }}
        className="w-full py-3 px-4 bg-blue-50 text-blue-700 border-2 border-dashed border-blue-300 rounded-xl font-semibold text-base hover:bg-blue-100 transition-colors"
      >
        + Nuevo
      </button>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Nuevo Stock</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Formato</label>
              <select
                value={form.formato}
                onChange={(e) => setForm({ ...form, formato: e.target.value as StockIntermedio["formato"] })}
                className="w-full p-3 border border-slate-300 rounded-xl text-base bg-white"
              >
                {Object.entries(FORMATO_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Cantidad</label>
              <input
                type="number"
                min={1}
                value={form.cantidad}
                onChange={(e) => setForm({ ...form, cantidad: parseInt(e.target.value) || 1 })}
                className="w-full p-3 border border-slate-300 rounded-xl text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Producto</label>
            <input
              type="text"
              value={form.producto}
              onChange={(e) => setForm({ ...form, producto: e.target.value })}
              placeholder="Nombre del producto"
              className="w-full p-3 border border-slate-300 rounded-xl text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Lote</label>
              <input
                type="text"
                value={form.lote}
                onChange={(e) => setForm({ ...form, lote: e.target.value })}
                placeholder="Lote produccion"
                className="w-full p-3 border border-slate-300 rounded-xl text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Fecha</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-xl text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Notas</label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              rows={2}
              placeholder="Observaciones..."
              className="w-full p-3 border border-slate-300 rounded-xl text-base resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Fotos</label>
            <PhotoUpload
              fotos={form.fotos}
              onChange={(fotos) => setForm({ ...form, fotos })}
              folder="stock-intermedio"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAdd}
              disabled={!form.producto || !form.lote}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold text-base hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-3">
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg">No hay stock en esta categoria</p>
          </div>
        )}

        {filteredItems.map((item) => {
          const estado = ESTADO_STYLES[item.estado];
          const canTrasvasar = item.estado !== "agotado" && item.cantidad > 0 && CONVERSIONS[item.formato];

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 ${
                item.estado === "agotado" ? "opacity-60" : ""
              }`}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-800 text-base">{item.producto}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${estado.bg} ${estado.text}`}>
                      {estado.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                    <span>Lote: <strong className="text-slate-700">{item.lote}</strong></span>
                    <span>{FORMATO_LABELS[item.formato]}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-bold text-slate-800">{item.cantidad}</span>
                  <span className="text-sm text-slate-500 ml-1">uds</span>
                </div>
              </div>

              {/* Date and notes */}
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{item.fecha}</span>
                {item.notas && <span className="truncate">{item.notas}</span>}
              </div>

              {/* Trasvasar button */}
              {canTrasvasar && (
                <>
                  {trasvasarId === item.id ? (
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-3">
                      <h5 className="font-semibold text-amber-800 text-sm">
                        Trasvasar {FORMATO_LABELS[item.formato]} a {FORMATO_LABELS[CONVERSIONS[item.formato].target]}
                      </h5>
                      <p className="text-xs text-amber-600">
                        Ratio: 1 {FORMATO_LABELS[item.formato]} = {CONVERSIONS[item.formato].ratio} {FORMATO_LABELS[CONVERSIONS[item.formato].target]}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-amber-700 mb-1">
                            Cantidad a trasvasar (max {item.cantidad})
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={item.cantidad}
                            value={trasvasarCantidad}
                            onChange={(e) => setTrasvasarCantidad(Math.min(parseInt(e.target.value) || 1, item.cantidad))}
                            className="w-full p-3 border border-amber-300 rounded-xl text-base bg-white"
                          />
                        </div>
                        <div className="text-center pt-5">
                          <span className="text-lg font-bold text-amber-700">
                            = {Math.floor(trasvasarCantidad * CONVERSIONS[item.formato].ratio)}
                          </span>
                          <span className="text-xs text-amber-600 block">
                            {FORMATO_LABELS[CONVERSIONS[item.formato].target]}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTrasvasar(item)}
                          className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600 transition-colors"
                        >
                          Confirmar Trasvase
                        </button>
                        <button
                          onClick={() => { setTrasvasarId(null); setTrasvasarCantidad(1); }}
                          className="py-3 px-4 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setTrasvasarId(item.id); setTrasvasarCantidad(1); }}
                      className="w-full py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-semibold text-sm hover:bg-amber-100 transition-colors"
                    >
                      Trasvasar a {FORMATO_LABELS[CONVERSIONS[item.formato].target]}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
