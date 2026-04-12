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
  formatoEnvase: "vidrio_plastico" | "hdpe_rosca" | "gotero" | "vidrio_metalico";
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

export type TabId =
  | "dashboard"
  | "mp"
  | "camara"
  | "produccion"
  | "envasado"
  | "pcc_comp"
  | "pcc_alim"
  | "stock"
  | "trazabilidad"
  | "incidencias"
  | "formacion"
  | "firma";
