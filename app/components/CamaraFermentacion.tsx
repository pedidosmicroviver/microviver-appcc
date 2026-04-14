"use client";

import { useState } from "react";
import type { Fermentacion, ControlFermentacion, MateriaPrima } from "../lib/types";
import { generateId } from "../lib/storage";
import PhotoUpload from "./PhotoUpload";

interface CamaraFermentacionProps {
  data: Fermentacion[];
  onChange: (data: Fermentacion[]) => void;
  materiasPrimas: MateriaPrima[];
}

const CONTROL_DAYS = [1, 3, 7, 15, 30, 40];
const TOTAL_DAYS = 40;

const EMPTY_CONTROL: Omit<ControlFermentacion, "fecha"> = {
  dia: 1,
  ph: 0,
  temperatura: 0,
  humedadRelativa: 0,
  aspectoVisual: "",
  olor: "",
  conforme: true,
  observaciones: "",
  fotos: [],
};

interface NewFermentForm {
  producto: string;
  loteProduccion: string;
  fechaInicio: string;
  selectedMPs: string[];
  fase: "primaria" | "secundaria";
  linea: "liquidos" | "solidos_ferm" | "solidos_no_ferm" | "alimentos";
  temperaturaObjetivo: number;
  duracionDias: number;
  fermentacionPrimariaId: string;
}

const EMPTY_FERM_FORM: NewFermentForm = {
  producto: "",
  loteProduccion: "",
  fechaInicio: "",
  selectedMPs: [],
  fase: "primaria",
  linea: "liquidos",
  temperaturaObjetivo: 30,
  duracionDias: 40,
  fermentacionPrimariaId: "",
};

function daysElapsed(fechaInicio: string, duracion: number = TOTAL_DAYS): number {
  if (!fechaInicio) return 0;
  const start = new Date(fechaInicio);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.min(diff, duracion));
}

function getControlDotColor(
  controles: ControlFermentacion[],
  day: number,
  elapsed: number
): "green" | "red" | "gray" {
  const control = controles.find((c) => c.dia === day);
  if (!control) {
    return elapsed >= day ? "gray" : "gray";
  }
  return control.conforme ? "green" : "red";
}

function hasCriticalPhAlert(controles: ControlFermentacion[]): boolean {
  const day7 = controles.find((c) => c.dia === 7);
  return day7 !== undefined && day7.ph > 4.6;
}

function estadoBadge(estado: Fermentacion["estado"]) {
  switch (estado) {
    case "activa":
      return (
        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          Activa
        </span>
      );
    case "completada":
      return (
        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          Completada
        </span>
      );
    case "rechazada":
      return (
        <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          Rechazada
        </span>
      );
  }
}

