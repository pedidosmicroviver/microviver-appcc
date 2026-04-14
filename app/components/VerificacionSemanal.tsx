"use client";

import { useState } from "react";
import type { VerificacionSemanal } from "../lib/types";
import { generateId } from "../lib/storage";
import PhotoUpload from "./PhotoUpload";

interface VerificacionSemanalProps {
  data: VerificacionSemanal[];
  onChange: (data: VerificacionSemanal[]) => void;
}

type ZoneKey =
  | "recepcion"
  | "almacenMp"
  | "almacenEnvases"
  | "salaFermentacion"
  | "areaEnvasado"
  | "almacenPt";

type CheckType = "Ld" | "Plagas" | "Manto";

const ZONES: { key: ZoneKey; label: string }[] = [
  { key: "recepcion", label: "Recepcion / Expedicion" },
  { key: "almacenMp", label: "Almacen MP" },
  { key: "almacenEnvases", label: "Almacen Envases" },
  { key: "salaFermentacion", label: "Sala Fermentacion" },
  { key: "areaEnvasado", label: "Area Envasado" },
  { key: "almacenPt", label: "Almacen PT" },
];

const CHECK_TYPES: { key: CheckType; label: string }[] = [
  { key: "Ld", label: "L+D" },
  { key: "Plagas", label: "Plagas" },
  { key: "Manto", label: "Manto." },
];

// Map zone+check to the actual field name in the type (handles the typo in types.ts)
function getFieldName(zone: ZoneKey, check: CheckType): keyof VerificacionSemanal {
  if (zone === "almacenEnvases" && check === "Plagas") {
    return "almacenEnvasesPlayas" as keyof VerificacionSemanal; // typo in types.ts
  }
  return `${zone}${check}` as keyof VerificacionSemanal;
}

function cycleValue(val: string): string {
  if (val === "") return "C";
  if (val === "C") return "I";
  return "";
}

const emptyForm = (): Omit<VerificacionSemanal, "id"> => ({
  fecha: new Date().toISOString().slice(0, 10),
  responsable: "",
  firma: "",
  aguaPh: "",
  aguaCloro: "",
  aguaOrganoleptico: "",
  recepcionLd: "",
  recepcionPlagas: "",
  recepcionManto: "",
  almacenMpLd: "",
  almacenMpPlagas: "",
  almacenMpManto: "",
  almacenEnvasesLd: "",
  almacenEnvasesPlayas: "",
  almacenEnvasesManto: "",
  salaFermentacionLd: "",
  salaFermentacionPlagas: "",
  salaFermentacionManto: "",
  areaEnvasadoLd: "",
  areaEnvasadoPlagas: "",
  areaEnvasadoManto: "",
  almacenPtLd: "",
  almacenPtPlagas: "",
  almacenPtManto: "",
  incidenciasLd: "",
  incidenciasPlagas: "",
  incidenciasManto: "",
  accionesCorrectoras: "",
  fotos: [],
});

function getToggleClasses(val: string): string {
  if (val === "C") return "bg-green-500 text-white border-green-600";
  if (val === "I") return "bg-red-500 text-white border-red-600";
  return "bg-gray-200 text-gray-500 border-gray-300";
}

function countValues(record: VerificacionSemanal, target: string, checkType: CheckType): number {
  let count = 0;
  for (const zone of ZONES) {
    const field = getFieldName(zone.key, checkType);
    if ((record[field] as string) === target) count++;
  }
  return count;
}

