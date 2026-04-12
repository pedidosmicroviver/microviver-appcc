"use client";

import { useState } from "react";
import type { PCC, ControlPCC } from "../lib/types";
import { generateId } from "../lib/storage";

interface PCCModuleProps {
  pccs: PCC[];
  onChange: (pccs: PCC[]) => void;
  tipo: "complemento" | "alimento";
}

const emptyControl = (): Omit<ControlPCC, "id" | "pccId"> => ({
  fecha: new Date().toISOString().slice(0, 10),
  valor: "",
  conforme: true,
  operario: "",
  accionCorrectora: "",
});

export default function PCCModule({ pccs, onChange, tipo }: PCCModuleProps) {
  const [expandedPccId, setExpandedPccId] = useState<string | null>(null);
  const [controlForm, setControlForm] = useState(emptyControl());
  const [showControlForm, setShowControlForm] = useState<string | null>(null);

  const title =
    tipo === "complemento"
      ? "APPCC Complementos (RD 1487/2009)"
      : "APPCC Alimentos (CE 852/2004)";

  const filteredPccs = pccs.filter((p) => p.tipo === tipo);

  const handleAddControl = (pccId: string) => {
    if (!controlForm.valor || !controlForm.operario) return;
    const nuevoControl: ControlPCC = {
      ...controlForm,
      id: generateId("ctrl"),
      pccId,
    };
    onChange(
      pccs.map((pcc) =>
        pcc.id === pccId
          ? { ...pcc, controles: [...pcc.controles, nuevoControl] }
          : pcc
      )
    );
    setControlForm(emptyControl());
    setShowControlForm(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>

      {filteredPccs.length === 0 && (
        <p className="text-center text-gray-400 py-8">
          No hay PCCs definidos para {tipo === "complemento" ? "complementos" : "alimentos"}
        </p>
      )}

      <div className="space-y-3">
        {filteredPccs.map((pcc) => (
          <div
            key={pcc.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => setExpandedPccId(expandedPccId === pcc.id ? null : pcc.id)}
              className="w-full px-5 py-4 flex items-center justify-between text-left active:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-gray-800">{pcc.nombre}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {pcc.controles.length} controles
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Limite: {pcc.limiteCritico} &middot; Frecuencia: {pcc.frecuencia} &middot;{" "}
                  {pcc.responsable}
                </div>
              </div>
              <span className="text-gray-400 text-xl ml-2">
                {expandedPccId === pcc.id ? "\u25B2" : "\u25BC"}
              </span>
            </button>

            {expandedPccId === pcc.id && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-600">Controles Registrados</h4>
                  <button
                    onClick={() =>
                      setShowControlForm(showControlForm === pcc.id ? null : pcc.id)
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium active:bg-blue-700"
                  >
                    {showControlForm === pcc.id ? "Cancelar" : "Registrar Control"}
                  </button>
                </div>

                {showControlForm === pcc.id && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Fecha
                        </label>
                        <input
                          type="date"
                          value={controlForm.fecha}
                          onChange={(e) =>
                            setControlForm({ ...controlForm, fecha: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Valor
                        </label>
                        <input
                          type="text"
                          value={controlForm.valor}
                          onChange={(e) =>
                            setControlForm({ ...controlForm, valor: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
                          placeholder="Valor medido"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Operario
                        </label>
                        <input
                          type="text"
                          value={controlForm.operario}
                          onChange={(e) =>
                            setControlForm({ ...controlForm, operario: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
                        />
                      </div>
                      <div className="flex items-center pt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={controlForm.conforme}
                            onChange={(e) =>
                              setControlForm({ ...controlForm, conforme: e.target.checked })
                            }
                            className="w-6 h-6 rounded border-gray-300"
                          />
                          <span className="text-base font-medium text-gray-700">Conforme</span>
                        </label>
                      </div>
                    </div>

                    {!controlForm.conforme && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Accion Correctora
                        </label>
                        <textarea
                          value={controlForm.accionCorrectora}
                          onChange={(e) =>
                            setControlForm({ ...controlForm, accionCorrectora: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base"
                          rows={2}
                        />
                      </div>
                    )}

                    <button
                      onClick={() => handleAddControl(pcc.id)}
                      className="w-full py-3 bg-green-600 text-white rounded-xl text-base font-semibold active:bg-green-700"
                    >
                      Guardar Control
                    </button>
                  </div>
                )}

                {pcc.controles.length === 0 && showControlForm !== pcc.id && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Sin controles registrados
                  </p>
                )}

                {pcc.controles.length > 0 && (
                  <div className="space-y-2">
                    {[...pcc.controles].reverse().map((ctrl) => (
                      <div
                        key={ctrl.id}
                        className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700">
                              {ctrl.fecha}
                            </span>
                            <span className="text-sm text-gray-600">
                              Valor: {ctrl.valor}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                ctrl.conforme
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {ctrl.conforme ? "Conforme" : "No conforme"}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Operario: {ctrl.operario}
                            {ctrl.accionCorrectora && (
                              <span className="text-red-600 ml-3">
                                Accion: {ctrl.accionCorrectora}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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
