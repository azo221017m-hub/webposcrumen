// src/components/ConfigTipoMovimiento.tsx
// Componente para configuración de tipos de movimiento en POSWEBCrumen

import React, { useState, useEffect } from 'react'; // Hooks de React
import type { TipoMovimiento, CreateTipoMovimientoData, UpdateTipoMovimientoData } from '../types'; // Tipos definidos
import { getTipoMovimientos, createTipoMovimiento, updateTipoMovimiento, deleteTipoMovimiento } from '../services/api'; // Servicios API
import Toast from './Toast'; // Componente de notificaciones
import '../styles/ConfigScreens.css'; // Estilos del componente

// Opciones para el dropdown de categorías de tipo de movimiento
const CATEGORIAS_TIPO_MOVIMIENTO = [
  { value: 'Gastos de operación', label: 'Gastos de operación' },
  { value: 'Gastos financieros', label: 'Gastos financieros' },
  { value: 'Gastos extraordinarios', label: 'Gastos extraordinarios' },
  { value: 'Compras de inventario', label: 'Compras de inventario' },
  { value: 'Compras de activos fijos', label: 'Compras de activos fijos' },
  { value: 'Compras de servicios', label: 'Compras de servicios' },
  { value: 'Compras administrativas', label: 'Compras administrativas' },
  { value: 'Compras extraordinarias / inversión', label: 'Compras extraordinarias / inversión' }
];

/**
 * Componente ConfigTipoMovimiento
 * Permite mostrar, crear, editar y eliminar tipos de movimiento
 */
