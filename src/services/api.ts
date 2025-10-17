// src/services/api.ts
// Servicio para comunicación con la API del backend POSWEBCrumen

import type { ApiResponse, LoginData, Usuario, Negocio, CreateUsuarioData, CreateNegocioData } from '../types';

// URL base de la API - se obtiene de variables de entorno o usa localhost por defecto
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Clase para manejar todas las llamadas a la API
class ApiService {
  private baseURL: string; // URL base de la API

  constructor() {
    this.baseURL = API_BASE_URL; // Inicializa la URL base
    console.log('🌐 ApiService inicializado con URL:', this.baseURL); // Log de inicialización
  }

  // Método privado para realizar peticiones HTTP
  private async request<T>(
    endpoint: string, // Endpoint de la API
    options: RequestInit = {} // Opciones de la petición
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`📡 Realizando petición: ${options.method || 'GET'} ${endpoint}`); // Log de petición
      
      // Construye la URL completa
      const url = `${this.baseURL}${endpoint}`;
      console.log(`🌐 URL completa: ${url}`); // Log de URL
      
      // Configuración por defecto de la petición
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json', // Tipo de contenido JSON
          ...options.headers, // Headers adicionales
        },
        ...options, // Opciones adicionales
      };

      console.log(`⚙️ Configuración de la petición:`, config); // Log de configuración

      // Realiza la petición
      const response = await fetch(url, config);
      console.log(`📊 Status de respuesta: ${response.status}`); // Log de status
      
      // Parsea la respuesta JSON
      const data: ApiResponse<T> = await response.json();
      console.log(`📦 Datos de respuesta completos:`, data); // Log de datos completos
      
      // Log del resultado
      if (data.success) {
        console.log('✅ Petición exitosa:', data.message); // Log de éxito
      } else {
        console.log('❌ Error en petición:', data.message); // Log de error
      }
      
      return data; // Retorna los datos
      
    } catch (error) {
      console.error('💥 Error en petición API:', error); // Log de error de red
      
      // Retorna error estructurado
      return {
        success: false,
        message: 'Error de conexión con el servidor',
        error: 'NETWORK_ERROR'
      };
    }
  }

  // Método para login de usuarios
  async login(loginData: LoginData): Promise<ApiResponse<{ user: Usuario }>> {
    console.log('🔐 Iniciando login para usuario:', loginData.usuario); // Log de login
    
    return this.request<{ user: Usuario }>('/api/auth/login', {
      method: 'POST', // Método POST
      body: JSON.stringify(loginData), // Datos de login en JSON
    });
  }

  // Método para obtener todos los usuarios
  async getUsuarios(): Promise<ApiResponse<Usuario[]>> {
    console.log('👥 Obteniendo lista de usuarios'); // Log de consulta
    
    return this.request<Usuario[]>('/api/usuarios', {
      method: 'GET', // Método GET
    });
  }

  // Método para crear un nuevo usuario
  async createUsuario(userData: CreateUsuarioData): Promise<ApiResponse<{ idUsuario: number; usuario: string }>> {
    console.log('👤 Creando nuevo usuario:', userData.usuario); // Log de creación
    
    return this.request<{ idUsuario: number; usuario: string }>('/api/usuarios', {
      method: 'POST', // Método POST
      body: JSON.stringify(userData), // Datos del usuario en JSON
    });
  }

  // Método para actualizar un usuario existente
  async updateUsuario(id: number, userData: Partial<CreateUsuarioData>): Promise<ApiResponse<{ idUsuario: number }>> {
    console.log('✏️ Actualizando usuario ID:', id); // Log de actualización
    
    return this.request<{ idUsuario: number }>(`/api/usuarios/${id}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(userData), // Datos actualizados en JSON
    });
  }

  // Método para obtener todos los negocios
  async getNegocios(): Promise<ApiResponse<Negocio[]>> {
    console.log('🏢 Obteniendo lista de negocios'); // Log de consulta
    
    return this.request<Negocio[]>('/api/negocios', {
      method: 'GET', // Método GET
    });
  }

  // Método para crear un nuevo negocio
  async createNegocio(negocioData: CreateNegocioData): Promise<ApiResponse<{ idNegocio: number; nombreNegocio: string }>> {
    console.log('🏢 Creando nuevo negocio:', negocioData.nombreNegocio); // Log de creación
    
    return this.request<{ idNegocio: number; nombreNegocio: string }>('/api/negocios', {
      method: 'POST', // Método POST
      body: JSON.stringify(negocioData), // Datos del negocio en JSON
    });
  }

  // Método para actualizar un negocio existente
  async updateNegocio(id: number, negocioData: Partial<CreateNegocioData>): Promise<ApiResponse<{ idNegocio: number }>> {
    console.log('✏️ Actualizando negocio ID:', id); // Log de actualización
    
    return this.request<{ idNegocio: number }>(`/api/negocios/${id}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(negocioData), // Datos actualizados en JSON
    });
  }

  // Método para verificar la salud del servidor
  async healthCheck(): Promise<ApiResponse<any>> {
    console.log('💊 Verificando salud del servidor'); // Log de health check
    
    return this.request<any>('/health', {
      method: 'GET', // Método GET
    });
  }
}

// Crea y exporta una instancia única del servicio API
const apiService = new ApiService();

export default apiService;