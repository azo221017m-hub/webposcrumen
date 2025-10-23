// src/App.tsx
// Aplicación principal de POSWEBCrumen

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { ScreenType } from './types'; // Importa tipos
import { useAuth } from './hooks/useAuth'; // Importa hook de autenticación

// Importa componentes
import PresentationScreen from './components/PresentationScreen'; // Pantalla de presentación
import LoginScreen from './components/LoginScreen'; // Pantalla de login
import HomeScreen from './components/HomeScreen'; // Pantalla principal
// ConfigNegocios removido - ahora se usa FormularioNegocio
import ConfigUsuarios from './components/ConfigUsuarios'; // Configuración de usuarios
import ConfigRoles from './components/ConfigRoles'; // Configuración de roles
import ConfigClientes from './components/ConfigClientes'; // Configuración de clientes
import ConfigCategorias from './components/ConfigCategorias'; // Configuración de categorías
import ConfigInsumos from './components/ConfigInsumos'; // Configuración de insumos
import FormularioNegocio from './components/FormularioNegocio'; // Formulario completo de negocio
import ConfigProductos from './components/ConfigProductos'; // Configuración de productos
import ConfigRecetas from './components/ConfigRecetas'; // Configuración de recetas
import ConfigSubRecetas from './components/ConfigSubRecetas'; // Configuración de sub-recetas
import ConfigMesas from './components/ConfigMesas'; // Configuración de mesas
import ConfigProveedores from './components/ConfigProveedores'; // Configuración de proveedores
import TableroInicial from './components/TableroInicial'; // Nuevo tablero inicial

// Workaround: permite pasar props no tipadas al componente cuando el tipo de props
// del componente no incluye onBack (evita error de compilación hasta ajustar tipos)
const ConfigUsuariosAny = ConfigUsuarios as any;
const ConfigRolesAny = ConfigRoles as any;
const ConfigClientesAny = ConfigClientes as any;
const ConfigCategoriasAny = ConfigCategorias as any;
const ConfigInsumosAny = ConfigInsumos as any;
const FormularioNegocioAny = FormularioNegocio as any;
const ConfigProductosAny = ConfigProductos as any;
const ConfigRecetasAny = ConfigRecetas as any;

// Importa estilos
import './styles/global.css'; // Estilos globales
import './App.css'; // Estilos específicos de App

