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
  | 'config-usuarios' // Configuración de usuarios
  | 'config-negocios' // Configuración de negocios
  | 'config-roles' // Configuración de roles
  | 'config-clientes' // Configuración de clientes
  | 'formulario-negocio' // Formulario completo de negocio
  | 'config-productos' // Configuración de productos
  | 'config-recetas' // Configuración de recetas
  | 'config-perfil' // Configuración de perfil
  | 'config-recibos' // Configuración de recibos
  | 'iniciar-venta' // Iniciar nueva venta
  | 'indicadores-ventas' // Indicadores de ventas
  | 'sistema-configuracion'; // Configuración del sistema

// Tipo para los indicadores del dashboard
export interface Indicator {
  id: string; // ID único del indicador
  title: string; // Título del indicador
  value: string | number; // Valor a mostrar
  description: string; // Descripción del indicador
  icon: string; // Icono a mostrar
  color: string; // Color del indicador
}