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