// src/components/ConfigSubtipoMovimiento.tsx
// Componente para gestión de subtipos de movimiento en POSWEBCrumen

import React, { useState, useEffect } from 'react'; // React hooks
import '../styles/ConfigScreens.css'; // Estilos globales para pantallas de configuración
import type { SubtipoMovimiento, CreateSubtipoMovimientoData, TipoMovimiento } from '../types'; // Tipos definidos
import Toast from './Toast'; // Componente de notificaciones

/**
 * Interfaz para los mensajes de notificación
 */
interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

/**
 * Interfaz para los datos del formulario
 */
interface FormData {
  nombretiposubmovimiento: string;
  idtipomovimiento: number | '';
  preciosubtipomovimiento: string;
}

/**
 * Componente para gestión de subtipos de movimiento
 * Permite crear, editar, visualizar y eliminar subtipos de movimiento
 * @returns JSX del componente
 */
const ConfigSubtipoMovimiento: React.FC = () => {
  console.log('📋 Renderizando ConfigSubtipoMovimiento'); // Log de renderizado

  // Estados del componente
  const [subtipoMovimientos, setSubtipoMovimientos] = useState<SubtipoMovimiento[]>([]);
  const [tiposMovimiento, setTiposMovimiento] = useState<TipoMovimiento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState<FormData>({
    nombretiposubmovimiento: '',
    idtipomovimiento: '',
    preciosubtipomovimiento: '0'
  });

  /**
   * Hook de efecto para cargar datos iniciales
   */
  useEffect(() => {
    console.log('🔄 Iniciando carga de datos en ConfigSubtipoMovimiento');
    cargarDatos();
  }, []);

  /**
   * Función para cargar subtipos de movimiento y tipos de movimiento
   */
  const cargarDatos = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('📥 Cargando datos de subtipos y tipos de movimiento...');

      // Cargar subtipos de movimiento y tipos de movimiento en paralelo
      const [subtiposResponse, tiposResponse] = await Promise.all([
        fetch('/api/subtipo-movimiento'),
        fetch('/api/tipo-movimiento')
      ]);

      if (!subtiposResponse.ok || !tiposResponse.ok) {
        throw new Error('Error al cargar los datos');
      }

      const subtiposData = await subtiposResponse.json();
      const tiposData = await tiposResponse.json();

      if (subtiposData.success && tiposData.success) {
        setSubtipoMovimientos(subtiposData.data);
        setTiposMovimiento(tiposData.data);
        console.log(`✅ ${subtiposData.data.length} subtipos y ${tiposData.data.length} tipos de movimiento cargados`);
      } else {
        throw new Error(subtiposData.message || tiposData.message || 'Error desconocido');
      }

      setError('');
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar los datos';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para mostrar notificaciones toast
   * @param message - Mensaje a mostrar
   * @param type - Tipo de notificación
   */
  const showToast = (message: string, type: 'success' | 'error'): void => {
    console.log(`🔔 Toast: ${type} - ${message}`);
    setToast({ message, type });
  };

  /**
   * Función para manejar cambios en el formulario
   * @param field - Campo que cambió
   * @param value - Nuevo valor
   */
  const handleFormChange = (field: keyof FormData, value: string | number): void => {
    console.log(`📝 Cambiando campo ${field}:`, value);
    
    // Lógica especial para el tipo de movimiento "Compras de inventario"
    if (field === 'idtipomovimiento') {
      const tipoSeleccionado = tiposMovimiento.find(t => t.idtipomovimiento === Number(value));
      if (tipoSeleccionado && tipoSeleccionado.nombretipomovimiento === 'Compras de inventario') {
        // Si se selecciona "Compras de inventario", el precio debe ser 0
        setFormData(prev => ({
          ...prev,
          idtipomovimiento: value as number | '',
          preciosubtipomovimiento: '0'
        }));
        console.log('💰 Precio establecido a 0 para Compras de inventario');
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Función para validar formulario
   * @returns true si el formulario es válido
   */
  const validarFormulario = (): boolean => {
    if (!formData.nombretiposubmovimiento.trim()) {
      showToast('El nombre del subtipo de movimiento es obligatorio', 'error');
      return false;
    }

    if (!formData.idtipomovimiento) {
      showToast('Debe seleccionar un tipo de movimiento', 'error');
      return false;
    }

    const precio = parseFloat(formData.preciosubtipomovimiento);
    if (isNaN(precio) || precio < 0) {
      showToast('El precio debe ser un número válido mayor o igual a 0', 'error');
      return false;
    }

    return true;
  };

  /**
   * Función para crear un nuevo subtipo de movimiento
   */
  const handleCreate = async (): Promise<void> => {
    try {
      console.log('➕ Creando nuevo subtipo de movimiento:', formData);
      
      if (!validarFormulario()) return;

      const nuevoSubtipoData: CreateSubtipoMovimientoData = {
        nombretiposubmovimiento: formData.nombretiposubmovimiento.trim(),
        idtipomovimiento: Number(formData.idtipomovimiento),
        preciosubtipomovimiento: parseFloat(formData.preciosubtipomovimiento)
      };

      const response = await fetch('/api/subtipo-movimiento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoSubtipoData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Subtipo de movimiento creado exitosamente:', data.data);
        showToast(data.message, 'success');
        resetForm();
        cargarDatos();
      } else {
        throw new Error(data.message || 'Error al crear el subtipo de movimiento');
      }

    } catch (error) {
      console.error('❌ Error al crear subtipo de movimiento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el subtipo de movimiento';
      showToast(errorMessage, 'error');
    }
  };

  /**
   * Función para actualizar un subtipo de movimiento existente
   */
  const handleUpdate = async (): Promise<void> => {
    try {
      if (!editingId) return;
      
      console.log(`🔄 Actualizando subtipo de movimiento ID: ${editingId}`, formData);
      
      if (!validarFormulario()) return;

      const updateData = {
        nombretiposubmovimiento: formData.nombretiposubmovimiento.trim(),
        idtipomovimiento: Number(formData.idtipomovimiento),
        preciosubtipomovimiento: parseFloat(formData.preciosubtipomovimiento)
      };

      const response = await fetch(`/api/subtipo-movimiento/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Subtipo de movimiento actualizado exitosamente:', data.data);
        showToast(data.message, 'success');
        resetForm();
        cargarDatos();
      } else {
        throw new Error(data.message || 'Error al actualizar el subtipo de movimiento');
      }

    } catch (error) {
      console.error('❌ Error al actualizar subtipo de movimiento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el subtipo de movimiento';
      showToast(errorMessage, 'error');
    }
  };

  /**
   * Función para eliminar un subtipo de movimiento
   * @param id - ID del subtipo a eliminar
   */
  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm('¿Está seguro de que desea eliminar este subtipo de movimiento?')) {
      return;
    }

    try {
      console.log(`🗑️ Eliminando subtipo de movimiento ID: ${id}`);

      const response = await fetch(`/api/subtipo-movimiento/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Subtipo de movimiento eliminado exitosamente');
        showToast(data.message, 'success');
        cargarDatos();
      } else {
        throw new Error(data.message || 'Error al eliminar el subtipo de movimiento');
      }

    } catch (error) {
      console.error('❌ Error al eliminar subtipo de movimiento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el subtipo de movimiento';
      showToast(errorMessage, 'error');
    }
  };

  /**
   * Función para cargar datos de un subtipo en el formulario para edición
   * @param subtipo - Subtipo de movimiento a editar
   */
  const handleEdit = (subtipo: SubtipoMovimiento): void => {
    console.log('✏️ Editando subtipo de movimiento:', subtipo);
    
    setFormData({
      nombretiposubmovimiento: subtipo.nombretiposubmovimiento,
      idtipomovimiento: subtipo.idtipomovimiento,
      preciosubtipomovimiento: subtipo.preciosubtipomovimiento.toString()
    });
    setEditingId(subtipo.idsubtipomovimiento);
  };

  /**
   * Función para resetear el formulario
   */
  const resetForm = (): void => {
    console.log('🔄 Reseteando formulario');
    setFormData({
      nombretiposubmovimiento: '',
      idtipomovimiento: '',
      preciosubtipomovimiento: '0'
    });
    setEditingId(null);
  };

  /**
   * Función para formatear el precio en el campo de entrada
   * @param value - Valor del precio
   * @returns Precio formateado
   */
  const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  /**
   * Verifica si el tipo seleccionado es "Compras de inventario"
   * @returns true si es compras de inventario
   */
  const isComprasInventario = (): boolean => {
    const tipoSeleccionado = tiposMovimiento.find(t => t.idtipomovimiento === Number(formData.idtipomovimiento));
    return tipoSeleccionado?.nombretipomovimiento === 'Compras de inventario';
  };

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <div className="config-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Renderizado del componente
  return (
    <div className="config-container">
      {/* Header */}
      <div className="config-header">
        <h2 className="config-title">Gestión de Subtipos de Movimiento</h2>
        <p className="config-subtitle">
          Administra los subtipos de movimiento del sistema con sus precios correspondientes
        </p>
      </div>

      {/* Sección del formulario */}
      <div className="form-section">
        <h3 className="form-title">
          {editingId ? 'Editar Subtipo de Movimiento' : 'Crear Nuevo Subtipo de Movimiento'}
        </h3>
        
        <div className="form-grid">
          {/* Campo nombre del subtipo */}
          <div className="form-group">
            <label className="form-label" htmlFor="nombretiposubmovimiento">
              Nombre del Subtipo *
            </label>
            <input
              type="text"
              id="nombretiposubmovimiento"
              className="form-input"
              placeholder="Ej: Compra de materia prima"
              value={formData.nombretiposubmovimiento}
              onChange={(e) => handleFormChange('nombretiposubmovimiento', e.target.value)}
              maxLength={255}
            />
          </div>

          {/* Campo tipo de movimiento */}
          <div className="form-group">
            <label className="form-label" htmlFor="idtipomovimiento">
              Tipo de Movimiento *
            </label>
            <select
              id="idtipomovimiento"
              className="form-select"
              value={formData.idtipomovimiento}
              onChange={(e) => handleFormChange('idtipomovimiento', e.target.value)}
            >
              <option value="">Seleccionar tipo de movimiento</option>
              {tiposMovimiento.map(tipo => (
                <option key={tipo.idtipomovimiento} value={tipo.idtipomovimiento}>
                  {tipo.nombretipomovimiento}
                </option>
              ))}
            </select>
          </div>

          {/* Campo precio del subtipo */}
          <div className="form-group">
            <label className="form-label" htmlFor="preciosubtipomovimiento">
              Precio del Subtipo *
            </label>
            <input
              type="number"
              id="preciosubtipomovimiento"
              className="form-input"
              placeholder="0.00"
              value={formData.preciosubtipomovimiento}
              onChange={(e) => handleFormChange('preciosubtipomovimiento', e.target.value)}
              min="0"
              step="0.01"
              disabled={isComprasInventario()}
            />
            {isComprasInventario() && (
              <small className="form-help">
                💡 El precio se establece automáticamente en $0 para compras de inventario
              </small>
            )}
          </div>
        </div>

        {/* Botones del formulario */}
        <div className="form-actions">
          {editingId ? (
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={handleUpdate}
              >
                🔄 Actualizar Subtipo
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                ❌ Cancelar Edición
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={handleCreate}
            >
              ➕ Crear Subtipo de Movimiento
            </button>
          )}
        </div>
      </div>

      {/* Sección de la tabla */}
      <div className="table-section">
        <h3 className="table-title">
          Subtipos de Movimiento Registrados ({subtipoMovimientos.length})
        </h3>
        
        {error && (
          <div className="error-message">
            ❌ {error}
            <button onClick={cargarDatos} className="btn-retry">
              🔄 Reintentar
            </button>
          </div>
        )}

        {subtipoMovimientos.length === 0 ? (
          <div className="no-data">
            📋 No hay subtipos de movimiento registrados
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre del Subtipo</th>
                  <th>Tipo de Movimiento</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {subtipoMovimientos.map((subtipo) => (
                  <tr key={subtipo.idsubtipomovimiento}>
                    <td className="text-center">
                      {subtipo.idsubtipomovimiento}
                    </td>
                    <td>
                      <strong>{subtipo.nombretiposubmovimiento}</strong>
                    </td>
                    <td>
                      <span className="tipo-badge">
                        {subtipo.nombretipomovimiento || 'N/A'}
                      </span>
                    </td>
                    <td className="text-right">
                      {formatPrice(subtipo.preciosubtipomovimiento)}
                    </td>
                    <td>
                      <div className="actions-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(subtipo)}
                          title="Editar subtipo de movimiento"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(subtipo.idsubtipomovimiento)}
                          title="Eliminar subtipo de movimiento"
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

      {/* Componente Toast para notificaciones */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ConfigSubtipoMovimiento;