const ConfigTipoMovimiento: React.FC = () => {
  // Estados para el manejo de datos y UI
  const [tipoMovimientos, setTipoMovimientos] = useState<TipoMovimiento[]>([]); // Lista de tipos de movimiento
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga
  const [showForm, setShowForm] = useState<boolean>(false); // Control del formulario
  const [editingTipoMovimiento, setEditingTipoMovimiento] = useState<TipoMovimiento | null>(null); // Tipo en edición
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null); // Notificación

  // Estados del formulario
  const [formData, setFormData] = useState<CreateTipoMovimientoData>({
    nombretipomovimiento: '',
    categoriatipomovimiento: 'Gastos de operación' // Valor por defecto
  });

  // Efecto para cargar tipos de movimiento al montar el componente
  useEffect(() => {
    loadTipoMovimientos();
  }, []);

  /**
   * Carga todos los tipos de movimiento desde la API
   */
  const loadTipoMovimientos = async (): Promise<void> => {
    try {
      setLoading(true); // Inicia el estado de carga
      console.log('📋 Cargando tipos de movimiento...');
      
      const response = await getTipoMovimientos(); // Llama a la API
      
      if (response.success && response.data) {
        setTipoMovimientos(response.data); // Actualiza el estado
        console.log(`✅ ${response.data.length} tipos de movimiento cargados`);
      } else {
        throw new Error(response.message || 'Error al cargar tipos de movimiento');
      }
    } catch (error) {
      console.error('❌ Error al cargar tipos de movimiento:', error);
      showToast('Error al cargar los tipos de movimiento', 'error');
    } finally {
      setLoading(false); // Finaliza el estado de carga
    }
  };

  /**
   * Muestra una notificación toast
   */
  const showToast = (message: string, type: 'success' | 'error'): void => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000); // Auto-ocultar después de 5 segundos
  };

  /**
   * Maneja los cambios en los campos del formulario
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Abre el formulario para crear un nuevo tipo de movimiento
   */
  const handleAddNew = (): void => {
    setEditingTipoMovimiento(null); // Limpia la edición
    setFormData({
      nombretipomovimiento: '',
      categoriatipomovimiento: 'Gastos de operación'
    });
    setShowForm(true); // Muestra el formulario
  };

  /**
   * Abre el formulario para editar un tipo de movimiento existente
   */
  const handleEdit = (tipoMovimiento: TipoMovimiento): void => {
    setEditingTipoMovimiento(tipoMovimiento); // Establece el tipo en edición
    setFormData({
      nombretipomovimiento: tipoMovimiento.nombretipomovimiento,
      categoriatipomovimiento: tipoMovimiento.categoriatipomovimiento
    });
    setShowForm(true); // Muestra el formulario
  };

  /**
   * Cancela la edición y cierra el formulario
   */
  const handleCancel = (): void => {
    setShowForm(false); // Oculta el formulario
    setEditingTipoMovimiento(null); // Limpia la edición
  };

  /**
   * Guarda un tipo de movimiento (crear o actualizar)
   */
  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    // Validaciones básicas
    if (!formData.nombretipomovimiento.trim()) {
      showToast('El nombre del tipo de movimiento es obligatorio', 'error');
      return;
    }

    if (!formData.categoriatipomovimiento.trim()) {
      showToast('La categoría del tipo de movimiento es obligatoria', 'error');
      return;
    }

    // Verificar si ya existe un tipo de movimiento con el mismo nombre (solo al crear)
    if (!editingTipoMovimiento) {
      const exists = tipoMovimientos.some(tipo => 
        tipo.nombretipomovimiento.toLowerCase().trim() === formData.nombretipomovimiento.toLowerCase().trim()
      );
      if (exists) {
        showToast('Ya existe un tipo de movimiento con ese nombre', 'error');
        return;
      }
    }

    try {
      if (editingTipoMovimiento) {
        // Actualizar tipo de movimiento existente
        console.log(`🔄 Actualizando tipo de movimiento ID: ${editingTipoMovimiento.idtipomovimiento}`);
        
        const updateData: UpdateTipoMovimientoData = {
          nombretipomovimiento: formData.nombretipomovimiento,
          categoriatipomovimiento: formData.categoriatipomovimiento
        };
        
        const response = await updateTipoMovimiento(editingTipoMovimiento.idtipomovimiento, updateData);
        
        if (response.success) {
          showToast('Tipo de movimiento actualizado correctamente', 'success');
          setShowForm(false); // Oculta el formulario
          loadTipoMovimientos(); // Recarga la lista
        } else {
          throw new Error(response.message || 'Error al actualizar el tipo de movimiento');
        }
      } else {
        // Crear nuevo tipo de movimiento
        console.log('📦 Creando nuevo tipo de movimiento');
        
        const response = await createTipoMovimiento(formData);
        
        if (response.success) {
          showToast('Tipo de movimiento creado correctamente', 'success');
          setShowForm(false); // Oculta el formulario
          setEditingTipoMovimiento(null); // Limpia la edición
          // Reinicia el formulario
          setFormData({
            nombretipomovimiento: '',
            categoriatipomovimiento: 'Gastos de operación'
          });
          loadTipoMovimientos(); // Recarga la lista
        } else {
          throw new Error(response.message || 'Error al crear el tipo de movimiento');
        }
      }
    } catch (error) {
      console.error('❌ Error al guardar tipo de movimiento:', error);
      showToast(error instanceof Error ? error.message : 'Error al guardar el tipo de movimiento', 'error');
    }
  };

  /**
   * Elimina un tipo de movimiento
   */
  const handleDelete = async (tipoMovimiento: TipoMovimiento): Promise<void> => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el tipo de movimiento "${tipoMovimiento.nombretipomovimiento}"?`)) {
      return; // Cancela si el usuario no confirma
    }

    try {
      console.log(`🗑️ Eliminando tipo de movimiento ID: ${tipoMovimiento.idtipomovimiento}`);
      
      const response = await deleteTipoMovimiento(tipoMovimiento.idtipomovimiento);
      
      if (response.success) {
        showToast('Tipo de movimiento eliminado correctamente', 'success');
        loadTipoMovimientos(); // Recarga la lista
      } else {
        throw new Error(response.message || 'Error al eliminar el tipo de movimiento');
      }
    } catch (error) {
      console.error('❌ Error al eliminar tipo de movimiento:', error);
      showToast(error instanceof Error ? error.message : 'Error al eliminar el tipo de movimiento', 'error');
    }
  };

  /**
   * Navega de regreso al tablero inicial
   */
  const handleGoBack = (): void => {
    // Dispara un evento personalizado para regresar al tablero inicial
    const event = new CustomEvent('navigateToHome');
    window.dispatchEvent(event);
  };

  return (
    <div className="config-screen">
      {/* Header de la pantalla */}
      <div className="config-header">
        <div className="config-title-container">
          <h2 className="config-title">
            📊 Configuración de Tipos de Movimiento
          </h2>
          <p className="config-subtitle">
            Gestiona los tipos y categorías de movimientos financieros
          </p>
        </div>
        <div className="config-actions">
          <button 
            className="btn-back" 
            onClick={handleGoBack}
            title="Regresar al Tablero Inicial"
          >
            ← Regresar
          </button>
          <button 
            className="btn-primary" 
            onClick={handleAddNew}
            title="Agregar nuevo tipo de movimiento"
          >
            + Agregar Nuevo
          </button>
        </div>
      </div>

      {/* Formulario de creación/edición */}
      {showForm && (
        <div className="config-form-container">
          <form onSubmit={handleSave} className="config-form">
            <h3 className="form-title">
              {editingTipoMovimiento ? '✏️ Editar Tipo de Movimiento' : '➕ Nuevo Tipo de Movimiento'}
            </h3>
            
            <div className="form-grid">
              {/* Campo: Nombre */}
              <div className="form-group">
                <label htmlFor="nombretipomovimiento" className="form-label">
                  📝 Nombre del Tipo de Movimiento *
                </label>
                <input
                  type="text"
                  id="nombretipomovimiento"
                  name="nombretipomovimiento"
                  value={formData.nombretipomovimiento}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ej: Pago de servicios, Compra de materia prima"
                  required
                />
              </div>

              {/* Campo: Categoría */}
              <div className="form-group">
                <label htmlFor="categoriatipomovimiento" className="form-label">
                  📁 Categoría del Movimiento *
                </label>
                <select
                  id="categoriatipomovimiento"
                  name="categoriatipomovimiento"
                  value={formData.categoriatipomovimiento}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  {CATEGORIAS_TIPO_MOVIMIENTO.map(categoria => (
                    <option key={categoria.value} value={categoria.value}>
                      {categoria.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botones del formulario */}
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                ❌ Cancelar
              </button>
              <button type="submit" className="btn-save">
                💾 {editingTipoMovimiento ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de tipos de movimiento */}
      <div className="config-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Cargando tipos de movimiento...</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="config-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre del Tipo</th>
                  <th>Categoría</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tipoMovimientos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="no-data">
                      📭 No hay tipos de movimiento registrados
                    </td>
                  </tr>
                ) : (
                  tipoMovimientos.map((tipoMovimiento) => (
                    <tr key={tipoMovimiento.idtipomovimiento}>
                      <td>{tipoMovimiento.idtipomovimiento}</td>
                      <td className="text-bold">{tipoMovimiento.nombretipomovimiento}</td>
                      <td>
                        <span className="badge badge-info">{tipoMovimiento.categoriatipomovimiento}</span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(tipoMovimiento)}
                            title="Editar tipo de movimiento"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(tipoMovimiento)}
                            title="Eliminar tipo de movimiento"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumen de estadísticas */}
      <div className="config-stats">
        <div className="stat-card">
          <h4>📊 Total Tipos</h4>
          <p className="stat-value">{tipoMovimientos.length}</p>
        </div>
        <div className="stat-card">
          <h4>📁 Categorías Únicas</h4>
          <p className="stat-value">
            {new Set(tipoMovimientos.map(tipo => tipo.categoriatipomovimiento)).size}
          </p>
        </div>
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

export default ConfigTipoMovimiento;