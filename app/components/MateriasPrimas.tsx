"use client";

import { useState } from "react";
import type { MateriaPrima } from "../lib/types";
import { generateId } from "../lib/storage";
import PhotoUpload from "./PhotoUpload";

interface MateriasPrimasProps {
  data: MateriaPrima[];
  onChange: (data: MateriaPrima[]) => void;
}

const EMPTY_MP: Omit<MateriaPrima, "id"> = {
  nombre: "",
  lote: "",
  proveedor: "",
  fechaCaducidad: "",
  fechaRecepcion: "",
  cantidad: 0,
  unidad: "kg",
  coaPendiente: false,
  notas: "",
  fotos: [],
};

function getExpiryStatus(fechaCaducidad: string): "expired" | "warning" | "ok" {
  if (!fechaCaducidad) return "ok";
  const now = new Date();
  const expiry = new Date(fechaCaducidad);
  if (expiry < now) return "expired";
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays <= 90) return "warning";
  return "ok";
}

export default function MateriasPrimas({ data, onChange }: MateriasPrimasProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<MateriaPrima, "id">>(EMPTY_MP);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!form.nombre || !form.lote) return;
    const newItem: MateriaPrima = { ...form, id: generateId("mp") };
    onChange([...data, newItem]);
    setForm(EMPTY_MP);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    onChange(data.filter((mp) => mp.id !== id));
  };

  const handleUpdateFotos = (id: string, fotos: string[]) => {
    onChange(data.map((mp) => (mp.id === id ? { ...mp, fotos } : mp)));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Materias Primas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-5 py-3 rounded-lg text-base font-semibold active:bg-green-700 min-h-[48px]"
        >
          {showForm ? "Cancelar" : "+ Nueva MP"}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-lg">Nueva Materia Prima</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
                placeholder="Nombre del ingrediente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lote *</label>
              <input
                type="text"
                value={form.lote}
                onChange={(e) => setForm({ ...form, lote: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
                placeholder="N. de lote"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
              <input
                type="text"
                value={form.proveedor}
                onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
                placeholder="Proveedor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Caducidad</label>
              <input
                type="date"
                value={form.fechaCaducidad}
                onChange={(e) => setForm({ ...form, fechaCaducidad: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Recepcion</label>
              <input
                type="date"
                value={form.fechaRecepcion}
                onChange={(e) => setForm({ ...form, fechaRecepcion: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input
                  type="number"
                  value={form.cantidad || ""}
                  onChange={(e) => setForm({ ...form, cantidad: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                <select
                  value={form.unidad}
                  onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px] bg-white appearance-auto cursor-pointer"
                  style={{ WebkitAppearance: "menulist", userSelect: "text" }}
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="L">L</option>
                  <option value="ml">ml</option>
                  <option value="unidades">unidades</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
              rows={2}
              placeholder="Observaciones..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fotos</label>
            <PhotoUpload
              fotos={form.fotos || []}
              onChange={(fotos) => setForm({ ...form, fotos })}
              folder="materias-primas"
              maxPhotos={5}
            />
          </div>
          <label className="flex items-center gap-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.coaPendiente}
              onChange={(e) => setForm({ ...form, coaPendiente: e.target.checked })}
              className="w-6 h-6 rounded"
            />
            <span className="text-base">COA Pendiente</span>
          </label>
          <button
            onClick={handleAdd}
            disabled={!form.nombre || !form.lote}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-semibold disabled:opacity-40 active:bg-blue-700 min-h-[48px]"
          >
            Guardar Materia Prima
          </button>
        </div>
      )}

      {data.length === 0 && !showForm && (
        <p className="text-gray-500 text-center py-8">No hay materias primas registradas.</p>
      )}

      <div className="space-y-2">
        {data.map((mp) => {
          const status = getExpiryStatus(mp.fechaCaducidad);
          const rowBg =
            status === "expired"
              ? "bg-red-50 border-red-300"
              : status === "warning"
              ? "bg-yellow-50 border-yellow-300"
              : "bg-white border-gray-200";

          return (
            <div
              key={mp.id}
              className={`border rounded-xl overflow-hidden ${rowBg}`}
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === mp.id ? null : mp.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-base">{mp.nombre}</span>
                    {mp.coaPendiente && (
                      <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        COA Pendiente
                      </span>
                    )}
                    {status === "expired" && (
                      <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        Caducado
                      </span>
                    )}
                    {status === "warning" && (
                      <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        Caduca pronto
                      </span>
                    )}
                    {mp.fotos && mp.fotos.length > 0 && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {mp.fotos.length} foto{mp.fotos.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-x-4">
                    <span>Lote: {mp.lote}</span>
                    <span>Prov: {mp.proveedor}</span>
                    <span>Cad: {mp.fechaCaducidad}</span>
                    <span>
                      {mp.cantidad} {mp.unidad}
                    </span>
                  </div>
                  {/* Thumbnail row */}
                  {mp.fotos && mp.fotos.length > 0 && expandedId !== mp.id && (
                    <div className="flex gap-1.5 mt-2">
                      {mp.fotos.slice(0, 3).map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Foto ${i + 1}`}
                          className="w-10 h-10 rounded object-cover border border-gray-300"
                        />
                      ))}
                      {mp.fotos.length > 3 && (
                        <span className="w-10 h-10 rounded bg-gray-200 border border-gray-300 flex items-center justify-center text-xs text-gray-600 font-medium">
                          +{mp.fotos.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(mp.id);
                    }}
                    className="text-red-500 hover:text-red-700 active:text-red-800 p-3 min-h-[48px] min-w-[48px] flex items-center justify-center"
                    aria-label={`Eliminar ${mp.nombre}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <span className="text-gray-400 text-xl">
                    {expandedId === mp.id ? "\u25B2" : "\u25BC"}
                  </span>
                </div>
              </div>
              {/* Expanded view with PhotoUpload */}
              {expandedId === mp.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  {mp.notas && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-1">Notas</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{mp.notas}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Fotos</h4>
                    <PhotoUpload
                      fotos={mp.fotos || []}
                      onChange={(fotos) => handleUpdateFotos(mp.id, fotos)}
                      folder="materias-primas"
                      maxPhotos={5}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
