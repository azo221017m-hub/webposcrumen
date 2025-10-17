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

// Tipo para las pantallas de la aplicación
export type ScreenType = 
  | 'presentation' // Pantalla de presentación inicial
  | 'login' // Pantalla de login
  | 'home' // Pantalla principal/dashboard
  | 'config-usuarios' // Configuración de usuarios
  | 'config-negocios'; // Configuración de negocios

// Tipo para los indicadores del dashboard
export interface Indicator {
  id: string; // ID único del indicador
  title: string; // Título del indicador
  value: string | number; // Valor a mostrar
  description: string; // Descripción del indicador
  icon: string; // Icono a mostrar
  color: string; // Color del indicador
}