export default function CamaraFermentacion({
  data,
  onChange,
  materiasPrimas,
}: CamaraFermentacionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [fermForm, setFermForm] = useState<NewFermentForm>(EMPTY_FERM_FORM);
  const [controlForm, setControlForm] = useState<Omit<ControlFermentacion, "fecha">>(EMPTY_CONTROL);
  const [showControlForm, setShowControlForm] = useState<string | null>(null);
  const [fermFormFotos, setFermFormFotos] = useState<string[]>([]);

  const handleAddFermentation = () => {
    if (!fermForm.producto || !fermForm.loteProduccion || !fermForm.fechaInicio) return;
    const newFerm: Fermentacion = {
      id: generateId("ferm"),
      producto: fermForm.producto,
      loteProduccion: fermForm.loteProduccion,
      fechaInicio: fermForm.fechaInicio,
      materiasPrimas: fermForm.selectedMPs,
      controles: [],
      estado: "activa",
      fotos: fermFormFotos,
      fase: fermForm.fase,
      temperaturaObjetivo: fermForm.temperaturaObjetivo,
      duracionDias: fermForm.duracionDias,
      linea: fermForm.linea,
      fermentacionPrimariaId: fermForm.fermentacionPrimariaId,
    };
    onChange([...data, newFerm]);
    setFermForm(EMPTY_FERM_FORM);
    setFermFormFotos([]);
    setShowNewForm(false);
  };

  const handleAddControl = (fermId: string) => {
    const updated = data.map((f) => {
      if (f.id !== fermId) return f;
      const newControl: ControlFermentacion = {
        ...controlForm,
        fecha: new Date().toISOString().split("T")[0],
      };
      return { ...f, controles: [...f.controles, newControl] };
    });
    onChange(updated);
    setControlForm(EMPTY_CONTROL);
    setShowControlForm(null);
  };

  const toggleMP = (mpId: string) => {
    setFermForm((prev) => ({
      ...prev,
      selectedMPs: prev.selectedMPs.includes(mpId)
        ? prev.selectedMPs.filter((id) => id !== mpId)
        : [...prev.selectedMPs, mpId],
    }));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Camara de Fermentacion</h2>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="bg-green-600 text-white px-5 py-3 rounded-lg text-base font-semibold active:bg-green-700 min-h-[48px]"
        >
          {showNewForm ? "Cancelar" : "+ Nueva Fermentacion"}
        </button>
      </div>

      {/* Reference limits - dynamic based on active fermentations */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800 space-y-1">
        <span className="font-semibold">Limites de referencia:</span>
        <div className="flex flex-col gap-0.5 mt-1">
          <span>Primaria: Temp objetivo: 30C &bull; pH objetivo final: 3.3-3.8 &bull; Duracion: 40 dias</span>
          <span>Secundaria: Temp objetivo: 35C &bull; pH objetivo final: 3.3-3.8 &bull; Duracion: 40 dias</span>
        </div>
      </div>

      {/* New Fermentation Form */}
      {showNewForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-lg">Nueva Fermentacion</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
              <input
                type="text"
                value={fermForm.producto}
                onChange={(e) => setFermForm({ ...fermForm, producto: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
                placeholder="Nombre del producto"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lote Produccion *</label>
              <input
                type="text"
                value={fermForm.loteProduccion}
                onChange={(e) => setFermForm({ ...fermForm, loteProduccion: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
                placeholder="Lote"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
              <input
                type="date"
                value={fermForm.fechaInicio}
                onChange={(e) => setFermForm({ ...fermForm, fechaInicio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fase *</label>
              <select
                value={fermForm.fase}
                onChange={(e) => {
                  const fase = e.target.value as "primaria" | "secundaria";
                  setFermForm({
                    ...fermForm,
                    fase,
                    temperaturaObjetivo: fase === "primaria" ? 30 : 35,
                    fermentacionPrimariaId: fase === "primaria" ? "" : fermForm.fermentacionPrimariaId,
                  });
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
              >
                <option value="primaria">Primaria</option>
                <option value="secundaria">Secundaria</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Linea *</label>
              <select
                value={fermForm.linea}
                onChange={(e) => setFermForm({ ...fermForm, linea: e.target.value as NewFermentForm["linea"] })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
              >
                <option value="liquidos">Liquidos fermentados</option>
                <option value="solidos_ferm">Solidos fermentados</option>
                <option value="solidos_no_ferm">Solidos no fermentados</option>
                <option value="alimentos">Alimentos fermentados</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temp. Objetivo (C)</label>
              <input
                type="number"
                value={fermForm.temperaturaObjetivo}
                onChange={(e) => setFermForm({ ...fermForm, temperaturaObjetivo: parseFloat(e.target.value) || 30 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duracion (dias)</label>
              <input
                type="number"
                value={fermForm.duracionDias}
                onChange={(e) => setFermForm({ ...fermForm, duracionDias: parseInt(e.target.value) || 40 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
                min="1"
              />
            </div>
          </div>
          {fermForm.fase === "secundaria" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fermentacion Primaria de origen *</label>
              <select
                value={fermForm.fermentacionPrimariaId}
                onChange={(e) => setFermForm({ ...fermForm, fermentacionPrimariaId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
              >
                <option value="">-- Seleccionar primaria --</option>
                {data
                  .filter((f) => f.fase === "primaria" && f.estado === "completada")
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.producto} - Lote: {f.loteProduccion} ({f.fechaInicio})
                    </option>
                  ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Materias Primas ({fermForm.selectedMPs.length} seleccionadas)
            </label>
            {materiasPrimas.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay materias primas disponibles.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1 bg-white">
                {materiasPrimas.map((mp) => (
                  <label
                    key={mp.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer min-h-[44px]"
                  >
                    <input
                      type="checkbox"
                      checked={fermForm.selectedMPs.includes(mp.id)}
                      onChange={() => toggleMP(mp.id)}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-sm">
                      {mp.nombre} - Lote: {mp.lote}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fotos</label>
            <PhotoUpload
              fotos={fermFormFotos}
              onChange={setFermFormFotos}
              folder="fermentacion"
            />
          </div>
          <button
            onClick={handleAddFermentation}
            disabled={!fermForm.producto || !fermForm.loteProduccion || !fermForm.fechaInicio}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-semibold disabled:opacity-40 active:bg-blue-700 min-h-[48px]"
          >
            Iniciar Fermentacion
          </button>
        </div>
      )}

      {data.length === 0 && !showNewForm && (
        <p className="text-gray-500 text-center py-8">No hay fermentaciones registradas.</p>
      )}

      {/* Fermentation List */}
      <div className="space-y-3">
        {data.map((ferm) => {
          const fermDuration = ferm.duracionDias || TOTAL_DAYS;
          const elapsed = daysElapsed(ferm.fechaInicio, fermDuration);
          const progress = Math.min((elapsed / fermDuration) * 100, 100);
          const isExpanded = expandedId === ferm.id;
          const criticalPh = hasCriticalPhAlert(ferm.controles);

          return (
            <div
              key={ferm.id}
              className="border border-gray-200 rounded-xl overflow-hidden bg-white"
            >
              {/* Header row - clickable */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : ferm.id)}
                className="w-full p-4 text-left active:bg-gray-50 min-h-[48px]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-base">{ferm.producto}</span>
                    {estadoBadge(ferm.estado)}
                    {ferm.fase === "primaria" ? (
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">Primaria</span>
                    ) : (
                      <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">Secundaria</span>
                    )}
                    {ferm.linea === "liquidos" && (
                      <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">Liquidos</span>
                    )}
                    {ferm.linea === "solidos_ferm" && (
                      <span className="bg-amber-50 text-amber-600 text-xs font-medium px-2 py-0.5 rounded-full">Solidos ferm</span>
                    )}
                    {ferm.linea === "solidos_no_ferm" && (
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">Solidos no ferm</span>
                    )}
                    {ferm.linea === "alimentos" && (
                      <span className="bg-green-50 text-green-600 text-xs font-medium px-2 py-0.5 rounded-full">Alimentos</span>
                    )}
                    {criticalPh && (
                      <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                        pH CRITICO
                      </span>
                    )}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Lote: {ferm.loteProduccion} &bull; Inicio: {ferm.fechaInicio} &bull; Dia {elapsed}/{ferm.duracionDias || TOTAL_DAYS}
                  {ferm.fase === "secundaria" && ferm.fermentacionPrimariaId && (() => {
                    const primaria = data.find((f) => f.id === ferm.fermentacionPrimariaId);
                    return primaria ? (
                      <span> &bull; Origen: {primaria.loteProduccion}</span>
                    ) : null;
                  })()}
                </div>

                {/* Progress Bar */}
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-green-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                  {/* Control day markers */}
                  {CONTROL_DAYS.map((day) => {
                    const pos = (day / fermDuration) * 100;
                    const dotColor = getControlDotColor(ferm.controles, day, elapsed);
                    const colorClass =
                      dotColor === "green"
                        ? "bg-green-600 border-green-800"
                        : dotColor === "red"
                        ? "bg-red-500 border-red-700"
                        : "bg-gray-400 border-gray-500";
                    return (
                      <div
                        key={day}
                        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border ${colorClass}`}
                        style={{ left: `${pos}%`, marginLeft: "-6px" }}
                        title={`Dia ${day}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  {CONTROL_DAYS.map((day) => (
                    <span key={day}>D{day}</span>
                  ))}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                  {/* Critical pH alert */}
                  {criticalPh && (
                    <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-sm text-red-800 font-semibold">
                      ALERTA: pH &gt; 4.6 en dia 7 - No conformidad critica. Evaluar rechazo del lote.
                    </div>
                  )}

                  {/* Controls Table */}
                  {ferm.controles.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="text-left p-2 rounded-tl-lg">Dia</th>
                            <th className="text-left p-2">pH</th>
                            <th className="text-left p-2">Temp</th>
                            <th className="text-left p-2">HR%</th>
                            <th className="text-left p-2">Aspecto</th>
                            <th className="text-left p-2">Olor</th>
                            <th className="text-left p-2">Fotos</th>
                            <th className="text-center p-2 rounded-tr-lg">Conf.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ferm.controles
                            .sort((a, b) => a.dia - b.dia)
                            .map((ctrl, i) => {
                              const phWarn = ctrl.dia >= 7 && ctrl.ph > 4.6;
                              const tempWarn = ctrl.temperatura < 18 || ctrl.temperatura > 24;
                              const hrWarn = ctrl.humedadRelativa < 60 || ctrl.humedadRelativa > 80;
                              return (
                                <tr key={i} className="border-b border-gray-100">
                                  <td className="p-2 font-medium">{ctrl.dia}</td>
                                  <td className={`p-2 ${phWarn ? "text-red-600 font-bold" : ""}`}>
                                    {ctrl.ph}
                                  </td>
                                  <td className={`p-2 ${tempWarn ? "text-orange-600 font-bold" : ""}`}>
                                    {ctrl.temperatura} C
                                  </td>
                                  <td className={`p-2 ${hrWarn ? "text-orange-600 font-bold" : ""}`}>
                                    {ctrl.humedadRelativa}%
                                  </td>
                                  <td className="p-2">{ctrl.aspectoVisual}</td>
                                  <td className="p-2">{ctrl.olor}</td>
                                  <td className="p-2">
                                    {ctrl.fotos && ctrl.fotos.length > 0 && (
                                      <div className="flex gap-1">
                                        {ctrl.fotos.map((foto, fi) => (
                                          <img
                                            key={fi}
                                            src={foto}
                                            alt={`Foto ${fi + 1}`}
                                            className="w-8 h-8 object-cover rounded cursor-pointer"
                                            onClick={() => window.open(foto, "_blank")}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-2 text-center">
                                    {ctrl.conforme ? (
                                      <span className="text-green-600 font-bold">OK</span>
                                    ) : (
                                      <span className="text-red-600 font-bold">NC</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {ferm.controles.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-2">
                      Sin controles registrados.
                    </p>
                  )}

                  {/* Add Control Form */}
                  {showControlForm === ferm.id ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                      <h4 className="font-semibold text-base">Registrar Control</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dia *</label>
                          <input
                            type="number"
                            value={controlForm.dia || ""}
                            onChange={(e) =>
                              setControlForm({ ...controlForm, dia: parseInt(e.target.value) || 0 })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
                            min="1"
                            max="40"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            pH <span className="text-gray-400">(&le; 4.6 dia 7)</span>
                          </label>
                          <input
                            type="number"
                            value={controlForm.ph || ""}
                            onChange={(e) =>
                              setControlForm({ ...controlForm, ph: parseFloat(e.target.value) || 0 })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
                            step="0.1"
                            min="0"
                            max="14"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Temperatura C <span className="text-gray-400">(18-24)</span>
                          </label>
                          <input
                            type="number"
                            value={controlForm.temperatura || ""}
                            onChange={(e) =>
                              setControlForm({
                                ...controlForm,
                                temperatura: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Humedad Relativa % <span className="text-gray-400">(60-80)</span>
                          </label>
                          <input
                            type="number"
                            value={controlForm.humedadRelativa || ""}
                            onChange={(e) =>
                              setControlForm({
                                ...controlForm,
                                humedadRelativa: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
                            step="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Aspecto Visual</label>
                          <input
                            type="text"
                            value={controlForm.aspectoVisual}
                            onChange={(e) =>
                              setControlForm({ ...controlForm, aspectoVisual: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
                            placeholder="Color, textura..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Olor</label>
                          <input
                            type="text"
                            value={controlForm.olor}
                            onChange={(e) =>
                              setControlForm({ ...controlForm, olor: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[48px]"
                            placeholder="Descripcion del olor"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                        <textarea
                          value={controlForm.observaciones}
                          onChange={(e) =>
                            setControlForm({ ...controlForm, observaciones: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base"
                          rows={2}
                          placeholder="Observaciones..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fotos</label>
                        <PhotoUpload
                          fotos={controlForm.fotos || []}
                          onChange={(fotos) => setControlForm({ ...controlForm, fotos })}
                          folder="fermentacion-controles"
                        />
                      </div>
                      <label className="flex items-center gap-3 py-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={controlForm.conforme}
                          onChange={(e) =>
                            setControlForm({ ...controlForm, conforme: e.target.checked })
                          }
                          className="w-6 h-6 rounded"
                        />
                        <span className="text-base">Conforme</span>
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAddControl(ferm.id)}
                          disabled={!controlForm.dia}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-semibold disabled:opacity-40 active:bg-blue-700 min-h-[48px]"
                        >
                          Guardar Control
                        </button>
                        <button
                          onClick={() => setShowControlForm(null)}
                          className="border border-gray-300 text-gray-700 px-5 py-3 rounded-lg text-base active:bg-gray-100 min-h-[48px]"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setControlForm(EMPTY_CONTROL);
                        setShowControlForm(ferm.id);
                      }}
                      className="bg-indigo-600 text-white px-5 py-3 rounded-lg text-base font-semibold active:bg-indigo-700 min-h-[48px]"
                    >
                      Registrar Control
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
