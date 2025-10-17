// src/components/HomeScreen.tsx
// Pantalla principal con dashboard y navegación

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { Usuario, Indicator, ScreenType } from '../types'; // Importa tipos
import '../styles/HomeScreen.css'; // Importa estilos específicos

// Componente de navegación local (fallback) para evitar error de módulo faltante
interface NavigationProps {
  user: Usuario;
  onNavigate: (screen: ScreenType) => void;
  onLogout: () => void;
  showMobile: boolean;
  onToggleMobile: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onNavigate, onLogout, showMobile, onToggleMobile }) => {
  return (
    <nav className={`navigation ${showMobile ? 'mobile-open' : ''}`}>
      <div className="nav-top">
        <div className="nav-brand">POSWEBCrumen</div>
        <button className="mobile-toggle" onClick={onToggleMobile}>☰</button>
      </div>

      <ul className="nav-list">
        <li>
          <button onClick={() => onNavigate('dashboard' as ScreenType)}>Dashboard</button>
        </li>
        <li>
          <button onClick={() => onNavigate('config-usuarios' as ScreenType)}>Usuarios</button>
        </li>
        <li>
          <button onClick={() => onNavigate('config-negocios' as ScreenType)}>Negocios</button>
        </li>
      </ul>

      <div className="nav-footer">
        <div className="nav-user">👤 {user.usuario}</div>
        <button className="logout-button" onClick={onLogout}>Cerrar sesión</button>
      </div>
    </nav>
  );
};

// Interfaz para las props del componente
interface HomeScreenProps {
  user: Usuario; // Usuario autenticado
  onNavigate: (screen: ScreenType) => void; // Función de navegación
  onLogout: () => void; // Función de logout
}

// Componente de pantalla principal
const HomeScreen: React.FC<HomeScreenProps> = ({ user, onNavigate, onLogout }) => {
  // Estado para los indicadores del dashboard
  const [indicators, setIndicators] = useState<Indicator[]>([]);

  // Estado para mostrar/ocultar el menú móvil
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  // Efecto para cargar los indicadores al montar el componente
  useEffect(() => {
    console.log('🏠 Cargando pantalla principal para:', user.nombre); // Log de carga
    loadIndicators(); // Carga los indicadores
  }, [user]);

  // Función para cargar indicadores de ejemplo
  const loadIndicators = (): void => {
    console.log('📊 Cargando indicadores del dashboard'); // Log de carga
    
    // Datos de ejemplo para los indicadores
    const exampleIndicators: Indicator[] = [
      {
        id: 'ventas',
        title: 'Ventas del Día',
        value: '$15,420.50',
        description: 'Total de ventas registradas hoy',
        icon: '💰',
        color: '#10b981' // Verde
      },
      {
        id: 'servicios',
        title: 'Servicios',
        value: '24',
        description: 'Servicios completados hoy',
        icon: '🛠️',
        color: '#3b82f6' // Azul
      },
      {
        id: 'compras_vs_ventas',
        title: 'Compras vs Ventas',
        value: '68%',
        description: 'Margen de ganancia actual',
        icon: '📈',
        color: '#8b5cf6' // Morado
      },
      {
        id: 'top_productos',
        title: 'Top Productos',
        value: 'Ver Lista',
        description: 'Los 5 productos más vendidos',
        icon: '🏆',
        color: '#f59e0b' // Amarillo
      }
    ];

    setIndicators(exampleIndicators); // Establece los indicadores
    console.log('✅ Indicadores cargados exitosamente'); // Log de éxito
  };

  // Función para manejar clicks en los indicadores
  const handleIndicatorClick = (indicatorId: string): void => {
    console.log('📊 Click en indicador:', indicatorId); // Log de click
    
    // Aquí se puede agregar lógica específica para cada indicador
    switch (indicatorId) {
      case 'ventas':
        console.log('💰 Mostrando detalles de ventas'); // Log específico
        break;
      case 'servicios':
        console.log('🛠️ Mostrando servicios'); // Log específico
        break;
      case 'top_productos':
        console.log('🏆 Mostrando top productos'); // Log específico
        break;
      default:
        console.log('📊 Indicador genérico'); // Log genérico
    }
  };

  return (
    <div className="home-screen">
      {/* Navegación lateral */}
      <Navigation 
        user={user}
        onNavigate={onNavigate}
        onLogout={onLogout}
        showMobile={showMobileMenu}
        onToggleMobile={() => setShowMobileMenu(!showMobileMenu)}
      />

      {/* Contenido principal */}
      <main className="main-content">
        
        {/* Header del dashboard */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <button 
                className="mobile-menu-toggle"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                ☰
              </button>
              <div className="welcome-text">
                <h1>Bienvenido, {user.nombre}</h1>
                <p>Panel de control - POSWEBCrumen</p>
              </div>
            </div>
            <div className="header-right">
              <div className="user-info">
                <span className="user-avatar">👤</span>
                <span className="user-name">{user.usuario}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Grid de indicadores */}
        <section className="indicators-section">
          <div className="indicators-grid">
            {indicators.map((indicator) => (
              <div 
                key={indicator.id}
                className="indicator-card card"
                onClick={() => handleIndicatorClick(indicator.id)}
                style={{ borderLeft: `4px solid ${indicator.color}` }}
              >
                <div className="indicator-icon" style={{ color: indicator.color }}>
                  {indicator.icon}
                </div>
                <div className="indicator-content">
                  <h3 className="indicator-title">{indicator.title}</h3>
                  <div className="indicator-value" style={{ color: indicator.color }}>
                    {indicator.value}
                  </div>
                  <p className="indicator-description">{indicator.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección de acciones rápidas */}
        <section className="quick-actions">
          <h2>Acciones Rápidas</h2>
          <div className="actions-grid">
            <button 
              className="action-button"
              onClick={() => onNavigate('config-usuarios' as ScreenType)}
            >
              <span className="action-icon">👥</span>
              <span>Gestionar Usuarios</span>
            </button>
            <button 
              className="action-button"
              onClick={() => onNavigate('config-negocios' as ScreenType)}
            >
              <span className="action-icon">🏢</span>
              <span>Gestionar Negocios</span>
            </button>
            <button className="action-button">
              <span className="action-icon">🛒</span>
              <span>Nueva Venta</span>
            </button>
            <button className="action-button">
              <span className="action-icon">📦</span>
              <span>Inventario</span>
            </button>
          </div>
        </section>

      </main>

      {/* Overlay para menú móvil */}
      {showMobileMenu && (
        <div 
          className="mobile-overlay"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </div>
  );
};

export default HomeScreen;