// src/types/index.ts
// Tipos TypeScript para el frontend de POSWEBCrumen

// Tipo para la respuesta estándar de la API
export interface ApiResponse<T = any> {
  success: boolean; // Indica si la operación fue exitosa
  message: string; // Mensaje descriptivo de la respuesta
  data?: T; // Datos opcionales de la respuesta
  error?: string; // Mensaje de error opcional
}

// Tipo para datos de usuario
export interface Usuario {
  idUsuario: number; // ID único del usuario
  idNegocio: number; // ID del negocio al que pertenece
  idRol: number; // ID del rol del usuario
  nombre: string; // Nombre completo del usuario
  usuario: string; // Nombre de usuario para login
  email: string; // Correo electrónico
  estatus: number; // Estado del usuario (1=activo, 9=bloqueado)
  fechaRegistro: string; // Fecha de registro del usuario
  fechaActualizacion: string; // Fecha de última actualización
  usuarioAuditoria: string; // Usuario que realizó la última modificación
}

// Tipo para datos de negocio
export interface Negocio {
  idNegocio: number; // ID único del negocio
  numerocliente: string; // Número de cliente del negocio
  nombreNegocio: string; // Nombre del negocio
  rfc: string; // RFC del negocio
  direccion: string; // Dirección completa del negocio
  telefono: string; // Teléfono de contacto
  estatusCliente: number; // Estado del cliente (1=activo, 0=inactivo)
  fechaRegistro: string; // Fecha de registro del negocio
  fechaActualizacion: string; // Fecha de última actualización
  usuario: string; // Usuario que registró el negocio
}

// Tipo para datos de login
export interface LoginData {
  usuario: string; // Nombre de usuario
  password: string; // Contraseña
}

// Tipo para el contexto de autenticación
export interface AuthContextType {
  user: Usuario | null; // Usuario autenticado actual
  isAuthenticated: boolean; // Estado de autenticación
  isLoading: boolean; // Estado de carga
  login: (loginData: LoginData) => Promise<boolean>; // Función de login
  logout: () => void; // Función de logout
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
  usuarioAuditoria?: string; // Usuario que crea el registro
}

// Tipo para datos de registro de negocio
export interface CreateNegocioData {
  numerocliente: string; // Número de cliente
  nombreNegocio: string; // Nombre del negocio
  rfc: string; // RFC
  direccion: string; // Dirección
  telefono: string; // Teléfono
  usuario?: string; // Usuario que crea el registro
}

// Tipo para datos de rol
export interface Rol {
  idRol: number; // ID único del rol
  nombreRol: string; // Nombre del rol
  descripcion: string; // Descripción del rol
  estatus: number; // Estado del rol (1=activo, 0=inactivo)
  fechaRegistro: string; // Fecha de registro
  fechaActualizacion: string; // Fecha de actualización
  usuario: string; // Usuario que modificó
}

// Tipo para datos de registro de rol
export interface CreateRolData {
  nombreRol: string; // Nombre del rol
  descripcion: string; // Descripción del rol
  estatus?: number; // Estado del rol (1=activo, 0=inactivo)
  usuario?: string; // Usuario que crea el registro
}

