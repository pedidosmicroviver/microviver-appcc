"use client";

import { useState } from "react";

interface Question {
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}

interface Modulo {
  titulo: string;
  contenido: React.ReactNode;
  pregunta: Question;
}

export default function CursoFormacion() {
  const [moduloActual, setModuloActual] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<number | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [modulosCompletados, setModulosCompletados] = useState<boolean[]>(Array(6).fill(false));
  const [cursoFinalizado, setCursoFinalizado] = useState(false);

  const modulos: Modulo[] = [
    {
      titulo: "1. Que es el APPCC",
      contenido: (
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            El sistema APPCC (Analisis de Peligros y Puntos de Control Critico) es un metodo
            sistematico para identificar, evaluar y controlar los peligros significativos
            relacionados con la seguridad alimentaria.
          </p>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <p className="font-semibold text-green-800">Referencia Legal</p>
            <p className="text-green-700">
              Reglamento (CE) 852/2004 del Parlamento Europeo: todos los operadores de empresa
              alimentaria deben crear, aplicar y mantener un sistema basado en los principios del APPCC.
            </p>
          </div>
          <h3 className="text-xl font-bold mt-6">Los 7 Principios del Codex Alimentarius</h3>
          <ol className="list-decimal list-inside space-y-2 text-lg">
            <li><strong>Analisis de peligros:</strong> Identificar todos los peligros potenciales.</li>
            <li><strong>Determinar los PCC:</strong> Identificar los puntos criticos de control.</li>
            <li><strong>Establecer limites criticos:</strong> Fijar valores maximos/minimos aceptables.</li>
            <li><strong>Sistema de vigilancia:</strong> Monitorizar cada PCC.</li>
            <li><strong>Medidas correctoras:</strong> Acciones cuando un PCC se desvie.</li>
            <li><strong>Verificacion:</strong> Confirmar que el sistema funciona correctamente.</li>
            <li><strong>Documentacion:</strong> Registrar todos los procedimientos y resultados.</li>
          </ol>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <p className="font-semibold text-yellow-800">Importante</p>
            <p className="text-yellow-700">
              El incumplimiento del sistema APPCC puede acarrear sanciones de hasta 600.000 euros
              segun la Ley 17/2011 de seguridad alimentaria y nutricion.
            </p>
          </div>
        </div>
      ),
      pregunta: {
        pregunta: "Cuantos principios tiene el sistema APPCC segun el Codex Alimentarius?",
        opciones: ["5 principios", "7 principios", "10 principios", "3 principios"],
        correcta: 1,
        explicacion:
          "El Codex Alimentarius establece 7 principios para el sistema APPCC: analisis de peligros, determinacion de PCC, limites criticos, vigilancia, medidas correctoras, verificacion y documentacion.",
      },
    },
    {
      titulo: "2. Los 3 tipos de peligros",
      contenido: (
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            En seguridad alimentaria, los peligros se clasifican en tres categorias principales
            que debemos identificar y controlar en cada etapa del proceso.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mt-4">
            <h3 className="text-xl font-bold text-red-800 mb-2">Peligros Biologicos</h3>
            <ul className="list-disc list-inside space-y-1 text-lg text-red-700">
              <li>Bacterias: Salmonella, Listeria, E. coli, Clostridium botulinum</li>
              <li>Mohos y levaduras: Aspergillus, Penicillium</li>
              <li>Virus: Norovirus, Hepatitis A</li>
              <li>Parasitos: Anisakis, Trichinella</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="text-xl font-bold text-blue-800 mb-2">Peligros Quimicos</h3>
            <ul className="list-disc list-inside space-y-1 text-lg text-blue-700">
              <li>Residuos de productos de limpieza</li>
              <li>Alergenos no declarados (los 14 alergenos del Reglamento 1169/2011)</li>
              <li>Pesticidas y herbicidas</li>
              <li>Metales pesados (plomo, mercurio, cadmio)</li>
              <li>Aditivos no autorizados</li>
            </ul>
          </div>
          <div className="bg-gray-100 border border-gray-300 rounded-xl p-5">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Peligros Fisicos</h3>
            <ul className="list-disc list-inside space-y-1 text-lg text-gray-700">
              <li>Fragmentos de metal</li>
              <li>Trozos de vidrio o plastico duro</li>
              <li>Piedras, huesos, espinas</li>
              <li>Objetos personales (pendientes, tiritas)</li>
            </ul>
          </div>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <p className="font-semibold text-green-800">Referencia Legal</p>
            <p className="text-green-700">
              Reglamento (UE) 1169/2011: obliga a declarar los 14 alergenos principales en
              todos los alimentos, incluyendo productos no envasados.
            </p>
          </div>
        </div>
      ),
      pregunta: {
        pregunta: "Los alergenos no declarados son un ejemplo de que tipo de peligro?",
        opciones: [
          "Peligro biologico",
          "Peligro fisico",
          "Peligro quimico",
          "Peligro medioambiental",
        ],
        correcta: 2,
        explicacion:
          "Los alergenos se clasifican como peligros quimicos. El Reglamento 1169/2011 obliga a declarar los 14 alergenos principales en todos los alimentos.",
      },
    },
    {
      titulo: "3. Puntos de Control Critico",
      contenido: (
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            Un Punto de Control Critico (PCC) es una etapa del proceso donde se puede aplicar un
            control que es esencial para prevenir, eliminar o reducir un peligro a un nivel aceptable.
          </p>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <p className="font-semibold text-green-800">Referencia Legal</p>
            <p className="text-green-700">
              Segun el Codex Alimentarius y el Reglamento 852/2004, cada PCC debe tener
              limites criticos medibles, un sistema de vigilancia y medidas correctoras definidas.
            </p>
          </div>
          <h3 className="text-xl font-bold mt-4">Como registrar controles en un PCC</h3>
          <ol className="list-decimal list-inside space-y-2 text-lg">
            <li>Identificar el peligro asociado a la etapa.</li>
            <li>Establecer el limite critico (ej: temperatura maxima, pH minimo).</li>
            <li>Definir el metodo de vigilancia (que, como, cuando, quien).</li>
            <li>Registrar cada medicion en la hoja de control correspondiente.</li>
            <li>Firmar y fechar cada registro.</li>
          </ol>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <p className="font-semibold text-yellow-800">Ante una desviacion del PCC:</p>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              <li>Detener el proceso inmediatamente.</li>
              <li>Separar e identificar el producto afectado.</li>
              <li>Aplicar la medida correctora definida.</li>
              <li>Registrar la incidencia en el parte de incidencias.</li>
              <li>Verificar que el PCC vuelve a estar bajo control antes de continuar.</li>
            </ul>
          </div>
        </div>
      ),
      pregunta: {
        pregunta: "Que es lo PRIMERO que hay que hacer ante una desviacion en un PCC?",
        opciones: [
          "Llamar al responsable de calidad",
          "Detener el proceso inmediatamente",
          "Anotar la desviacion en el registro",
          "Continuar y revisar al final del dia",
        ],
        correcta: 1,
        explicacion:
          "Ante una desviacion, lo primero es detener el proceso inmediatamente para evitar que producto no seguro siga avanzando. Despues se separa el producto y se aplican las medidas correctoras.",
      },
    },
    {
      titulo: "4. Lactofermentacion",
      contenido: (
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            La lactofermentacion es el proceso de conservacion mediante el cual las bacterias lacticas
            transforman los azucares en acido lactico, reduciendo el pH y creando un entorno seguro
            para la conservacion del alimento.
          </p>
          <h3 className="text-xl font-bold mt-4">Proceso de 40 dias en Microviver</h3>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
            <ul className="space-y-3 text-lg">
              <li><strong>Dias 1-7:</strong> Fase de fermentacion activa. El pH debe descender rapidamente.</li>
              <li><strong>Dia 7:</strong> Control critico - el pH debe ser &le; 4.6. Si no se alcanza, el lote se rechaza.</li>
              <li><strong>Dias 7-21:</strong> Fase de maduracion. El pH sigue bajando lentamente.</li>
              <li><strong>Dias 21-40:</strong> Fase de estabilizacion. Controles periodicos.</li>
            </ul>
          </div>
          <h3 className="text-xl font-bold mt-4">Parametros de control</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">&le; 4.6</p>
              <p className="text-blue-600 font-semibold">pH maximo dia 7</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-orange-700">18-24 &deg;C</p>
              <p className="text-orange-600 font-semibold">Temperatura</p>
            </div>
            <div className="bg-teal-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-teal-700">60-80%</p>
              <p className="text-teal-600 font-semibold">Humedad relativa</p>
            </div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <p className="font-semibold text-yellow-800">Atencion</p>
            <p className="text-yellow-700">
              Si el pH no alcanza 4.6 en el dia 7, existe riesgo de crecimiento de
              Clostridium botulinum. El lote completo debe ser rechazado y registrado como incidencia.
            </p>
          </div>
        </div>
      ),
      pregunta: {
        pregunta: "Cual es el pH maximo aceptable en el dia 7 de lactofermentacion?",
        opciones: ["5.0", "4.6", "3.8", "6.0"],
        correcta: 1,
        explicacion:
          "El pH maximo aceptable en el dia 7 es 4.6. Por debajo de este valor se inhibe el crecimiento de patogenos como Clostridium botulinum. Si no se alcanza, el lote se rechaza.",
      },
    },
    {
      titulo: "5. Trazabilidad",
      contenido: (
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            La trazabilidad es la capacidad de seguir el movimiento de un alimento a traves de
            todas las etapas de produccion, transformacion y distribucion.
          </p>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <p className="font-semibold text-green-800">Referencia Legal</p>
            <p className="text-green-700">
              Reglamento (CE) 178/2002, articulo 18: todos los operadores de empresa alimentaria
              deben poder identificar a quien han comprado y a quien han vendido sus productos.
            </p>
          </div>
          <h3 className="text-xl font-bold mt-4">Tipos de lotes en Microviver</h3>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-gray-400">
              <p className="font-bold text-lg">Lote de Materia Prima (MP)</p>
              <p>Identifica cada partida de ingredientes recibidos. Formato: MP-YYYYMMDD-XXX</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-indigo-400">
              <p className="font-bold text-lg">Lote de Produccion</p>
              <p>Vincula las materias primas con el proceso. Formato: PROD-YYYYMMDD-XXX</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-emerald-400">
              <p className="font-bold text-lg">Lote de Envasado</p>
              <p>Identifica el producto final listo para venta. Formato: ENV-YYYYMMDD-XXX</p>
            </div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-4">
            <p className="font-semibold text-yellow-800">Ante una alerta sanitaria:</p>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              <li>Localizar todos los lotes afectados mediante el sistema de trazabilidad.</li>
              <li>Inmovilizar el producto inmediatamente.</li>
              <li>Notificar a las autoridades sanitarias en un plazo maximo de 24 horas.</li>
              <li>Iniciar la retirada del producto del mercado si es necesario.</li>
              <li>Documentar todas las acciones tomadas.</li>
            </ul>
          </div>
        </div>
      ),
      pregunta: {
        pregunta: "En cuanto tiempo maximo hay que notificar una alerta sanitaria a las autoridades?",
        opciones: ["48 horas", "72 horas", "24 horas", "1 semana"],
        correcta: 2,
        explicacion:
          "Las autoridades sanitarias deben ser notificadas en un plazo maximo de 24 horas desde la deteccion de una alerta sanitaria, segun la normativa vigente.",
      },
    },
    {
      titulo: "6. Higiene y buenas practicas",
      contenido: (
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            Las buenas practicas de higiene (BPH) son la base sobre la que se construye todo
            el sistema APPCC. Sin una correcta higiene, ningun control critico sera efectivo.
          </p>
          <h3 className="text-xl font-bold mt-4">Normas de higiene personal</h3>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>Lavado de manos: antes de manipular alimentos, despues de ir al bano, al cambiar de tarea.</li>
            <li>Ropa de trabajo limpia y exclusiva para la zona de produccion.</li>
            <li>Pelo recogido y cubierto con gorro o redecilla.</li>
            <li>Sin joyas, relojes ni esmalte de unas.</li>
            <li>Cubrir heridas con tiritas azules impermeables y guantes.</li>
            <li>No comer, beber ni fumar en la zona de trabajo.</li>
          </ul>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mt-4">
            <p className="font-semibold text-green-800">Principio FEFO (First Expired, First Out)</p>
            <p className="text-green-700">
              Utilizar siempre primero los productos con fecha de caducidad mas proxima.
              Colocar los productos nuevos detras de los existentes. Revisar fechas diariamente.
            </p>
          </div>
          <h3 className="text-xl font-bold mt-4">Limpieza del puesto de venta</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <ol className="list-decimal list-inside space-y-2 text-lg text-blue-800">
              <li>Retirar todos los productos y materiales.</li>
              <li>Limpiar con agua caliente y detergente autorizado.</li>
              <li>Aclarar con agua limpia.</li>
              <li>Desinfectar con solucion de hipoclorito (concentracion adecuada).</li>
              <li>Dejar secar al aire (no usar panos).</li>
              <li>Registrar la limpieza en la hoja de control.</li>
            </ol>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <p className="font-semibold text-yellow-800">Recuerda</p>
            <p className="text-yellow-700">
              El plan de limpieza y desinfeccion debe estar documentado y disponible para
              inspeccion en todo momento. Incluir: frecuencia, productos utilizados, responsable y metodo.
            </p>
          </div>
        </div>
      ),
      pregunta: {
        pregunta: "Que significa el principio FEFO?",
        opciones: [
          "First Entered, First Out",
          "First Expired, First Out",
          "First Evaluated, First Opened",
          "First in Factory, First Out",
        ],
        correcta: 1,
        explicacion:
          "FEFO (First Expired, First Out) significa que se deben utilizar primero los productos con fecha de caducidad mas cercana, para evitar que caduquen en el almacen.",
      },
    },
  ];

  const handleResponder = (index: number) => {
    setRespuestaSeleccionada(index);
    setMostrarResultado(true);
  };

  const handleSiguiente = () => {
    if (mostrarResultado && respuestaSeleccionada === modulos[moduloActual].pregunta.correcta) {
      const nuevosCompletados = [...modulosCompletados];
      nuevosCompletados[moduloActual] = true;
      setModulosCompletados(nuevosCompletados);
    }

    if (moduloActual < modulos.length - 1) {
      setModuloActual(moduloActual + 1);
      setRespuestaSeleccionada(null);
      setMostrarResultado(false);
    } else if (modulosCompletados.every((c) => c) ||
      (respuestaSeleccionada === modulos[moduloActual].pregunta.correcta)) {
      setCursoFinalizado(true);
    }
  };

  const handleAnterior = () => {
    if (moduloActual > 0) {
      setModuloActual(moduloActual - 1);
      setRespuestaSeleccionada(null);
      setMostrarResultado(false);
    }
  };

  const modulosCompletadosCount = modulosCompletados.filter(Boolean).length;
  const progreso = (modulosCompletadosCount / modulos.length) * 100;

  if (cursoFinalizado) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center space-y-6">
          <div className="text-6xl mb-4">&#127891;</div>
          <h1 className="text-3xl font-bold text-green-700">Certificado completado</h1>
          <p className="text-xl text-gray-600">
            Has completado satisfactoriamente los 6 modulos del curso de formacion APPCC de Microviver.
          </p>
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 inline-block">
            <p className="text-lg text-green-800 font-semibold">Formacion APPCC - Microviver</p>
            <p className="text-green-600">6/6 modulos completados</p>
            <p className="text-green-600 mt-2">
              Fecha: {new Date().toLocaleDateString("es-ES")}
            </p>
          </div>
          <p className="text-gray-500 mt-4">
            Ahora debes firmar el registro de formacion en el modulo de Firma Digital.
          </p>
          <button
            onClick={() => {
              setCursoFinalizado(false);
              setModuloActual(0);
              setModulosCompletados(Array(6).fill(false));
              setRespuestaSeleccionada(null);
              setMostrarResultado(false);
            }}
            className="mt-4 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl text-lg hover:bg-gray-300 transition"
          >
            Repetir curso
          </button>
        </div>
      </div>
    );
  }

  const modulo = modulos[moduloActual];

  return (
    <div className="max-w-3xl mx-auto p-4 pb-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-600">
            Progreso del curso
          </span>
          <span className="text-sm font-semibold text-gray-600">
            {modulosCompletadosCount}/{modulos.length} modulos
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Module content */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-gray-100">
          {modulo.titulo}
          {modulosCompletados[moduloActual] && (
            <span className="ml-3 text-green-500 text-lg">&#10003; Completado</span>
          )}
        </h2>
        {modulo.contenido}
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Pregunta de evaluacion
        </h3>
        <p className="text-lg text-gray-700 mb-4">{modulo.pregunta.pregunta}</p>
        <div className="space-y-3">
          {modulo.pregunta.opciones.map((opcion, index) => {
            let btnClass =
              "w-full text-left p-4 rounded-xl border-2 text-lg transition ";
            if (mostrarResultado) {
              if (index === modulo.pregunta.correcta) {
                btnClass += "border-green-500 bg-green-50 text-green-800 font-semibold";
              } else if (index === respuestaSeleccionada) {
                btnClass += "border-red-500 bg-red-50 text-red-800";
              } else {
                btnClass += "border-gray-200 bg-gray-50 text-gray-400";
              }
            } else {
              btnClass +=
                respuestaSeleccionada === index
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50";
            }
            return (
              <button
                key={index}
                onClick={() => !mostrarResultado && handleResponder(index)}
                disabled={mostrarResultado}
                className={btnClass}
              >
                {opcion}
              </button>
            );
          })}
        </div>
        {mostrarResultado && (
          <div
            className={`mt-4 p-4 rounded-xl ${
              respuestaSeleccionada === modulo.pregunta.correcta
                ? "bg-green-50 border border-green-300"
                : "bg-red-50 border border-red-300"
            }`}
          >
            <p className="font-bold text-lg mb-1">
              {respuestaSeleccionada === modulo.pregunta.correcta
                ? "Correcto!"
                : "Incorrecto"}
            </p>
            <p>{modulo.pregunta.explicacion}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        <button
          onClick={handleAnterior}
          disabled={moduloActual === 0}
          className="flex-1 py-4 px-6 rounded-xl text-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Anterior
        </button>
        <button
          onClick={handleSiguiente}
          disabled={!mostrarResultado}
          className="flex-1 py-4 px-6 rounded-xl text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {moduloActual === modulos.length - 1 ? "Finalizar" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}