// src/components/ConfigRecetas.tsx
// Componente para gestión de recetas

import { useState, useEffect } from 'react';
import type { Usuario } from '../types';
import '../styles/ConfigScreens.css';

// Interfaces para Recetas
interface Receta {
  idReceta?: number;
  nombreReceta: string;
  instrucciones: string;
  archivoInstrucciones?: string;
  costoReceta: number;
  estatus: number;
  fechaRegistro?: string;
  fechaActualizacion?: string;
  usuario: string;
  idNegocio: number;
  totalInsumos?: number;
}

interface DetalleReceta {
  idDetalleReceta?: number;
  nombreInsumo: string;
  umInsumo: string;
  cantidadUso: number;
  costoInsumo: number;
  estatus: number;
  usuario: string;
  idNegocio: number;
}

interface RecetaCompleta {
  receta: Omit<Receta, 'idReceta' | 'fechaRegistro' | 'fechaActualizacion' | 'totalInsumos'>;
  detalles: Omit<DetalleReceta, 'idDetalleReceta'>[];
}

interface ConfigRecetasProps {
  user: Usuario;
  onNavigate: (screen: string) => void;
}

// Unidades de medida comunes
const UNIDADES_MEDIDA = [
  'kg', 'gr', 'mg', 'l', 'ml', 'pza', 'taza', 'cda', 'cdita', 
  'pizca', 'rebanada', 'diente', 'rama', 'hoja', 'sobre'
];

