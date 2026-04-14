"use client";

import { useState } from "react";
import type { Proveedor } from "../lib/types";
import { generateId } from "../lib/storage";
import PhotoUpload from "./PhotoUpload";

interface ProveedoresProps {
  data: Proveedor[];
  onChange: (data: Proveedor[]) => void;
}

type FilterTab = "todos" | "aprobado" | "provisional" | "suspendido";

const categoriaDescriptions: Record<Proveedor["categoria"], string> = {
  A: "MP y materiales contacto directo",
  B: "Servicios seguridad alimentaria",
  C: "Materiales auxiliares",
  D: "Otros",
};

const estadoColor: Record<Proveedor["estado"], string> = {
  aprobado: "bg-green-100 text-green-800",
  provisional: "bg-yellow-100 text-yellow-800",
  suspendido: "bg-red-100 text-red-800",
  alerta: "bg-orange-100 text-orange-800",
};

const estadoLabel: Record<Proveedor["estado"], string> = {
  aprobado: "Aprobado",
  provisional: "Provisional",
  suspendido: "Suspendido",
  alerta: "Alerta",
};

const categoriaColor: Record<Proveedor["categoria"], string> = {
  A: "bg-indigo-100 text-indigo-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-slate-100 text-slate-700",
  D: "bg-gray-100 text-gray-600",
};

const emptyForm = (): Omit<Proveedor, "id"> => ({
  codigo: "",
  nombre: "",
  cif: "",
  poblacion: "",
  direccion: "",
  contacto: "",
  telefono: "",
  email: "",
  productosSubministrados: "",
  categoria: "A",
  estado: "provisional",
  incidenciasAnuales: 0,
  calificacionAnual: "",
  fechaUltimaEvaluacion: new Date().toISOString().slice(0, 10),
  observaciones: "",
  fotos: [],
});

