export interface MateriaPrima {
  id: string;
  nombre: string;
  lote: string;
  proveedor: string;
  fechaCaducidad: string;
  fechaRecepcion: string;
  cantidad: number;
  unidad: string;
  coaPendiente: boolean;
  notas: string;
  fotos: string[];
}

export interface ControlFermentacion {
  dia: number;
  fecha: string;
  ph: number;
  temperatura: number;
  humedadRelativa: number;
  aspectoVisual: string;
  olor: string;
  conforme: boolean;
  observaciones: string;
  fotos: string[];
}

export interface Fermentacion {
  id: string;
  producto: string;
  loteProduccion: string;
  fechaInicio: string;
  materiasPrimas: string[];
  controles: ControlFermentacion[];
  estado: "activa" | "completada" | "rechazada";
  fotos: string[];
  // Nuevos campos para doble fermentacion
  fase: "primaria" | "secundaria";
  temperaturaObjetivo: number;    // 30C primaria, 35C secundaria
  duracionDias: number;           // 40 dias por defecto
  linea: "liquidos" | "solidos_ferm" | "solidos_no_ferm" | "alimentos";
  fermentacionPrimariaId: string; // link a la primaria si es secundaria
}

export interface HojaProduccion {
  id: string;
  loteProduccion: string;
  producto: string;
  fecha: string;
  operario: string;
  materiasPrimas: { mpId: string; cantidad: number }[];
  fermentacionId: string;
  estado: "en_proceso" | "completada" | "rechazada";
  observaciones: string;
  fotos: string[];
}

export interface HojaEnvasado {
  id: string;
  loteEnvasado: string;
  loteProduccion: string;
  producto: string;
  fecha: string;
  operario: string;
  formatoEnvase: string;
  loteEnvase: string;
  loteTapon: string;
  unidades: number;
  estado: "en_proceso" | "completado" | "rechazado";
  observaciones: string;
  fotos: string[];
}

export interface ControlPCC {
  id: string;
  pccId: string;
  fecha: string;
  valor: string;
  conforme: boolean;
  operario: string;
  accionCorrectora: string;
  fotos: string[];
}

export interface PCC {
  id: string;
  nombre: string;
  limiteCritico: string;
  frecuencia: string;
  responsable: string;
  tipo: "complemento" | "alimento";
  controles: ControlPCC[];
}

export interface ProductoStock {
  id: string;
  nombre: string;
  ean: string;
  tipo: "solido" | "liquido";
  categoria: "complemento" | "alimento";
  stock: number;
  umbralAlerta: number;
  loteActual: string;
  materiasPrimas: { nombre: string; lote: string; caducidad: string }[];
  envase: string;
  loteEnvase: string;
  tapon: string;
  loteTapon: string;
}

export interface Incidencia {
  id: string;
  fecha: string;
  tipo: string;
  gravedad: "alta" | "media" | "baja";
  descripcion: string;
  accionCorrectora: string;
  estado: "abierta" | "cerrada";
  fechaCierre?: string;
  responsable: string;
  fotos: string[];
}

export interface Envase {
  id: string;
  tipo: string;
  descripcion: string;
  lote: string;
  cantidad: number;
  unidad: string;
  fechaRecepcion: string;
  proveedor: string;
  notas: string;
  fotos: string[];
}

export interface PlanLimpieza {
  id: string;
  zona: string;
  equipo: string;
  productoLimpieza: string;
  frecuencia: "diaria" | "semanal" | "mensual";
  responsable: string;
  instrucciones: string;
  activo: boolean;
  registros: RegistroLimpieza[];
}

export interface RegistroLimpieza {
  id: string;
  planId: string;
  fecha: string;
  operario: string;
  conforme: boolean;
  observaciones: string;
  fotos: string[];
}

// Stock intermedio (bidones, garrafas, botes)
export interface StockIntermedio {
  id: string;
  producto: string;
  lote: string;
  formato: string;
  cantidad: number;
  unidad: string;
  origenId: string;
  origenTipo: string;
  fecha: string;
  estado: "en_almacen" | "en_proceso" | "agotado";
  notas: string;
  fotos: string[];
}

// Verificacion semanal (Registro 18)
export interface VerificacionSemanal {
  id: string;
  fecha: string;
  responsable: string;
  firma: string;
  // Agua
  aguaPh: string;
  aguaCloro: string;
  aguaOrganoleptico: string;
  // Zonas: C (correcto) / I (incorrecto) / "" (no aplica)
  recepcionLd: string;
  recepcionPlagas: string;
  recepcionManto: string;
  almacenMpLd: string;
  almacenMpPlagas: string;
  almacenMpManto: string;
  almacenEnvasesLd: string;
  almacenEnvasesPlayas: string;
  almacenEnvasesManto: string;
  salaFermentacionLd: string;
  salaFermentacionPlagas: string;
  salaFermentacionManto: string;
  areaEnvasadoLd: string;
  areaEnvasadoPlagas: string;
  areaEnvasadoManto: string;
  almacenPtLd: string;
  almacenPtPlagas: string;
  almacenPtManto: string;
  // Incidencias
  incidenciasLd: string;
  incidenciasPlagas: string;
  incidenciasManto: string;
  accionesCorrectoras: string;
  fotos: string[];
}

// Proveedor (Registro 16)
export interface Proveedor {
  id: string;
  codigo: string;
  nombre: string;
  cif: string;
  poblacion: string;
  direccion: string;
  contacto: string;
  telefono: string;
  email: string;
  productosSubministrados: string;
  categoria: "A" | "B" | "C" | "D";
  estado: "aprobado" | "provisional" | "suspendido" | "alerta";
  incidenciasAnuales: number;
  calificacionAnual: string;
  fechaUltimaEvaluacion?: string;
  observaciones: string;
  fotos: string[];
}

export type TabId =
  | "dashboard"
  | "mp"
  | "camara"
  | "produccion"
  | "envasado"
  | "envases"
  | "pcc_comp"
  | "pcc_alim"
  | "stock"
  | "stock_intermedio"
  | "trazabilidad"
  | "incidencias"
  | "limpieza"
  | "verificacion"
  | "proveedores"
  | "formacion"
  | "firma";
