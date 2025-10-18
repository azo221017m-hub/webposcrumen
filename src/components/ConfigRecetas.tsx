// src/components/ConfigRecetas.tsx
// Componente para gestión de recetas

import React, { useState, useEffect } from 'react';
import type { Usuario } from '../types';
import InsumosSelector from './InsumosSelector';
import '../styles/ConfigScreens.css';

//// Interfaces para Recetas
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

  // Estados para errores
  const [errorCritico, setErrorCritico] = useState<string | null>(null);

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
        console.log('✅ Recetas cargadas:', data.data.length);
        
        // Log detallado de cada receta para verificar tipos de datos
        data.data.forEach((receta: any, index: number) => {
          console.log(`📋 Receta ${index + 1}:`, {
            nombreReceta: receta.nombreReceta,
            costoReceta: receta.costoReceta,
            costoRecetaType: typeof receta.costoReceta,
            totalInsumos: receta.totalInsumos,
            totalInsumosType: typeof receta.totalInsumos
          });
        });
        
        setRecetas(data.data);
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



  // Función para manejar selección de insumo del selector
  const handleInsumoSelect = (insumoEncontrado: any): void => {
    console.log('🎯 Insumo seleccionado para agregar a receta:', insumoEncontrado);
    agregarInsumoAReceta(insumoEncontrado);
  };

  // Función para agregar insumo encontrado a la receta
  const agregarInsumoAReceta = (insumoEncontrado: any): void => {
    try {
      // Validar que el insumo tenga los datos necesarios
      if (!insumoEncontrado || !insumoEncontrado.nomInsumo) {
        alert('Error: Datos del insumo incompletos');
        return;
      }

      // Buscar el primer insumo vacío o agregar uno nuevo
      let indexVacio = insumos.findIndex(insumo => !insumo.nombreInsumo.trim());
      
      if (indexVacio === -1) {
        // No hay espacios vacíos, agregar uno nuevo
        if (insumos.length >= 40) {
          alert('Máximo 40 insumos permitidos por receta');
          return;
        }
        
        const nuevoInsumo: DetalleReceta = {
          nombreInsumo: insumoEncontrado.nomInsumo || '',
          umInsumo: insumoEncontrado.umInsumo || 'pza',
          cantidadUso: 0,
          costoInsumo: typeof insumoEncontrado.costoPromPond === 'number' ? insumoEncontrado.costoPromPond : parseFloat(insumoEncontrado.costoPromPond || 0),
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
          nombreInsumo: insumoEncontrado.nomInsumo || '',
          umInsumo: insumoEncontrado.umInsumo || 'pza',
          costoInsumo: typeof insumoEncontrado.costoPromPond === 'number' ? insumoEncontrado.costoPromPond : parseFloat(insumoEncontrado.costoPromPond || 0)
        };
        setInsumos(nuevosInsumos);
      }
      

      
      console.log('✅ Insumo agregado a la receta:', insumoEncontrado.nomInsumo);
      alert(`✅ Insumo "${insumoEncontrado.nomInsumo}" agregado a la receta`);
    } catch (error) {
      console.error('❌ Error al agregar insumo a la receta:', error);
      alert('Error al agregar el insumo a la receta');
    }
  };

  // Función para calcular costo total automáticamente
  useEffect(() => {
    const costoTotal = insumos.reduce((total, insumo) => {
      const cantidad = typeof insumo.cantidadUso === 'number' ? insumo.cantidadUso : parseFloat(insumo.cantidadUso || 0);
      const costo = typeof insumo.costoInsumo === 'number' ? insumo.costoInsumo : parseFloat(insumo.costoInsumo || 0);
      return total + (cantidad * costo);
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
        
        {/* Verificación de error crítico */}
        {errorCritico && (
          <div className="error-message" style={{ margin: '2rem 0' }}>
            <span className="error-icon">💥</span>
            <strong>Error crítico:</strong> {errorCritico}
            <br />
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setErrorCritico(null);
                window.location.reload();
              }}
              style={{ marginTop: '1rem' }}
            >
              🔄 Recargar Página
            </button>
          </div>
        )}
        
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
                        value={(typeof costoReceta === 'number' ? costoReceta : parseFloat(costoReceta || 0)).toFixed(2)}
                        readOnly
                        style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Buscador de Insumos Mejorado */}
                <div className="form-section">
                  <h3>🔍 Agregar Insumos a la Receta</h3>
                  <InsumosSelector
                    onInsumoSelect={handleInsumoSelect}
                    filtroTipo="CONSUMO"
                    placeholder="Buscar insumos por nombre..."
                    label="Buscar y Seleccionar Insumo"
                    selectedInsumos={insumos.map((_, index) => index)}
                  />
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
                              value={`$${((typeof insumo.cantidadUso === 'number' ? insumo.cantidadUso : parseFloat(insumo.cantidadUso || 0)) * (typeof insumo.costoInsumo === 'number' ? insumo.costoInsumo : parseFloat(insumo.costoInsumo || 0))).toFixed(2)}`}
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
                              <strong>${typeof receta.costoReceta === 'number' ? receta.costoReceta.toFixed(2) : parseFloat(receta.costoReceta || 0).toFixed(2)}</strong>
                            </td>
                            <td>
                              <span className="status-badge status-active">
                                {typeof receta.totalInsumos === 'number' ? receta.totalInsumos : parseInt(String(receta.totalInsumos || 0))} insumos
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