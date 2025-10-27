// src/components/ConfigInsumos.tsx
// Componente para gestión de insumos con tabla tblposcrumenwebinsumos

import React, { useState, useEffect } from 'react'; // Importa React y hooks
import type { 
  Insumo, 
  CreateInsumoData,
  CuentaContableOption
} from '../types'; // Importa tipos
import apiService from '../services/api'; // Importa servicio API
import Toast from './Toast'; // Importa componente Toast
import '../styles/ConfigScreens.css'; // Importa estilos

// Props del componente
interface ConfigInsumosProps {
  onBack?: () => void; // Función para volver atrás (opcional)
}

// Componente principal
const ConfigInsumos: React.FC<ConfigInsumosProps> = ({ onBack }) => {
  // Estados del componente
  const [insumos, setInsumos] = useState<Insumo[]>([]); // Lista de insumos
  const [cuentasContables, setCuentasContables] = useState<CuentaContableOption[]>([]); // Lista de cuentas contables
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carga
  const [showForm, setShowForm] = useState<boolean>(false); // Mostrar/ocultar formulario
  const [isEditing, setIsEditing] = useState<boolean>(false); // Modo edición
  const [editingId, setEditingId] = useState<number | null>(null); // ID de insumo en edición

  // Estado del formulario
  const [formData, setFormData] = useState<CreateInsumoData>({
    nombre: '',
    tipo_insumo: 'PRODUCTO',
    unidad_medida: 'Pza',
    stock_actual: 0,
    stock_minimo: 0,
    costo_promedio_ponderado: 0,
    precio_venta: 0,
    id_cuentacontable: 0
  });

  // Estados para el Toast
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Opciones para los controles
  const unidadMedidaOptions = ['Kg', 'Lt', 'Pza'] as const;

  // Función para mostrar mensajes toast
  const showToastMessage = (message: string, type: 'success' | 'error' | 'info'): void => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Función para cerrar el toast
  const closeToast = (): void => {
    setShowToast(false);
  };

  // Función para cargar los insumos
  const loadInsumos = async (): Promise<void> => {
    try {
      console.log('📦 Cargando insumos...');
      const response = await apiService.getInsumos();
      
      if (response.success && response.data) {
        setInsumos(response.data);
        console.log(`✅ ${response.data.length} insumos cargados`);
      } else {
        console.error('❌ Error cargando insumos:', response.message);
        showToastMessage('Error cargando insumos', 'error');
      }
    } catch (error) {
      console.error('❌ Error cargando insumos:', error);
      showToastMessage('Error cargando insumos', 'error');
    }
  };

  // Función para cargar las cuentas contables
  const loadCuentasContables = async (): Promise<void> => {
    try {
      console.log('💳 Cargando cuentas contables...');
      const response = await apiService.getCuentasContablesDropdown();
      
      if (response.success && response.data) {
        const cuentas = response.data ?? [];
        setCuentasContables(cuentas);
        console.log(`✅ ${cuentas.length} cuentas contables cargadas`);
        
        // Si hay cuentas disponibles y no hay una seleccionada, seleccionar la primera
        if (cuentas.length > 0 && formData.id_cuentacontable === 0) {
          setFormData(prev => ({
            ...prev,
            id_cuentacontable: cuentas[0].idcuentacontable
          }));
        }
      } else {
        console.error('❌ Error cargando cuentas contables:', response.message);
        showToastMessage('Error cargando cuentas contables', 'error');
      }
    } catch (error) {
      console.error('❌ Error cargando cuentas contables:', error);
      showToastMessage('Error cargando cuentas contables', 'error');
    }
  };

  // Hook useEffect para cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadInsumos(), loadCuentasContables()]);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Función para resetear el formulario
  const resetForm = (): void => {
    setFormData({
      nombre: '',
      tipo_insumo: 'PRODUCTO',
      unidad_medida: 'Pza',
      stock_actual: 0,
      stock_minimo: 0,
      costo_promedio_ponderado: 0,
      precio_venta: 0,
      id_cuentacontable: cuentasContables.length > 0 ? cuentasContables[0].idcuentacontable : 0
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Función para manejar cambios en los inputs del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    
    // Parsear valores numéricos
    if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  // Función para manejar el switch de tipo_insumo
  const handleTipoInsumoToggle = (): void => {
    setFormData(prev => ({
      ...prev,
      tipo_insumo: prev.tipo_insumo === 'PRODUCTO' ? 'INSUMO' : 'PRODUCTO'
    }));
  };

  // Función para validar el formulario
  const validateForm = (): boolean => {
    if (!formData.nombre.trim()) {
      showToastMessage('El nombre del insumo es requerido', 'error');
      return false;
    }

    if (formData.nombre.length > 100) {
      showToastMessage('El nombre no puede exceder 100 caracteres', 'error');
      return false;
    }

    if (formData.stock_actual < 0) {
      showToastMessage('El stock actual no puede ser negativo', 'error');
      return false;
    }

    if (formData.stock_minimo < 0) {
      showToastMessage('El stock mínimo no puede ser negativo', 'error');
      return false;
    }

    if (formData.costo_promedio_ponderado <= 0) {
      showToastMessage('El costo promedio ponderado debe ser mayor a 0', 'error');
      return false;
    }

    if (formData.precio_venta <= 0) {
      showToastMessage('El precio de venta debe ser mayor a 0', 'error');
      return false;
    }

    if (formData.id_cuentacontable === 0) {
      showToastMessage('Debe seleccionar una cuenta contable', 'error');
      return false;
    }

    return true;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (isEditing && editingId) {
        // Modo edición - actualizar insumo existente
        console.log(`📦 Actualizando insumo ID: ${editingId}`);
        const response = await apiService.updateInsumo(editingId, formData);
        
        if (response.success) {
          showToastMessage('Insumo actualizado exitosamente', 'success');
          await loadInsumos();
          setShowForm(false);
          resetForm();
        } else {
          showToastMessage(response.message || 'Error actualizando insumo', 'error');
        }
      } else {
        // Modo creación - crear nuevo insumo
        console.log('📦 Creando nuevo insumo');
        const response = await apiService.createInsumo(formData);
        
        if (response.success) {
          showToastMessage('Insumo creado exitosamente', 'success');
          await loadInsumos();
          setShowForm(false);
          resetForm();
        } else {
          showToastMessage(response.message || 'Error creando insumo', 'error');
        }
      }
    } catch (error) {
      console.error('❌ Error en operación:', error);
      showToastMessage('Error en la operación', 'error');
    }
  };

  // Función para editar un insumo
  const handleEdit = (insumo: Insumo): void => {
    console.log(`📦 Editando insumo ID: ${insumo.id_insumo}`);
    
    setFormData({
      nombre: insumo.nombre,
      tipo_insumo: insumo.tipo_insumo,
      unidad_medida: insumo.unidad_medida,
      stock_actual: insumo.stock_actual,
      stock_minimo: insumo.stock_minimo,
      costo_promedio_ponderado: insumo.costo_promedio_ponderado,
      precio_venta: insumo.precio_venta,
      id_cuentacontable: insumo.id_cuentacontable
    });
    
    setIsEditing(true);
    setEditingId(insumo.id_insumo);
    setShowForm(true);
  };

  // Función para cancelar la edición/creación
  const handleCancel = (): void => {
    setShowForm(false);
    resetForm();
  };

  // Función para obtener badge de tipo de insumo
  const getTipoInsumoBadge = (tipo: 'PRODUCTO' | 'INSUMO') => {
    const color = tipo === 'PRODUCTO' ? '#3b82f6' : '#10b981';
    return (
      <span 
        style={{
          display: 'inline-block',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.375rem',
          fontSize: '0.8rem',
          fontWeight: '600',
          textAlign: 'center',
          minWidth: '70px',
          color: 'white',
          backgroundColor: color,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease'
        }}
      >
        {tipo}
      </span>
    );
  };

  // Función para obtener nombre de cuenta contable
  const getNombreCuentaContable = (idCuenta: number): string => {
    const cuenta = cuentasContables.find(c => c.idcuentacontable === idCuenta);
    return cuenta ? cuenta.nombrecuentacontable : 'No encontrada';
  };

  // Renderizado del componente
  return (
    <div className="config-container">
      {/* Header de la sección */}
      <div className="config-header">
        <h2>📦 Configuración de Insumos</h2>
        <div className="config-header-buttons">
          {!showForm && (
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              ➕ Nuevo Insumo
            </button>
          )}
          <button
            className="btn-secondary"
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                window.location.href = '/';
              }
            }}
          >
            🏠 Regresar al Tablero
          </button>
        </div>
      </div>

      {/* Formulario para crear/editar insumo */}
      {showForm && (
        <div className="config-form-section">
          <h3>{isEditing ? '✏️ Editar Insumo' : '➕ Nuevo Insumo'}</h3>
          
          <form onSubmit={handleSubmit} className="config-form">
            
            {/* Fila 1: Nombre e switch Tipo */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre del Insumo *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ingrese el nombre del insumo"
                  maxLength={100}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Tipo de Insumo *</label>
                <div className="switch-container">
                  <button
                    type="button"
                    className={`switch-button ${formData.tipo_insumo === 'PRODUCTO' ? 'active' : ''}`}
                    onClick={handleTipoInsumoToggle}
                  >
                    <span className="switch-label">
                      {formData.tipo_insumo === 'PRODUCTO' ? '🛍️ PRODUCTO' : '🔧 INSUMO'}
                    </span>
                    <div className={`switch-toggle ${formData.tipo_insumo === 'PRODUCTO' ? 'on' : 'off'}`}>
                      <div className="switch-thumb"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Fila 2: Unidad de Medida (Radio Buttons) */}
            <div className="form-row">
              <div className="form-group">
                <label>Unidad de Medida *</label>
                <div className="radio-group">
                  {unidadMedidaOptions.map(unidad => (
                    <label key={unidad} className="radio-option">
                      <input
                        type="radio"
                        name="unidad_medida"
                        value={unidad}
                        checked={formData.unidad_medida === unidad}
                        onChange={handleInputChange}
                      />
                      <span className="radio-label">{unidad}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Fila 3: Stock Actual y Stock Mínimo */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stock_actual">Stock Actual *</label>
                <input
                  type="number"
                  id="stock_actual"
                  name="stock_actual"
                  value={formData.stock_actual}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="stock_minimo">Stock Mínimo *</label>
                <input
                  type="number"
                  id="stock_minimo"
                  name="stock_minimo"
                  value={formData.stock_minimo}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Fila 4: Costo y Precio */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="costo_promedio_ponderado">Costo Promedio Ponderado *</label>
                <input
                  type="number"
                  id="costo_promedio_ponderado"
                  name="costo_promedio_ponderado"
                  value={formData.costo_promedio_ponderado}
                  onChange={handleInputChange}
                  min="0.0001"
                  step="0.0001"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="precio_venta">Precio de Venta *</label>
                <input
                  type="number"
                  id="precio_venta"
                  name="precio_venta"
                  value={formData.precio_venta}
                  onChange={handleInputChange}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Fila 5: Cuenta Contable */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="id_cuentacontable">Cuenta Contable *</label>
                <select
                  id="id_cuentacontable"
                  name="id_cuentacontable"
                  value={formData.id_cuentacontable}
                  onChange={handleInputChange}
                  required
                >
                  <option value={0}>Seleccione una cuenta contable</option>
                  {cuentasContables.map(cuenta => (
                    <option key={cuenta.idcuentacontable} value={cuenta.idcuentacontable}>
                      {cuenta.nombrecuentacontable}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {isEditing ? '💾 Actualizar' : '➕ Crear'} Insumo
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de insumos */}
      <div className="config-list-section">
        <h3>📋 Lista de Insumos</h3>
        
        {isLoading ? (
          <div className="loading-message">Cargando insumos...</div>
        ) : insumos.length === 0 ? (
          <div className="empty-message">No hay insumos registrados</div>
        ) : (
          <div className="config-table-container">
            <table className="config-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Unidad</th>
                  <th>Stock Act.</th>
                  <th>Stock Min.</th>
                  <th>Costo Prom.</th>
                  <th>Precio Venta</th>
                  <th>Cuenta Contable</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {insumos.map((insumo) => (
                  <tr key={insumo.id_insumo}>
                    <td>{insumo.id_insumo}</td>
                    <td>{insumo.nombre}</td>
                    <td>{getTipoInsumoBadge(insumo.tipo_insumo)}</td>
                    <td>{insumo.unidad_medida}</td>
                    <td>{insumo.stock_actual.toFixed(2)}</td>
                    <td>{insumo.stock_minimo.toFixed(2)}</td>
                    <td>${insumo.costo_promedio_ponderado.toFixed(4)}</td>
                    <td>${insumo.precio_venta.toFixed(2)}</td>
                    <td>{getNombreCuentaContable(insumo.id_cuentacontable)}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(insumo)}
                        title="Editar insumo"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast para mensajes */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default ConfigInsumos;