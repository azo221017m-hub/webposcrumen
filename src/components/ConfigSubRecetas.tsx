// src/components/ConfigSubRecetas.tsx
// Componente para gestión de sub-recetas

import React, { useState, useEffect } from 'react';
import type { Usuario, ScreenType } from '../types';
import Toast from './Toast';
import '../styles/ConfigScreens.css';

// Interfaces para Sub-Recetas
interface SubReceta {
  idSubReceta?: number;
  nombreSubReceta: string;
  instruccionesSubr: string;
  archivoInstruccionesSubr?: string;
  costoSubReceta: number;
  estatusSubr: number;
  fechaRegistro?: string;
  fechaActualizacion?: string;
  usuario: string;
  idNegocio: number;
  totalInsumos?: number;
}

interface DetalleSubReceta {
  idDetalleSubReceta?: number;
  nombreInsumoSubr: string;
  umInsumoSubr: string;
  cantidadUsoSubr: number;
  costoInsumoSubr: number;
  estatus: number;
  usuario: string;
  idNegocio: number;
}

interface SubRecetaCompleta {
  subReceta: Omit<SubReceta, 'idSubReceta' | 'fechaRegistro' | 'fechaActualizacion' | 'totalInsumos'>;
  detalles: Omit<DetalleSubReceta, 'idDetalleSubReceta'>[];
}

interface ConfigSubRecetasProps {
  user: Usuario;
  onNavigate: (screen: ScreenType) => void;
}

interface InsumoConsumo {
  idInsumo: number;
  nomInsumo: string;
  umInsumo: string;
  costoPromPond: number;
  existencia: number;
}

