// backend/src/types/index.ts
// Definición de tipos TypeScript para toda la aplicación POSWEBCrumen

// Tipo para la respuesta estándar de la API
export interface ApiResponse<T = any> {
  success: boolean; // Indica si la operación fue exitosa
  message: string; // Mensaje descriptivo de la respuesta
  data?: T; // Datos opcionales de la respuesta
  error?: string; // Mensaje de error opcional
}

// Tipo para datos de usuario en la base de datos
export interface Usuario {
  idUsuario: number; // ID único del usuario
  idNegocio: number; // ID del negocio al que pertenece
  idRol: number; // ID del rol del usuario
  nombre: string; // Nombre completo del usuario
  usuario: string; // Nombre de usuario para login
  password: string; // Contraseña encriptada
  email: string; // Correo electrónico
  estatus: number; // Estado del usuario (1=activo, 9=bloqueado)
  fechaRegistro: Date; // Fecha de registro del usuario
  fechaActualizacion: Date; // Fecha de última actualización
  usuarioAuditoria: string; // Usuario que realizó la última modificación
}

// Tipo para datos de negocio en la base de datos
export interface Negocio {
  idNegocio: number; // ID único del negocio
  numerocliente: string; // Número de cliente del negocio
  nombreNegocio: string; // Nombre del negocio
  rfc: string; // RFC del negocio
  direccion: string; // Dirección completa del negocio
  telefono: string; // Teléfono de contacto
  estatusCliente: number; // Estado del cliente (1=activo, 0=inactivo)
  fechaRegistro: Date; // Fecha de registro del negocio
  fechaActualizacion: Date; // Fecha de última actualización
  usuario: string; // Usuario que registró el negocio
}

// Tipo para intentos de acceso fallidos
export interface AccessAttempt {
  id: number; // ID único del intento
  tipo: 'cliente' | 'usuario'; // Tipo de acceso intentado
  referencia: string; // Referencia del usuario que intentó acceder
  intentos: number; // Número de intentos fallidos
  last_attempt: Date; // Fecha del último intento
  bloqueado_until: Date | null; // Fecha hasta cuando está bloqueado
}

// Tipo para unidades de medida de compra
export interface UMMovimiento {
  idUmCompra: number; // ID único de la unidad de medida
  nombreUmCompra: string; // Nombre de la unidad de medida (máx 100 caracteres)
  valor: number; // Valor decimal de la unidad de medida
  umMatPrima: 'Kl' | 'Lt' | 'gr' | 'ml' | 'pza'; // Unidad de materia prima (valores permitidos)
  valorConvertido: number; // Valor convertido decimal
  fechaRegistro: Date; // Fecha de registro
  fechaActualizacion: Date; // Fecha de última actualización
  usuario: string; // Usuario que realizó la operación
}

// Tipos para naturaleza de movimiento contable
export type NaturalezaMovimiento = 'COMPRA' | 'GASTO';

// Tipos para categorías de movimiento según naturaleza
export type CategoriaCompra = 'Inventario' | 'activo fijo' | 'servicios' | 'administrativas' | 'extraodinarias' | 'inversión';
export type CategoriaGasto = 'operación' | 'financiero' | 'extraorinario';

// Tipo para tipos de movimiento contable
export interface TipoMovimiento {
  idtipomovimiento: number; // ID único del tipo de movimiento
  nombretipomovimiento: string; // Nombre del tipo de movimiento (máx 100 caracteres)
  categoriatipomovimiento: CategoriaCompra | CategoriaGasto; // Categoría según naturaleza
  naturalezatipomovimiento: NaturalezaMovimiento; // Naturaleza del movimiento (COMPRA|GASTO)
}

// Tipo para datos de login
export interface LoginData {
  usuario: string; // Nombre de usuario
  password: string; // Contraseña
}

// Tipo para datos de registro de usuario
export interface CreateUsuarioData {
  idNegocio: number; // ID del negocio
  idRol: number; // ID del rol
  nombre: string; // Nombre completo
  usuario: string; // Nombre de usuario
  password: string; // Contraseña
  email: string; // Correo electrónico
  activo?: number; // Estado del usuario (1=activo, 0=inactivo)
  usuarioAuditoria: string; // Usuario que crea el registro
}