export default function Proveedores({ data, onChange }: ProveedoresProps) {
  const [filter, setFilter] = useState<FilterTab>("todos");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered =
    filter === "todos"
      ? data
      : data.filter((p) => p.estado === filter);

  const sorted = [...filtered].sort((a, b) => a.nombre.localeCompare(b.nombre));

  const updateField = <K extends keyof Omit<Proveedor, "id">>(
    field: K,
    value: Omit<Proveedor, "id">[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    if (!form.nombre) return;
    const safeForm = { ...form, fotos: form.fotos || [] };
    if (editingId) {
      onChange(
        data.map((p) => (p.id === editingId ? { ...safeForm, id: editingId } : p))
      );
      setEditingId(null);
    } else {
      const newProveedor: Proveedor = {
        ...safeForm,
        id: generateId("prov"),
      };
      onChange([newProveedor, ...data]);
    }
    setForm(emptyForm());
    setShowForm(false);
  };

  const handleEdit = (proveedor: Proveedor) => {
    const { id, ...rest } = proveedor;
    setForm(rest);
    setEditingId(id);
    setShowForm(true);
    setExpandedId(null);
    // Scroll to top to show the form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleCancel = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(false);
  };

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "todos", label: "Todos", count: data.length },
    {
      key: "aprobado",
      label: "Aprobados",
      count: data.filter((p) => p.estado === "aprobado").length,
    },
    {
      key: "provisional",
      label: "Provisionales",
      count: data.filter((p) => p.estado === "provisional").length,
    },
    {
      key: "suspendido",
      label: "Suspendidos",
      count: data.filter((p) => p.estado === "suspendido").length,
    },
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          Control de Proveedores (Reg.16)
        </h2>
        <button
          onClick={() => (showForm ? handleCancel() : setShowForm(true))}
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors min-h-[44px]"
        >
          {showForm ? "Cancelar" : "+ Nuevo Proveedor"}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 min-w-0 py-2 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap min-h-[40px] ${
              filter === tab.key
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-sm">
          <h3 className="font-semibold text-slate-700 text-sm">
            {editingId ? "Editar Proveedor" : "Nuevo Proveedor"}
          </h3>

          {/* Codigo y Nombre */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Codigo
              </label>
              <input
                type="text"
                value={form.codigo}
                onChange={(e) => updateField("codigo", e.target.value)}
                placeholder="PROV-001"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px]"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => updateField("nombre", e.target.value)}
                placeholder="Nombre del proveedor"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px]"
              />
            </div>
          </div>

          {/* CIF y Poblacion */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                CIF / NIF
              </label>
              <input
                type="text"
                value={form.cif}
                onChange={(e) => updateField("cif", e.target.value)}
                placeholder="B12345678"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Poblacion
              </label>
              <input
                type="text"
                value={form.poblacion}
                onChange={(e) => updateField("poblacion", e.target.value)}
                placeholder="Ciudad"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px]"
              />
            </div>
          </div>

          {/* Direccion */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Direccion
            </label>
            <input
              type="text"
              value={form.direccion}
              onChange={(e) => updateField("direccion", e.target.value)}
              placeholder="Direccion completa"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px]"
            />
          </div>

          {/* Contacto, Telefono, Email */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Contacto
              </label>
              <input
                type="text"
                value={form.contacto}
                onChange={(e) => updateField("contacto", e.target.value)}
                placeholder="Persona contacto"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Telefono
              </label>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => updateField("telefono", e.target.value)}
                placeholder="600 000 000"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="email@proveedor.com"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px]"
              />
            </div>
          </div>

          {/* Productos subministrados */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Productos Subministrados
            </label>
            <textarea
              value={form.productosSubministrados}
              onChange={(e) => updateField("productosSubministrados", e.target.value)}
              rows={2}
              placeholder="Descripcion de productos que suministra..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none"
            />
          </div>

          {/* Categoria y Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Categoria
              </label>
              <select
                value={form.categoria}
                onChange={(e) =>
                  updateField("categoria", e.target.value as Proveedor["categoria"])
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px] bg-white"
              >
                <option value="A">A - {categoriaDescriptions.A}</option>
                <option value="B">B - {categoriaDescriptions.B}</option>
                <option value="C">C - {categoriaDescriptions.C}</option>
                <option value="D">D - {categoriaDescriptions.D}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Estado
              </label>
              <select
                value={form.estado}
                onChange={(e) =>
                  updateField("estado", e.target.value as Proveedor["estado"])
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px] bg-white"
              >
                <option value="aprobado">Aprobado</option>
                <option value="provisional">Provisional</option>
                <option value="suspendido">Suspendido</option>
                <option value="alerta">Alerta</option>
              </select>
            </div>
          </div>

          {/* Evaluacion */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Incidencias Anuales
              </label>
              <input
                type="number"
                min={0}
                value={form.incidenciasAnuales}
                onChange={(e) =>
                  updateField("incidenciasAnuales", parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Calificacion Anual
              </label>
              <input
                type="text"
                value={form.calificacionAnual}
                onChange={(e) => updateField("calificacionAnual", e.target.value)}
                placeholder="Ej: Satisfactorio"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Ultima Evaluacion
              </label>
              <input
                type="date"
                value={form.fechaUltimaEvaluacion}
                onChange={(e) => updateField("fechaUltimaEvaluacion", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px]"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Observaciones
            </label>
            <textarea
              value={form.observaciones}
              onChange={(e) => updateField("observaciones", e.target.value)}
              rows={2}
              placeholder="Observaciones sobre el proveedor..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none"
            />
          </div>

          {/* Fotos */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Documentos / Fotos (COA, fichas tecnicas, registro sanitario)
            </label>
            <PhotoUpload
              fotos={form.fotos}
              onChange={(fotos) => setForm((prev) => ({ ...prev, fotos }))}
              folder="proveedores"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleAdd}
            disabled={!form.nombre || !form.codigo}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
          >
            {editingId ? "Guardar Cambios" : "Registrar Proveedor"}
          </button>
        </div>
      )}

      {/* List */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg font-medium">
            {filter === "todos"
              ? "Sin proveedores registrados"
              : `Sin proveedores ${filter === "aprobado" ? "aprobados" : filter === "provisional" ? "provisionales" : "suspendidos"}`}
          </p>
          <p className="text-sm mt-1">
            Pulsa &quot;+ Nuevo Proveedor&quot; para empezar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((proveedor) => {
            const isExpanded = expandedId === proveedor.id;

            return (
              <div
                key={proveedor.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
              >
                {/* Card summary */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : proveedor.id)
                  }
                  className="w-full text-left p-4 min-h-[60px]"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-slate-400">
                          {proveedor.codigo}
                        </span>
                        <span className="font-semibold text-slate-800 text-sm truncate">
                          {proveedor.nombre}
                        </span>
                      </div>
                      {proveedor.productosSubministrados && (
                        <p className="text-xs text-slate-500 truncate">
                          {proveedor.productosSubministrados}
                        </p>
                      )}
                      {proveedor.cif && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          CIF: {proveedor.cif}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${categoriaColor[proveedor.categoria]}`}
                      >
                        Cat. {proveedor.categoria}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${estadoColor[proveedor.estado]}`}
                      >
                        {estadoLabel[proveedor.estado]}
                      </span>
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-4">
                    {/* Contact info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {proveedor.direccion && (
                        <div>
                          <span className="text-slate-500 text-xs font-medium">
                            Direccion
                          </span>
                          <p className="text-slate-700">{proveedor.direccion}</p>
                        </div>
                      )}
                      {proveedor.poblacion && (
                        <div>
                          <span className="text-slate-500 text-xs font-medium">
                            Poblacion
                          </span>
                          <p className="text-slate-700">{proveedor.poblacion}</p>
                        </div>
                      )}
                      {proveedor.contacto && (
                        <div>
                          <span className="text-slate-500 text-xs font-medium">
                            Contacto
                          </span>
                          <p className="text-slate-700">{proveedor.contacto}</p>
                        </div>
                      )}
                      {proveedor.telefono && (
                        <div>
                          <span className="text-slate-500 text-xs font-medium">
                            Telefono
                          </span>
                          <p className="text-slate-700">{proveedor.telefono}</p>
                        </div>
                      )}
                      {proveedor.email && (
                        <div>
                          <span className="text-slate-500 text-xs font-medium">
                            Email
                          </span>
                          <p className="text-slate-700">{proveedor.email}</p>
                        </div>
                      )}
                    </div>

                    {/* Products */}
                    {proveedor.productosSubministrados && (
                      <div>
                        <span className="text-slate-500 text-xs font-medium">
                          Productos Subministrados
                        </span>
                        <p className="text-sm text-slate-700 mt-0.5">
                          {proveedor.productosSubministrados}
                        </p>
                      </div>
                    )}

                    {/* Categoria detail */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500 text-xs font-medium">
                          Categoria
                        </span>
                        <p className="text-slate-700">
                          {proveedor.categoria} -{" "}
                          {categoriaDescriptions[proveedor.categoria]}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs font-medium">
                          Estado
                        </span>
                        <p className="text-slate-700">
                          {estadoLabel[proveedor.estado]}
                        </p>
                      </div>
                    </div>

                    {/* Evaluation */}
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500 text-xs font-medium">
                          Incidencias Anuales
                        </span>
                        <p
                          className={`font-semibold ${proveedor.incidenciasAnuales > 0 ? "text-red-600" : "text-green-600"}`}
                        >
                          {proveedor.incidenciasAnuales}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs font-medium">
                          Calificacion Anual
                        </span>
                        <p className="text-slate-700">
                          {proveedor.calificacionAnual || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs font-medium">
                          Ultima Evaluacion
                        </span>
                        <p className="text-slate-700">
                          {proveedor.fechaUltimaEvaluacion
                            ? new Date(
                                proveedor.fechaUltimaEvaluacion
                              ).toLocaleDateString("es-ES")
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {/* Observaciones */}
                    {proveedor.observaciones && (
                      <div>
                        <span className="text-slate-500 text-xs font-medium">
                          Observaciones
                        </span>
                        <p className="text-sm text-slate-700 mt-0.5">
                          {proveedor.observaciones}
                        </p>
                      </div>
                    )}

                    {/* Fotos */}
                    {proveedor.fotos.length > 0 && (
                      <div>
                        <span className="text-slate-500 text-xs font-medium">
                          Documentos ({proveedor.fotos.length})
                        </span>
                        <div className="grid grid-cols-4 gap-2 mt-1">
                          {proveedor.fotos.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt={`Doc ${i + 1}`}
                              className="w-full aspect-square object-cover rounded-lg border border-slate-200"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => handleEdit(proveedor)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors min-h-[40px]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Eliminar este proveedor?")) {
                            onChange(data.filter((p) => p.id !== proveedor.id));
                            setExpandedId(null);
                          }
                        }}
                        className="text-red-500 text-xs font-medium hover:text-red-700 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
