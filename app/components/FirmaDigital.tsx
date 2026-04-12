"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface RegistroFirma {
  id: string;
  nombre: string;
  dni: string;
  puesto: string;
  modulosConfirmados: string[];
  firmaDataUrl: string;
  fecha: string;
  hora: string;
}

const MODULOS = [
  "1. Que es el APPCC",
  "2. Los 3 tipos de peligros",
  "3. Puntos de Control Critico",
  "4. Lactofermentacion",
  "5. Trazabilidad",
  "6. Higiene y buenas practicas",
];

export default function FirmaDigital() {
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [puesto, setPuesto] = useState("");
  const [modulosChecked, setModulosChecked] = useState<boolean[]>(Array(6).fill(false));
  const [haFirmado, setHaFirmado] = useState(false);
  const [registros, setRegistros] = useState<RegistroFirma[]>([]);
  const [registroGuardado, setRegistroGuardado] = useState<RegistroFirma | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const datosCompletos = nombre.trim() && dni.trim() && puesto.trim();
  const todosModulosChecked = modulosChecked.every(Boolean);
  const puedeGuardar = datosCompletos && todosModulosChecked && haFirmado;

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;
    canvas.width = container.clientWidth;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, []);

  useEffect(() => {
    initCanvas();
    const handleResize = () => initCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initCanvas]);

  const getCoords = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const coords = getCoords(e);
    if (coords) lastPointRef.current = coords;
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const coords = getCoords(e);
    if (!coords || !lastPointRef.current) return;

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    lastPointRef.current = coords;
    setHaFirmado(true);
  };

  const endDraw = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const limpiarFirma = () => {
    initCanvas();
    setHaFirmado(false);
  };

  const handleToggleModulo = (index: number) => {
    const nuevo = [...modulosChecked];
    nuevo[index] = !nuevo[index];
    setModulosChecked(nuevo);
  };

  const generarId = () => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FORM-${ts}-${rand}`;
  };

  const guardarRegistro = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ahora = new Date();
    const registro: RegistroFirma = {
      id: generarId(),
      nombre: nombre.trim(),
      dni: dni.trim(),
      puesto: puesto.trim(),
      modulosConfirmados: MODULOS.filter((_, i) => modulosChecked[i]),
      firmaDataUrl: canvas.toDataURL("image/png"),
      fecha: ahora.toLocaleDateString("es-ES"),
      hora: ahora.toLocaleTimeString("es-ES"),
    };
    setRegistros([registro, ...registros]);
    setRegistroGuardado(registro);
    // Reset form
    setNombre("");
    setDni("");
    setPuesto("");
    setModulosChecked(Array(6).fill(false));
    setHaFirmado(false);
    setTimeout(() => initCanvas(), 50);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 pb-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Firma Digital - Registro de Formacion</h1>

      {/* Confirmation message */}
      {registroGuardado && (
        <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-green-700">Registro guardado correctamente</h2>
          <div className="grid grid-cols-2 gap-3 text-lg">
            <div>
              <span className="text-gray-500">ID Registro:</span>
              <p className="font-mono font-bold text-green-800">{registroGuardado.id}</p>
            </div>
            <div>
              <span className="text-gray-500">Fecha y hora:</span>
              <p className="font-semibold">{registroGuardado.fecha} {registroGuardado.hora}</p>
            </div>
            <div>
              <span className="text-gray-500">Nombre:</span>
              <p className="font-semibold">{registroGuardado.nombre}</p>
            </div>
            <div>
              <span className="text-gray-500">DNI:</span>
              <p className="font-semibold">{registroGuardado.dni}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Puesto:</span>
              <p className="font-semibold">{registroGuardado.puesto}</p>
            </div>
          </div>
          <div>
            <span className="text-gray-500">Firma:</span>
            <img
              src={registroGuardado.firmaDataUrl}
              alt="Firma digital"
              className="mt-2 border border-gray-300 rounded-lg max-w-xs"
            />
          </div>
          <button
            onClick={() => setRegistroGuardado(null)}
            className="px-5 py-2 bg-green-600 text-white rounded-xl text-lg hover:bg-green-700 transition"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Step 1: Worker data */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Paso 1: Datos del trabajador
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre y apellidos"
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-600 font-semibold mb-1">DNI / NIE</label>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="12345678A"
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Puesto de trabajo</label>
            <input
              type="text"
              value={puesto}
              onChange={(e) => setPuesto(e.target.value)}
              placeholder="Ej: Operario de produccion"
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Step 2: Module confirmation */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Paso 2: Confirmar modulos completados
        </h2>
        <p className="text-gray-500 mb-4">Marca todos los modulos que has completado:</p>
        <div className="space-y-3">
          {MODULOS.map((modulo, index) => (
            <label
              key={index}
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 cursor-pointer hover:bg-gray-50 transition"
            >
              <input
                type="checkbox"
                checked={modulosChecked[index]}
                onChange={() => handleToggleModulo(index)}
                className="w-6 h-6 rounded accent-green-600"
              />
              <span className="text-lg">{modulo}</span>
            </label>
          ))}
        </div>
        {!todosModulosChecked && (
          <p className="text-amber-600 text-sm mt-3 font-semibold">
            Debes confirmar todos los modulos para poder firmar.
          </p>
        )}
      </div>

      {/* Step 3: Digital signature */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Paso 3: Firma digital
        </h2>
        <p className="text-gray-500 mb-3">Firma con el dedo en la zona de abajo:</p>
        <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white touch-none">
          <canvas
            ref={canvasRef}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            className="w-full cursor-crosshair"
            style={{ touchAction: "none" }}
          />
        </div>
        <div className="flex justify-between items-center mt-3">
          <button
            onClick={limpiarFirma}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl text-lg hover:bg-gray-300 transition"
          >
            Limpiar firma
          </button>
          {haFirmado && (
            <span className="text-green-600 font-semibold">Firma detectada</span>
          )}
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={guardarRegistro}
        disabled={!puedeGuardar}
        className="w-full py-4 rounded-xl text-xl font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition"
      >
        Guardar Registro
      </button>

      {/* Saved signatures list */}
      {registros.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Registros guardados ({registros.length})
          </h2>
          <div className="space-y-4">
            {registros.map((reg) => (
              <div
                key={reg.id}
                className="border border-gray-200 rounded-xl p-4 flex gap-4 items-start"
              >
                <img
                  src={reg.firmaDataUrl}
                  alt="Firma"
                  className="w-24 h-16 object-contain border border-gray-200 rounded bg-white flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800">{reg.nombre}</p>
                  <p className="text-gray-500 text-sm">
                    DNI: {reg.dni} | Puesto: {reg.puesto}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {reg.fecha} {reg.hora} | ID: <span className="font-mono">{reg.id}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}