// Tipo para datos de registro de negocio
export interface CreateNegocioData {
  numerocliente: string; // Número de cliente
  nombreNegocio: string; // Nombre del negocio
  rfc: string; // RFC
  direccion: string; // Dirección
  telefono: string; // Teléfono
  usuario: string; // Usuario que crea el registro
}

// Tipo para datos de registro de rol
export interface CreateRolData {
  nombreRol: string; // Nombre del rol
  descripcion: string; // Descripción del rol
  estatus?: number; // Estado del rol (1=activo, 0=inactivo)
  usuario?: string; // Usuario que crea el registro
}

// Tipo para datos de registro de cliente
export interface CreateClienteData {
  nombre: string; // Nombre del cliente
  telefono: string; // Teléfono del cliente
  email: string; // Email del cliente
  direccion: string; // Dirección del cliente
  estatus?: number; // Estado del cliente (1=activo, 0=inactivo)
  usuario?: string; // Usuario que crea el registro
}

// Tipo para datos de registro de parámetros de negocio
export interface CreateParametrosNegocioData {
  idNegocio: number; // ID del negocio asociado
  tipoNegocio: string; // Tipo de negocio
  impresionRecibo?: number; // Impresión de recibo (1=sí, 0=no)
  encabezado: string; // Encabezado del recibo
  pie: string; // Pie del recibo
  tipoRecibo: string; // Tipo de recibo
  envioMensaje?: number; // Envío de mensaje (1=sí, 0=no)
  estatus?: number; // Estado (1=activo, 0=inactivo)
  usuario?: string; // Usuario que crea el registro
}

// Tipo para datos de categoría en la base de datos
export interface Categoria {
  idCategoria: number; // ID único de la categoría
  nombre: string; // Nombre de la categoría
  descripcion: string; // Descripción de la categoría
  estatus: number; // Estado de la categoría (1=activo, 0=inactivo)
  fechaRegistro: Date; // Fecha de registro
  fechaActualizacion: Date; // Fecha de última actualización
  usuario: string; // Usuario que registró la categoría
}

// Tipo para datos de registro de categoría
export interface CreateCategoriaData {
  nombre: string; // Nombre de la categoría
  descripcion: string; // Descripción de la categoría
  estatus?: number; // Estado (1=activo, 0=inactivo)
  usuario?: string; // Usuario que crea el registro
}

// Tipo para datos de producto en la base de datos
export interface Producto {
  idProducto: number; // ID único del producto
  idCategoria: number; // ID de la categoría
  idReceta?: number; // ID de la receta (opcional)
  nombre: string; // Nombre del producto
  descripcion: string; // Descripción del producto
  precio: number; // Precio del producto
  existencia: number; // Existencia disponible
  estatus: number; // Estado del producto (1=activo, 0=inactivo)
  fechaRegistro: Date; // Fecha de registro
  fechaActualizacion: Date; // Fecha de última actualización
  usuario: string; // Usuario que registró el producto
  idNegocio: number; // ID del negocio al que pertenece
  imagenProducto?: Buffer; // Imagen del producto (LONGBLOB)
}

// Tipo para datos de registro de producto
export interface CreateProductoData {
  idCategoria: number; // ID de la categoría
  idReceta?: number; // ID de la receta (opcional)
  nombre: string; // Nombre del producto
  descripcion: string; // Descripción del producto
  precio: number; // Precio del producto
  existencia: number; // Existencia inicial
  estatus?: number; // Estado (1=activo, 0=inactivo)
  usuario?: string; // Usuario que crea el registro
  idNegocio: number; // ID del negocio
  imagenProducto?: Buffer; // Imagen del producto
}

// Tipo para datos de insumo según tabla tblposcrumenwebinsumos
export interface Insumo {
  id_insumo: number; // ID único del insumo (AI PK)
  nombre: string; // Nombre del insumo (varchar 100)
  unidad_medida: 'Kg' | 'Lt' | 'Pza'; // Unidad de medida del insumo (varchar 20)
  tipo_insumo: 'PRODUCTO' | 'INSUMO'; // Tipo de insumo (enum)
  stock_actual: number; // Stock actual disponible (decimal 10,2)
  stock_minimo: number; // Stock mínimo (decimal 10,2)
  costo_promedio_ponderado: number; // Costo promedio ponderado (decimal 12,4)
  precio_venta: number; // Precio de venta (decimal 12,2)
  id_cuentacontable: number; // ID de cuenta contable (int 11)
  activo: boolean; // Estado activo/inactivo (tinyint 1)
  fecha_registro: string; // Fecha de registro (datetime)
  fecha_actualizacion: string; // Fecha de última actualización (datetime)
  usuario: string; // Usuario que registró el insumo
}