// Componente principal de la aplicación
function App() {
  // Estado para la pantalla actual - siempre inicia con presentation
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('presentation');
  
  // Hook de autenticación
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  // Efecto para manejar cambios en el estado de autenticación
  useEffect(() => {
    console.log('🔄 [App] Estado de autenticación cambió:', { 
      isAuthenticated, 
      user: user?.usuario, 
      currentScreen,
      isLoading 
    }); // Log de cambio
    
    // Si está autenticado y viene de login o presentation, va al tablero-inicial
    if (isAuthenticated && user && (currentScreen === 'login' || currentScreen === 'presentation')) {
      console.log('📊 [App] Redirigiendo a tablero-inicial - usuario autenticado'); // Log de redirección
      console.log('📱 [App] Cambiando currentScreen de', currentScreen, 'a tablero-inicial'); // Log de cambio de pantalla
      setCurrentScreen('tablero-inicial');
    }
    
    // Si no está autenticado y no está en login o presentación, va a login
    if (!isAuthenticated && !isLoading && currentScreen !== 'login' && currentScreen !== 'presentation') {
      console.log('🔐 [App] Redirigiendo a login - usuario no autenticado'); // Log de redirección
      setCurrentScreen('login');
    }
  }, [isAuthenticated, isLoading, user]); // Removido currentScreen de las dependencias para evitar loops

  // Función para manejar el completado de la presentación (solo presentación, no login)
  const handlePresentationComplete = (): void => {
    console.log('🎬 [handlePresentationComplete] Presentación completada, ir a login');
    setCurrentScreen('login'); // Ir al login real
  };

  // Función para manejar la navegación entre pantallas
  const handleNavigate = (screen: ScreenType): void => {
    console.log('🧭 Navegando a pantalla:', screen); // Log de navegación
    setCurrentScreen(screen); // Cambia la pantalla actual
  };

  // Función para regresar al TableroInicial desde pantallas de configuración
  const handleBackToTableroInicial = (): void => {
    console.log('📊 Regresando al TableroInicial'); // Log de regreso
    setCurrentScreen('tablero-inicial'); // Cambia al TableroInicial
  };

  // Función para manejar logout integrada inline donde se usa

  // Renderiza la pantalla actual según el estado
  const renderCurrentScreen = (): React.ReactElement => {
    // Si está cargando la autenticación, muestra un loader
    if (isLoading) {
      return (
        <div className="loading-screen fullscreen center-content">
          <div className="loading-content">
            <img 
              src="/logocrumenpos.svg" 
              alt="Logo Crumen POS" 
              className="loading-logo"
            />
            <div className="spinner"></div>
            <p>PosWebCrumen Cargando</p>
          </div>
        </div>
      );
    }

    // Switch para renderizar la pantalla correspondiente
    switch (currentScreen) {
      case 'presentation':
        console.log('🎬 Renderizando pantalla de presentación'); // Log de renderizado
        return <PresentationScreen onComplete={handlePresentationComplete} />;

      case 'login':
        console.log('🔐 Renderizando pantalla de login directa'); // Log de renderizado
        return (
          <LoginScreen
            onLogin={async (loginData) => {
              console.log('🔐 [App] Manejando login directamente:', loginData.usuario);
              try {
                const success = await login(loginData);
                if (success) {
                  console.log('✅ [App] Login exitoso, navegando a tablero-inicial');
                  setCurrentScreen('tablero-inicial');
                  return true;
                } else {
                  console.log('❌ [App] Login falló');
                  return false;
                }
              } catch (error) {
                console.error('💥 [App] Error en login:', error);
                return false;
              }
            }}
            isLoading={isLoading}
          />
        );

      case 'home':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🏠 Renderizando pantalla principal'); // Log de renderizado
        return (
          <HomeScreen 
            user={user} 
            onNavigate={handleNavigate}
          />
        );

      case 'tablero-inicial':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('📊 Renderizando tablero inicial'); // Log de renderizado
        return (
          <TableroInicial 
            user={user} 
            onNavigate={handleNavigate}
            onLogout={() => {
              logout();
              setCurrentScreen('presentation');
            }}
          />
        );

      case 'config-usuarios':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('👥 Renderizando configuración de usuarios'); // Log de renderizado
        return <ConfigUsuariosAny currentUser={user} onBack={handleBackToTableroInicial} />;

      case 'config-negocios':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🏢 Renderizando formulario de negocios'); // Log de renderizado
        return <FormularioNegocioAny onBack={handleBackToTableroInicial} />;

      case 'config-roles':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('👥 Renderizando configuración de roles'); // Log de renderizado
        return <ConfigRolesAny currentUser={user} onBack={handleBackToTableroInicial} />;

      case 'config-clientes':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('👥 Renderizando configuración de clientes'); // Log de renderizado
        return <ConfigClientesAny currentUser={user} onBack={handleBackToTableroInicial} />;

      case 'config-categorias':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🏷️ Renderizando configuración de categorías'); // Log de renderizado
        return <ConfigCategoriasAny currentUser={user} onBack={handleBackToTableroInicial} />;

      case 'config-insumos':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('📦 Renderizando configuración de insumos'); // Log de renderizado
        return <ConfigInsumosAny currentUser={user} onBack={handleBackToTableroInicial} />;

      case 'config-productos':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('📦 Renderizando configuración de productos'); // Log de renderizado
        return <ConfigProductosAny user={user} onBack={handleBackToTableroInicial} />;

      case 'config-recetas':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('📋 Renderizando configuración de recetas'); // Log de renderizado
        return <ConfigRecetasAny user={user} onBack={handleBackToTableroInicial} />;

      case 'config-sub-recetas':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🍴 Renderizando configuración de sub-recetas'); // Log de renderizado
        return <ConfigSubRecetas user={user} onBack={handleBackToTableroInicial} />;

      case 'config-mesas':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🍽️ Renderizando configuración de mesas'); // Log de renderizado
        return <ConfigMesas currentUser={user} onBack={handleBackToTableroInicial} />;

      case 'config-proveedores':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🏪 Renderizando configuración de proveedores'); // Log de renderizado
        return <ConfigProveedores currentUser={user} onBack={handleBackToTableroInicial} />;

      case 'formulario-negocio':
        if (!isAuthenticated || !user) {
          console.log('❌ Usuario no autenticado, redirigiendo a login'); // Log de error
          setCurrentScreen('login');
          return <div></div>; // Componente vacío temporal
        }
        console.log('🏢 Renderizando formulario de negocio completo'); // Log de renderizado
        return <FormularioNegocioAny currentUser={user} onBack={handleBackToTableroInicial} />;

      default:
        console.log('❓ Pantalla desconocida, redirigiendo a presentación'); // Log de error
        setCurrentScreen('presentation');
        return <div></div>; // Componente vacío temporal
    }
  };

  return (
    <div className="app-container">
      {renderCurrentScreen()}
    </div>
  );
}

export default App;