// Componente ConfigProveedores - Gestión de Proveedores
import React, { useState, useEffect } from 'react';
import type { 
  ScreenType, 
  Proveedor, 
  CreateProveedorData, 
  UpdateProveedorData 
} from '../types';
import { useAuth } from '../hooks/useAuth';
import Toast from './Toast';
import '../styles/ConfigScreens.css';
import '../styles/FormStyles.css';

interface Props {
  onNavigate: (screen: ScreenType) => void;
}

const ConfigProveedores: React.FC<Props> = ({ onNavigate }) => {
  // Auth context
  const { user } = useAuth();

  // Estados del componente
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentProveedor, setCurrentProveedor] = useState<Proveedor | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Estados del formulario
  const [formData, setFormData] = useState<CreateProveedorData>({
    nombre: '',
    rfc: '',
    telefono: '',
    correo: '',
    direccion: '',
    banco: '',
    cuenta: '',
    activo: true,
    usuarioauditoria: user?.nombre || 'system',
    idnegocio: user?.idNegocio || 1
  });

  // Estados para toast
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Función para mostrar toast
  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Función para cargar proveedores
  const cargarProveedores = async () => {
    setIsLoading(true);
    try {
      console.log('🏪 Cargando proveedores...');
      const response = await fetch('http://localhost:4000/api/proveedores');
      
      if (!response.ok) {
        throw new Error('Error en la petición');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ Proveedores cargados:', data.data.length);
        setProveedores(data.data);
      } else {
        console.warn('⚠️ No se encontraron proveedores');
        setProveedores([]);
        showToastMessage('No se encontraron proveedores', 'info');
      }
    } catch (error) {
      console.error('❌ Error cargando proveedores:', error);
      showToastMessage('Error al cargar proveedores', 'error');
      setProveedores([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    cargarProveedores();
  }, []);

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      rfc: '',
      telefono: '',
      correo: '',
      direccion: '',
      banco: '',
      cuenta: '',
      activo: true,
      usuarioauditoria: user?.nombre || 'system',
      idnegocio: user?.idNegocio || 1
    });
    setCurrentProveedor(null);
    setIsEditing(false);
  };

  // Función para abrir modal de creación
  const abrirModalCreacion = () => {
    resetForm();
    setShowModal(true);
  };

  // Función para abrir modal de edición
  const abrirModalEdicion = (proveedor: Proveedor) => {
    setCurrentProveedor(proveedor);
    setFormData({
      nombre: proveedor.nombre,
      rfc: proveedor.rfc,
      telefono: proveedor.telefono,
      correo: proveedor.correo,
      direccion: proveedor.direccion,
      banco: proveedor.banco,
      cuenta: proveedor.cuenta,
      activo: proveedor.activo,
      usuarioauditoria: user?.nombre || 'system',
      idnegocio: user?.idNegocio || 1
    });
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para cerrar modal
  const cerrarModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Manejar campo booleano (switch)
    if (name === 'activo') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } 
    // Manejar campos de texto
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Función para crear proveedor
  const crearProveedor = async () => {
    try {
      setIsProcessing(true);
      console.log('🏪 Enviando datos del proveedor:', formData);

      const response = await fetch('http://localhost:4000/api/proveedores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          rfc: formData.rfc,
          telefono: formData.telefono,
          correo: formData.correo,
          direccion: formData.direccion,
          banco: formData.banco,
          cuenta: formData.cuenta,
          activo: formData.activo,
          usuarioauditoria: formData.usuarioauditoria,
          idnegocio: formData.idnegocio
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Proveedor creado exitosamente');
        showToastMessage(data.message, 'success');
        cerrarModal();
        await cargarProveedores();
      } else {
        console.error('❌ Error del servidor:', data.message);
        showToastMessage(data.message || 'Error al crear proveedor', 'error');
      }
    } catch (error) {
      console.error('❌ Error creando proveedor:', error);
      showToastMessage('Error de conexión al crear proveedor', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para actualizar proveedor
  const actualizarProveedor = async () => {
    if (!currentProveedor) return;

    try {
      setIsProcessing(true);
      console.log('🏪 Actualizando proveedor ID:', currentProveedor.id_proveedor);

      const updateData: UpdateProveedorData = {
        nombre: formData.nombre,
        rfc: formData.rfc,
        telefono: formData.telefono,
        correo: formData.correo,
        direccion: formData.direccion,
        banco: formData.banco,
        cuenta: formData.cuenta,
        activo: formData.activo,
        usuarioauditoria: formData.usuarioauditoria
      };

      const response = await fetch(`http://localhost:4000/api/proveedores/${currentProveedor.id_proveedor}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Proveedor actualizado exitosamente');
        showToastMessage(data.message, 'success');
        cerrarModal();
        await cargarProveedores();
      } else {
        console.error('❌ Error del servidor:', data.message);
        showToastMessage(data.message || 'Error al actualizar proveedor', 'error');
      }
    } catch (error) {
      console.error('❌ Error actualizando proveedor:', error);
      showToastMessage('Error de conexión al actualizar proveedor', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para eliminar proveedor
  const eliminarProveedor = async (proveedor: Proveedor) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el proveedor "${proveedor.nombre}"?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      console.log('🏪 Eliminando proveedor ID:', proveedor.id_proveedor);

      const response = await fetch(`http://localhost:4000/api/proveedores/${proveedor.id_proveedor}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Proveedor eliminado exitosamente');
        showToastMessage(data.message, 'success');
        await cargarProveedores();
      } else {
        console.error('❌ Error del servidor:', data.message);
        showToastMessage(data.message || 'Error al eliminar proveedor', 'error');
      }
    } catch (error) {
      console.error('❌ Error eliminando proveedor:', error);
      showToastMessage('Error de conexión al eliminar proveedor', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      await actualizarProveedor();
    } else {
      await crearProveedor();
    }
  };

  return (
    <div className="config-screen">
      {/* Header */}
      <div className="config-header">
        <div className="header-left">
          <button 
            onClick={() => onNavigate('tablero-inicial')}
            className="btn-back"
          >
            ← Regresar
          </button>
          <h1>🏪 Configuración de Proveedores</h1>
        </div>
        
        <div className="header-right">
          <button 
            onClick={abrirModalCreacion}
            className="btn-primary"
            disabled={isProcessing}
          >
            + Agregar Proveedor
          </button>
        </div>
      </div>

      {/* Lista de proveedores */}
      <div className="minicards-container">
        {isLoading && proveedores.length === 0 ? (
          <div className="loading-message">
            <p>⏳ Cargando proveedores...</p>
          </div>
        ) : proveedores.length === 0 ? (
          <div className="empty-message">
            <p>📝 No hay proveedores registrados</p>
            <p>Haz clic en "Agregar Proveedor" para comenzar</p>
          </div>
        ) : (
          proveedores.map((proveedor) => (
            <div key={proveedor.id_proveedor} className="minicard">
              <div className="minicard-header">
                <h3 className="minicard-title">🏪 {proveedor.nombre}</h3>
                <div className="minicard-actions">
                  <button 
                    onClick={() => abrirModalEdicion(proveedor)}
                    className="btn-edit"
                    disabled={isProcessing}
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => eliminarProveedor(proveedor)}
                    className="btn-delete"
                    disabled={isProcessing}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="minicard-content">
                <div className="field-row">
                  <span className="field-label">RFC:</span>
                  <span className="field-value">{proveedor.rfc}</span>
                </div>
                
                <div className="field-row">
                  <span className="field-label">Teléfono:</span>
                  <span className="field-value">{proveedor.telefono}</span>
                </div>
                
                <div className="field-row">
                  <span className="field-label">Correo:</span>
                  <span className="field-value">{proveedor.correo}</span>
                </div>
                
                <div className="field-row">
                  <span className="field-label">Banco:</span>
                  <span className="field-value">{proveedor.banco}</span>
                </div>
                
                <div className="field-row">
                  <span className="field-label">Cuenta:</span>
                  <span className="field-value">{proveedor.cuenta}</span>
                </div>
                
                <div className="field-row">
                  <span className="field-label">Estado:</span>
                  <span className={`status-badge ${proveedor.activo ? 'active' : 'inactive'}`}>
                    {proveedor.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de formulario */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditing ? '✏️ Editar Proveedor' : '➕ Nuevo Proveedor'}</h2>
              <button 
                onClick={cerrarModal}
                className="btn-close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-content">
                {/* Primera fila - Nombre y RFC */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre *</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      maxLength={150}
                      className="form-input"
                      placeholder="Nombre completo del proveedor"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="rfc">RFC *</label>
                    <input
                      type="text"
                      id="rfc"
                      name="rfc"
                      value={formData.rfc}
                      onChange={handleInputChange}
                      required
                      maxLength={20}
                      className="form-input"
                      placeholder="RFC del proveedor"
                    />
                  </div>
                </div>

                {/* Segunda fila - Teléfono y Correo */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono *</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                      maxLength={30}
                      className="form-input"
                      placeholder="Número de teléfono"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="correo">Correo Electrónico *</label>
                    <input
                      type="email"
                      id="correo"
                      name="correo"
                      value={formData.correo}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                      className="form-input"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                {/* Tercera fila - Dirección */}
                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="direccion">Dirección *</label>
                    <textarea
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      required
                      className="form-textarea"
                      placeholder="Dirección completa del proveedor"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Cuarta fila - Banco y Cuenta */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="banco">Banco *</label>
                    <input
                      type="text"
                      id="banco"
                      name="banco"
                      value={formData.banco}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                      className="form-input"
                      placeholder="Nombre del banco"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cuenta">Número de Cuenta *</label>
                    <input
                      type="text"
                      id="cuenta"
                      name="cuenta"
                      value={formData.cuenta}
                      onChange={handleInputChange}
                      required
                      maxLength={50}
                      className="form-input"
                      placeholder="Número de cuenta bancaria"
                    />
                  </div>
                </div>

                {/* Quinta fila - Estado Activo */}
                <div className="form-row">
                  <div className="form-group">
                    <div className="form-switch-container">
                      <label className="form-switch-label">Estado del Proveedor *</label>
                      <label className="form-switch">
                        <input
                          type="checkbox"
                          id="activo"
                          name="activo"
                          checked={formData.activo}
                          onChange={handleInputChange}
                        />
                        <span className="form-slider"></span>
                      </label>
                      <span className="form-switch-label">
                        {formData.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={cerrarModal}
                  className="btn-secondary"
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? '⏳ Procesando...' : (isEditing ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast de notificaciones */}
      {showToast && (
        <Toast 
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ConfigProveedores;