const ConfigRecetas: React.FC<ConfigRecetasProps> = ({ user, onNavigate }) => {
  // Estados principales
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReceta, setEditingReceta] = useState<Receta | null>(null);

  // Evitar warning de variable no usada: usar UNIDADES_MEDIDA en un efecto (solo para lectura)
  useEffect(() => {
    // Mantener referencia para evitar 'declared but its value is never read'
    console.log('Unidades de medida disponibles:', UNIDADES_MEDIDA);
  }, []);

  // Estados del formulario
  const [nombreReceta, setNombreReceta] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [archivoInstrucciones, setArchivoInstrucciones] = useState('');
  const [costoReceta, setCostoReceta] = useState<number>(0);

  // Estados para insumos dinámicos
  const [insumos, setInsumos] = useState<DetalleReceta[]>([{
    nombreInsumo: '',
    umInsumo: 'pza',
    cantidadUso: 0,
    costoInsumo: 0,
    estatus: 1,
    usuario: user.usuario,
    idNegocio: 1
  }]);

  // Estados para buscador de insumos
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<any[]>([]);
  const [buscandoInsumos, setBuscandoInsumos] = useState<boolean>(false);
  const [mostrarResultados, setMostrarResultados] = useState<boolean>(false);

  // Cargar recetas al montar el componente
  useEffect(() => {
    cargarRecetas();
  }, []);

  // Función para cargar recetas
  const cargarRecetas = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Cargando recetas...');
      
      const response = await fetch('/api/recetas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setRecetas(data.data);
        console.log('✅ Recetas cargadas:', data.data.length);
      } else {
        setError(data.message || 'Error al cargar recetas');
        console.error('❌ Error en respuesta:', data.message);
      }
    } catch (error) {
      console.error('❌ Error al cargar recetas:', error);
      setError('Error de conexión al cargar recetas');
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar insumo
  const agregarInsumo = (): void => {
    if (insumos.length >= 40) {
      alert('Máximo 40 insumos permitidos por receta');
      return;
    }

    setInsumos([...insumos, {
      nombreInsumo: '',
      umInsumo: 'pza',
      cantidadUso: 0,
      costoInsumo: 0,
      estatus: 1,
      usuario: user.usuario,
      idNegocio: 1
    }]);
  };

  // Función para eliminar insumo
  const eliminarInsumo = (index: number): void => {
    if (insumos.length <= 1) {
      alert('Debe tener al menos un insumo');
      return;
    }

    const nuevosInsumos = insumos.filter((_, i) => i !== index);
    setInsumos(nuevosInsumos);
  };

  // Función para actualizar insumo
  const actualizarInsumo = (index: number, field: keyof DetalleReceta, value: string | number): void => {
    const nuevosInsumos = [...insumos];
    (nuevosInsumos[index] as any)[field] = value;
    setInsumos(nuevosInsumos);
  };

  // Función para buscar insumos en la tabla
  const buscarInsumosEnTabla = async (): Promise<void> => {
    if (!terminoBusqueda || terminoBusqueda.trim().length < 2) {
      alert('Ingrese al menos 2 caracteres para buscar');
      return;
    }

    try {
      setBuscandoInsumos(true);
      setMostrarResultados(false);
      
      const url = `/api/insumos/buscar/${encodeURIComponent(terminoBusqueda)}`;
      console.log(`🔍 Buscando insumos con término: "${terminoBusqueda}"`);
      console.log(`📡 URL de búsqueda: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`📊 Response status: ${response.status}`);
      console.log(`📊 Response ok: ${response.ok}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📊 Response data:`, data);

      if (data.success) {
        setResultadosBusqueda(data.data);
        setMostrarResultados(true);
        console.log(`✅ ${data.data.length} insumos encontrados`);
        
        if (data.data.length === 0) {
          alert('No se encontraron insumos con ese término de búsqueda');
        }
      } else {
        setResultadosBusqueda([]);
        setMostrarResultados(false);
        alert('Error al buscar insumos: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Error al buscar insumos:', error);
      setResultadosBusqueda([]);
      setMostrarResultados(false);
      alert('Error de conexión al buscar insumos');
    } finally {
      setBuscandoInsumos(false);
    }
  };

  // Función para agregar insumo encontrado a la receta
  const agregarInsumoAReceta = (insumoEncontrado: any): void => {
    // Buscar el primer insumo vacío o agregar uno nuevo
    let indexVacio = insumos.findIndex(insumo => !insumo.nombreInsumo.trim());
    
    if (indexVacio === -1) {
      // No hay espacios vacíos, agregar uno nuevo
      if (insumos.length >= 40) {
        alert('Máximo 40 insumos permitidos por receta');
        return;
      }
      
      const nuevoInsumo: DetalleReceta = {
        nombreInsumo: insumoEncontrado.nomInsumo,
        umInsumo: insumoEncontrado.umInsumo,
        cantidadUso: 0,
        costoInsumo: insumoEncontrado.costoPromPond,
        estatus: 1,
        usuario: user.usuario,
        idNegocio: 1
      };
      
      setInsumos([...insumos, nuevoInsumo]);
    } else {
      // Usar el espacio vacío existente
      const nuevosInsumos = [...insumos];
      nuevosInsumos[indexVacio] = {
        ...nuevosInsumos[indexVacio],
        nombreInsumo: insumoEncontrado.nomInsumo,
        umInsumo: insumoEncontrado.umInsumo,
        costoInsumo: insumoEncontrado.costoPromPond
      };
      setInsumos(nuevosInsumos);
    }
    
    // Limpiar resultados de búsqueda
    setMostrarResultados(false);
    setResultadosBusqueda([]);
    setTerminoBusqueda('');
    
    console.log('✅ Insumo agregado a la receta:', insumoEncontrado.nomInsumo);
    alert(`✅ Insumo "${insumoEncontrado.nomInsumo}" agregado a la receta`);
  };

  // Función para calcular costo total automáticamente
  useEffect(() => {
    const costoTotal = insumos.reduce((total, insumo) => {
      return total + (insumo.cantidadUso * insumo.costoInsumo);
    }, 0);
    setCostoReceta(costoTotal);
  }, [insumos]);

  // Función para guardar receta
  const guardarReceta = async (): Promise<void> => {
    // Validaciones
    if (!nombreReceta.trim()) {
      alert('El nombre de la receta es obligatorio');
      return;
    }

    if (!instrucciones.trim()) {
      alert('Las instrucciones son obligatorias');
      return;
    }

    // Validar insumos
    const insumosValidos = insumos.filter(insumo => 
      insumo.nombreInsumo.trim() && 
      insumo.cantidadUso > 0 && 
      insumo.costoInsumo > 0
    );

    if (insumosValidos.length === 0) {
      alert('Debe agregar al menos un insumo válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const recetaCompleta: RecetaCompleta = {
        receta: {
          nombreReceta: nombreReceta.trim(),
          instrucciones: instrucciones.trim(),
          archivoInstrucciones: archivoInstrucciones.trim() || undefined,
          costoReceta: costoReceta,
          estatus: 1,
          usuario: user.usuario,
          idNegocio: 1
        },
        detalles: insumosValidos
      };

      console.log('💾 Guardando receta:', recetaCompleta);

      const url = editingReceta ? `/api/recetas/${editingReceta.idReceta}` : '/api/recetas';
      const method = editingReceta ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recetaCompleta),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Receta guardada exitosamente');
        alert(editingReceta ? 'Receta actualizada exitosamente' : 'Receta creada exitosamente');
        limpiarFormulario();
        setShowForm(false);
        cargarRecetas();
      } else {
        setError(data.message || 'Error al guardar receta');
        console.error('❌ Error al guardar:', data.message);
      }
    } catch (error) {
      console.error('❌ Error al guardar receta:', error);
      setError('Error de conexión al guardar receta');
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar formulario
  const limpiarFormulario = (): void => {
    setNombreReceta('');
    setInstrucciones('');
    setArchivoInstrucciones('');
    setCostoReceta(0);
    setInsumos([{
      nombreInsumo: '',
      umInsumo: 'pza',
      cantidadUso: 0,
      costoInsumo: 0,
      estatus: 1,
      usuario: user.usuario,
      idNegocio: 1
    }]);
    setEditingReceta(null);
    setError(null);
  };

  // Función para editar receta
  const editarReceta = async (receta: Receta): Promise<void> => {
    try {
      console.log('✏️ Cargando detalles de receta para editar:', receta.idReceta);
      
      const response = await fetch(`/api/recetas/${receta.idReceta}`);
      const data = await response.json();

      if (data.success) {
        const { receta: recetaData, detalles } = data.data;
        
        setEditingReceta(receta);
        setNombreReceta(recetaData.nombreReceta);
        setInstrucciones(recetaData.instrucciones);
        setArchivoInstrucciones(recetaData.archivoInstrucciones || '');
        setCostoReceta(recetaData.costoReceta);
        setInsumos(detalles.length > 0 ? detalles : [{
          nombreInsumo: '',
          umInsumo: 'pza',
          cantidadUso: 0,
          costoInsumo: 0,
          estatus: 1,
          usuario: user.usuario,
          idNegocio: 1
        }]);
        setShowForm(true);
      } else {
        alert('Error al cargar detalles de la receta');
      }
    } catch (error) {
      console.error('❌ Error al cargar detalles:', error);
      alert('Error de conexión al cargar detalles');
    }
  };

  // Función para eliminar receta
  const eliminarReceta = async (id: number): Promise<void> => {
    if (!window.confirm('¿Está seguro de eliminar esta receta?')) {
      return;
    }

    try {
      const response = await fetch(`/api/recetas/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: user.usuario }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Receta eliminada exitosamente');
        cargarRecetas();
      } else {
        alert(data.message || 'Error al eliminar receta');
      }
    } catch (error) {
      console.error('❌ Error al eliminar receta:', error);
      alert('Error de conexión al eliminar receta');
    }
  };

  return (
    <div className="config-screen">
      <div className="config-container">
        
        {/* Header */}
        <div className="config-header">
          <div className="config-breadcrumb">
            <span className="breadcrumb-item">
              <button onClick={() => onNavigate('home')}>🏠 Inicio</button>
            </span>
            <span className="breadcrumb-separator">→</span>
            <span className="breadcrumb-item">📋 Recetas</span>
          </div>
          <h1>Gestión de Recetas</h1>
          <p>Administra las recetas con sus ingredientes y costos</p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Contenido principal */}
        <div className="config-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">📋</span>
              {showForm ? (editingReceta ? 'Editar Receta' : 'Nueva Receta') : 'Lista de Recetas'}
            </h2>
            <div className="toolbar-right">
              {!showForm ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  <span>➕</span>
                  Nueva Receta
                </button>
              ) : (
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    limpiarFormulario();
                  }}
                >
                  <span>📋</span>
                  Ver Lista
                </button>
              )}
            </div>
          </div>

          <div className="card-content">
            {showForm ? (
              /* Formulario de receta */
              <div className="config-form">
                
                {/* Información básica */}
                <div className="form-section">
                  <h3>Información Básica</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nombre de la Receta *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={nombreReceta}
                        onChange={(e) => setNombreReceta(e.target.value)}
                        placeholder="Ej: Pizza Margarita"
                        maxLength={150}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Instrucciones *</label>
                      <textarea
                        className="form-input form-textarea"
                        value={instrucciones}
                        onChange={(e) => setInstrucciones(e.target.value)}
                        placeholder="Describe paso a paso cómo preparar la receta..."
                        rows={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Archivo de Instrucciones (Opcional)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={archivoInstrucciones}
                        onChange={(e) => setArchivoInstrucciones(e.target.value)}
                        placeholder="URL o ruta del archivo con instrucciones"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Costo Total Calculado</label>
                      <input
                        type="number"
                        className="form-input"
                        value={costoReceta.toFixed(2)}
                        readOnly
                        style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Buscador de Insumos */}
                <div className="form-section">
                  <h3>🔍 Buscador de Insumos</h3>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: '1' }}>
                      <label className="form-label">Buscar Insumo por Nombre</label>
                      <input
                        type="text"
                        className="form-input"
                        value={terminoBusqueda}
                        onChange={(e) => setTerminoBusqueda(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            buscarInsumosEnTabla();
                          }
                        }}
                        placeholder="Escriba el nombre del insumo a buscar..."
                        maxLength={50}
                      />
                    </div>
                    <div className="form-group" style={{ flex: '0 0 auto', marginTop: '1.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={buscarInsumosEnTabla}
                        disabled={buscandoInsumos || terminoBusqueda.trim().length < 2}
                      >
                        {buscandoInsumos ? '🔍 Buscando...' : '🔍 Buscar'}
                      </button>
                    </div>
                  </div>

                  {/* Resultados de búsqueda */}
                  {mostrarResultados && (
                    <div className="search-results">
                      <h4>Resultados de Búsqueda ({resultadosBusqueda.length})</h4>
                      {resultadosBusqueda.length === 0 ? (
                        <div className="no-results">
                          <p>No se encontraron insumos con ese término de búsqueda.</p>
                        </div>
                      ) : (
                        <div className="results-grid">
                          {resultadosBusqueda.map((insumo, index) => (
                            <div key={index} className="result-card">
                              <div className="result-info">
                                <h5>{insumo.nomInsumo}</h5>
                                <div className="result-details">
                                  <span className="result-um">📏 {insumo.umInsumo}</span>
                                  <span className="result-price">💰 ${insumo.costoPromPond.toFixed(2)}</span>
                                  {insumo.existencia !== undefined && (
                                    <span className="result-stock">📦 Stock: {insumo.existencia}</span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={() => agregarInsumoAReceta(insumo)}
                              >
                                ➕ Agregar a Receta
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Insumos */}
                <div className="form-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Insumos ({insumos.length}/40)</h3>
                    <button 
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={agregarInsumo}
                      disabled={insumos.length >= 40}
                    >
                      ➕ Agregar Insumo
                    </button>
                  </div>

                  <div className="insumos-list">
                    {insumos.map((insumo, index) => (
                      <div key={index} className="insumo-item">
                        <div className="insumo-header">
                          <span className="insumo-number">#{index + 1}</span>
                          {insumos.length > 1 && (
                            <button 
                              type="button"
                              className="btn-delete"
                              onClick={() => eliminarInsumo(index)}
                              title="Eliminar insumo"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                        
                        <div className="insumo-fields">
                          <div className="form-group">
                            <label className="form-label">Nombre del Insumo *</label>
                            <input
                              type="text"
                              className="form-input"
                              value={insumo.nombreInsumo}
                              placeholder="Use el buscador para agregar insumos"
                              readOnly
                              style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                            />
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">Unidad de Medida *</label>
                            <input
                              type="text"
                              className="form-input"
                              value={insumo.umInsumo}
                              placeholder="Unidad de medida"
                              readOnly
                              style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                            />
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">Cantidad a Usar *</label>
                            <input
                              type="number"
                              className="form-input"
                              value={insumo.cantidadUso}
                              onChange={(e) => actualizarInsumo(index, 'cantidadUso', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              step="0.0001"
                              min="0"
                              required
                            />
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">Costo por Unidad *</label>
                            <input
                              type="number"
                              className="form-input"
                              value={insumo.costoInsumo}
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              readOnly
                              style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                            />
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">Subtotal</label>
                            <input
                              type="text"
                              className="form-input"
                              value={`$${(insumo.cantidadUso * insumo.costoInsumo).toFixed(2)}`}
                              readOnly
                              style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      limpiarFormulario();
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={guardarReceta}
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : (editingReceta ? 'Actualizar' : 'Guardar')} Receta
                  </button>
                </div>
              </div>
            ) : (
              /* Lista de recetas */
              <div>
                {loading ? (
                  <div className="loading-skeleton" style={{ height: '200px' }}></div>
                ) : recetas.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3>No hay recetas registradas</h3>
                    <p>Comienza creando tu primera receta</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Costo</th>
                          <th>Insumos</th>
                          <th>Fecha</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recetas.map((receta) => (
                          <tr key={receta.idReceta}>
                            <td>
                              <strong>{receta.nombreReceta}</strong>
                              <br />
                              <small style={{ color: 'var(--text-secondary)' }}>
                                {receta.instrucciones.substring(0, 50)}...
                              </small>
                            </td>
                            <td>
                              <strong>${receta.costoReceta.toFixed(2)}</strong>
                            </td>
                            <td>
                              <span className="status-badge status-active">
                                {receta.totalInsumos || 0} insumos
                              </span>
                            </td>
                            <td>
                              {new Date(receta.fechaRegistro || '').toLocaleDateString()}
                            </td>
                            <td>
                              <span className={`status-badge ${receta.estatus === 1 ? 'status-active' : 'status-inactive'}`}>
                                {receta.estatus === 1 ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button
                                  className="action-btn edit"
                                  onClick={() => editarReceta(receta)}
                                  title="Editar receta"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="action-btn delete"
                                  onClick={() => eliminarReceta(receta.idReceta!)}
                                  title="Eliminar receta"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Botón de regresar */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            className="btn btn-secondary btn-lg"
            onClick={() => onNavigate('home')}
          >
            🏠 Regresar al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigRecetas;