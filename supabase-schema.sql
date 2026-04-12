-- Microviver APPCC Database Schema

-- Materias Primas
CREATE TABLE materias_primas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  lote TEXT NOT NULL,
  proveedor TEXT NOT NULL,
  fecha_caducidad DATE NOT NULL,
  fecha_recepcion DATE NOT NULL,
  cantidad NUMERIC NOT NULL,
  unidad TEXT NOT NULL,
  coa_pendiente BOOLEAN DEFAULT false,
  notas TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fermentaciones
CREATE TABLE fermentaciones (
  id TEXT PRIMARY KEY,
  producto TEXT NOT NULL,
  lote_produccion TEXT NOT NULL,
  fecha_inicio DATE NOT NULL,
  materias_primas TEXT[] DEFAULT '{}',
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'completada', 'rechazada')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Controles de Fermentacion
CREATE TABLE controles_fermentacion (
  id SERIAL PRIMARY KEY,
  fermentacion_id TEXT NOT NULL REFERENCES fermentaciones(id) ON DELETE CASCADE,
  dia INTEGER NOT NULL,
  fecha DATE NOT NULL,
  ph NUMERIC NOT NULL,
  temperatura NUMERIC NOT NULL,
  humedad_relativa NUMERIC NOT NULL,
  aspecto_visual TEXT DEFAULT '',
  olor TEXT DEFAULT '',
  conforme BOOLEAN NOT NULL,
  observaciones TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Hojas de Produccion
CREATE TABLE producciones (
  id TEXT PRIMARY KEY,
  lote_produccion TEXT NOT NULL,
  producto TEXT NOT NULL,
  fecha DATE NOT NULL,
  operario TEXT NOT NULL,
  materias_primas JSONB DEFAULT '[]',
  fermentacion_id TEXT DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'en_proceso' CHECK (estado IN ('en_proceso', 'completada', 'rechazada')),
  observaciones TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Hojas de Envasado
CREATE TABLE envasados (
  id TEXT PRIMARY KEY,
  lote_envasado TEXT NOT NULL,
  lote_produccion TEXT NOT NULL,
  producto TEXT NOT NULL,
  fecha DATE NOT NULL,
  operario TEXT NOT NULL,
  formato_envase TEXT NOT NULL,
  lote_envase TEXT NOT NULL,
  lote_tapon TEXT NOT NULL,
  unidades INTEGER NOT NULL,
  estado TEXT NOT NULL DEFAULT 'en_proceso' CHECK (estado IN ('en_proceso', 'completado', 'rechazado')),
  observaciones TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PCCs
CREATE TABLE pccs (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  limite_critico TEXT NOT NULL,
  frecuencia TEXT NOT NULL,
  responsable TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('complemento', 'alimento')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Controles PCC
CREATE TABLE controles_pcc (
  id TEXT PRIMARY KEY,
  pcc_id TEXT NOT NULL REFERENCES pccs(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  valor TEXT NOT NULL,
  conforme BOOLEAN NOT NULL,
  operario TEXT NOT NULL,
  accion_correctora TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Productos (Stock)
CREATE TABLE productos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  ean TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('solido', 'liquido')),
  categoria TEXT NOT NULL CHECK (categoria IN ('complemento', 'alimento')),
  stock INTEGER NOT NULL DEFAULT 0,
  umbral_alerta INTEGER NOT NULL DEFAULT 10,
  lote_actual TEXT DEFAULT '',
  materias_primas JSONB DEFAULT '[]',
  envase TEXT DEFAULT '',
  lote_envase TEXT DEFAULT '',
  tapon TEXT DEFAULT '',
  lote_tapon TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Incidencias
CREATE TABLE incidencias (
  id TEXT PRIMARY KEY,
  fecha DATE NOT NULL,
  tipo TEXT NOT NULL,
  gravedad TEXT NOT NULL CHECK (gravedad IN ('alta', 'media', 'baja')),
  descripcion TEXT NOT NULL,
  accion_correctora TEXT DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada')),
  fecha_cierre DATE,
  responsable TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert demo PCCs Complementos
INSERT INTO pccs (id, nombre, limite_critico, frecuencia, responsable, tipo) VALUES
  ('PCC-C1', 'pH fermentacion (dia 7)', 'pH <= 4.6', 'Dia 7 de cada fermentacion', 'Responsable produccion', 'complemento'),
  ('PCC-C2', 'Temperatura camara fermentacion', '18-24C', 'Diaria durante fermentacion', 'Responsable produccion', 'complemento'),
  ('PCC-C3', 'Control microbiologico producto final', 'Ausencia patogenos (RD 3484/2000)', 'Cada lote', 'Laboratorio externo', 'complemento'),
  ('PCC-C4', 'Verificacion etiquetado (AESAN)', 'Cumplimiento RD 1487/2009', 'Cada nuevo producto/cambio', 'Responsable calidad', 'complemento'),
  ('PCC-C5', 'Dosificacion ingredientes activos', 'Dentro de rango declarado ±10%', 'Cada lote produccion', 'Operario produccion', 'complemento'),
  ('PCC-C6', 'Detector de metales envasado', 'Fe 1.5mm, No-Fe 2.0mm, SS 2.5mm', 'Cada sesion de envasado', 'Operario envasado', 'complemento');

-- Insert demo PCCs Alimentos
INSERT INTO pccs (id, nombre, limite_critico, frecuencia, responsable, tipo) VALUES
  ('PCC-A1', 'pH fermentacion (dia 7)', 'pH <= 4.6', 'Dia 7 de cada fermentacion', 'Responsable produccion', 'alimento'),
  ('PCC-A2', 'Temperatura almacenamiento', '< 25C ambiente / < 5C refrigerado', 'Diaria', 'Responsable almacen', 'alimento'),
  ('PCC-A3', 'Control alergenos (14 alergenos UE 1169/2011)', 'Declaracion completa en etiqueta', 'Cada producto / cambio formulacion', 'Responsable calidad', 'alimento'),
  ('PCC-A4', 'Limpieza entre cambios de producto', 'Protocolo limpieza completado', 'Cada cambio de producto', 'Operario', 'alimento');
