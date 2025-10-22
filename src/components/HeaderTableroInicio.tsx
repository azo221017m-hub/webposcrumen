// src/components/HeaderTableroInicio.tsx
// Header del tablero inicial con logo, bienvenida y menú de usuario

import { useState } from 'react';
import type { Usuario } from '../types';

// Props del componente HeaderTableroInicio
interface HeaderTableroInicioProps {
  user: Usuario;
  onLogout: () => void;
  onToggleProtection: () => void;
  showProtection: boolean;
}

// Componente Header del tablero inicial
const HeaderTableroInicio: React.FC<HeaderTableroInicioProps> = ({
  user,
  onLogout,
  onToggleProtection,
  showProtection
}) => {
  // Estado para controlar el dropdown del usuario
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  // Función para manejar logout
  const handleLogout = (): void => {
    console.log('🚪 Usuario cerrando sesión:', user.usuario);
    onLogout();
    setShowUserMenu(false);
  };

  return (
    <header className="header-tablero-inicio">
      <div className="header-container">
        
        {/* Logo y botón de protección */}
        <div className="header-left">
          <button 
            className={`protection-btn ${showProtection ? 'active' : ''}`}
            onClick={onToggleProtection}
            title={showProtection ? 'Desactivar protección' : 'Activar protección de pantalla'}
          >
            {showProtection ? '🔒' : '☰'}
          </button>
          
          <div className="logo-container">
            <img 
              src="/logowebposcrumen.svg" 
              alt="POSWEBCrumen Logo" 
              className="header-logo"
            />
          </div>
        </div>

        {/* Texto de bienvenida central */}
        <div className="header-center">
          <div className="welcome-section">
            <h1 className="welcome-title">
              Bienvenido, {user.nombre}
            </h1>
            <p className="business-subtitle">
              {user.idNegocio ? `Negocio ID: ${user.idNegocio}` : 'Mi Negocio'} - POSWEBCRUMEN
            </p>
          </div>
        </div>

        {/* Usuario y menú desplegable */}
        <div className="header-right">
          <div 
            className="user-menu-container"
            onMouseEnter={() => setShowUserMenu(true)}
            onMouseLeave={() => setShowUserMenu(false)}
          >
            <div className="user-info">
              <span className="user-icon">👤</span>
              <span className="user-name">{user.usuario}</span>
              <span className="dropdown-arrow">▼</span>
            </div>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="dropdown-item user-details">
                  <span className="detail-label">Usuario:</span>
                  <span className="detail-value">{user.usuario}</span>
                </div>
                <div className="dropdown-item user-details">
                  <span className="detail-label">Estado:</span>
                  <span className="detail-value">{user.estatus === 1 ? 'Activo' : 'Inactivo'}</span>
                </div>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item logout-btn"
                  onClick={handleLogout}
                >
                  <span className="logout-icon">🚪</span>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

export default HeaderTableroInicio;