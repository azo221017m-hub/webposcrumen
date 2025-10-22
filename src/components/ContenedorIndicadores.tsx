// src/components/ContenedorIndicadores.tsx
// Contenedor de indicadores principales del dashboard

// Props del componente ContenedorIndicadores
interface ContenedorIndicadoresProps {
  onIndicatorClick: (indicator: string) => void;
}

// Componente contenedor de indicadores
const ContenedorIndicadores: React.FC<ContenedorIndicadoresProps> = ({ 
  onIndicatorClick 
}) => {

  // Función para manejar click en indicador
  const handleClick = (indicator: string): void => {
    console.log('📊 Click en indicador:', indicator);
    onIndicatorClick(indicator);
  };

  return (
    <section className="contenedor-indicadores">
      
      {/* Título de la sección */}
      <header className="indicadores-header">
        <h1>📊 Panel de Control</h1>
        <p>Resumen de actividades del negocio</p>
      </header>

      {/* Grid de indicadores */}
      <div className="indicadores-grid">
        
        {/* Indicador de Ventas */}
        <div 
          className="indicador-card ventas"
          onClick={() => handleClick('ventas')}
        >
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3 className="card-title">Ventas del Día</h3>
            <div className="card-value">$25,480</div>
            <div className="card-change positive">+15.2% ↗️</div>
            <div className="card-subtitle">Comparado con ayer</div>
          </div>
        </div>

        {/* Indicador de Pedidos */}
        <div 
          className="indicador-card pedidos"
          onClick={() => handleClick('pedidos')}
        >
          <div className="card-icon">🍽️</div>
          <div className="card-content">
            <h3 className="card-title">Pedidos Activos</h3>
            <div className="card-value">47</div>
            <div className="card-change positive">+12 nuevos</div>
            <div className="card-subtitle">Órdenes en proceso</div>
          </div>
        </div>

        {/* Indicador de Clientes */}
        <div 
          className="indicador-card clientes"
          onClick={() => handleClick('clientes')}
        >
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3 className="card-title">Clientes</h3>
            <div className="card-value">156</div>
            <div className="card-change positive">+3 nuevos</div>
            <div className="card-subtitle">Total registrados</div>
          </div>
        </div>

        {/* Indicador de Productos */}
        <div 
          className="indicador-card productos"
          onClick={() => handleClick('productos')}
        >
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3 className="card-title">Productos</h3>
            <div className="card-value">284</div>
            <div className="card-change warning">Stock bajo</div>
            <div className="card-subtitle">Requiere atención</div>
          </div>
        </div>

        {/* Indicador de Ingresos */}
        <div 
          className="indicador-card ingresos"
          onClick={() => handleClick('ingresos')}
        >
          <div className="card-icon">💵</div>
          <div className="card-content">
            <h3 className="card-title">Ingresos</h3>
            <div className="card-value">$187K</div>
            <div className="card-change positive">+22.5% ↗️</div>
            <div className="card-subtitle">Este mes</div>
          </div>
        </div>

        {/* Indicador de Gastos */}
        <div 
          className="indicador-card gastos"
          onClick={() => handleClick('gastos')}
        >
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h3 className="card-title">Gastos</h3>
            <div className="card-value">$42K</div>
            <div className="card-change negative">+8.1% ↗️</div>
            <div className="card-subtitle">Este mes</div>
          </div>
        </div>

      </div>

      {/* Botones de acción rápida */}
      <div className="indicadores-actions">
        <button 
          className="action-btn primary"
          onClick={() => handleClick('nueva-venta')}
        >
          <span className="btn-icon">🛒</span>
          Nueva Venta
        </button>
        
        <button 
          className="action-btn secondary"
          onClick={() => handleClick('reportes')}
        >
          <span className="btn-icon">📈</span>
          Ver Reportes
        </button>
        
        <button 
          className="action-btn secondary"
          onClick={() => handleClick('inventario')}
        >
          <span className="btn-icon">📦</span>
          Inventario
        </button>
      </div>

    </section>
  );
};

export default ContenedorIndicadores;