"use client";

import {
  MateriaPrima,
  Fermentacion,
  ProductoStock,
  Incidencia,
} from "../lib/types";

interface DashboardProps {
  materiasPrimas: MateriaPrima[];
  fermentaciones: Fermentacion[];
  productos: ProductoStock[];
  incidencias: Incidencia[];
}

export default function Dashboard({
  materiasPrimas,
  fermentaciones,
  productos,
  incidencias,
}: DashboardProps) {
  const hoy = new Date();

  // --- Computed alerts ---
  const mpCaducadas = materiasPrimas.filter(
    (mp) => new Date(mp.fechaCaducidad) < hoy
  );

  const mpProximas = materiasPrimas.filter((mp) => {
    const cad = new Date(mp.fechaCaducidad);
    const diffDias = Math.ceil(
      (cad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDias >= 0 && diffDias <= 90;
  });

  const coaPendientes = materiasPrimas.filter((mp) => mp.coaPendiente);

  const incidenciasAbiertas = incidencias.filter(
    (i) => i.estado === "abierta"
  );

  const stockBajo = productos.filter((p) => p.stock <= p.umbralAlerta);

  const fermentacionesActivas = fermentaciones.filter(
    (f) => f.estado === "activa"
  );

  // --- KPIs ---
  const totalMP = materiasPrimas.length;
  const totalFermentacionesActivas = fermentacionesActivas.length;
  const totalStockUnidades = productos.reduce((sum, p) => sum + p.stock, 0);
  const totalIncidenciasAbiertas = incidenciasAbiertas.length;

  return (
    <div className="p-4 pb-24 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Panel APPCC - Microviver
      </h1>

      {/* --- Alertas --- */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Alertas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AlertCard
            title="MP Caducadas"
            count={mpCaducadas.length}
            color={mpCaducadas.length > 0 ? "red" : "green"}
            detail={
              mpCaducadas.length > 0
                ? mpCaducadas.map((mp) => mp.nombre).join(", ")
                : "Ninguna"
            }
          />
          <AlertCard
            title="MP Proximas a caducar (<=90 dias)"
            count={mpProximas.length}
            color={mpProximas.length > 0 ? "yellow" : "green"}
            detail={
              mpProximas.length > 0
                ? mpProximas.map((mp) => mp.nombre).join(", ")
                : "Ninguna"
            }
          />
          <AlertCard
            title="COA Pendientes"
            count={coaPendientes.length}
            color={coaPendientes.length > 0 ? "yellow" : "green"}
            detail={
              coaPendientes.length > 0
                ? coaPendientes.map((mp) => mp.nombre).join(", ")
                : "Todos recibidos"
            }
          />
          <AlertCard
            title="Incidencias Abiertas"
            count={incidenciasAbiertas.length}
            color={incidenciasAbiertas.length > 0 ? "red" : "green"}
            detail={
              incidenciasAbiertas.length > 0
                ? incidenciasAbiertas.map((i) => i.descripcion).join("; ")
                : "Ninguna"
            }
          />
          <AlertCard
            title="Stock Bajo Umbral"
            count={stockBajo.length}
            color={stockBajo.length > 0 ? "red" : "green"}
            detail={
              stockBajo.length > 0
                ? stockBajo
                    .map((p) => `${p.nombre} (${p.stock}/${p.umbralAlerta})`)
                    .join(", ")
                : "Todo OK"
            }
          />
          <AlertCard
            title="Fermentaciones Activas"
            count={fermentacionesActivas.length}
            color={fermentacionesActivas.length > 0 ? "yellow" : "green"}
            detail={
              fermentacionesActivas.length > 0
                ? fermentacionesActivas.map((f) => f.producto).join(", ")
                : "Ninguna en curso"
            }
          />
        </div>
      </section>

      {/* --- KPIs --- */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Indicadores
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiBox label="Total MP Registradas" value={totalMP} />
          <KpiBox
            label="Fermentaciones Activas"
            value={totalFermentacionesActivas}
          />
          <KpiBox label="Stock Total (uds)" value={totalStockUnidades} />
          <KpiBox
            label="Incidencias Abiertas"
            value={totalIncidenciasAbiertas}
          />
        </div>
      </section>

      {/* --- Marco Legal --- */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Marco Legal de Referencia
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <ul className="space-y-2 text-sm text-blue-900">
            <li>
              <span className="font-semibold">RD 3484/2000</span> - Normas de
              higiene para la elaboracion, distribucion y comercio de comidas
              preparadas
            </li>
            <li>
              <span className="font-semibold">Reg CE 852/2004</span> -
              Reglamento relativo a la higiene de los productos alimenticios
            </li>
            <li>
              <span className="font-semibold">RD 1487/2009</span> -
              Complementos alimenticios (trasposicion Directiva 2002/46/CE)
            </li>
            <li>
              <span className="font-semibold">Reg UE 1169/2011</span> -
              Informacion alimentaria facilitada al consumidor
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

// --- Sub-components ---

function AlertCard({
  title,
  count,
  color,
  detail,
}: {
  title: string;
  count: number;
  color: "red" | "yellow" | "green";
  detail: string;
}) {
  const borderColor = {
    red: "border-red-400 bg-red-50",
    yellow: "border-yellow-400 bg-yellow-50",
    green: "border-green-400 bg-green-50",
  }[color];

  const countColor = {
    red: "text-red-700",
    yellow: "text-yellow-700",
    green: "text-green-700",
  }[color];

  return (
    <div className={`rounded-xl border-l-4 p-4 ${borderColor}`}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className={`text-2xl font-bold ${countColor}`}>{count}</span>
      </div>
      <p className="text-xs text-gray-600 line-clamp-2">{detail}</p>
    </div>
  );
}

function KpiBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
