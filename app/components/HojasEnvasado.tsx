"use client";

import { useState } from "react";
import type { HojaEnvasado, HojaProduccion } from "../lib/types";
import { generateId } from "../lib/storage";

interface HojasEnvasadoProps {
  data: HojaEnvasado[];
  onChange: (data: HojaEnvasado[]) => void;
  producciones: HojaProduccion[];
}

const formatoLabels: Record<HojaEnvasado["formatoEnvase"], string> = {
  vidrio_plastico: "Vidrio + tapon plastico",
  hdpe_rosca: "HDPE + tapon rosca",
  gotero: "Gotero pipeta",
  vidrio_metalico: "Vidrio + tapon metalico",
};

const estadoColor: Record<HojaEnvasado["estado"], string> = {
  en_proceso: "bg-yellow-100 text-yellow-800",
  completado: "bg-green-100 text-green-800",
  rechazado: "bg-red-100 text-red-800",
};

const estadoLabel: Record<HojaEnvasado["estado"], string> = {
  en_proceso: "En proceso",
  completado: "Completado",
  rechazado: "Rechazado",
};

const emptyForm = (): Omit<HojaEnvasado, "id"> => ({
  loteEnvasado: "",
  loteProduccion: "",
  producto: "",
  fecha: new Date().toISOString().slice(0, 10),
  operario: "",
  formatoEnvase: "vidrio_plastico",
  loteEnvase: "",
  loteTapon: "",
  unidades: 0,
  estado: "en_proceso",
  observaciones: "",
});

export default function HojasEnvasado({
  data,
  onChange,
  producciones,
}: HojasEnvasadoProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!form.loteEnvasado || !form.producto || !form.operario) return;
    const nuevo: HojaEnvasado = {
      ...form,
      id: generateId("env"),
    };
    onChange([...data, nuevo]);
    setForm(emptyForm());
    setShowForm(false);
  };

  const changeEstado = (id: string, estado: HojaEnvasado["estado"]) => {
    onChange(data.map((h) => (h.id === id ? { ...h, estado } : h)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Hojas de Envasado</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-3 bg-blue-600 text-white rounded-xl text-base font-medium active:bg-blue-700"
        >
          {showForm ? "Cancelar" : "+ Nuevo Envasado"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Nuevo Envasado</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Lote Envasado</label>
              <input
                type="text"
                value={form.loteEnvasado}
                onChange={(e) => setForm({ ...form, loteEnvasado: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
                placeholder="LE-2026-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Lote Produccion</label>
              <select
                value={form.loteProduccion}
                onChange={(e) => setForm({ ...form, loteProduccion: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base bg-white"
              >
                <option value="">Seleccionar produccion...</option>
                {producciones.map((p) => (
                  <option key={p.id} value={p.loteProduccion}>
                    {p.loteProduccion} - {p.producto}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Producto</label>
              <input
                type="text"
                value={form.producto}
                onChange={(e) => setForm({ ...form, producto: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Fecha</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Operario</label>
              <input
                type="text"
                value={form.operario}
                onChange={(e) => setForm({ ...form, operario: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Formato Envase</label>
              <select
                value={form.formatoEnvase}
                onChange={(e) =>
                  setForm({ ...form, formatoEnvase: e.target.value as HojaEnvasado["formatoEnvase"] })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base bg-white"
              >
                {Object.entries(formatoLabels).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Lote Envase</label>
              <input
                type="text"
                value={form.loteEnvase}
                onChange={(e) => setForm({ ...form, loteEnvase: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Lote Tapon</label>
              <input
                type="text"
                value={form.loteTapon}
                onChange={(e) => setForm({ ...form, loteTapon: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Unidades</label>
              <input
                type="number"
                value={form.unidades || ""}
                onChange={(e) => setForm({ ...form, unidades: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Observaciones</label>
            <textarea
              value={form.observaciones}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
              rows={3}
            />
          </div>

          <button
            onClick={handleAdd}
            className="w-full py-3 bg-green-600 text-white rounded-xl text-base font-semibold active:bg-green-700"
          >
            Guardar Envasado
          </button>
        </div>
      )}

      {data.length === 0 && !showForm && (
        <p className="text-center text-gray-400 py-8">No hay hojas de envasado registradas</p>
      )}

      <div className="space-y-3">
        {data.map((hoja) => (
          <div
            key={hoja.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === hoja.id ? null : hoja.id)}
              className="w-full px-5 py-4 flex items-center justify-between text-left active:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-gray-800">{hoja.loteEnvasado}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${estadoColor[hoja.estado]}`}
                  >
                    {estadoLabel[hoja.estado]}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {hoja.producto} &middot; {formatoLabels[hoja.formatoEnvase]} &middot;{" "}
                  {hoja.unidades} uds &middot; {hoja.fecha} &middot; {hoja.operario}
                </div>
              </div>
              <span className="text-gray-400 text-xl ml-2">
                {expandedId === hoja.id ? "\u25B2" : "\u25BC"}
              </span>
            </button>

            {expandedId === hoja.id && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-gray-500">Lote Produccion:</span>{" "}
                    <span className="font-medium text-gray-700">{hoja.loteProduccion}</span>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-gray-500">Lote Envase:</span>{" "}
                    <span className="font-medium text-gray-700">{hoja.loteEnvase}</span>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-gray-500">Lote Tapon:</span>{" "}
                    <span className="font-medium text-gray-700">{hoja.loteTapon}</span>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-gray-500">Unidades:</span>{" "}
                    <span className="font-medium text-gray-700">{hoja.unidades}</span>
                  </div>
                </div>

                {hoja.observaciones && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Observaciones</h4>
                    <p className="text-sm text-gray-600">{hoja.observaciones}</p>
                  </div>
                )}

                {hoja.estado === "en_proceso" && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => changeEstado(hoja.id, "completado")}
                      className="flex-1 py-3 bg-green-600 text-white rounded-xl text-base font-medium active:bg-green-700"
                    >
                      Completar
                    </button>
                    <button
                      onClick={() => changeEstado(hoja.id, "rechazado")}
                      className="flex-1 py-3 bg-red-600 text-white rounded-xl text-base font-medium active:bg-red-700"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