const ConfigSubRecetas: React.FC<ConfigSubRecetasProps> = ({ user, onNavigate }) => {
  // Estados principales
  const [subRecetas, setSubRecetas] = useState<SubReceta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSubReceta, setEditingSubReceta] = useState<SubReceta | null>(null);

  // Estados del formulario
  const [nombreSubReceta, setNombreSubReceta] = useState('');
  const [instruccionesSubr, setInstruccionesSubr] = useState('');
  const [archivoInstruccionesSubr, setArchivoInstruccionesSubr] = useState('');
  const [costoSubReceta, setCostoSubReceta] = useState<number>(0);

  // Estados para insumos dinámicos
  const [insumos, setInsumos] = useState<DetalleSubReceta[]>([{
    nombreInsumoSubr: '',
    umInsumoSubr: '',
    cantidadUsoSubr: 0,
    costoInsumoSubr: 0,
    estatus: 1,
    usuario: user.usuario,
    idNegocio: 1
  }]);

  // Estados para buscador de insumos
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<InsumoConsumo[]>([]);
  const [buscandoInsumos, setBuscandoInsumos] = useState<boolean>(false);
  const [mostrarResultados, setMostrarResultados] = useState<boolean>(false);

  // Estados para Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Función para mostrar Toast
  const mostrarToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Auto-ocultar después de 2 segundos
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  // Cargar sub-recetas al montar el componente
  useEffect(() => {
    cargarSubRecetas();
  }, []);

  // Función para cargar sub-recetas
  const cargarSubRecetas = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Cargando sub-recetas...');
      
      const response = await fetch('/api/sub-recetas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Sub-recetas cargadas:', data.data.length);
        setSubRecetas(data.data);
      } else {
        setError(data.message || 'Error al cargar sub-recetas');
        console.error('❌ Error en respuesta:', data.message);
      }
    } catch (error) {
      console.error('❌ Error al cargar sub-recetas:', error);
      setError('Error de conexión al cargar sub-recetas');
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar insumo
  const agregarInsumo = (): void => {
    if (insumos.length >= 40) {
      mostrarToast('Máximo 40 insumos permitidos por sub-receta', 'error');
      return;
    }

    setInsumos([...insumos, {
      nombreInsumoSubr: '',
      umInsumoSubr: '',
      cantidadUsoSubr: 0,
      costoInsumoSubr: 0,
      estatus: 1,
      usuario: user.usuario,
      idNegocio: 1
    }]);
  };

  // Función para eliminar insumo
  const eliminarInsumo = (index: number): void => {
    if (insumos.length <= 1) {
      mostrarToast('Debe tener al menos un insumo', 'error');
      return;
    }

    const nuevosInsumos = insumos.filter((_, i) => i !== index);
    setInsumos(nuevosInsumos);
  };

  // Función para actualizar insumo
  const actualizarInsumo = (index: number, field: keyof DetalleSubReceta, value: string | number): void => {
    const nuevosInsumos = [...insumos];
    (nuevosInsumos[index] as any)[field] = value;
    setInsumos(nuevosInsumos);
  };

  // Función para buscar insumos de consumo
  const buscarInsumosConsumo = async (): Promise<void> => {
    if (!terminoBusqueda || terminoBusqueda.trim().length < 2) {
      mostrarToast('Ingrese al menos 2 caracteres para buscar', 'error');
      return;
    }

    try {
      setBuscandoInsumos(true);
      setMostrarResultados(false);
      
      const url = `/api/sub-recetas/insumos-consumo/buscar/${encodeURIComponent(terminoBusqueda)}`;
      console.log(`🔍 Buscando insumos de consumo: "${terminoBusqueda}"`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📊 Respuesta búsqueda:`, data);

      if (data.success) {
        const resultados = data.data || [];
        setResultadosBusqueda(resultados);
        setMostrarResultados(true);
        
        console.log(`✅ ${resultados.length} insumos de consumo encontrados`);
        
        if (resultados.length === 0) {
          mostrarToast('No se encontraron insumos de consumo con ese término', 'info');
        } else {
          mostrarToast(`${resultados.length} insumos encontrados`, 'success');
        }
      } else {
        setResultadosBusqueda([]);
        setMostrarResultados(false);
        mostrarToast('Error al buscar insumos: ' + (data.message || 'Error desconocido'), 'error');
      }
    } catch (error) {
      console.error('❌ Error al buscar insumos:', error);
      setResultadosBusqueda([]);
      setMostrarResultados(false);
      mostrarToast('Error de conexión al buscar insumos', 'error');
    } finally {
      setBuscandoInsumos(false);
    }
  };

  // Función para agregar insumo encontrado a la sub-receta
  const agregarInsumoASubReceta = (insumoEncontrado: InsumoConsumo): void => {
    try {
      // Validar que el insumo tenga los datos necesarios
      if (!insumoEncontrado || !insumoEncontrado.nomInsumo) {
        mostrarToast('Error: Datos del insumo incompletos', 'error');
        return;
      }

      // Buscar el primer insumo vacío o agregar uno nuevo
      let indexVacio = insumos.findIndex(insumo => !insumo.nombreInsumoSubr.trim());
      
      if (indexVacio === -1) {
        // No hay espacios vacíos, agregar uno nuevo
        if (insumos.length >= 40) {
          mostrarToast('Máximo 40 insumos permitidos por sub-receta', 'error');
          return;
        }
        
        const nuevoInsumo: DetalleSubReceta = {
          nombreInsumoSubr: insumoEncontrado.nomInsumo || '',
          umInsumoSubr: insumoEncontrado.umInsumo || '',
          cantidadUsoSubr: 0,
          costoInsumoSubr: typeof insumoEncontrado.costoPromPond === 'number' ? 
            insumoEncontrado.costoPromPond : parseFloat(String(insumoEncontrado.costoPromPond || 0)),
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
          nombreInsumoSubr: insumoEncontrado.nomInsumo || '',
          umInsumoSubr: insumoEncontrado.umInsumo || '',
          costoInsumoSubr: typeof insumoEncontrado.costoPromPond === 'number' ? 
            insumoEncontrado.costoPromPond : parseFloat(String(insumoEncontrado.costoPromPond || 0))
        };
        setInsumos(nuevosInsumos);
      }
      
      // Limpiar resultados de búsqueda
      setMostrarResultados(false);
      setResultadosBusqueda([]);
      setTerminoBusqueda('');
      
      console.log('✅ Insumo agregado a la sub-receta:', insumoEncontrado.nomInsumo);
      mostrarToast(`Insumo "${insumoEncontrado.nomInsumo}" agregado`, 'success');
    } catch (error) {
      console.error('❌ Error al agregar insumo a la sub-receta:', error);
      mostrarToast('Error al agregar el insumo', 'error');
    }
  };

  // Función para calcular costo total automáticamente
  useEffect(() => {
    const costoTotal = insumos.reduce((total, insumo) => {
      const cantidad = typeof insumo.cantidadUsoSubr === 'number' ? 
        insumo.cantidadUsoSubr : parseFloat(String(insumo.cantidadUsoSubr || 0));
      const costo = typeof insumo.costoInsumoSubr === 'number' ? 
        insumo.costoInsumoSubr : parseFloat(String(insumo.costoInsumoSubr || 0));
      return total + (cantidad * costo);
    }, 0);
    setCostoSubReceta(costoTotal);
  }, [insumos]);

  // Función para guardar sub-receta
  const guardarSubReceta = async (): Promise<void> => {
    // Validaciones
    if (!nombreSubReceta.trim()) {
      mostrarToast('El nombre de la sub-receta es obligatorio', 'error');
      return;
    }

    if (!instruccionesSubr.trim()) {
      mostrarToast('Las instrucciones son obligatorias', 'error');
      return;
    }

    // Validar insumos
    const insumosValidos = insumos.filter(insumo => 
      insumo.nombreInsumoSubr.trim() && 
      insumo.cantidadUsoSubr > 0 && 
      insumo.costoInsumoSubr > 0
    );

    if (insumosValidos.length === 0) {
      mostrarToast('Debe agregar al menos un insumo válido', 'error');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const subRecetaCompleta: SubRecetaCompleta = {
        subReceta: {
          nombreSubReceta: nombreSubReceta.trim(),
          instruccionesSubr: instruccionesSubr.trim(),
          archivoInstruccionesSubr: archivoInstruccionesSubr.trim() || undefined,
          costoSubReceta: costoSubReceta,
          estatusSubr: 1,
          usuario: user.usuario,
          idNegocio: 1
        },
        detalles: insumosValidos
      };

      console.log('💾 Guardando sub-receta:', subRecetaCompleta);

      const url = editingSubReceta ? `/api/sub-recetas/${editingSubReceta.idSubReceta}` : '/api/sub-recetas';
      const method = editingSubReceta ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subRecetaCompleta),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Sub-receta guardada exitosamente');
        mostrarToast(
          editingSubReceta ? 'Sub-receta actualizada exitosamente' : 'Sub-receta creada exitosamente', 
          'success'
        );
        limpiarFormulario();
        setShowForm(false);
        cargarSubRecetas();
      } else {
        setError(data.message || 'Error al guardar sub-receta');
        mostrarToast('Error al guardar: ' + (data.message || 'Error desconocido'), 'error');
        console.error('❌ Error al guardar:', data.message);
      }
    } catch (error) {
      console.error('❌ Error al guardar sub-receta:', error);
      setError('Error de conexión al guardar sub-receta');
      mostrarToast('Error de conexión al guardar', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar formulario
  const limpiarFormulario = (): void => {
    setNombreSubReceta('');
    setInstruccionesSubr('');
    setArchivoInstruccionesSubr('');
    setCostoSubReceta(0);
    setInsumos([{
      nombreInsumoSubr: '',
      umInsumoSubr: '',
      cantidadUsoSubr: 0,
      costoInsumoSubr: 0,
      estatus: 1,
      usuario: user.usuario,
      idNegocio: 1
    }]);
    setEditingSubReceta(null);
    setError(null);
    setMostrarResultados(false);
    setResultadosBusqueda([]);
    setTerminoBusqueda('');
  };

  // Función para editar sub-receta
  const editarSubReceta = async (subReceta: SubReceta): Promise<void> => {
    try {
      console.log('✏️ Cargando detalles de sub-receta para editar:', subReceta.idSubReceta);
      
      const response = await fetch(`/api/sub-recetas/${subReceta.idSubReceta}`);
      const data = await response.json();

      if (data.success) {
        const { subReceta: subRecetaData, detalles } = data.data;
        
        setEditingSubReceta(subReceta);
        setNombreSubReceta(subRecetaData.nombreSubReceta);
        setInstruccionesSubr(subRecetaData.instruccionesSubr);
        setArchivoInstruccionesSubr(subRecetaData.archivoInstruccionesSubr || '');
        setCostoSubReceta(subRecetaData.costoSubReceta);
        setInsumos(detalles.length > 0 ? detalles : [{
          nombreInsumoSubr: '',
          umInsumoSubr: '',
          cantidadUsoSubr: 0,
          costoInsumoSubr: 0,
          estatus: 1,
          usuario: user.usuario,
          idNegocio: 1
        }]);
        setShowForm(true);
        mostrarToast('Sub-receta cargada para edición', 'info');
      } else {
        mostrarToast('Error al cargar detalles de la sub-receta', 'error');
      }
    } catch (error) {
      console.error('❌ Error al cargar detalles:', error);
      mostrarToast('Error de conexión al cargar detalles', 'error');
    }
  };

  // Función para eliminar sub-receta
  const eliminarSubReceta = async (id: number): Promise<void> => {
    if (!window.confirm('¿Está seguro de eliminar esta sub-receta?')) {
      return;
    }

    try {
      const response = await fetch(`/api/sub-recetas/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: user.usuario }),
      });

      const data = await response.json();

      if (data.success) {
        mostrarToast('Sub-receta eliminada exitosamente', 'success');
        cargarSubRecetas();
      } else {
        mostrarToast(data.message || 'Error al eliminar sub-receta', 'error');
      }
    } catch (error) {
      console.error('❌ Error al eliminar sub-receta:', error);
      mostrarToast('Error de conexión al eliminar sub-receta', 'error');
    }
  };

  return (
    <div className="config-screen">
      <div className="config-container">
        
        {/* Toast Component */}
        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
        
        {/* Header */}
        <div className="config-header">
          <div className="config-breadcrumb">
            <span className="breadcrumb-item">
              <button onClick={() => onNavigate('home')}>🏠 Inicio</button>
            </span>
            <span className="breadcrumb-separator">→</span>
            <span className="breadcrumb-item">🍴 Sub-Recetas</span>
          </div>
          <h1>Gestión de Sub-Recetas</h1>
          <p>Administra las sub-recetas con insumos de consumo</p>
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
              <span className="card-icon">🍴</span>
              {showForm ? (editingSubReceta ? 'Editar Sub-Receta' : 'Nueva Sub-Receta') : 'Lista de Sub-Recetas'}
            </h2>
            <div className="toolbar-right">
              {!showForm ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  <span>➕</span>
                  Nueva Sub-Receta
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
              /* Formulario de sub-receta */
              <div className="config-form">
                
                {/* Información básica */}
                <div className="form-section">
                  <h3>Información Básica</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nombre de la Sub-Receta *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={nombreSubReceta}
                        onChange={(e) => setNombreSubReceta(e.target.value)}
                        placeholder="Ej: Salsa Especial"
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
                        value={instruccionesSubr}
                        onChange={(e) => setInstruccionesSubr(e.target.value)}
                        placeholder="Describe paso a paso cómo preparar la sub-receta..."
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
                        value={archivoInstruccionesSubr}
                        onChange={(e) => setArchivoInstruccionesSubr(e.target.value)}
                        placeholder="URL o ruta del archivo con instrucciones"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Costo Total Calculado</label>
                      <input
                        type="number"
                        className="form-input"
                        value={(typeof costoSubReceta === 'number' ? costoSubReceta : parseFloat(String(costoSubReceta || 0))).toFixed(2)}
                        readOnly
                        style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Buscador de Insumos de Consumo */}
                <div className="form-section">
                  <h3>🔍 Buscador de Insumos de Consumo</h3>
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
                            buscarInsumosConsumo();
                          }
                        }}
                        placeholder="Escriba el nombre del insumo de consumo..."
                        maxLength={50}
                      />
                    </div>
                    <div className="form-group" style={{ flex: '0 0 auto', marginTop: '1.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={buscarInsumosConsumo}
                        disabled={buscandoInsumos || terminoBusqueda.trim().length < 2}
                      >
                        {buscandoInsumos ? '🔍 Buscando...' : '🔍 Buscar'}
                      </button>
                    </div>
                  </div>

                  {/* Resultados de búsqueda */}
                  {mostrarResultados && (
                    <div className="search-results">
                      <h4>Insumos de Consumo Encontrados ({resultadosBusqueda.length})</h4>
                      {resultadosBusqueda.length === 0 ? (
                        <div className="no-results">
                          <p>No se encontraron insumos de consumo con ese término.</p>
                        </div>
                      ) : (
                        <div className="results-grid">
                          {resultadosBusqueda.map((insumo, index) => (
                            <div key={index} className="result-card">
                              <div className="result-info">
                                <h5>{insumo.nomInsumo}</h5>
                                <div className="result-details">
                                  <span className="result-um">📏 {insumo.umInsumo || 'N/A'}</span>
                                  <span className="result-price">
                                    💰 ${typeof insumo.costoPromPond === 'number' ? 
                                      insumo.costoPromPond.toFixed(2) : 
                                      parseFloat(String(insumo.costoPromPond || 0)).toFixed(2)}
                                  </span>
                                  {insumo.existencia !== undefined && (
                                    <span className="result-stock">📦 Stock: {insumo.existencia}</span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={() => agregarInsumoASubReceta(insumo)}
                              >
                                ➕ Agregar a Sub-Receta
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
                              value={insumo.nombreInsumoSubr}
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
                              value={insumo.umInsumoSubr}
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
                              value={insumo.cantidadUsoSubr}
                              onChange={(e) => actualizarInsumo(index, 'cantidadUsoSubr', parseFloat(e.target.value) || 0)}
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
                              value={insumo.costoInsumoSubr}
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
                              value={`$${((typeof insumo.cantidadUsoSubr === 'number' ? insumo.cantidadUsoSubr : parseFloat(String(insumo.cantidadUsoSubr || 0))) * (typeof insumo.costoInsumoSubr === 'number' ? insumo.costoInsumoSubr : parseFloat(String(insumo.costoInsumoSubr || 0)))).toFixed(2)}`}
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
                    onClick={guardarSubReceta}
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : (editingSubReceta ? 'Actualizar' : 'Guardar')} Sub-Receta
                  </button>
                </div>
              </div>
            ) : (
              /* Lista de sub-recetas */
              <div>
                {loading ? (
                  <div className="loading-skeleton" style={{ height: '200px' }}></div>
                ) : subRecetas.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">🍴</div>
                    <h3>No hay sub-recetas registradas</h3>
                    <p>Comienza creando tu primera sub-receta</p>
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
                        {subRecetas.map((subReceta) => (
                          <tr key={subReceta.idSubReceta}>
                            <td>
                              <strong>{subReceta.nombreSubReceta}</strong>
                              <br />
                              <small style={{ color: 'var(--text-secondary)' }}>
                                {subReceta.instruccionesSubr.substring(0, 50)}...
                              </small>
                            </td>
                            <td>
                              <strong>
                                ${typeof subReceta.costoSubReceta === 'number' ? 
                                  subReceta.costoSubReceta.toFixed(2) : 
                                  parseFloat(String(subReceta.costoSubReceta || 0)).toFixed(2)}
                              </strong>
                            </td>
                            <td>
                              <span className="status-badge status-active">
                                {typeof subReceta.totalInsumos === 'number' ? 
                                  subReceta.totalInsumos : 
                                  parseInt(String(subReceta.totalInsumos || 0))} insumos
                              </span>
                            </td>
                            <td>
                              {new Date(subReceta.fechaRegistro || '').toLocaleDateString()}
                            </td>
                            <td>
                              <span className={`status-badge ${subReceta.estatusSubr === 1 ? 'status-active' : 'status-inactive'}`}>
                                {subReceta.estatusSubr === 1 ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button
                                  className="action-btn edit"
                                  onClick={() => editarSubReceta(subReceta)}
                                  title="Editar sub-receta"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="action-btn delete"
                                  onClick={() => eliminarSubReceta(subReceta.idSubReceta!)}
                                  title="Eliminar sub-receta"
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

export default ConfigSubRecetas;