// Tipo para crear/actualizar insumo
export interface CreateInsumoData {
  nombre: string; // Nombre del insumo (requerido)
  unidad_medida: 'Kg' | 'Lt' | 'Pza'; // Unidad de medida (requerido)
  tipo_insumo: 'PRODUCTO' | 'INSUMO'; // Tipo de insumo (requerido)
  stock_actual: number; // Stock inicial/actual (requerido)
  stock_minimo: number; // Stock mínimo (requerido)
  costo_promedio_ponderado: number; // Costo promedio ponderado (requerido)
  precio_venta: number; // Precio de venta (requerido)
  id_cuentacontable: number; // ID de cuenta contable (requerido)
}

// Tipo para datos de mesa en la base de datos
export interface Mesa {
  idmesa: number; // ID único de la mesa
  nombremesa: string; // Nombre de la mesa
  numeromesa: number; // Número de la mesa
  cantcomensales: number; // Cantidad de comensales
  estatusmesa: 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA' | 'INACTIVA'; // Estado de la mesa
  tiempodeinicio?: Date; // Tiempo de inicio de ocupación
  tiempoactual?: Date; // Tiempo actual de ocupación
  estatustiempo?: 'EN_CURSO' | 'FINALIZADO' | 'PENDIENTE'; // Estado del tiempo
  creado_en?: Date; // Fecha de creación
  actualizado_en?: Date; // Fecha de actualización
  creado_por?: string; // Usuario que creó la mesa
  actualizado_por?: string; // Usuario que actualizó la mesa
}

// Tipo para crear una nueva mesa
export interface CreateMesaData {
  nombremesa: string; // Nombre de la mesa
  numeromesa: number; // Número de la mesa
  cantcomensales: number; // Cantidad de comensales
  estatusmesa: 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA' | 'INACTIVA'; // Estado de la mesa
  creado_por: string; // Usuario que crea la mesa
}

// Tipo para actualizar una mesa
export interface UpdateMesaData {
  nombremesa?: string; // Nombre de la mesa (opcional)
  numeromesa?: number; // Número de la mesa (opcional)
  cantcomensales?: number; // Cantidad de comensales (opcional)
  estatusmesa?: 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA' | 'INACTIVA'; // Estado de la mesa (opcional)
  actualizado_por: string; // Usuario que actualiza la mesa
}

// Tipo para datos de proveedor en la base de datos
export interface Proveedor {
  id: number; // ID único del proveedor (mapeado desde idProveedor)
  nombre: string; // Nombre del proveedor
  rfc?: string; // RFC del proveedor
  telefono?: string; // Teléfono del proveedor
  correo?: string; // Correo electrónico del proveedor
  direccion?: string; // Dirección del proveedor
  banco?: string; // Banco del proveedor
  cuenta?: string; // Cuenta bancaria del proveedor
  activo: number; // Estado del proveedor (1=activo, 0=inactivo)
  created_at: Date; // Fecha de creación (mapeado desde fechaRegistro)
  updated_at: Date; // Fecha de última actualización (mapeado desde fechaActualizacion)
}

// Tipo para crear un nuevo proveedor
export interface CreateProveedorData {
  nombre: string; // Nombre del proveedor (requerido)
  rfc?: string; // RFC del proveedor (opcional)
  telefono?: string; // Teléfono del proveedor (opcional)
  correo?: string; // Correo electrónico del proveedor (opcional)
  direccion?: string; // Dirección del proveedor (opcional)
  banco?: string; // Banco del proveedor (opcional)
  cuenta?: string; // Cuenta bancaria del proveedor (opcional)
  activo?: number; // Estado del proveedor (opcional, por defecto 1)
}

// Tipo para actualizar un proveedor
export interface UpdateProveedorData {
  nombre: string; // Nombre del proveedor (requerido)
  rfc?: string; // RFC del proveedor (opcional)
  telefono?: string; // Teléfono del proveedor (opcional)
  correo?: string; // Correo electrónico del proveedor (opcional)
  direccion?: string; // Dirección del proveedor (opcional)
  banco?: string; // Banco del proveedor (opcional)
  cuenta?: string; // Cuenta bancaria del proveedor (opcional)
  activo?: number; // Estado del proveedor (opcional)
}