export default function VerificacionSemanalModule({
  data,
  onChange,
}: VerificacionSemanalProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggle = (zone: ZoneKey, check: CheckType) => {
    const field = getFieldName(zone, check);
    const current = (form as Record<string, unknown>)[field as string] as string;
    updateField(field as string, cycleValue(current));
  };

  const handleAdd = () => {
    if (!form.responsable || !form.fecha) return;
    const newRecord: VerificacionSemanal = {
      ...form,
      id: generateId("ver"),
    };
    onChange([newRecord, ...data]);
    setForm(emptyForm());
    setShowForm(false);
  };

  const sorted = [...data].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          Verificacion Semanal (Reg.18)
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors min-h-[44px]"
        >
          {showForm ? "Cancelar" : "+ Nueva Verificacion"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-5 shadow-sm">
          {/* Fecha y Responsable */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => updateField("fecha", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Responsable
              </label>
              <input
                type="text"
                value={form.responsable}
                onChange={(e) => updateField("responsable", e.target.value)}
                placeholder="Nombre del responsable"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px]"
              />
            </div>
          </div>

          {/* Agua (control mensual) */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                A
              </span>
              Control de Agua (mensual)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  pH
                </label>
                <input
                  type="text"
                  value={form.aguaPh}
                  onChange={(e) => updateField("aguaPh", e.target.value)}
                  placeholder="6.5 - 9.5"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Cloro (mg/L)
                </label>
                <input
                  type="text"
                  value={form.aguaCloro}
                  onChange={(e) => updateField("aguaCloro", e.target.value)}
                  placeholder="0.2 - 1.0"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Organoleptico
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updateField("aguaOrganoleptico", cycleValue(form.aguaOrganoleptico))
                  }
                  className={`w-full min-h-[44px] rounded-xl border-2 font-bold text-sm transition-colors ${getToggleClasses(form.aguaOrganoleptico)}`}
                >
                  {form.aguaOrganoleptico || "-"}
                </button>
              </div>
            </div>
          </div>

          {/* Zone Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-2">
              Verificacion por Zonas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 px-3 border-b border-slate-200 w-1/3">
                      Zona
                    </th>
                    {CHECK_TYPES.map((ct) => (
                      <th
                        key={ct.key}
                        className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 px-2 border-b border-slate-200"
                      >
                        {ct.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ZONES.map((zone, idx) => (
                    <tr
                      key={zone.key}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                    >
                      <td className="py-2 px-3 text-sm font-medium text-slate-700 border-b border-slate-100">
                        {zone.label}
                      </td>
                      {CHECK_TYPES.map((ct) => {
                        const field = getFieldName(zone.key, ct.key);
                        const val = (form as Record<string, unknown>)[field as string] as string;
                        return (
                          <td
                            key={ct.key}
                            className="py-2 px-2 text-center border-b border-slate-100"
                          >
                            <button
                              type="button"
                              onClick={() => handleToggle(zone.key, ct.key)}
                              className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl border-2 font-bold text-base transition-all active:scale-95 ${getToggleClasses(val)}`}
                            >
                              {val || "-"}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Pulsar para alternar: - / C (correcto) / I (incorrecto)
            </p>
          </div>

          {/* Incidencias */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-700">Incidencias</h3>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Incidencias L+D
              </label>
              <textarea
                value={form.incidenciasLd}
                onChange={(e) => updateField("incidenciasLd", e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none"
                placeholder="Describir incidencias de limpieza y desinfeccion..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Incidencias Plagas
              </label>
              <textarea
                value={form.incidenciasPlagas}
                onChange={(e) => updateField("incidenciasPlagas", e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none"
                placeholder="Describir incidencias de control de plagas..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Incidencias Mantenimiento
              </label>
              <textarea
                value={form.incidenciasManto}
                onChange={(e) => updateField("incidenciasManto", e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none"
                placeholder="Describir incidencias de mantenimiento..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Acciones Correctoras
              </label>
              <textarea
                value={form.accionesCorrectoras}
                onChange={(e) => updateField("accionesCorrectoras", e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none"
                placeholder="Acciones correctoras adoptadas..."
              />
            </div>
          </div>

          {/* Fotos */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Fotos
            </label>
            <PhotoUpload
              fotos={form.fotos}
              onChange={(fotos) => setForm((prev) => ({ ...prev, fotos }))}
              folder="verificacion-semanal"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleAdd}
            disabled={!form.responsable || !form.fecha}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
          >
            Guardar Verificacion
          </button>
        </div>
      )}

      {/* List */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg font-medium">Sin verificaciones</p>
          <p className="text-sm mt-1">Pulsa &quot;+ Nueva Verificacion&quot; para empezar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((record) => {
            const isExpanded = expandedId === record.id;
            const cLd = countValues(record, "C", "Ld");
            const iLd = countValues(record, "I", "Ld");
            const cPlagas = countValues(record, "C", "Plagas");
            const iPlagas = countValues(record, "I", "Plagas");
            const cManto = countValues(record, "C", "Manto");
            const iManto = countValues(record, "I", "Manto");

            return (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
              >
                {/* Summary row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                  className="w-full text-left p-4 flex items-center justify-between min-h-[60px]"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-slate-800 text-sm">
                        {new Date(record.fecha).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-xs text-slate-500">
                        {record.responsable}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span>
                        L+D:{" "}
                        <span className="text-green-600 font-semibold">{cLd}C</span>
                        {iLd > 0 && (
                          <span className="text-red-600 font-semibold ml-1">
                            {iLd}I
                          </span>
                        )}
                      </span>
                      <span>
                        Plagas:{" "}
                        <span className="text-green-600 font-semibold">{cPlagas}C</span>
                        {iPlagas > 0 && (
                          <span className="text-red-600 font-semibold ml-1">
                            {iPlagas}I
                          </span>
                        )}
                      </span>
                      <span>
                        Manto:{" "}
                        <span className="text-green-600 font-semibold">{cManto}C</span>
                        {iManto > 0 && (
                          <span className="text-red-600 font-semibold ml-1">
                            {iManto}I
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-4">
                    {/* Agua */}
                    {(record.aguaPh || record.aguaCloro || record.aguaOrganoleptico) && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                          Control de Agua
                        </h4>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-slate-500">pH:</span>{" "}
                            <span className="font-medium">{record.aguaPh || "-"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Cloro:</span>{" "}
                            <span className="font-medium">{record.aguaCloro || "-"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Organoleptico:</span>{" "}
                            <span
                              className={`font-bold ${record.aguaOrganoleptico === "C" ? "text-green-600" : record.aguaOrganoleptico === "I" ? "text-red-600" : ""}`}
                            >
                              {record.aguaOrganoleptico || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Zone grid detail */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                        Verificacion por Zonas
                      </h4>
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="text-left text-xs font-semibold text-slate-500 py-1.5 px-2 border-b border-slate-200">
                              Zona
                            </th>
                            {CHECK_TYPES.map((ct) => (
                              <th
                                key={ct.key}
                                className="text-center text-xs font-semibold text-slate-500 py-1.5 px-2 border-b border-slate-200"
                              >
                                {ct.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ZONES.map((zone) => (
                            <tr key={zone.key}>
                              <td className="py-1.5 px-2 text-slate-700 border-b border-slate-100">
                                {zone.label}
                              </td>
                              {CHECK_TYPES.map((ct) => {
                                const field = getFieldName(zone.key, ct.key);
                                const val = record[field] as string;
                                return (
                                  <td
                                    key={ct.key}
                                    className="text-center py-1.5 px-2 border-b border-slate-100"
                                  >
                                    <span
                                      className={`inline-block w-8 h-8 rounded-lg font-bold text-sm leading-8 ${
                                        val === "C"
                                          ? "bg-green-100 text-green-700"
                                          : val === "I"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-gray-100 text-gray-400"
                                      }`}
                                    >
                                      {val || "-"}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Incidencias */}
                    {(record.incidenciasLd ||
                      record.incidenciasPlagas ||
                      record.incidenciasManto ||
                      record.accionesCorrectoras) && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase">
                          Incidencias
                        </h4>
                        {record.incidenciasLd && (
                          <div className="text-sm">
                            <span className="font-medium text-slate-600">L+D:</span>{" "}
                            {record.incidenciasLd}
                          </div>
                        )}
                        {record.incidenciasPlagas && (
                          <div className="text-sm">
                            <span className="font-medium text-slate-600">Plagas:</span>{" "}
                            {record.incidenciasPlagas}
                          </div>
                        )}
                        {record.incidenciasManto && (
                          <div className="text-sm">
                            <span className="font-medium text-slate-600">Manto.:</span>{" "}
                            {record.incidenciasManto}
                          </div>
                        )}
                        {record.accionesCorrectoras && (
                          <div className="text-sm">
                            <span className="font-medium text-slate-600">
                              Acciones Correctoras:
                            </span>{" "}
                            {record.accionesCorrectoras}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Fotos */}
                    {record.fotos.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                          Fotos ({record.fotos.length})
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                          {record.fotos.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt={`Foto ${i + 1}`}
                              className="w-full aspect-square object-cover rounded-lg border border-slate-200"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm("Eliminar esta verificacion?")) {
                          onChange(data.filter((r) => r.id !== record.id));
                          setExpandedId(null);
                        }
                      }}
                      className="text-red-500 text-xs font-medium hover:text-red-700 transition-colors"
                    >
                      Eliminar verificacion
                    </button>
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
