// src/components/ConfigProveedores.tsx
// Componente para gestión de proveedores con funciones CRUD

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { Proveedor, Usuario, CreateProveedorData } from '../types'; // Importa tipos
import apiService from '../services/api'; // Importa servicio de API
import Toast from './Toast'; // Importa componente Toast
import '../styles/ConfigScreens.css'; // Importa estilos

// Tipo específico para el formulario que garantiza que todos los campos tienen valores
interface ProveedorFormData {
  nombre: string;
  rfc: string;
  telefono: string;
  correo: string;
  direccion: string;
  banco: string;
  cuenta: string;
  activo: number;
}

// Interfaz para las props del componente
interface ConfigProveedoresProps {
  currentUser: Usuario; // Usuario actual logueado
  onBack?: () => void; // Función para regresar al TableroInicial
}

/**
 * Componente ConfigProveedores
 * Gestiona la configuración de proveedores con formularios y lista
 * @param currentUser Usuario actualmente logueado
 * @param onBack Función para regresar al TableroInicial
 */
const ConfigProveedores: React.FC<ConfigProveedoresProps> = ({ currentUser: _currentUser, onBack }) => {
  // Estados del componente
  const [proveedores, setProveedores] = useState<Proveedor[]>([]); // Lista de proveedores
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga
  const [showForm, setShowForm] = useState<boolean>(false); // Mostrar/ocultar formulario
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null); // Proveedor en edición
  const [submitting, setSubmitting] = useState<boolean>(false); // Estado de envío

  // Estados para el formulario - asegurándonos de que todos los campos opcionales tengan valores por defecto
  const [formData, setFormData] = useState<ProveedorFormData>({
    nombre: '',
    rfc: '', // Valor por defecto para evitar undefined
    telefono: '', // Valor por defecto para evitar undefined
    correo: '', // Valor por defecto para evitar undefined
    direccion: '', // Valor por defecto para evitar undefined
    banco: '', // Valor por defecto para evitar undefined
    cuenta: '', // Valor por defecto para evitar undefined
    activo: 1
  });

  // Estados para Toast
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isVisible: false,
    message: '',
    type: 'success'
  });

  // Función para mostrar toast
  const showToast = (message: string, type: 'success' | 'error' = 'success'): void => {
    setToast({ isVisible: true, message, type });
  };

  // Función para ocultar toast
  const hideToast = (): void => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Efecto para cargar proveedores al montar el componente
  useEffect(() => {
    loadProveedores();
  }, []);

  // Función para cargar la lista de proveedores
  const loadProveedores = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('🏪 Cargando proveedores...');
      
      const response = await apiService.getProveedores();
      
      if (response.success && response.data) {
        setProveedores(response.data);
        console.log('✅ Proveedores cargados:', response.data.length);
      } else {
        console.error('❌ Error al cargar proveedores:', response.message);
        showToast('Error al cargar proveedores', 'error');
      }
    } catch (error) {
      console.error('💥 Error al cargar proveedores:', error);
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'activo' ? parseInt(value) : value
    }));
  };

  // Función para manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Validación básica - solo el nombre es requerido
    if (!formData.nombre.trim()) {
      showToast('El nombre del proveedor es obligatorio', 'error');
      return;
    }

    try {
      setSubmitting(true);
      console.log('💾 Guardando proveedor...', formData);
      
      // Convertir datos del formulario al tipo correcto para la API
      const proveedorData: CreateProveedorData = {
        nombre: formData.nombre,
        rfc: formData.rfc || undefined,
        telefono: formData.telefono || undefined,
        correo: formData.correo || undefined,
        direccion: formData.direccion || undefined,
        banco: formData.banco || undefined,
        cuenta: formData.cuenta || undefined,
        activo: formData.activo
      };

      let response;
      if (editingProveedor) {
        // Actualizar proveedor existente
        response = await apiService.updateProveedor(editingProveedor.id, proveedorData);
      } else {
        // Crear nuevo proveedor
        response = await apiService.createProveedor(proveedorData);
      }
      
      if (response.success) {
        showToast(
          editingProveedor 
            ? 'Proveedor actualizado correctamente' 
            : 'Proveedor creado correctamente'
        );
        
        // Limpiar formulario y recargar lista
        resetForm();
        await loadProveedores();
      } else {
        console.error('❌ Error al guardar proveedor:', response.message);
        showToast(response.message || 'Error al guardar proveedor', 'error');
      }
    } catch (error) {
      console.error('💥 Error al guardar proveedor:', error);
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Función para editar proveedor
  const handleEdit = (proveedor: Proveedor): void => {
    console.log('✏️ Editando proveedor:', proveedor.nombre);
    setEditingProveedor(proveedor);
    setFormData({
      nombre: proveedor.nombre,
      rfc: proveedor.rfc ?? '', // Usar valor por defecto si es undefined
      telefono: proveedor.telefono ?? '', // Usar valor por defecto si es undefined
      correo: proveedor.correo ?? '', // Usar valor por defecto si es undefined
      direccion: proveedor.direccion ?? '', // Usar valor por defecto si es undefined
      banco: proveedor.banco ?? '', // Usar valor por defecto si es undefined
      cuenta: proveedor.cuenta ?? '', // Usar valor por defecto si es undefined
      activo: proveedor.activo
    });
    setShowForm(true);
  };

  // Función para eliminar proveedor
  const handleDelete = async (id: number, nombre: string): Promise<void> => {
    if (!window.confirm(`¿Estás seguro de eliminar el proveedor "${nombre}"?`)) {
      return;
    }

    try {
      console.log('🗑️ Eliminando proveedor ID:', id);
      
      const response = await apiService.deleteProveedor(id);
      
      if (response.success) {
        showToast('Proveedor eliminado correctamente');
        await loadProveedores();
      } else {
        console.error('❌ Error al eliminar proveedor:', response.message);
        showToast(response.message || 'Error al eliminar proveedor', 'error');
      }
    } catch (error) {
      console.error('💥 Error al eliminar proveedor:', error);
      showToast('Error al conectar con el servidor', 'error');
    }
  };

  // Función para resetear el formulario
  const resetForm = (): void => {
    setFormData({
      nombre: '',
      rfc: '',
      telefono: '',
      correo: '',
      direccion: '',
      banco: '',
      cuenta: '',
      activo: 1
    });
    setEditingProveedor(null);
    setShowForm(false);
  };

  // Función para manejar cancelar
  const handleCancel = (): void => {
    resetForm();
  };

  return (
    <div className="config-screen">
      
      {/* Header de la pantalla */}
      <div className="config-header">
        <div className="header-left">
          {onBack && (
            <button 
              className="btn-secondary"
              onClick={onBack}
            >
              ← Regresar
            </button>
          )}
          <h1>🏪 Configuración de Proveedores</h1>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '📋 Ver Lista' : '➕ Nuevo Proveedor'}
        </button>
      </div>

      {/* Contenido principal */}
      <div className="config-content">
        
        {showForm ? (
          /* Formulario de proveedor */
          <div className="form-section">
            <h2>{editingProveedor ? '✏️ Editar Proveedor' : '➕ Nuevo Proveedor'}</h2>
            
            <form onSubmit={handleSubmit} className="config-form">
              
              {/* Fila 1: Nombre y RFC */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">
                    Nombre del Proveedor *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ingresa el nombre del proveedor"
                    required
                    maxLength={150}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="rfc">
                    RFC *
                  </label>
                  <input
                    type="text"
                    id="rfc"
                    name="rfc"
                    value={formData.rfc ?? ''}
                    onChange={handleInputChange}
                    placeholder="RFC del proveedor"
                    maxLength={20}
                  />
                </div>
              </div>

              {/* Fila 2: Teléfono y Correo */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="telefono">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono ?? ''}
                    onChange={handleInputChange}
                    placeholder="Teléfono del proveedor"
                    maxLength={30}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="correo">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="correo"
                    name="correo"
                    value={formData.correo ?? ''}
                    onChange={handleInputChange}
                    placeholder="correo@proveedor.com"
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Fila 3: Dirección */}
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="direccion">
                    Dirección
                  </label>
                  <textarea
                    id="direccion"
                    name="direccion"
                    value={formData.direccion ?? ''}
                    onChange={handleInputChange}
                    placeholder="Dirección completa del proveedor"
                    rows={3}
                  />
                </div>
              </div>

              {/* Fila 4: Banco y Cuenta */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="banco">
                    Banco
                  </label>
                  <input
                    type="text"
                    id="banco"
                    name="banco"
                    value={formData.banco ?? ''}
                    onChange={handleInputChange}
                    placeholder="Nombre del banco"
                    maxLength={100}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cuenta">
                    Número de Cuenta
                  </label>
                  <input
                    type="text"
                    id="cuenta"
                    name="cuenta"
                    value={formData.cuenta ?? ''}
                    onChange={handleInputChange}
                    placeholder="Número de cuenta bancaria"
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Fila 5: Estado */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="activo">
                    Estado
                  </label>
                  <select
                    id="activo"
                    name="activo"
                    value={formData.activo}
                    onChange={handleInputChange}
                  >
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Botones del formulario */}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  ❌ Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? '⏳ Guardando...' : (editingProveedor ? '💾 Actualizar' : '💾 Guardar')}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Lista de proveedores */
          <div className="table-section">
            <h2>📋 Lista de Proveedores</h2>
            
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Cargando proveedores...</p>
              </div>
            ) : proveedores.length === 0 ? (
              <div className="empty-state">
                <p>📭 No hay proveedores registrados</p>
                <button 
                  className="btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  ➕ Crear Primer Proveedor
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>RFC</th>
                      <th>Teléfono</th>
                      <th>Correo</th>
                      <th>Banco</th>
                      <th>Estado</th>
                      <th>Fecha Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proveedores.map((proveedor) => (
                      <tr key={proveedor.id}>
                        <td>{proveedor.id}</td>
                        <td className="font-weight-bold">{proveedor.nombre}</td>
                        <td>{proveedor.rfc || 'N/A'}</td>
                        <td>{proveedor.telefono || 'N/A'}</td>
                        <td>{proveedor.correo || 'N/A'}</td>
                        <td>{proveedor.banco || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${proveedor.activo ? 'active' : 'inactive'}`}>
                            {proveedor.activo ? '✅ Activo' : '❌ Inactivo'}
                          </span>
                        </td>
                        <td>{new Date(proveedor.created_at).toLocaleDateString('es-ES')}</td>
                        <td className="actions-cell">
                          <button
                            className="btn-action btn-edit"
                            onClick={() => handleEdit(proveedor)}
                            title="Editar proveedor"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(proveedor.id, proveedor.nombre)}
                            title="Eliminar proveedor"
                          >
                            🗑️
                          </button>
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

      {/* Componente Toast para notificaciones */}
      <Toast
        {...(toast as any)}
        onClose={hideToast}
      />
    </div>
  );
};

export default ConfigProveedores;