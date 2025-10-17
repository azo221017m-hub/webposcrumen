// src/hooks/useAuth.ts
// Hook personalizado para manejo de autenticación en POSWEBCrumen

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { Usuario, LoginData, AuthContextType } from '../types'; // Importa tipos
import apiService from '../services/api'; // Importa servicio de API

// Hook personalizado para autenticación
export const useAuth = (): AuthContextType => {
  // Estado para el usuario autenticado
  const [user, setUser] = useState<Usuario | null>(null);
  
  // Estado para indicar si está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Estado para indicar si está cargando
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Efecto para cargar datos de autenticación al iniciar
  useEffect(() => {
    console.log('🔍 Verificando estado de autenticación...'); // Log de verificación
    
    // Busca datos del usuario en localStorage
    const savedUser = localStorage.getItem('poscrumen_user');
    const savedAuth = localStorage.getItem('poscrumen_authenticated');
    
    if (savedUser && savedAuth === 'true') {
      try {
        // Parsea y restaura el usuario guardado
        const userData: Usuario = JSON.parse(savedUser);
        setUser(userData); // Establece el usuario
        setIsAuthenticated(true); // Marca como autenticado
        console.log('✅ Usuario restaurado desde localStorage:', userData.usuario); // Log de restauración
      } catch (error) {
        console.error('❌ Error parseando usuario guardado:', error); // Log de error
        // Limpia datos corruptos
        localStorage.removeItem('poscrumen_user');
        localStorage.removeItem('poscrumen_authenticated');
      }
    }
    
    setIsLoading(false); // Termina la carga
  }, []);

  // Función para realizar login
  const login = async (loginData: LoginData): Promise<boolean> => {
    try {
      console.log('🔐 Intentando login...'); // Log de intento
      setIsLoading(true); // Inicia la carga
      
      // Llama a la API para autenticarse
      const response = await apiService.login(loginData);
      
      if (response.success && response.data?.user) {
        // Login exitoso
        const userData = response.data.user;
        
        setUser(userData); // Establece el usuario
        setIsAuthenticated(true); // Marca como autenticado
        
        // Guarda en localStorage para persistencia
        localStorage.setItem('poscrumen_user', JSON.stringify(userData));
        localStorage.setItem('poscrumen_authenticated', 'true');
        
        console.log('✅ Login exitoso para:', userData.usuario); // Log de éxito
        setIsLoading(false); // Termina la carga
        return true; // Retorna éxito
        
      } else {
        // Login fallido
        console.log('❌ Login fallido:', response.message); // Log de fallo
        setIsLoading(false); // Termina la carga
        return false; // Retorna fallo
      }
      
    } catch (error) {
      console.error('💥 Error en login:', error); // Log de error
      setIsLoading(false); // Termina la carga
      return false; // Retorna fallo
    }
  };

  // Función para realizar logout
  const logout = (): void => {
    console.log('🚪 Cerrando sesión...'); // Log de logout
    
    // Limpia el estado
    setUser(null); // Remueve el usuario
    setIsAuthenticated(false); // Marca como no autenticado
    
    // Limpia localStorage
    localStorage.removeItem('poscrumen_user');
    localStorage.removeItem('poscrumen_authenticated');
    
    console.log('✅ Sesión cerrada exitosamente'); // Log de éxito
  };

  // Retorna el contexto de autenticación
  return {
    user, // Usuario actual
    isAuthenticated, // Estado de autenticación
    isLoading, // Estado de carga
    login, // Función de login
    logout, // Función de logout
  };
};