// Tipo para datos de cliente
export interface Cliente {
  idCliente: number; // ID único del cliente
  nombre: string; // Nombre del cliente
  telefono: string; // Teléfono del cliente
  email: string; // Email del cliente
  direccion: string; // Dirección del cliente
  estatus: number; // Estado del cliente (1=activo, 0=inactivo)
  fechaRegistro: string; // Fecha de registro
  fechaActualizacion: string; // Fecha de actualización
  usuario: string; // Usuario que modificó
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

// Tipo para parámetros de negocio
export interface ParametrosNegocio {
  idParametro: number; // ID único del parámetro
  idNegocio: number; // ID del negocio asociado
  tipoNegocio: string; // Tipo de negocio
  impresionRecibo: number; // Impresión de recibo (1=sí, 0=no)
  encabezado: string; // Encabezado del recibo
  pie: string; // Pie del recibo
  tipoRecibo: string; // Tipo de recibo
  envioMensaje: number; // Envío de mensaje (1=sí, 0=no)
  estatus: number; // Estado (1=activo, 0=inactivo)
  fechaRegistro: string; // Fecha de registro
  fechaActualizacion: string; // Fecha de actualización
  usuario: string; // Usuario que modificó
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

// Tipo para registro completo de negocio (cliente + negocio + parámetros)
export interface CreateNegocioCompletoData {
  cliente: CreateClienteData; // Datos del cliente
  negocio: {
    nombreNegocio: string; // Nombre del negocio
    rfc: string; // RFC
    direccion: string; // Dirección
    telefono: string; // Teléfono
    estatusCliente?: number; // Estado del cliente (1=activo, 0=inactivo)
    usuario?: string; // Usuario que crea el registro
  };
  parametros: CreateParametrosNegocioData; // Parámetros del negocio
}

// Tipo para las pantallas de la aplicación
export type ScreenType = 
  | 'presentation' // Pantalla de presentación inicial
  | 'login' // Pantalla de login
  | 'home' // Pantalla principal/dashboard
  | 'tablero-inicial' // Nuevo tablero inicial
  | 'config-usuarios' // Configuración de usuarios
  | 'config-negocios' // Configuración de negocios
  | 'config-roles' // Configuración de roles
  | 'config-clientes' // Configuración de clientes
  | 'config-categorias' // Configuración de categorías
  | 'config-insumos' // Configuración de insumos
  | 'config-proveedores' // Configuración de proveedores
  | 'formulario-negocio' // Formulario completo de negocio
  | 'config-productos' // Configuración de productos
  | 'config-recetas' // Configuración de recetas
  | 'config-sub-recetas' // Configuración de sub-recetas
  | 'config-mesas' // Configuración de mesas
  | 'config-perfil' // Configuración de perfil
  | 'config-recibos' // Configuración de recibos
  | 'iniciar-venta' // Iniciar nueva venta
  | 'indicadores-ventas' // Indicadores de ventas
  | 'sistema-configuracion' // Configuración del sistema
  | 'config-umcompras' // Configuración de unidades de medida de compra
  | 'config-tipo-movimiento' // Configuración de tipos de movimiento
  | 'config-subtipo-movimiento'; // Configuración de subtipos de movimiento

// Tipo para los indicadores del dashboard
export interface Indicator {
  id: string; // ID único del indicador
  title: string; // Título del indicador
  value: string | number; // Valor a mostrar
  description: string; // Descripción del indicador
  icon: string; // Icono a mostrar
  color: string; // Color del indicador
}

// Tipo para datos de categoría
export interface Categoria {
  idCategoria: number; // ID único de la categoría
  nombre: string; // Nombre de la categoría
  descripcion: string; // Descripción de la categoría
  estatus: number; // Estado de la categoría (1=activo, 0=inactivo)
  fechaRegistro: string; // Fecha de registro
  fechaActualizacion: string; // Fecha de última actualización
  usuario: string; // Usuario que registró la categoría
}

// Tipo para datos de registro de categoría
export interface CreateCategoriaData {
  nombre: string; // Nombre de la categoría
  descripcion: string; // Descripción de la categoría
  estatus?: number; // Estado (1=activo, 0=inactivo)
  usuario?: string; // Usuario que crea el registro
}

// Tipo para datos de producto
export interface Producto {
  idProducto: number; // ID único del producto
  idCategoria: number; // ID de la categoría
  idReceta?: number; // ID de la receta (opcional)
  nombre: string; // Nombre del producto
  descripcion: string; // Descripción del producto
  precio: number; // Precio del producto
  existencia: number; // Existencia disponible
  estatus: number; // Estado del producto (1=activo, 0=inactivo)
  fechaRegistro: string; // Fecha de registro
  fechaActualizacion: string; // Fecha de última actualización
  usuario: string; // Usuario que registró el producto
  idNegocio: number; // ID del negocio al que pertenece
  imagenProducto?: string; // Imagen del producto (base64)
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
  imagenProducto?: File; // Archivo de imagen del producto
}

// Tipo para datos de insumo (como viene del backend)
export interface Insumo {
  id_insumo: number; // ID único del insumo
  nombre: string; // Nombre del insumo
  costo_promedio_ponderado: string | number; // Costo promedio ponderado (decimal de MySQL)
  unidad_medida: string; // Unidad de medida del insumo
  tipo_insumo: 'INSUMO' | 'PRODUCTO'; // Tipo de insumo
  stock_actual: string | number; // Stock actual disponible (decimal de MySQL)
  stock_minimo: string | number; // Stock mínimo (decimal de MySQL)
  precio_venta: string | number; // Precio de venta (decimal de MySQL)
  precio_referencia?: string | number; // Precio de referencia opcional (decimal de MySQL)
  id_categoria: number; // ID de la categoría
  id_proveedor?: number; // ID del proveedor opcional
  activo: boolean; // Estado activo/inactivo
  fecha_registro: string; // Fecha de registro
  fecha_actualizacion: string; // Fecha de última actualización
  usuario: string; // Usuario que registró el insumo
}

// Tipo para datos de registro de insumo
export interface CreateInsumoData {
  nombre: string; // Nombre del insumo
  costo_promedio_ponderado: number; // Costo promedio ponderado
  unidad_medida: string; // Unidad de medida del insumo
  tipo_insumo: 'INSUMO' | 'PRODUCTO'; // Tipo de insumo (según requerimiento)
  stock_actual: number; // Stock inicial/actual
  stock_minimo: number; // Stock mínimo
  precio_venta: number; // Precio de venta
  precio_referencia?: number; // Precio de referencia opcional
  id_categoria: number; // ID de la categoría
  id_proveedor?: number; // ID del proveedor opcional
  activo?: boolean; // Estado activo/inactivo (por defecto true)
  usuario?: string; // Usuario que crea el registro (opcional, se llenará automáticamente)
}

// Tipo para producto en un pedido
export interface PedidoProducto {
  nombre: string; // Nombre del producto
  cantidad: number; // Cantidad solicitada
  precio: number; // Precio unitario
  subtotal: number; // Subtotal del producto (cantidad * precio)
}

// Tipo para pedido tipo comanda
export interface Pedido {
  idPedido: string; // ID único del pedido
  numeroComanda: string; // Número de comanda
  cliente: string; // Nombre del cliente
  productos: PedidoProducto[]; // Lista de productos en el pedido
  total: number; // Total del pedido
  formaPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'MIXTO'; // Forma de pago
  estado: 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO' | 'CANCELADO'; // Estado del pedido
  fechaPedido: string; // Fecha y hora del pedido
  horaPedido: string; // Hora específica del pedido
  mesa?: string; // Mesa asignada (opcional)
  observaciones?: string; // Observaciones especiales (opcional)
}

// Tipo para datos de mesa
export interface Mesa {
  idmesa: number; // ID único de la mesa
  nombremesa: string; // Nombre de la mesa
  numeromesa: number; // Número de la mesa
  cantcomensales: number; // Cantidad de comensales
  estatusmesa: 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA' | 'INACTIVA'; // Estado de la mesa
  tiempodeinicio?: string; // Tiempo de inicio de ocupación
  tiempoactual?: string; // Tiempo actual de ocupación
  estatustiempo?: 'EN_CURSO' | 'FINALIZADO' | 'PENDIENTE'; // Estado del tiempo
  creado_en?: string; // Fecha de creación
  actualizado_en?: string; // Fecha de actualización
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

// Tipo para datos de proveedor
export interface Proveedor {
  id: number; // ID único del proveedor
  nombre: string; // Nombre del proveedor
  rfc?: string; // RFC del proveedor (opcional)
  telefono?: string; // Teléfono del proveedor (opcional)
  correo?: string; // Correo electrónico del proveedor (opcional)
  direccion?: string; // Dirección del proveedor (opcional)
  banco?: string; // Banco del proveedor (opcional)
  cuenta?: string; // Número de cuenta del proveedor (opcional)
  activo: number; // Estado activo (1=activo, 0=inactivo)
  created_at: string; // Fecha de registro del proveedor
  updated_at: string; // Fecha de última actualización del proveedor
}

// Tipo para crear un proveedor
export interface CreateProveedorData {
  nombre: string; // Nombre del proveedor (requerido)
  rfc?: string; // RFC del proveedor (opcional)
  telefono?: string; // Teléfono del proveedor (opcional)
  correo?: string; // Correo electrónico del proveedor (opcional)
  direccion?: string; // Dirección del proveedor (opcional)
  banco?: string; // Banco del proveedor (opcional)
  cuenta?: string; // Número de cuenta del proveedor (opcional)
  activo?: number; // Estado activo (1=activo, 0=inactivo, por defecto 1)
}

// Tipo para actualizar un proveedor
export interface UpdateProveedorData {
  nombre: string; // Nombre del proveedor (requerido)
  rfc?: string; // RFC del proveedor (opcional)
  telefono?: string; // Teléfono del proveedor (opcional)
  correo?: string; // Correo electrónico del proveedor (opcional)
  direccion?: string; // Dirección del proveedor (opcional)
  banco?: string; // Banco del proveedor (opcional)
  cuenta?: string; // Número de cuenta del proveedor (opcional)
  activo?: number; // Estado activo del proveedor (opcional)
}

// Tipo para unidad de medida de compra
export interface UMCompra {
  idUmCompra: number; // ID único de la unidad de medida de compra
  nombreUmCompra: string; // Nombre de la unidad de medida de compra
  valor: number | string; // Valor de conversión (puede venir como string desde MySQL)
  umMatPrima: string; // Unidad de materia prima (Lt, ml, Kl, gr, pza)
  valorConvertido: number | string; // Valor convertido (puede venir como string desde MySQL)
  fechaRegistro: string; // Fecha de registro
  fechaActualizacion: string; // Fecha de última actualización
  usuario: string; // Usuario que realizó el registro/actualización
}

// Tipo para crear una nueva unidad de medida de compra
export interface CreateUMCompraData {
  nombreUmCompra: string; // Nombre de la unidad de medida de compra (requerido)
  valor: number; // Valor de conversión (requerido)
  umMatPrima: string; // Unidad de materia prima (requerido: Lt, ml, Kl, gr, pza)
  valorConvertido: number; // Valor convertido (requerido)
  usuario: string; // Usuario que realiza el registro (requerido)
}

// Tipo para actualizar una unidad de medida de compra
export interface UpdateUMCompraData {
  nombreUmCompra: string; // Nombre de la unidad de medida de compra (requerido)
  valor: number; // Valor de conversión (requerido)
  umMatPrima: string; // Unidad de materia prima (requerido: Lt, ml, Kl, gr, pza)
  valorConvertido: number; // Valor convertido (requerido)
}

// Tipo para tipo de movimiento
export interface TipoMovimiento {
  idtipomovimiento: number; // ID único del tipo de movimiento
  nombretipomovimiento: string; // Nombre del tipo de movimiento
  categoriatipomovimiento: string; // Categoría del tipo de movimiento
}

// Tipo para crear un nuevo tipo de movimiento
export interface CreateTipoMovimientoData {
  nombretipomovimiento: string; // Nombre del tipo de movimiento (requerido)
  categoriatipomovimiento: string; // Categoría del tipo de movimiento (requerido)
}

// Tipo para actualizar un tipo de movimiento
export interface UpdateTipoMovimientoData {
  nombretipomovimiento: string; // Nombre del tipo de movimiento (requerido)
  categoriatipomovimiento: string; // Categoría del tipo de movimiento (requerido)
}

// Tipo para subtipo de movimiento
export interface SubtipoMovimiento {
  idsubtipomovimiento: number; // ID único del subtipo de movimiento
  nombretiposubmovimiento: string; // Nombre del subtipo de movimiento
  idtipomovimiento: number; // ID del tipo de movimiento asociado
  preciosubtipomovimiento: number; // Precio del subtipo de movimiento
  nombretipomovimiento?: string; // Nombre del tipo de movimiento (para JOINs)
}

// Tipo para crear un nuevo subtipo de movimiento
export interface CreateSubtipoMovimientoData {
  nombretiposubmovimiento: string; // Nombre del subtipo de movimiento (requerido)
  idtipomovimiento: number; // ID del tipo de movimiento (requerido)
  preciosubtipomovimiento: number; // Precio del subtipo de movimiento (requerido)
}

// Tipo para actualizar un subtipo de movimiento
export interface UpdateSubtipoMovimientoData {
  nombretiposubmovimiento: string; // Nombre del subtipo de movimiento (requerido)
  idtipomovimiento: number; // ID del tipo de movimiento (requerido)
  preciosubtipomovimiento: number; // Precio del subtipo de movimiento (requerido)
}