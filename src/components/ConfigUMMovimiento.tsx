// src/components/ConfigUMMovimiento.tsx
// Componente para gestión de unidades de medida de compra

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { UMMovimiento, CreateUMMovimientoData, Usuario } from '../types'; // Importa tipos
import apiService from '../services/api'; // Importa servicio de API
import Toast from './Toast'; // Importa componente Toast
import '../styles/ConfigScreens.css'; // Importa estilos

// Interfaz para las props del componente
interface ConfigUMMovimientoProps {
  currentUser: Usuario | null; // Usuario actual logueado
  onBack?: () => void; // Función para regresar (opcional)
}

/**
 * Componente ConfigUMMovimiento
 * Gestiona la configuración de unidades de medida de compra con formularios y lista
 * @param currentUser Usuario actualmente logueado
 * @param onBack Función para regresar al HomeScreen
 */
const ConfigUMMovimiento: React.FC<ConfigUMMovimientoProps> = ({ currentUser, onBack }) => {
  // Estados del componente
  const [umMovimientos, setUmMovimientos] = useState<UMMovimiento[]>([]); // Lista de unidades de medida
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carga
  const [showForm, setShowForm] = useState<boolean>(false); // Control del formulario
  const [isEditing, setIsEditing] = useState<boolean>(false); // Control del modo edición
  const [editingId, setEditingId] = useState<number | null>(null); // ID de la UM siendo editada
  
  // Estado para el formulario de nueva unidad de medida
  const [formData, setFormData] = useState<CreateUMMovimientoData>({
    nombreUmCompra: '',
    valor: 0,
    umMatPrima: 'pza',
    valorConvertido: 0,
    usuario: currentUser?.usuario || 'admin'
  });

  // Estados para Toast
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState<boolean>(false);

  // Opciones válidas para umMatPrima
  const umMatPrimaOptions: Array<'Kl' | 'Lt' | 'gr' | 'ml' | 'pza'> = ['Kl', 'Lt', 'gr', 'ml', 'pza'];

  // Función para mostrar Toast
  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Función para cerrar Toast
  const closeToast = () => {
    setShowToast(false);
  };

  // Función para cargar unidades de medida desde la API
  const loadUMMovimientos = async (): Promise<void> => {
    try {
      console.log('📏 Cargando unidades de medida...'); // Log de carga
      const response = await apiService.getUMMovimientos();
      
      if (response.success && response.data) {
        setUmMovimientos(response.data);
        console.log(`✅ ${response.data.length} unidades de medida cargadas`); // Log de éxito
      } else {
        console.error('❌ Error cargando unidades de medida:', response.message);
        showToastMessage('Error cargando unidades de medida', 'error');
      }
    } catch (error) {
      console.error('❌ Error cargando unidades de medida:', error);
      showToastMessage('Error cargando unidades de medida', 'error');
    } finally {
      setIsLoading(false); // Finaliza la carga
    }
  };

  // Hook useEffect para cargar datos al montar el componente
  useEffect(() => {
    loadUMMovimientos(); // Carga las unidades de medida
  }, []);

  // Función para resetear el formulario
  const resetForm = (): void => {
    setFormData({
      nombreUmCompra: '',
      valor: 0,
      umMatPrima: 'pza',
      valorConvertido: 0,
      usuario: currentUser?.usuario || 'admin'
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Función para manejar cambios en los inputs del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    // Convertir valores numéricos
    if (name === 'valor' || name === 'valorConvertido') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
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
    if (!formData.nombreUmCompra.trim()) {
      showToastMessage('El nombre de la unidad de medida es requerido', 'error');
      return false;
    }

    if (formData.nombreUmCompra.length > 100) {
      showToastMessage('El nombre no puede exceder 100 caracteres', 'error');
      return false;
    }

    if (formData.valor <= 0) {
      showToastMessage('El valor debe ser mayor a 0', 'error');
      return false;
    }

    if (formData.valorConvertido <= 0) {
      showToastMessage('El valor convertido debe ser mayor a 0', 'error');
      return false;
    }

    if (!umMatPrimaOptions.includes(formData.umMatPrima)) {
      showToastMessage('Seleccione una unidad de materia prima válida', 'error');
      return false;
    }

    return true;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault(); // Previene el comportamiento por defecto del form
    
    if (!validateForm()) return; // Valida el formulario

    try {
      if (isEditing && editingId) {
        // Modo edición - actualizar unidad de medida existente
        console.log(`📏 Actualizando unidad de medida ID: ${editingId}`);
        const response = await apiService.updateUMMovimiento(editingId, formData);
        
        if (response.success) {
          showToastMessage('Unidad de medida actualizada exitosamente', 'success');
          await loadUMMovimientos(); // Recarga la lista
          setShowForm(false); // Oculta el formulario
          resetForm(); // Resetea el formulario
        } else {
          showToastMessage(response.message || 'Error actualizando unidad de medida', 'error');
        }
      } else {
        // Modo creación - crear nueva unidad de medida
        console.log('📏 Creando nueva unidad de medida');
        const response = await apiService.createUMMovimiento(formData);
        
        if (response.success) {
          showToastMessage('Unidad de medida creada exitosamente', 'success');
          await loadUMMovimientos(); // Recarga la lista
          setShowForm(false); // Oculta el formulario
          resetForm(); // Resetea el formulario
        } else {
          showToastMessage(response.message || 'Error creando unidad de medida', 'error');
        }
      }
    } catch (error) {
      console.error('❌ Error en operación:', error);
      showToastMessage('Error en la operación', 'error');
    }
  };

  // Función para editar una unidad de medida
  const handleEdit = (umMovimiento: UMMovimiento): void => {
    console.log(`📏 Editando unidad de medida ID: ${umMovimiento.idUmCompra}`);
    
    // Carga los datos en el formulario, convirtiendo valores a números
    setFormData({
      nombreUmCompra: umMovimiento.nombreUmCompra,
      valor: Number(umMovimiento.valor),
      umMatPrima: umMovimiento.umMatPrima,
      valorConvertido: Number(umMovimiento.valorConvertido),
      usuario: currentUser?.usuario || 'admin'
    });
    
    setIsEditing(true); // Activa modo edición
    setEditingId(umMovimiento.idUmCompra); // Establece el ID a editar
    setShowForm(true); // Muestra el formulario
  };

  // Función para cancelar la edición/creación
  const handleCancel = (): void => {
    setShowForm(false); // Oculta el formulario
    resetForm(); // Resetea el formulario
  };

  // Función para formatear fecha
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Renderizado del componente
  return (
    <div className="config-container">
      {/* Header de la sección */}
      <div className="config-header">
        <h2>📏 Configuración de Unidades de Medida de Compra</h2>
        <div className="config-header-buttons">
          {!showForm && (
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              ➕ Nueva Unidad de Medida
            </button>
          )}
          {onBack && (
            <button 
              className="btn-secondary"
              onClick={onBack}
            >
              ← Regresar
            </button>
          )}
        </div>
      </div>

      {/* Formulario para crear/editar unidad de medida */}
      {showForm && (
        <div className="config-form-section">
          <h3>{isEditing ? '✏️ Editar Unidad de Medida' : '➕ Nueva Unidad de Medida'}</h3>
          
          <form onSubmit={handleSubmit} className="config-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombreUmCompra">Nombre de la Unidad de Medida *</label>
                <input
                  type="text"
                  id="nombreUmCompra"
                  name="nombreUmCompra"
                  value={formData.nombreUmCompra}
                  onChange={handleInputChange}
                  placeholder="Ej: Kilogramo, Litro, Pieza..."
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="umMatPrima">Unidad de Materia Prima *</label>
                <select
                  id="umMatPrima"
                  name="umMatPrima"
                  value={formData.umMatPrima}
                  onChange={handleInputChange}
                  required
                >
                  {umMatPrimaOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="valor">Valor *</label>
                <input
                  type="number"
                  id="valor"
                  name="valor"
                  value={formData.valor}
                  onChange={handleInputChange}
                  step="0.001"
                  min="0.001"
                  placeholder="0.000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="valorConvertido">Valor Convertido *</label>
                <input
                  type="number"
                  id="valorConvertido"
                  name="valorConvertido"
                  value={formData.valorConvertido}
                  onChange={handleInputChange}
                  step="0.001"
                  min="0.001"
                  placeholder="0.000"
                  required
                />
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">
                {isEditing ? '💾 Actualizar' : '💾 Guardar'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de unidades de medida */}
      <div className="config-list-section">
        <h3>📋 Lista de Unidades de Medida</h3>
        
        {isLoading ? (
          <div className="loading-message">Cargando unidades de medida...</div>
        ) : umMovimientos.length === 0 ? (
          <div className="empty-message">No hay unidades de medida registradas</div>
        ) : (
          <div className="config-table-container">
            <table className="config-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Valor</th>
                  <th>Unidad Mat. Prima</th>
                  <th>Valor Convertido</th>
                  <th>Fecha Registro</th>
                  <th>Usuario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {umMovimientos.map((umMovimiento) => (
                  <tr key={umMovimiento.idUmCompra}>
                    <td>{umMovimiento.idUmCompra}</td>
                    <td>{umMovimiento.nombreUmCompra}</td>
                    <td>{Number(umMovimiento.valor).toFixed(3)}</td>
                    <td>
                      <span 
                        className="um-matprima-badge"
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          textAlign: 'center',
                          minWidth: '40px',
                          color: 'white',
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {umMovimiento.umMatPrima}
                      </span>
                    </td>
                    <td>{Number(umMovimiento.valorConvertido).toFixed(3)}</td>
                    <td>{formatDate(umMovimiento.fechaRegistro)}</td>
                    <td>{umMovimiento.usuario}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(umMovimiento)}
                        title="Editar unidad de medida"
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

export default ConfigUMMovimiento;