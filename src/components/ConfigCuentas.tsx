// src/components/ConfigCuentas.tsx
// Componente para gestión de cuentas contables en POSWEBCrumen

import React, { useState, useEffect } from 'react'; // Importa React y hooks
import type { 
  TipoMovimiento, 
  CreateTipoMovimientoData, 
  NaturalezaMovimiento, 
  CategoriaCompra, 
  CategoriaGasto 
} from '../types'; // Importa tipos
import apiService from '../services/api'; // Importa servicio API
import Toast from './Toast'; // Importa componente Toast
import '../styles/ConfigScreens.css'; // Importa estilos

// Props del componente
interface ConfigCuentasProps {
  onBack?: () => void; // Función para volver atrás (opcional)
}

// Componente principal
const ConfigCuentas: React.FC<ConfigCuentasProps> = ({ onBack }) => {
  // Estados del componente
  const [cuentas, setCuentas] = useState<TipoMovimiento[]>([]); // Lista de cuentas contables
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carga
  const [showForm, setShowForm] = useState<boolean>(false); // Mostrar/ocultar formulario
  const [isEditing, setIsEditing] = useState<boolean>(false); // Modo edición
  const [editingId, setEditingId] = useState<number | null>(null); // ID de cuenta en edición

  // Estado del formulario
  const [formData, setFormData] = useState<CreateTipoMovimientoData>({
    nombrecuentacontable: '',
    naturalezacuentacontable: 'COMPRA',
    categoriacuentacontable: 'Inventario'
  });

  // Estados para el Toast
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Opciones para los dropdowns
  const naturalezaOptions: NaturalezaMovimiento[] = ['COMPRA', 'GASTO'];
  const categoriasCompra: CategoriaCompra[] = ['Inventario', 'activo fijo', 'servicios', 'administrativas', 'extraodinarias', 'inversión'];
  const categoriasGasto: CategoriaGasto[] = ['operación', 'financiero', 'extraorinario'];

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

  // Función para cargar las cuentas contables
  const loadCuentas = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('💳 Cargando cuentas contables...');
      const response = await apiService.getCuentas();
      
      if (response.success && response.data) {
        setCuentas(response.data);
        console.log(`✅ ${response.data.length} cuentas contables cargadas`);
      } else {
        console.error('❌ Error cargando cuentas contables:', response.message);
        showToastMessage('Error cargando cuentas contables', 'error');
      }
    } catch (error) {
      console.error('❌ Error cargando cuentas contables:', error);
      showToastMessage('Error cargando cuentas contables', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Hook useEffect para cargar datos al montar el componente
  useEffect(() => {
    loadCuentas();
  }, []);

  // Función para resetear el formulario
  const resetForm = (): void => {
    setFormData({
      nombrecuentacontable: '',
      naturalezacuentacontable: 'COMPRA',
      categoriacuentacontable: 'Inventario'
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Función para manejar cambios en los inputs del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    if (name === 'naturalezacuentacontable') {
      // Cuando cambia la naturaleza, resetear la categoría al primer valor válido
      const nuevaNaturaleza = value as NaturalezaMovimiento;
      const nuevaCategoria = nuevaNaturaleza === 'COMPRA' ? categoriasCompra[0] : categoriasGasto[0];
      
      setFormData(prev => ({
        ...prev,
        naturalezacuentacontable: nuevaNaturaleza,
        categoriacuentacontable: nuevaCategoria
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Función para validar el formulario
  const validateForm = (): boolean => {
    if (!formData.nombrecuentacontable.trim()) {
      showToastMessage('El nombre de la cuenta contable es requerido', 'error');
      return false;
    }

    if (formData.nombrecuentacontable.length > 100) {
      showToastMessage('El nombre no puede exceder 100 caracteres', 'error');
      return false;
    }

    if (!naturalezaOptions.includes(formData.naturalezacuentacontable)) {
      showToastMessage('Seleccione una naturaleza de movimiento válida', 'error');
      return false;
    }

    // Validar categoría según naturaleza
    if (formData.naturalezacuentacontable === 'COMPRA') {
      if (!categoriasCompra.includes(formData.categoriacuentacontable as CategoriaCompra)) {
        showToastMessage('Seleccione una categoría válida para COMPRA', 'error');
        return false;
      }
    } else if (formData.naturalezacuentacontable === 'GASTO') {
      if (!categoriasGasto.includes(formData.categoriacuentacontable as CategoriaGasto)) {
        showToastMessage('Seleccione una categoría válida para GASTO', 'error');
        return false;
      }
    }

    return true;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (isEditing && editingId) {
        // Modo edición - actualizar cuenta contable existente
        console.log(`💳 Actualizando cuenta contable ID: ${editingId}`);
        const response = await apiService.updateCuenta(editingId, formData);
        
        if (response.success) {
          showToastMessage('Cuenta contable actualizada exitosamente', 'success');
          await loadCuentas();
          setShowForm(false);
          resetForm();
        } else {
          showToastMessage(response.message || 'Error actualizando cuenta contable', 'error');
        }
      } else {
        // Modo creación - crear nueva cuenta contable
        console.log('💳 Creando nueva cuenta contable');
        const response = await apiService.createCuenta(formData);
        
        if (response.success) {
          showToastMessage('Cuenta contable creada exitosamente', 'success');
          await loadCuentas();
          setShowForm(false);
          resetForm();
        } else {
          showToastMessage(response.message || 'Error creando cuenta contable', 'error');
        }
      }
    } catch (error) {
      console.error('❌ Error en operación:', error);
      showToastMessage('Error en la operación', 'error');
    }
  };

  // Función para editar una cuenta contable
  const handleEdit = (cuenta: TipoMovimiento): void => {
    console.log(`💳 Editando cuenta contable ID: ${cuenta.idcuentacontable}`);
    
    setFormData({
      nombrecuentacontable: cuenta.nombrecuentacontable,
      naturalezacuentacontable: cuenta.naturalezacuentacontable,
      categoriacuentacontable: cuenta.categoriacuentacontable
    });
    
    setIsEditing(true);
    setEditingId(cuenta.idcuentacontable);
    setShowForm(true);
  };

  // Función para cancelar la edición/creación
  const handleCancel = (): void => {
    setShowForm(false);
    resetForm();
  };

  // Obtener opciones de categoría según naturaleza actual
  const getCategoriaOptions = (): (CategoriaCompra | CategoriaGasto)[] => {
    return formData.naturalezacuentacontable === 'COMPRA' ? categoriasCompra : categoriasGasto;
  };

  // Función para obtener badge de naturaleza
  const getNaturalezaBadge = (naturaleza: NaturalezaMovimiento) => {
    const color = naturaleza === 'COMPRA' ? '#10b981' : '#f59e0b';
    return (
      <span 
        style={{
          display: 'inline-block',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.375rem',
          fontSize: '0.8rem',
          fontWeight: '600',
          textAlign: 'center',
          minWidth: '60px',
          color: 'white',
          backgroundColor: color,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease'
        }}
      >
        {naturaleza}
      </span>
    );
  };

  // Renderizado del componente
  return (
    <div className="config-container">
      {/* Header de la sección */}
      <div className="config-header">
        <h2>💳 Configuración de Cuentas Contables</h2>
        <div className="config-header-buttons">
          {!showForm && (
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              ➕ Nueva Cuenta Contable
            </button>
          )}
          {onBack && (
            <button 
              className="btn-secondary"
              onClick={onBack}
            >
              ⬅️ Volver
            </button>
          )}
        </div>
      </div>

      {/* Formulario para crear/editar cuenta contable */}
      {showForm && (
        <div className="config-form-section">
          <h3>{isEditing ? '✏️ Editar Cuenta Contable' : '➕ Nueva Cuenta Contable'}</h3>
          
          <form onSubmit={handleSubmit} className="config-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombrecuentacontable">Nombre de la Cuenta Contable *</label>
                <input
                  type="text"
                  id="nombrecuentacontable"
                  name="nombrecuentacontable"
                  value={formData.nombrecuentacontable}
                  onChange={handleInputChange}
                  placeholder="Ingrese el nombre de la cuenta contable"
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="naturalezacuentacontable">Naturaleza *</label>
                <select
                  id="naturalezacuentacontable"
                  name="naturalezacuentacontable"
                  value={formData.naturalezacuentacontable}
                  onChange={handleInputChange}
                  required
                >
                  {naturalezaOptions.map(naturaleza => (
                    <option key={naturaleza} value={naturaleza}>
                      {naturaleza}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="categoriacuentacontable">Categoría *</label>
                <select
                  id="categoriacuentacontable"
                  name="categoriacuentacontable"
                  value={formData.categoriacuentacontable}
                  onChange={handleInputChange}
                  required
                >
                  {getCategoriaOptions().map(categoria => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {isEditing ? '💾 Actualizar' : '➕ Crear'} Cuenta Contable
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de cuentas contables */}
      <div className="config-list-section">
        <h3>📋 Lista de Cuentas Contables</h3>
        
        {isLoading ? (
          <div className="loading-message">Cargando cuentas contables...</div>
        ) : cuentas.length === 0 ? (
          <div className="empty-message">No hay cuentas contables registradas</div>
        ) : (
          <div className="config-table-container">
            <table className="config-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Naturaleza</th>
                  <th>Categoría</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cuentas.map((cuenta) => (
                  <tr key={cuenta.idcuentacontable}>
                    <td>{cuenta.idcuentacontable}</td>
                    <td>{cuenta.nombrecuentacontable}</td>
                    <td>{getNaturalezaBadge(cuenta.naturalezacuentacontable)}</td>
                    <td>
                      <span className="categoria-text">
                        {cuenta.categoriacuentacontable}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(cuenta)}
                        title="Editar cuenta contable"
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

export default ConfigCuentas;