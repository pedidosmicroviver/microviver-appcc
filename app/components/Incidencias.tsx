"use client";

import { useState } from "react";
import type { Incidencia } from "../lib/types";
import { generateId } from "../lib/storage";
import PhotoUpload from "./PhotoUpload";

interface IncidenciasProps {
  data: Incidencia[];
  onChange: (data: Incidencia[]) => void;
}

const gravedadColor: Record<Incidencia["gravedad"], string> = {
  alta: "bg-red-100 text-red-800",
  media: "bg-yellow-100 text-yellow-800",
  baja: "bg-gray-100 text-gray-600",
};

const estadoColor: Record<Incidencia["estado"], string> = {
  abierta: "bg-orange-100 text-orange-800",
  cerrada: "bg-green-100 text-green-800",
};

const tipoOptions = [
  "Desviacion PCC",
  "Proveedor",
  "Envase defectuoso",
  "Contaminacion",
  "Limpieza",
  "Otros",
];

type FilterTab = "todas" | "abiertas" | "cerradas";

const emptyForm = (): Omit<Incidencia, "id"> => ({
  fecha: new Date().toISOString().slice(0, 10),
  tipo: "Desviacion PCC",
  gravedad: "media",
  descripcion: "",
  accionCorrectora: "",
  estado: "abierta",
  responsable: "",
  fotos: [],
});

export default function Incidencias({ data, onChange }: IncidenciasProps) {
  const [filter, setFilter] = useState<FilterTab>("todas");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    filter === "todas"
      ? data
      : filter === "abiertas"
        ? data.filter((i) => i.estado === "abierta")
        : data.filter((i) => i.estado === "cerrada");

  const handleAdd = () => {
    if (!form.descripcion || !form.responsable) return;
    const nueva: Incidencia = {
      ...form,
      id: generateId("inc"),
    };
    onChange([...data, nueva]);
    setForm(emptyForm());
    setShowForm(false);
  };

  const cerrarIncidencia = (id: string) => {
    onChange(
      data.map((i) =>
        i.id === id
          ? { ...i, estado: "cerrada" as const, fechaCierre: new Date().toISOString().slice(0, 10) }
          : i
      )
    );
  };

  const handleUpdateFotos = (id: string, fotos: string[]) => {
    onChange(data.map((i) => (i.id === id ? { ...i, fotos } : i)));
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "todas", label: "Todas", count: data.length },
    { key: "abiertas", label: "Abiertas", count: data.filter((i) => i.estado === "abierta").length },
    { key: "cerradas", label: "Cerradas", count: data.filter((i) => i.estado === "cerrada").length },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Incidencias</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-3 bg-blue-600 text-white rounded-xl text-base font-medium active:bg-blue-700"
        >
          {showForm ? "Cancelar" : "+ Nueva Incidencia"}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-5 py-3 rounded-xl text-base font-medium transition-colors ${
              filter === tab.key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 active:bg-gray-200"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Nueva Incidencia</h3>
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base bg-white"
              >
                {tipoOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Gravedad</label>
              <select
                value={form.gravedad}
                onChange={(e) =>
                  setForm({ ...form, gravedad: e.target.value as Incidencia["gravedad"] })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base bg-white"
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Responsable</label>
              <input
                type="text"
                value={form.responsable}
                onChange={(e) => setForm({ ...form, responsable: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descripcion</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Accion Correctora</label>
            <textarea
              value={form.accionCorrectora}
              onChange={(e) => setForm({ ...form, accionCorrectora: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Fotos adjuntas</label>
            <PhotoUpload
              fotos={form.fotos || []}
              onChange={(fotos) => setForm({ ...form, fotos })}
              folder="incidencias"
              maxPhotos={5}
            />
          </div>

          <button
            onClick={handleAdd}
            className="w-full py-3 bg-green-600 text-white rounded-xl text-base font-semibold active:bg-green-700"
          >
            Guardar Incidencia
          </button>
        </div>
      )}

      {filtered.length === 0 && !showForm && (
        <p className="text-center text-gray-400 py-8">No hay incidencias registradas</p>
      )}

      <div className="space-y-3">
        {filtered.map((inc) => (
          <div
            key={inc.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === inc.id ? null : inc.id)}
              className="w-full px-5 py-4 flex items-center justify-between text-left active:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium text-gray-500">{inc.fecha}</span>
                  <span className="text-sm font-medium text-gray-700">{inc.tipo}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${gravedadColor[inc.gravedad]}`}
                  >
                    {inc.gravedad.charAt(0).toUpperCase() + inc.gravedad.slice(1)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${estadoColor[inc.estado]}`}
                  >
                    {inc.estado.charAt(0).toUpperCase() + inc.estado.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{inc.descripcion}</p>
              </div>
              <span className="text-gray-400 text-xl ml-2">
                {expandedId === inc.id ? "\u25B2" : "\u25BC"}
              </span>
            </button>

            {expandedId === inc.id && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-gray-500">Tipo:</span>{" "}
                    <span className="font-medium text-gray-700">{inc.tipo}</span>
                  </div>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-gray-500">Responsable:</span>{" "}
                    <span className="font-medium text-gray-700">{inc.responsable}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">Descripcion</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{inc.descripcion}</p>
                </div>

                {inc.accionCorrectora && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Accion Correctora</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {inc.accionCorrectora}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Fotos adjuntas</h4>
                  <PhotoUpload
                    fotos={inc.fotos || []}
                    onChange={(fotos) => handleUpdateFotos(inc.id, fotos)}
                    folder="incidencias"
                    maxPhotos={5}
                  />
                </div>

                {inc.fechaCierre && (
                  <div className="bg-green-50 px-3 py-2 rounded-lg text-sm">
                    <span className="text-green-700">Cerrada el: {inc.fechaCierre}</span>
                  </div>
                )}

                {inc.estado === "abierta" && (
                  <button
                    onClick={() => cerrarIncidencia(inc.id)}
                    className="w-full py-3 bg-orange-600 text-white rounded-xl text-base font-medium active:bg-orange-700"
                  >
                    Cerrar Incidencia
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
