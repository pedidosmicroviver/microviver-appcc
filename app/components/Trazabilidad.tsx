"use client";

import { useState } from "react";
import type {
  ProductoStock,
  Fermentacion,
  MateriaPrima,
  HojaProduccion,
  HojaEnvasado,
} from "../lib/types";
import { generateId } from "../lib/storage";

interface TrazabilidadProps {
  productos: ProductoStock[];
  fermentaciones: Fermentacion[];
  materiasPrimas: MateriaPrima[];
  producciones: HojaProduccion[];
  envasados: HojaEnvasado[];
}

function estadoColor(estado: string): string {
  switch (estado) {
    case "activa":
    case "en_proceso":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "completada":
    case "completado":
      return "bg-green-100 text-green-800 border-green-300";
    case "rechazada":
    case "rechazado":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
}

function estadoBorderColor(estado: string): string {
  switch (estado) {
    case "activa":
    case "en_proceso":
      return "border-yellow-400";
    case "completada":
    case "completado":
      return "border-green-500";
    case "rechazada":
    case "rechazado":
      return "border-red-400";
    default:
      return "border-gray-300";
  }
}

export default function Trazabilidad({
  productos,
  fermentaciones,
  materiasPrimas,
  producciones,
  envasados,
}: TrazabilidadProps) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const query = search.toLowerCase().trim();
  const filteredProducts = query
    ? productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(query) ||
          p.loteActual.toLowerCase().includes(query) ||
          p.ean.includes(query)
      )
    : productos;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Find fermentaciones linked to a product via producciones
  const getProductionChain = (producto: ProductoStock) => {
    // Find producciones for this product
    const relatedProducciones = producciones.filter(
      (pr) =>
        pr.producto.toLowerCase() === producto.nombre.toLowerCase() ||
        pr.loteProduccion === producto.loteActual
    );

    // Find envasados for this product
    const relatedEnvasados = envasados.filter(
      (env) =>
        env.producto.toLowerCase() === producto.nombre.toLowerCase() ||
        env.loteProduccion === producto.loteActual
    );

    // Collect fermentacion IDs from producciones
    const fermentacionIds = relatedProducciones
      .map((pr) => pr.fermentacionId)
      .filter(Boolean);

    const relatedFermentaciones = fermentaciones.filter(
      (f) =>
        fermentacionIds.includes(f.id) ||
        f.producto.toLowerCase() === producto.nombre.toLowerCase() ||
        f.loteProduccion === producto.loteActual
    );

    // For each fermentacion, resolve MP IDs to full MP objects
    const fermentacionesConMPs = relatedFermentaciones.map((f) => {
      const mps = f.materiasPrimas
        .map((mpId) => materiasPrimas.find((mp) => mp.id === mpId))
        .filter(Boolean) as MateriaPrima[];
      return { fermentacion: f, mps };
    });

    return { fermentacionesConMPs, relatedEnvasados };
  };

  const diasFermentacion = (f: Fermentacion): number => {
    if (!f.fechaInicio) return 0;
    const inicio = new Date(f.fechaInicio);
    const ahora = new Date();
    return Math.floor(
      (ahora.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre de producto, lote o EAN..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
            No se encontraron productos.
          </div>
        )}

        {filteredProducts.map((producto) => {
          const isExpanded = expandedId === producto.id;
          const isLowStock = producto.stock <= producto.umbralAlerta;
          const { fermentacionesConMPs, relatedEnvasados } =
            getProductionChain(producto);

          return (
            <div key={producto.id} className="bg-white rounded-xl shadow">
              {/* Product Header */}
              <div
                onClick={() => toggleExpand(producto.id)}
                className="p-4 cursor-pointer active:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-gray-800 truncate">
                      {producto.nombre}
                    </h4>
                    {isLowStock && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Stock bajo
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                    <span>Lote: {producto.loteActual}</span>
                    <span>EAN: {producto.ean}</span>
                    <span>Stock: {producto.stock}</span>
                  </div>
                </div>
                <span className="text-gray-400 text-xl ml-3">
                  {isExpanded ? "▲" : "▼"}
                </span>
              </div>

              {/* Expanded Traceability Chain */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                  {/* Producto Final */}
                  <div className="mb-4">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-indigo-800">
                        Producto Final
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-indigo-700">
                        <span>{producto.nombre}</span>
                        <span>Lote: {producto.loteActual}</span>
                        <span>EAN: {producto.ean}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fermentaciones Chain */}
                  {fermentacionesConMPs.length > 0 ? (
                    fermentacionesConMPs.map(({ fermentacion, mps }, fIdx) => (
                      <div key={fIdx} className="ml-4 mb-3">
                        {/* Connecting line */}
                        <div
                          className={`border-l-4 ${estadoBorderColor(
                            fermentacion.estado
                          )} pl-4 space-y-3`}
                        >
                          {/* Fermentacion */}
                          <div
                            className={`rounded-lg p-3 border ${estadoColor(
                              fermentacion.estado
                            )}`}
                          >
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">
                                Fermentacion
                              </p>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${estadoColor(
                                  fermentacion.estado
                                )}`}
                              >
                                {fermentacion.estado}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
                              <span>Lote: {fermentacion.loteProduccion}</span>
                              <span>Inicio: {fermentacion.fechaInicio}</span>
                              <span>
                                Dias: {diasFermentacion(fermentacion)}
                              </span>
                            </div>
                          </div>

                          {/* Materias Primas */}
                          {mps.length > 0 && (
                            <div className="ml-4">
                              <div className="border-l-4 border-orange-300 pl-4 space-y-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                  Materias Primas
                                </p>
                                {mps.map((mp) => (
                                  <div
                                    key={mp.id}
                                    className="bg-orange-50 border border-orange-200 rounded-lg p-2.5 text-sm"
                                  >
                                    <span className="font-medium text-orange-800">
                                      {mp.nombre}
                                    </span>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-orange-700 text-xs">
                                      <span>Lote: {mp.lote}</span>
                                      <span>Proveedor: {mp.proveedor}</span>
                                      <span>
                                        Caducidad: {mp.fechaCaducidad}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="ml-4 mb-3 text-sm text-gray-400 italic pl-4 border-l-4 border-gray-200 py-2">
                      Sin fermentaciones vinculadas
                    </div>
                  )}

                  {/* Envase y Tapon */}
                  <div className="ml-4 mt-3">
                    <div className="border-l-4 border-blue-300 pl-4 space-y-2">
                      {/* Envase */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-semibold text-blue-800">
                          Envase
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-blue-700">
                          <span>Tipo: {producto.envase || "—"}</span>
                          <span>Lote: {producto.loteEnvase || "—"}</span>
                        </div>
                      </div>

                      {/* Tapon */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-semibold text-blue-800">
                          Tapon
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-blue-700">
                          <span>Tipo: {producto.tapon || "—"}</span>
                          <span>Lote: {producto.loteTapon || "—"}</span>
                        </div>
                      </div>

                      {/* Related Envasados */}
                      {relatedEnvasados.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Hojas de Envasado
                          </p>
                          {relatedEnvasados.map((env) => (
                            <div
                              key={env.id}
                              className={`rounded-lg p-2.5 text-sm border ${estadoColor(
                                env.estado
                              )}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  Lote: {env.loteEnvasado}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full border font-medium ${estadoColor(
                                    env.estado
                                  )}`}
                                >
                                  {env.estado}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs">
                                <span>Fecha: {env.fecha}</span>
                                <span>Uds: {env.unidades}</span>
                                <span>Formato: {env.formatoEnvase}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
