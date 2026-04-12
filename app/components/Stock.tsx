"use client";

import { useState } from "react";
import type { ProductoStock } from "../lib/types";
import { generateId } from "../lib/storage";

interface StockProps {
  productos: ProductoStock[];
  onChange: (productos: ProductoStock[]) => void;
}

const DEMO_EANS = [
  "8412345000001",
  "8412345000002",
  "8412345000003",
  "8412345000004",
  "8412345000005",
];

type TabFiltro = "liquido" | "solido";

export default function Stock({ productos, onChange }: StockProps) {
  const [tab, setTab] = useState<TabFiltro>("liquido");
  const [barcode, setBarcode] = useState("");
  const [highlightedEan, setHighlightedEan] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredProducts = productos.filter((p) => p.tipo === tab);

  const handleSearch = () => {
    const ean = barcode.trim();
    if (!ean) return;
    const found = productos.find((p) => p.ean === ean);
    if (found) {
      setTab(found.tipo === "liquido" ? "liquido" : "solido");
      setHighlightedEan(found.ean);
      setExpandedId(found.id);
      setTimeout(() => setHighlightedEan(null), 4000);
    } else {
      setHighlightedEan(null);
    }
    setBarcode("");
  };

  const handleDemoEan = (ean: string) => {
    setBarcode(ean);
    const found = productos.find((p) => p.ean === ean);
    if (found) {
      setTab(found.tipo === "liquido" ? "liquido" : "solido");
      setHighlightedEan(found.ean);
      setExpandedId(found.id);
      setTimeout(() => setHighlightedEan(null), 4000);
    }
  };

  const adjustStock = (id: string, delta: number) => {
    onChange(
      productos.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Barcode Scanner Section */}
      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">
          Escaner de Codigo de Barras
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Escanear o introducir EAN..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSearch}
            className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-medium active:bg-green-700"
          >
            Buscar
          </button>
        </div>
        {/* Demo EAN pills */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Demo EAN:</span>
          {DEMO_EANS.map((ean) => (
            <button
              key={ean}
              onClick={() => handleDemoEan(ean)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full border border-gray-300 active:bg-gray-300 transition"
            >
              {ean}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("liquido")}
          className={`flex-1 py-3 rounded-xl text-lg font-semibold transition ${
            tab === "liquido"
              ? "bg-blue-600 text-white shadow"
              : "bg-white text-gray-600 border border-gray-300"
          }`}
        >
          Liquidos
        </button>
        <button
          onClick={() => setTab("solido")}
          className={`flex-1 py-3 rounded-xl text-lg font-semibold transition ${
            tab === "solido"
              ? "bg-amber-600 text-white shadow"
              : "bg-white text-gray-600 border border-gray-300"
          }`}
        >
          Solidos
        </button>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-400">
            No hay productos {tab === "liquido" ? "liquidos" : "solidos"} registrados.
          </div>
        )}
        {filteredProducts.map((producto) => {
          const isLowStock = producto.stock <= producto.umbralAlerta;
          const isHighlighted = highlightedEan === producto.ean;
          const isExpanded = expandedId === producto.id;

          return (
            <div
              key={producto.id}
              className={`bg-white rounded-xl shadow transition-all ${
                isHighlighted
                  ? "ring-4 ring-green-400 bg-green-50"
                  : ""
              }`}
            >
              {/* Product Card Header */}
              <div
                onClick={() => toggleExpand(producto.id)}
                className="p-4 cursor-pointer active:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold text-gray-800 truncate">
                        {producto.nombre}
                      </h4>
                      {isLowStock && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          Stock bajo
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                      <span>EAN: {producto.ean}</span>
                      <span>Lote: {producto.loteActual}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <div
                      className={`text-2xl font-bold ${
                        isLowStock ? "text-red-600" : "text-gray-800"
                      }`}
                    >
                      {producto.stock}
                    </div>
                    <span className="text-gray-400 text-xl">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Entry/Exit Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      adjustStock(producto.id, 1);
                    }}
                    className="flex-1 bg-green-100 text-green-800 font-semibold py-3 rounded-lg text-base active:bg-green-200 border border-green-300 transition"
                  >
                    +1 Entrada
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      adjustStock(producto.id, -1);
                    }}
                    className="flex-1 bg-red-100 text-red-800 font-semibold py-3 rounded-lg text-base active:bg-red-200 border border-red-300 transition"
                  >
                    -1 Salida
                  </button>
                </div>
              </div>

              {/* Expanded Traceability Detail */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
                  <h5 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Trazabilidad del producto
                  </h5>

                  {/* Materias Primas */}
                  {producto.materiasPrimas.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Materias Primas
                      </p>
                      <div className="space-y-1">
                        {producto.materiasPrimas.map((mp, i) => (
                          <div
                            key={i}
                            className="bg-gray-50 rounded-lg px-3 py-2 text-sm flex flex-wrap gap-x-4 gap-y-1"
                          >
                            <span className="font-medium text-gray-700">
                              {mp.nombre}
                            </span>
                            <span className="text-gray-500">
                              Lote: {mp.lote}
                            </span>
                            <span className="text-gray-500">
                              Cad: {mp.caducidad}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Envase */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Envase</p>
                      <p className="text-sm text-gray-700">
                        {producto.envase || "—"}{" "}
                        <span className="text-gray-400">
                          (Lote: {producto.loteEnvase || "—"})
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tapon</p>
                      <p className="text-sm text-gray-700">
                        {producto.tapon || "—"}{" "}
                        <span className="text-gray-400">
                          (Lote: {producto.loteTapon || "—"})
                        </span>
                      </p>
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
