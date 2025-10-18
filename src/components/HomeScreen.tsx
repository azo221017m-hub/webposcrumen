// src/components/HomeScreen.tsx
// Pantalla principal con dashboard y navegación

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { Usuario, ScreenType, Pedido } from '../types'; // Importa tipos
import '../styles/HomeScreenNew.css'; // Importa estilos específicos

// Componente de navegación mejorado con menú dropdown
interface NavigationProps {
  user: Usuario;
  onNavigate: (screen: ScreenType) => void;
  showMobile: boolean;
  onToggleMobile: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onNavigate, showMobile, onToggleMobile }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Función para manejar dropdown
  const toggleDropdown = (menu: string) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  // Función para manejar navegación y cerrar dropdown
  const handleNavigate = (screen: ScreenType) => {
    onNavigate(screen);
    setOpenDropdown(null);
  };

  return (
    <nav className={`navigation ${showMobile ? 'mobile-open' : ''}`}>
      {/* Header de navegación */}
      <div className="nav-header">
        <div className="nav-brand">
              <button className="mobile-toggle" onClick={onToggleMobile}>
          ☰
        </button>
          <img 
            src="/logowebposcrumen.svg" 
            alt="POSWEBCrumen Logo" 
            className="brand-logo"
          />
          
        </div>
        <span className="brand-text">POSWEBCrumen v.25.A.100</span>
      
      </div>

      {/* Menú principal */}
      <div className="nav-menu">
        
        {/* CONFIGURAR */}
        <div className="nav-section">
          <button 
            className={`nav-section-btn ${openDropdown === 'config' ? 'active' : ''}`}
            onClick={() => toggleDropdown('config')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">CONFIGURAR</span>
            <span className="nav-arrow">{openDropdown === 'config' ? '▼' : '▶'}</span>
          </button>
          
          {openDropdown === 'config' && (
            <div className="nav-dropdown">
              <button onClick={() => handleNavigate('config-usuarios' as ScreenType)}>
                <span className="dropdown-icon">👥</span>
                Usuarios
              </button>
              <button onClick={() => handleNavigate('config-roles' as ScreenType)}>
                <span className="dropdown-icon">🎭</span>
                Roles
              </button>
              <button onClick={() => handleNavigate('config-clientes' as ScreenType)}>
                <span className="dropdown-icon">👤</span>
                Clientes
              </button>
              <button onClick={() => handleNavigate('config-categorias' as ScreenType)}>
                <span className="dropdown-icon">🏷️</span>
                Categorías
              </button>
              <button onClick={() => handleNavigate('config-insumos' as ScreenType)}>
                <span className="dropdown-icon">🧪</span>
                Insumos
              </button>
              <button onClick={() => handleNavigate('formulario-negocio' as ScreenType)}>
                <span className="dropdown-icon">🏢</span>
                Registro Negocio
              </button>
              <button onClick={() => handleNavigate('config-productos' as ScreenType)}>
                <span className="dropdown-icon">📦</span>
                Productos
              </button>
              <button onClick={() => handleNavigate('config-recetas' as ScreenType)}>
                <span className="dropdown-icon">📋</span>
                Recetas
              </button>
              <button onClick={() => handleNavigate('config-sub-recetas' as ScreenType)}>
                <span className="dropdown-icon">🍴</span>
                Sub-Recetas
              </button>
              <button onClick={() => handleNavigate('config-perfil' as ScreenType)}>
                <span className="dropdown-icon">👤</span>
                Perfil
              </button>
              <button onClick={() => handleNavigate('config-recibos' as ScreenType)}>
                <span className="dropdown-icon">🧾</span>
                Recibos
              </button>
            </div>
          )}
        </div>

        {/* VENTAS */}
        <div className="nav-section">
          <button 
            className={`nav-section-btn ${openDropdown === 'ventas' ? 'active' : ''}`}
            onClick={() => toggleDropdown('ventas')}
          >
            <span className="nav-icon">💰</span>
            <span className="nav-text">VENTAS</span>
            <span className="nav-arrow">{openDropdown === 'ventas' ? '▼' : '▶'}</span>
          </button>
          
          {openDropdown === 'ventas' && (
            <div className="nav-dropdown">
              <button onClick={() => handleNavigate('iniciar-venta' as ScreenType)}>
                <span className="dropdown-icon">🛒</span>
                Iniciar Venta
              </button>
              <button onClick={() => handleNavigate('indicadores-ventas' as ScreenType)}>
                <span className="dropdown-icon">📊</span>
                Indicadores
              </button>
            </div>
          )}
        </div>

        {/* SISTEMA */}
        <div className="nav-section">
          <button 
            className={`nav-section-btn ${openDropdown === 'sistema' ? 'active' : ''}`}
            onClick={() => toggleDropdown('sistema')}
          >
            <span className="nav-icon">🔧</span>
            <span className="nav-text">SISTEMA</span>
            <span className="nav-arrow">{openDropdown === 'sistema' ? '▼' : '▶'}</span>
          </button>
          
          {openDropdown === 'sistema' && (
            <div className="nav-dropdown">
              <button onClick={() => handleNavigate('config-negocios' as ScreenType)}>
                <span className="dropdown-icon">🏢</span>
                Negocios
              </button>
              <button onClick={() => handleNavigate('sistema-configuracion' as ScreenType)}>
                <span className="dropdown-icon">🔧</span>
                Configuración
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Componente de pedidos desde POSdeClientes
const OrdersComponent: React.FC = () => {
  // Datos simulados de 10 pedidos tipo comanda
  const mockOrders: Pedido[] = [
    {
      idPedido: 'PED001',
      numeroComanda: 'COM-001',
      cliente: 'María González',
      productos: [
        { nombre: 'Café Americano', cantidad: 2, precio: 35.00, subtotal: 70.00 },
        { nombre: 'Croissant', cantidad: 1, precio: 45.00, subtotal: 45.00 }
      ],
      total: 115.00,
      formaPago: 'EFECTIVO',
      estado: 'PENDIENTE',
      fechaPedido: '2025-10-18',
      horaPedido: '08:30',
      mesa: 'Mesa 5'
    },
    {
      idPedido: 'PED002',
      numeroComanda: 'COM-002',
      cliente: 'Carlos Ruiz',
      productos: [
        { nombre: 'Hamburguesa Clásica', cantidad: 1, precio: 120.00, subtotal: 120.00 },
        { nombre: 'Papas Fritas', cantidad: 1, precio: 45.00, subtotal: 45.00 },
        { nombre: 'Refresco Cola', cantidad: 2, precio: 25.00, subtotal: 50.00 }
      ],
      total: 215.00,
      formaPago: 'TARJETA',
      estado: 'PREPARANDO',
      fechaPedido: '2025-10-18',
      horaPedido: '09:15',
      mesa: 'Mesa 2'
    },
    {
      idPedido: 'PED003',
      numeroComanda: 'COM-003',
      cliente: 'Ana Martínez',
      productos: [
        { nombre: 'Ensalada César', cantidad: 1, precio: 85.00, subtotal: 85.00 },
        { nombre: 'Agua Natural', cantidad: 1, precio: 20.00, subtotal: 20.00 }
      ],
      total: 105.00,
      formaPago: 'TRANSFERENCIA',
      estado: 'LISTO',
      fechaPedido: '2025-10-18',
      horaPedido: '09:45',
      mesa: 'Mesa 7'
    },
    {
      idPedido: 'PED004',
      numeroComanda: 'COM-004',
      cliente: 'Roberto Silva',
      productos: [
        { nombre: 'Pizza Margherita', cantidad: 1, precio: 180.00, subtotal: 180.00 },
        { nombre: 'Cerveza', cantidad: 2, precio: 40.00, subtotal: 80.00 }
      ],
      total: 260.00,
      formaPago: 'EFECTIVO',
      estado: 'PREPARANDO',
      fechaPedido: '2025-10-18',
      horaPedido: '10:20',
      mesa: 'Mesa 3'
    },
    {
      idPedido: 'PED005',
      numeroComanda: 'COM-005',
      cliente: 'Elena Vásquez',
      productos: [
        { nombre: 'Tacos al Pastor', cantidad: 3, precio: 25.00, subtotal: 75.00 },
        { nombre: 'Agua de Horchata', cantidad: 1, precio: 30.00, subtotal: 30.00 }
      ],
      total: 105.00,
      formaPago: 'EFECTIVO',
      estado: 'PENDIENTE',
      fechaPedido: '2025-10-18',
      horaPedido: '10:55',
      mesa: 'Mesa 1'
    },
    {
      idPedido: 'PED006',
      numeroComanda: 'COM-006',
      cliente: 'Miguel Torres',
      productos: [
        { nombre: 'Sopa del Día', cantidad: 1, precio: 65.00, subtotal: 65.00 },
        { nombre: 'Pan Integral', cantidad: 2, precio: 15.00, subtotal: 30.00 },
        { nombre: 'Jugo Natural', cantidad: 1, precio: 35.00, subtotal: 35.00 }
      ],
      total: 130.00,
      formaPago: 'TARJETA',
      estado: 'LISTO',
      fechaPedido: '2025-10-18',
      horaPedido: '11:30',
      mesa: 'Mesa 6'
    },
    {
      idPedido: 'PED007',
      numeroComanda: 'COM-007',
      cliente: 'Laura Morales',
      productos: [
        { nombre: 'Pasta Alfredo', cantidad: 1, precio: 145.00, subtotal: 145.00 },
        { nombre: 'Vino Tinto Copa', cantidad: 1, precio: 60.00, subtotal: 60.00 }
      ],
      total: 205.00,
      formaPago: 'MIXTO',
      estado: 'PREPARANDO',
      fechaPedido: '2025-10-18',
      horaPedido: '12:10',
      mesa: 'Mesa 4'
    },
    {
      idPedido: 'PED008',
      numeroComanda: 'COM-008',
      cliente: 'David Herrera',
      productos: [
        { nombre: 'Desayuno Completo', cantidad: 1, precio: 95.00, subtotal: 95.00 },
        { nombre: 'Café con Leche', cantidad: 1, precio: 30.00, subtotal: 30.00 }
      ],
      total: 125.00,
      formaPago: 'EFECTIVO',
      estado: 'PENDIENTE',
      fechaPedido: '2025-10-18',
      horaPedido: '12:45',
      mesa: 'Mesa 8'
    },
    {
      idPedido: 'PED009',
      numeroComanda: 'COM-009',
      cliente: 'Patricia López',
      productos: [
        { nombre: 'Sándwich Club', cantidad: 1, precio: 85.00, subtotal: 85.00 },
        { nombre: 'Papas Gajo', cantidad: 1, precio: 50.00, subtotal: 50.00 },
        { nombre: 'Limonada', cantidad: 1, precio: 25.00, subtotal: 25.00 }
      ],
      total: 160.00,
      formaPago: 'TARJETA',
      estado: 'LISTO',
      fechaPedido: '2025-10-18',
      horaPedido: '13:20',
      mesa: 'Mesa 9'
    },
    {
      idPedido: 'PED010',
      numeroComanda: 'COM-010',
      cliente: 'Fernando Castillo',
      productos: [
        { nombre: 'Pollo a la Plancha', cantidad: 1, precio: 135.00, subtotal: 135.00 },
        { nombre: 'Arroz Blanco', cantidad: 1, precio: 25.00, subtotal: 25.00 },
        { nombre: 'Verduras al Vapor', cantidad: 1, precio: 40.00, subtotal: 40.00 }
      ],
      total: 200.00,
      formaPago: 'TRANSFERENCIA',
      estado: 'PREPARANDO',
      fechaPedido: '2025-10-18',
      horaPedido: '13:55',
      mesa: 'Mesa 10'
    }
  ];

  // Función para manejar click en pedido
  const handleOrderClick = (pedido: Pedido): void => {
    console.log('🍽️ Click en pedido:', pedido.numeroComanda); // Log de click
    // Aquí se puede agregar lógica para mostrar detalles del pedido
  };

  // Función para obtener clase CSS según el estado
  const getStatusClass = (estado: string): string => {
    return estado.toLowerCase().replace(' ', '-');
  };

  // Función para formatear precio
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <section className="orders-section">
      <h2>📋 Pedidos POSdeClientes</h2>
      <div className="orders-list">
        {mockOrders.map((pedido) => (
          <div 
            key={pedido.idPedido} 
            className="order-card"
            onClick={() => handleOrderClick(pedido)}
          >
            {/* Header del pedido */}
            <div className="order-header">
              <span className="order-number">{pedido.numeroComanda}</span>
              <span className={`order-status ${getStatusClass(pedido.estado)}`}>
                {pedido.estado}
              </span>
            </div>

            {/* Cliente y mesa */}
            <div className="order-client">
              <span>👤</span>
              <span>{pedido.cliente}</span>
              {pedido.mesa && <span>• {pedido.mesa}</span>}
            </div>

            {/* Lista de productos */}
            <div className="order-products">
              {pedido.productos.map((producto, index) => (
                <div key={index} className="order-product">
                  <div className="product-info">
                    <span className="product-quantity">{producto.cantidad}x</span>
                    {producto.nombre}
                  </div>
                  <div className="product-price">
                    {formatPrice(producto.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer con total y forma de pago */}
            <div className="order-footer">
              <div className="order-total">
                Total: {formatPrice(pedido.total)}
              </div>
              <div className="order-payment">
                {pedido.formaPago}
              </div>
            </div>

            {/* Hora del pedido */}
            <div className="order-time">
              {pedido.horaPedido} - {pedido.fechaPedido}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Interfaz para las props del componente
interface HomeScreenProps {
  user: Usuario; // Usuario autenticado
  onNavigate: (screen: ScreenType) => void; // Función de navegación
  onLogout: () => void; // Función de logout
}

// Componente de pantalla principal
const HomeScreen: React.FC<HomeScreenProps> = ({ user, onNavigate }) => {
  // Estado para mostrar/ocultar el menú móvil
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  // Efecto para log al montar el componente
  useEffect(() => {
    console.log('🏠 Cargando pantalla principal para:', user.nombre); // Log de carga
  }, [user]);

  // Función para manejar clicks en los indicadores
  const handleIndicatorClick = (indicatorId: string): void => {
    console.log('📊 Click en indicador:', indicatorId); // Log de click
    
    // Aquí se puede agregar lógica específica para cada indicador
    switch (indicatorId) {
      case 'ventas':
        console.log('💰 Mostrando detalles de ventas'); // Log específico
        onNavigate('indicadores-ventas' as ScreenType);
        break;
      case 'servicios':
        console.log('🛠️ Mostrando servicios'); // Log específico
        break;
      case 'finanzas':
        console.log('📊 Mostrando finanzas'); // Log específico
        break;
      case 'productos':
        console.log('🏆 Mostrando top productos'); // Log específico
        onNavigate('config-productos' as ScreenType);
        break;
      case 'inventario':
        console.log('📦 Mostrando inventario'); // Log específico
        onNavigate('config-insumos' as ScreenType);
        break;
      case 'clientes':
        console.log('👥 Mostrando clientes'); // Log específico
        onNavigate('config-clientes' as ScreenType);
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

        {/* Contenido principal del dashboard */}
        <div className="dashboard-content">
          
          {/* Columna izquierda: Grid de indicadores */}
          <section className="indicators-section">
            <div className="indicators-grid">
              
              {/* Cards de indicadores minimalistas */}
              <div className="indicator-card" onClick={() => handleIndicatorClick('ventas')}>
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <h3 className="card-title">Ventas del Día</h3>
                  <div className="card-value">$25,480.00</div>
                  <div className="card-change positive">+15.2% ↗️</div>
                </div>
              </div>

              <div className="indicator-card" onClick={() => handleIndicatorClick('servicios')}>
                <div className="card-icon">🔧</div>
                <div className="card-content">
                  <h3 className="card-title">Servicios</h3>
                  <div className="card-value">12</div>
                  <div className="card-change neutral">Sin cambios</div>
                </div>
              </div>

              <div className="indicator-card" onClick={() => handleIndicatorClick('finanzas')}>
                <div className="card-icon">📊</div>
                <div className="card-content">
                  <h3 className="card-title">Balance</h3>
                  <div className="card-value">$57,230</div>
                  <div className="card-change positive">+8.5% ↗️</div>
                </div>
              </div>

              <div className="indicator-card" onClick={() => handleIndicatorClick('productos')}>
                <div className="card-icon">🏆</div>
                <div className="card-content">
                  <h3 className="card-title">Top Productos</h3>
                  <div className="card-value">5</div>
                  <div className="card-change info">Ver detalles</div>
                </div>
              </div>

              <div className="indicator-card" onClick={() => handleIndicatorClick('inventario')}>
                <div className="card-icon">📦</div>
                <div className="card-content">
                  <h3 className="card-title">Inventario</h3>
                  <div className="card-value">284</div>
                  <div className="card-change warning">Stock bajo</div>
                </div>
              </div>

              <div className="indicator-card" onClick={() => handleIndicatorClick('clientes')}>
                <div className="card-icon">👥</div>
                <div className="card-content">
                  <h3 className="card-title">Clientes</h3>
                  <div className="card-value">156</div>
                  <div className="card-change positive">+3 nuevos</div>
                </div>
              </div>

            </div>
          </section>

          {/* Columna central: Acciones rápidas */}
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
              <button 
                className="action-button"
                onClick={() => onNavigate('config-roles' as ScreenType)}
              >
                <span className="action-icon">🎭</span>
                <span>Gestionar Roles</span>
              </button>
              <button 
                className="action-button"
                onClick={() => onNavigate('config-clientes' as ScreenType)}
              >
                <span className="action-icon">👤</span>
                <span>Gestionar Clientes</span>
              </button>
              <button 
                className="action-button"
                onClick={() => onNavigate('config-categorias' as ScreenType)}
              >
                <span className="action-icon">🏷️</span>
                <span>Gestionar Categorías</span>
              </button>
              <button 
                className="action-button"
                onClick={() => onNavigate('config-insumos' as ScreenType)}
              >
                <span className="action-icon">🧪</span>
                <span>Gestionar Insumos</span>
              </button>
              <button 
                className="action-button"
                onClick={() => onNavigate('config-productos' as ScreenType)}
              >
                <span className="action-icon">📦</span>
                <span>Gestionar Productos</span>
              </button>
              <button 
                className="action-button"
                onClick={() => onNavigate('config-recetas' as ScreenType)}
              >
                <span className="action-icon">📋</span>
                <span>Gestionar Recetas</span>
              </button>
            </div>
          </section>

          {/* Columna derecha: Pedidos desde POSdeClientes */}
          <OrdersComponent />

        </div>

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