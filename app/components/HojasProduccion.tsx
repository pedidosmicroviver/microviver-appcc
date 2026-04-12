"use client";

import { useState } from "react";
import type { HojaProduccion, MateriaPrima, Fermentacion } from "../lib/types";
import { generateId } from "../lib/storage";

interface HojasProduccionProps {
  data: HojaProduccion[];
  onChange: (data: HojaProduccion[]) => void;
  materiasPrimas: MateriaPrima[];
  fermentaciones: Fermentacion[];
}

const estadoColor: Record<HojaProduccion["estado"], string> = {
  en_proceso: "bg-yellow-100 text-yellow-800",
  completada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
};

const estadoLabel: Record<HojaProduccion["estado"], string> = {
  en_proceso: "En proceso",
  completada: "Completada",
  rechazada: "Rechazada",
};

const emptyForm = (): Omit<HojaProduccion, "id"> => ({
  loteProduccion: "",
  producto: "",
  fecha: new Date().toISOString().slice(0, 10),
  operario: "",
  materiasPrimas: [],
  fermentacionId: "",
  estado: "en_proceso",
  observaciones: "",
});

export default function HojasProduccion({
  data,
  onChange,
  materiasPrimas,
  fermentaciones,
}: HojasProduccionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [mpSelections, setMpSelections] = useState<{ mpId: string; cantidad: number }[]>([]);

  const handleAdd = () => {
    if (!form.loteProduccion || !form.producto || !form.operario) return;
    const nueva: HojaProduccion = {
      ...form,
      id: generateId("prod"),
      materiasPrimas: mpSelections.filter((mp) => mp.mpId && mp.cantidad > 0),
    };
    onChange([...data, nueva]);
    setForm(emptyForm());
    setMpSelections([]);
    setShowForm(false);
  };

  const changeEstado = (id: string, estado: HojaProduccion["estado"]) => {
    onChange(data.map((h) => (h.id === id ? { ...h, estado } : h)));
  };

  const addMpRow = () => {
    setMpSelections([...mpSelections, { mpId: "", cantidad: 0 }]);
  };

  const updateMpRow = (idx: number, field: "mpId" | "cantidad", value: string | number) => {
    const updated = [...mpSelections];
    updated[idx] = { ...updated[idx], [field]: value };
    setMpSelections(updated);
  };

  const removeMpRow = (idx: number) => {
    setMpSelections(mpSelections.filter((_, i) => i !== idx));
  };

  const getMpName = (id: string) => {
    const mp = materiasPrimas.find((m) => m.id === id);
    return mp ? `${mp.nombre} (${mp.lote})` : id;
  };

  const activeFermentaciones = fermentaciones.filter((f) => f.estado === "activa");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Hojas de Produccion</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-3 bg-blue-600 text-white rounded-xl text-base font-medium active:bg-blue-700"
        >
          {showForm ? "Cancelar" : "+ Nueva Produccion"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Nueva Hoja de Produccion</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Lote Produccion</label>
              <input
                type="text"
                value={form.loteProduccion}
                onChange={(e) => setForm({ ...form, loteProduccion: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
                placeholder="LP-2026-001"
              />
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Fermentacion</label>
              <select
                value={form.fermentacionId}
                onChange={(e) => setForm({ ...form, fermentacionId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base bg-white"
              >
                <option value="">-- Sin fermentacion --</option>
                {activeFermentaciones.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.producto} ({f.loteProduccion})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-600">Materias Primas</label>
              <button
                onClick={addMpRow}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium active:bg-gray-200"
              >
                + Anadir MP
              </button>
            </div>
            {mpSelections.map((sel, idx) => (
              <div key={idx} className="flex items-center gap-3 mb-2">
                <select
                  value={sel.mpId}
                  onChange={(e) => updateMpRow(idx, "mpId", e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-base bg-white"
                >
                  <option value="">Seleccionar MP...</option>
                  {materiasPrimas.map((mp) => (
                    <option key={mp.id} value={mp.id}>
                      {mp.nombre} - Lote: {mp.lote}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={sel.cantidad || ""}
                  onChange={(e) => updateMpRow(idx, "cantidad", parseFloat(e.target.value) || 0)}
                  placeholder="Cantidad"
                  className="w-28 px-4 py-3 border border-gray-300 rounded-xl text-base"
                />
                <button
                  onClick={() => removeMpRow(idx)}
                  className="px-3 py-3 bg-red-50 text-red-600 rounded-xl text-base font-medium active:bg-red-100"
                >
                  X
                </button>
              </div>
            ))}
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
            Guardar Produccion
          </button>
        </div>
      )}

      {data.length === 0 && !showForm && (
        <p className="text-center text-gray-400 py-8">No hay hojas de produccion registradas</p>
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
                  <span className="font-semibold text-gray-800">{hoja.loteProduccion}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${estadoColor[hoja.estado]}`}
                  >
                    {estadoLabel[hoja.estado]}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {hoja.producto} &middot; {hoja.fecha} &middot; {hoja.operario}
                </div>
              </div>
              <span className="text-gray-400 text-xl ml-2">
                {expandedId === hoja.id ? "\u25B2" : "\u25BC"}
              </span>
            </button>

            {expandedId === hoja.id && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                {hoja.materiasPrimas.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Materias Primas</h4>
                    <div className="space-y-1">
                      {hoja.materiasPrimas.map((mp, i) => (
                        <div key={i} className="flex justify-between text-sm bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="text-gray-700">{getMpName(mp.mpId)}</span>
                          <span className="text-gray-500 font-medium">{mp.cantidad}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hoja.observaciones && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Observaciones</h4>
                    <p className="text-sm text-gray-600">{hoja.observaciones}</p>
                  </div>
                )}

                {hoja.estado === "en_proceso" && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => changeEstado(hoja.id, "completada")}
                      className="flex-1 py-3 bg-green-600 text-white rounded-xl text-base font-medium active:bg-green-700"
                    >
                      Completar
                    </button>
                    <button
                      onClick={() => changeEstado(hoja.id, "rechazada")}
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
