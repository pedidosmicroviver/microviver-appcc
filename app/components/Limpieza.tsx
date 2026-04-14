"use client";

import { useState } from "react";
import type { PlanLimpieza, RegistroLimpieza } from "../lib/types";
import { generateId } from "../lib/storage";
import PhotoUpload from "./PhotoUpload";

interface LimpiezaProps {
  data: PlanLimpieza[];
  onChange: (data: PlanLimpieza[]) => void;
}

const frecuenciaColor: Record<PlanLimpieza["frecuencia"], string> = {
  diaria: "bg-green-100 text-green-800",
  semanal: "bg-blue-100 text-blue-800",
  mensual: "bg-amber-100 text-amber-800",
};

const emptyPlan = (): Omit<PlanLimpieza, "id"> => ({
  zona: "",
  equipo: "",
  productoLimpieza: "",
  frecuencia: "diaria",
  responsable: "",
  instrucciones: "",
  activo: true,
  registros: [],
});

const emptyRegistro = (): Omit<RegistroLimpieza, "id" | "planId"> => ({
  fecha: new Date().toISOString().slice(0, 10),
  operario: "",
  conforme: true,
  observaciones: "",
  fotos: [],
});

export default function Limpieza({ data, onChange }: LimpiezaProps) {
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planForm, setPlanForm] = useState(emptyPlan());
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const [regForm, setRegForm] = useState(emptyRegistro());
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const activePlans = data.filter((p) => p.activo);

  /* ---- Plan CRUD ---- */
  const handleAddPlan = () => {
    if (!planForm.zona || !planForm.equipo || !planForm.responsable) return;
    const nuevo: PlanLimpieza = { ...planForm, id: generateId("lim") };
    onChange([...data, nuevo]);
    setPlanForm(emptyPlan());
    setShowPlanForm(false);
  };

  const toggleActivo = (id: string) => {
    onChange(data.map((p) => (p.id === id ? { ...p, activo: !p.activo } : p)));
  };

  const deletePlan = (id: string) => {
    onChange(data.filter((p) => p.id !== id));
  };

  /* ---- Registro ---- */
  const handleAddRegistro = () => {
    if (!selectedPlanId || !regForm.operario) return;
    const nuevo: RegistroLimpieza = {
      ...regForm,
      id: generateId("rlim"),
      planId: selectedPlanId,
    };
    onChange(
      data.map((p) =>
        p.id === selectedPlanId
          ? { ...p, registros: [...p.registros, nuevo] }
          : p
      )
    );
    setRegForm(emptyRegistro());
    setSelectedPlanId("");
  };

  /* All registros flattened and sorted */
  const allRegistros = data
    .flatMap((p) =>
      p.registros.map((r) => ({
        ...r,
        zona: p.zona,
        equipo: p.equipo,
      }))
    )
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 20);

  const handleUpdateRegFotos = (fotos: string[]) => {
    setRegForm((prev) => ({ ...prev, fotos }));
  };

  return (
    <div className="space-y-8">
      {/* ============ SECTION 1: Plan de L+D ============ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Plan de L+D</h2>
          <button
            onClick={() => setShowPlanForm(!showPlanForm)}
            className="px-5 py-3 bg-green-600 text-white rounded-xl text-base font-semibold active:bg-green-700 transition"
          >
            {showPlanForm ? "Cancelar" : "+ Nueva Zona"}
          </button>
        </div>

        {/* Plan form */}
        {showPlanForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Zona
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sala de produccion"
                  value={planForm.zona}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, zona: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  list="zonas-sugeridas"
                />
                <datalist id="zonas-sugeridas">
                  <option value="Sala 1" />
                  <option value="Sala 2" />
                  <option value="Sala 3" />
                  <option value="Bano 1" />
                  <option value="Bano 2" />
                  <option value="Oficina" />
                  <option value="Cocina" />
                  <option value="Almacen MP" />
                  <option value="Almacen envases" />
                  <option value="Almacen producto terminado" />
                  <option value="Zona envasado" />
                  <option value="Camara fermentacion" />
                  <option value="Recepcion/expedicion" />
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Equipo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Mezcladora"
                  value={planForm.equipo}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, equipo: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  list="equipos-sugeridos"
                />
                <datalist id="equipos-sugeridos">
                  <option value="Mezcladora" />
                  <option value="Dosificadora" />
                  <option value="Selladora" />
                  <option value="Mesa de trabajo" />
                  <option value="Suelo" />
                  <option value="Paredes" />
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Producto de limpieza
                </label>
                <input
                  type="text"
                  placeholder="Ej: Degreaser D-10 + Sanit-100"
                  value={planForm.productoLimpieza}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, productoLimpieza: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Frecuencia
                </label>
                <select
                  value={planForm.frecuencia}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      frecuencia: e.target.value as PlanLimpieza["frecuencia"],
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  <option value="diaria">Diaria</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Responsable
                </label>
                <input
                  type="text"
                  placeholder="Nombre del responsable"
                  value={planForm.responsable}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, responsable: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Instrucciones / Protocolo
              </label>
              <textarea
                placeholder="Pasos del protocolo de limpieza..."
                value={planForm.instrucciones}
                onChange={(e) =>
                  setPlanForm({ ...planForm, instrucciones: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              onClick={handleAddPlan}
              className="w-full py-3 bg-green-600 text-white rounded-xl text-base font-semibold active:bg-green-700 transition"
            >
              Guardar Plan
            </button>
          </div>
        )}

        {/* Plan cards */}
        {data.length === 0 && (
          <p className="text-center text-slate-400 py-8">
            No hay zonas registradas. Pulsa &quot;+ Nueva Zona&quot; para comenzar.
          </p>
        )}

        <div className="space-y-3">
          {data.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border ${plan.activo ? "border-slate-200" : "border-slate-100 opacity-60"} overflow-hidden`}
            >
              {/* Card header */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer active:bg-slate-50 transition"
                onClick={() =>
                  setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)
                }
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 text-base">
                      {plan.zona}
                    </span>
                    <span className="text-slate-400">-</span>
                    <span className="text-slate-600 text-base">
                      {plan.equipo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${frecuenciaColor[plan.frecuencia]}`}
                    >
                      {plan.frecuencia.charAt(0).toUpperCase() +
                        plan.frecuencia.slice(1)}
                    </span>
                    <span className="text-sm text-slate-500">
                      {plan.responsable}
                    </span>
                    {!plan.activo && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle activo */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleActivo(plan.id);
                    }}
                    className={`relative w-12 h-7 rounded-full transition ${plan.activo ? "bg-green-500" : "bg-slate-300"}`}
                    title={plan.activo ? "Desactivar" : "Activar"}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${plan.activo ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlan(plan.id);
                    }}
                    className="p-2 text-red-400 hover:text-red-600 active:text-red-700 transition"
                    title="Eliminar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                  {/* Chevron */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-slate-400 transition-transform ${expandedPlanId === plan.id ? "rotate-180" : ""}`}
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

              {/* Expanded content */}
              {expandedPlanId === plan.id && (
                <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50">
                  {plan.productoLimpieza && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Producto:</span>{" "}
                      {plan.productoLimpieza}
                    </p>
                  )}
                  {plan.instrucciones && (
                    <p className="text-sm text-slate-600 whitespace-pre-line">
                      <span className="font-medium">Instrucciones:</span>{" "}
                      {plan.instrucciones}
                    </p>
                  )}

                  <h4 className="text-sm font-semibold text-slate-700 pt-2">
                    Registros recientes ({plan.registros.length})
                  </h4>
                  {plan.registros.length === 0 ? (
                    <p className="text-sm text-slate-400">Sin registros.</p>
                  ) : (
                    <div className="space-y-2">
                      {[...plan.registros]
                        .sort((a, b) => b.fecha.localeCompare(a.fecha))
                        .slice(0, 10)
                        .map((reg) => (
                          <div
                            key={reg.id}
                            className="flex items-start gap-3 bg-white rounded-xl p-3 text-sm"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-slate-500">
                                  {reg.fecha}
                                </span>
                                <span className="font-medium text-slate-700">
                                  {reg.operario}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${reg.conforme ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                >
                                  {reg.conforme ? "Conforme" : "No Conforme"}
                                </span>
                              </div>
                              {reg.observaciones && (
                                <p className="text-slate-500 mt-1">
                                  {reg.observaciones}
                                </p>
                              )}
                            </div>
                            {reg.fotos.length > 0 && (
                              <div className="flex gap-1 shrink-0">
                                {reg.fotos.slice(0, 3).map((url, i) => (
                                  <img
                                    key={i}
                                    src={url}
                                    alt="foto"
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============ SECTION 2: Registro de Limpieza ============ */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Registrar Limpieza
        </h2>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Plan (zona - equipo)
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">-- Seleccionar plan --</option>
                {activePlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.zona} - {p.equipo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={regForm.fecha}
                onChange={(e) =>
                  setRegForm({ ...regForm, fecha: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Operario
              </label>
              <input
                type="text"
                placeholder="Nombre del operario"
                value={regForm.operario}
                onChange={(e) =>
                  setRegForm({ ...regForm, operario: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={regForm.conforme}
                  onChange={(e) =>
                    setRegForm({ ...regForm, conforme: e.target.checked })
                  }
                  className="w-6 h-6 rounded-lg text-green-600 focus:ring-green-500 border-slate-300"
                />
                <span className="text-base text-slate-700 font-medium">
                  Conforme
                </span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Observaciones
              </label>
              <textarea
                placeholder="Observaciones (opcional)"
                value={regForm.observaciones}
                onChange={(e) =>
                  setRegForm({ ...regForm, observaciones: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <PhotoUpload
                fotos={regForm.fotos}
                onChange={handleUpdateRegFotos}
                folder="limpieza"
              />
            </div>
          </div>
          <button
            onClick={handleAddRegistro}
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-base font-semibold active:bg-blue-700 transition"
          >
            Guardar Registro
          </button>
        </div>

        {/* Recent registros */}
        <h3 className="text-lg font-semibold text-slate-700 mb-3">
          Registros recientes
        </h3>
        {allRegistros.length === 0 ? (
          <p className="text-center text-slate-400 py-6">
            No hay registros de limpieza.
          </p>
        ) : (
          <div className="space-y-2">
            {allRegistros.map((reg) => (
              <div
                key={reg.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-slate-500">{reg.fecha}</span>
                    <span className="font-semibold text-slate-800 text-base">
                      {reg.zona} - {reg.equipo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm text-slate-600">
                      {reg.operario}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${reg.conforme ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {reg.conforme ? "Conforme" : "No Conforme"}
                    </span>
                  </div>
                  {reg.observaciones && (
                    <p className="text-sm text-slate-500 mt-1">
                      {reg.observaciones}
                    </p>
                  )}
                </div>
                {reg.fotos.length > 0 && (
                  <div className="flex gap-1 shrink-0">
                    {reg.fotos.slice(0, 3).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="foto"
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
