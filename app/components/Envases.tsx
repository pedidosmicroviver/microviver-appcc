"use client";

import { useState } from "react";
import type { Envase } from "../lib/types";
import { generateId } from "../lib/storage";
import PhotoUpload from "./PhotoUpload";

interface EnvasesProps {
  data: Envase[];
  onChange: (data: Envase[]) => void;
}

const TIPOS = [
  "Bote vidrio",
  "Bote HDPE",
  "Tapon plastico",
  "Tapon rosca",
  "Tapon metalico",
  "Gotero/pipeta",
  "Etiqueta",
  "Precinto",
  "Caja",
] as const;

const EMPTY_ENVASE: Omit<Envase, "id"> = {
  tipo: "Bote vidrio",
  descripcion: "",
  lote: "",
  cantidad: 0,
  unidad: "unidades",
  fechaRecepcion: "",
  proveedor: "",
  notas: "",
  fotos: [],
};

function getTipoBadgeClasses(tipo: string): string {
  if (tipo.includes("vidrio")) return "bg-blue-100 text-blue-700";
  if (tipo.includes("HDPE")) return "bg-amber-100 text-amber-700";
  if (tipo.startsWith("Tapon")) return "bg-slate-100 text-slate-700";
  if (tipo.includes("Gotero") || tipo.includes("pipeta")) return "bg-purple-100 text-purple-700";
  if (tipo.includes("Etiqueta")) return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-700";
}

export default function Envases({ data, onChange }: EnvasesProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Envase, "id">>(EMPTY_ENVASE);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!form.lote) return;
    const newItem: Envase = { ...form, id: generateId("env") };
    onChange([...data, newItem]);
    setForm(EMPTY_ENVASE);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    onChange(data.filter((env) => env.id !== id));
  };

  const handleUpdateFotos = (id: string, fotos: string[]) => {
    onChange(data.map((env) => (env.id === id ? { ...env, fotos } : env)));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Envases y Material de Envasado</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-5 py-3 rounded-lg text-base font-semibold active:bg-green-700 min-h-[48px]"
        >
          {showForm ? "Cancelar" : "+ Nuevo Envase"}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-lg">Nuevo Envase</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px] bg-white appearance-auto cursor-pointer"
                style={{ WebkitAppearance: "menulist", userSelect: "text" }}
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
              <input
                type="text"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
                placeholder="Bote vidrio 500ml ambar"
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
                  step="1"
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
                  <option value="unidades">unidades</option>
                  <option value="cajas">cajas</option>
                  <option value="packs">packs</option>
                </select>
              </div>
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
              folder="envases"
              maxPhotos={5}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!form.lote}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-semibold disabled:opacity-40 active:bg-blue-700 min-h-[48px]"
          >
            Guardar Envase
          </button>
        </div>
      )}

      {data.length === 0 && !showForm && (
        <p className="text-gray-500 text-center py-8">No hay envases registrados.</p>
      )}

      <div className="space-y-2">
        {data.map((env) => (
          <div
            key={env.id}
            className="border rounded-xl overflow-hidden bg-white border-gray-200"
          >
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === env.id ? null : env.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getTipoBadgeClasses(env.tipo)}`}
                  >
                    {env.tipo}
                  </span>
                  <span className="font-semibold text-base">{env.descripcion || env.tipo}</span>
                  {env.fotos && env.fotos.length > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {env.fotos.length} foto{env.fotos.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-x-4">
                  <span>Lote: {env.lote}</span>
                  <span>
                    {env.cantidad} {env.unidad}
                  </span>
                  {env.proveedor && <span>Prov: {env.proveedor}</span>}
                  {env.fechaRecepcion && <span>Recep: {env.fechaRecepcion}</span>}
                </div>
                {/* Thumbnail row */}
                {env.fotos && env.fotos.length > 0 && expandedId !== env.id && (
                  <div className="flex gap-1.5 mt-2">
                    {env.fotos.slice(0, 3).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Foto ${i + 1}`}
                        className="w-10 h-10 rounded object-cover border border-gray-300"
                      />
                    ))}
                    {env.fotos.length > 3 && (
                      <span className="w-10 h-10 rounded bg-gray-200 border border-gray-300 flex items-center justify-center text-xs text-gray-600 font-medium">
                        +{env.fotos.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 ml-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(env.id);
                  }}
                  className="text-red-500 hover:text-red-700 active:text-red-800 p-3 min-h-[48px] min-w-[48px] flex items-center justify-center"
                  aria-label={`Eliminar ${env.descripcion || env.tipo}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <span className="text-gray-400 text-xl">
                  {expandedId === env.id ? "\u25B2" : "\u25BC"}
                </span>
              </div>
            </div>
            {/* Expanded view with all details + PhotoUpload */}
            {expandedId === env.id && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>
                    <span className="font-semibold text-gray-600">Tipo:</span>{" "}
                    <span>{env.tipo}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Lote:</span>{" "}
                    <span>{env.lote}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Cantidad:</span>{" "}
                    <span>
                      {env.cantidad} {env.unidad}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Proveedor:</span>{" "}
                    <span>{env.proveedor || "—"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Fecha Recepcion:</span>{" "}
                    <span>{env.fechaRecepcion || "—"}</span>
                  </div>
                  {env.descripcion && (
                    <div className="col-span-2">
                      <span className="font-semibold text-gray-600">Descripcion:</span>{" "}
                      <span>{env.descripcion}</span>
                    </div>
                  )}
                </div>
                {env.notas && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Notas</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{env.notas}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Fotos</h4>
                  <PhotoUpload
                    fotos={env.fotos || []}
                    onChange={(fotos) => handleUpdateFotos(env.id, fotos)}
                    folder="envases"
                    maxPhotos={5}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
