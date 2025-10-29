// Componente ConfigUsuarios - Gestión de usuarios del sistema
import React, { useState, useEffect } from 'react';
import type {
  UsuarioSistema,
  CreateUsuarioSistemaData,
  UpdateUsuarioSistemaData,
  NegocioDropdown,
  RolDropdown,
  ScreenType
} from '../types';
import apiService from '../services/api';
import Toast from './Toast';
import { useAuth } from '../hooks/useAuth';
import '../styles/ConfigScreens.css';

interface Props {
  onNavigate: (screen: ScreenType) => void;
}

const ConfigUsuarios: React.FC<Props> = ({ onNavigate }) => {
  // Estados para gestión de datos
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [negocios, setNegocios] = useState<NegocioDropdown[]>([]);
  const [roles, setRoles] = useState<RolDropdown[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Estados para modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingUsuario, setEditingUsuario] = useState<UsuarioSistema | null>(null);
  
  // Estados para formulario
  const [formData, setFormData] = useState<CreateUsuarioSistemaData>({
    idNegocio: 0,
    idRol: 0,
    nombre: '',
    alias: '',
    password: '',
    telefono: '',
    cumple: new Date().toISOString().split('T')[0],
    frasepersonal: '',
    fotoine: '',
    fotopersona: '',
    fotoavatar: '',
    desempeno: 0,
    popularidad: 0,
    estatus: 1,
    usuarioauditoria: ''
  });
  
  // Estados para manejo de archivos
  const [imagePreview, setImagePreview] = useState<{
    fotoine?: string;
    fotopersona?: string; 
    fotoavatar?: string;
  }>({});
  
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
  
  // Hook de autenticación
  const { user: currentUser } = useAuth();

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Función para cargar todos los datos necesarios
  const loadInitialData = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('📊 Cargando datos iniciales para ConfigUsuarios...');
      
      // Cargar usuarios, negocios y roles en paralelo
      const [usuariosResponse, negociosResponse, rolesResponse] = await Promise.all([
        apiService.getUsuarios(),
        apiService.getNegociosDropdown(),
        apiService.getRolesDropdown()
      ]);
      
      if (usuariosResponse.success && usuariosResponse.data) {
        setUsuarios(usuariosResponse.data);
        console.log(`✅ Cargados ${usuariosResponse.data.length} usuarios`);
      }
      
      if (negociosResponse.success && negociosResponse.data) {
        setNegocios(negociosResponse.data);
        console.log(`✅ Cargados ${negociosResponse.data.length} negocios`);
      }
      
      if (rolesResponse.success && rolesResponse.data) {
        setRoles(rolesResponse.data);
        console.log(`✅ Cargados ${rolesResponse.data.length} roles`);
      }
      
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
      showToast('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar toast
  const showToast = (message: string, type: 'success' | 'error'): void => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  // Función para ocultar toast
  const hideToast = (): void => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Función para abrir modal de creación
  const handleCreate = (): void => {
    console.log('➕ Abriendo modal para crear usuario');
    setModalMode('create');
    setEditingUsuario(null);
    setFormData({
      idNegocio: negocios.length > 0 ? negocios[0].idNegocio : 0,
      idRol: roles.length > 0 ? roles[0].idRol : 0,
      nombre: '',
      alias: '',
      password: '',
      telefono: '',
      cumple: new Date().toISOString().split('T')[0],
      frasepersonal: '',
      fotoine: '',
      fotopersona: '',
      fotoavatar: '',
      desempeno: 0,
      popularidad: 0,
      estatus: 1,
      usuarioauditoria: currentUser?.alias || 'system'
    });
    setImagePreview({});
    setIsModalOpen(true);
  };

  // Función para abrir modal de edición
  const handleEdit = (usuario: UsuarioSistema): void => {
    console.log('✏️ Abriendo modal para editar usuario:', usuario.nombre);
    setModalMode('edit');
    setEditingUsuario(usuario);
    setFormData({
      idNegocio: usuario.idNegocio,
      idRol: usuario.idRol,
      nombre: usuario.nombre,
      alias: usuario.alias,
      password: '', // No mostrar password actual
      telefono: usuario.telefono,
      cumple: typeof usuario.cumple === 'string' ? usuario.cumple : usuario.cumple.toISOString().split('T')[0],
      frasepersonal: usuario.frasepersonal,
      fotoine: usuario.fotoine || '',
      fotopersona: usuario.fotopersona || '',
      fotoavatar: usuario.fotoavatar || '',
      desempeno: usuario.desempeno,
      popularidad: usuario.popularidad,
      estatus: usuario.estatus,
      usuarioauditoria: currentUser?.alias || 'system'
    });
    
    // Configurar previsualizaciones de imágenes
    setImagePreview({
      fotoine: usuario.fotoine ? `data:image/jpeg;base64,${usuario.fotoine}` : undefined,
      fotopersona: usuario.fotopersona ? `data:image/jpeg;base64,${usuario.fotopersona}` : undefined,
      fotoavatar: usuario.fotoavatar ? `data:image/jpeg;base64,${usuario.fotoavatar}` : undefined
    });
    
    setIsModalOpen(true);
  };

  // Función para cerrar modal
  const handleCloseModal = (): void => {
    console.log('❌ Cerrando modal de usuario');
    setIsModalOpen(false);
    setEditingUsuario(null);
    setImagePreview({});
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'idNegocio' || name === 'idRol' || name === 'estatus' || name === 'desempeno' || name === 'popularidad'
        ? Number(value)
        : value
    }));
  };

  // Función para manejar cambio de archivo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'fotoine' | 'fotopersona' | 'fotoavatar'): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido', 'error');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('El archivo es muy grande. Máximo 5MB permitido', 'error');
      return;
    }

    try {
      // Convertir a base64
      const base64 = await fileToBase64(file);
      const base64Data = base64.split(',')[1]; // Remover el prefijo data:image/...;base64,
      
      setFormData(prev => ({
        ...prev,
        [fieldName]: base64Data
      }));
      
      setImagePreview(prev => ({
        ...prev,
        [fieldName]: base64
      }));
      
      console.log(`📷 Imagen ${fieldName} cargada correctamente`);
      
    } catch (error) {
      console.error(`❌ Error cargando imagen ${fieldName}:`, error);
      showToast('Error al cargar la imagen', 'error');
    }
  };

  // Función para convertir archivo a base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      console.log(`💾 ${modalMode === 'create' ? 'Creando' : 'Actualizando'} usuario...`);
      
      if (modalMode === 'create') {
        // Validar campos requeridos para creación
        if (!formData.nombre || !formData.alias || !formData.password || !formData.telefono || !formData.idNegocio || !formData.idRol) {
          showToast('Por favor completa todos los campos requeridos', 'error');
          return;
        }
        
        const response = await apiService.createUsuario(formData);
        
        if (response.success) {
          console.log('✅ Usuario creado exitosamente');
          showToast('Usuario creado exitosamente', 'success');
          await loadInitialData(); // Recargar datos
          handleCloseModal();
        } else {
          showToast(response.message || 'Error al crear usuario', 'error');
        }
        
      } else if (editingUsuario) {
        // Actualizar usuario existente
        const updateData: UpdateUsuarioSistemaData = { ...formData };
        
        // Si no se cambió la password, no la incluyas
        if (!formData.password) {
          delete updateData.password;
        }
        
        const response = await apiService.updateUsuario(editingUsuario.idUsuario, updateData);
        
        if (response.success) {
          console.log('✅ Usuario actualizado exitosamente');
          showToast('Usuario actualizado exitosamente', 'success');
          await loadInitialData(); // Recargar datos
          handleCloseModal();
        } else {
          showToast(response.message || 'Error al actualizar usuario', 'error');
        }
      }
      
    } catch (error) {
      console.error('❌ Error en submit:', error);
      showToast('Error interno del servidor', 'error');
    }
  };

  // Función para eliminar usuario
  const handleDelete = async (usuario: UsuarioSistema): Promise<void> => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${usuario.nombre}"?`)) {
      return;
    }
    
    try {
      console.log('🗑️ Eliminando usuario:', usuario.nombre);
      
      const response = await apiService.deleteUsuario(usuario.idUsuario);
      
      if (response.success) {
        console.log('✅ Usuario eliminado exitosamente');
        showToast('Usuario eliminado exitosamente', 'success');
        await loadInitialData(); // Recargar datos
      } else {
        showToast(response.message || 'Error al eliminar usuario', 'error');
      }
      
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      showToast('Error interno del servidor', 'error');
    }
  };

  // Función para generar estrellas de rating
  const renderStars = (rating: number, fieldName: 'desempeno' | 'popularidad'): React.ReactElement => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= fullStars ? 'star-filled' : (i === fullStars + 1 && hasHalfStar ? 'star-half' : 'star-empty')}`}
          onClick={() => handleRatingChange(fieldName, i)}
          style={{ cursor: 'pointer', fontSize: '20px', color: i <= rating ? '#FFD700' : '#DDD' }}
        >
          ★
        </span>
      );
    }
    
    return <div className="star-rating">{stars}</div>;
  };

  // Función para manejar cambio de rating
  const handleRatingChange = (fieldName: 'desempeno' | 'popularidad', rating: number): void => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: rating
    }));
  };

  // Función para obtener el nombre del negocio
  const getNombreNegocio = (idNegocio: number): string => {
    const negocio = negocios.find(n => n.idNegocio === idNegocio);
    return negocio?.nombreNegocio || 'N/A';
  };

  // Función para obtener el nombre del rol
  const getNombreRol = (idRol: number): string => {
    const rol = roles.find(r => r.idRol === idRol);
    return rol?.nombreRol || 'N/A';
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="config-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="config-container">
      {/* Header */}
      <div className="usuarios-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-back" onClick={() => onNavigate('tablero-inicial')}>
            ← Regresar
          </button>
          <h1 className="usuarios-title">
            👥 Gestión de Usuarios
          </h1>
        </div>
        
        <button className="btn-add-usuario" onClick={handleCreate}>
          ✨ Agregar Usuario
        </button>
      </div>

      {/* Lista de usuarios */}
      <div className="config-content">
        {usuarios.length === 0 ? (
          <div className="empty-state">
            <p>No hay usuarios registrados</p>
            <button className="btn-primary" onClick={handleCreate}>
              Crear primer usuario
            </button>
          </div>
        ) : (
          <div className="config-content">
            {usuarios.map((usuario) => (
              <div key={usuario.idUsuario} className="user-card">
                <div className="user-header-card">
                  <h3 className="user-nombre">{usuario.nombre}</h3>
                  <span className={`user-status ${usuario.estatus === 1 ? 'status-activo' : 'status-inactivo'}`}>
                    {usuario.estatus === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="user-details">
                  <div className="detail-item">
                    <span className="detail-label">Alias</span>
                    <span className="detail-value">@{usuario.alias}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Rol</span>
                    <span className="detail-value">{usuario.nombreRol || getNombreRol(usuario.idRol)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Negocio</span>
                    <span className="detail-value">{usuario.nombreNegocio || getNombreNegocio(usuario.idNegocio)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Teléfono</span>
                    <span className="detail-value">{usuario.telefono || 'No especificado'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Desempeño</span>
                    <div className="star-rating">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`star ${i < usuario.desempeno ? '' : 'empty'}`}>★</span>
                      ))}
                      <span style={{marginLeft: '0.5rem', fontSize: '0.875rem', color: '#6b7280'}}>
                        ({usuario.desempeno.toFixed(1)})
                      </span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Popularidad</span>
                    <div className="star-rating">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`star ${i < usuario.popularidad ? '' : 'empty'}`}>★</span>
                      ))}
                      <span style={{marginLeft: '0.5rem', fontSize: '0.875rem', color: '#6b7280'}}>
                        ({usuario.popularidad.toFixed(1)})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="user-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(usuario)}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(usuario)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' ? '➕ Nuevo Usuario' : '✏️ Editar Usuario'}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                {/* Información básica */}
                <div className="form-section">
                  <h3>📝 Información Básica</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre Completo *</label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                        placeholder="Nombre completo del usuario"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Alias/Usuario *</label>
                      <input
                        type="text"
                        name="alias"
                        value={formData.alias}
                        onChange={handleInputChange}
                        required
                        placeholder="Alias único del usuario"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Teléfono *</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        required
                        placeholder="Número de teléfono"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Fecha de Cumpleaños *</label>
                      <input
                        type="date"
                        name="cumple"
                        value={typeof formData.cumple === 'string' ? formData.cumple : formData.cumple.toISOString().split('T')[0]}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Contraseña {modalMode === 'create' ? '*' : '(dejar vacío para no cambiar)'}</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={modalMode === 'create'}
                      placeholder={modalMode === 'create' ? 'Contraseña del usuario' : 'Nueva contraseña (opcional)'}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Frase Personal</label>
                    <textarea
                      name="frasepersonal"
                      value={formData.frasepersonal}
                      onChange={handleInputChange}
                      placeholder="Frase motivacional o personal del usuario"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Asignaciones */}
                <div className="form-section">
                  <h3>🏢 Asignaciones</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Negocio *</label>
                      <select
                        name="idNegocio"
                        value={formData.idNegocio}
                        onChange={handleInputChange}
                        required
                      >
                        <option value={0}>Seleccionar negocio</option>
                        {negocios.map((negocio) => (
                          <option key={negocio.idNegocio} value={negocio.idNegocio}>
                            {negocio.nombreNegocio}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Rol *</label>
                      <select
                        name="idRol"
                        value={formData.idRol}
                        onChange={handleInputChange}
                        required
                      >
                        <option value={0}>Seleccionar rol</option>
                        {roles.map((rol) => (
                          <option key={rol.idRol} value={rol.idRol}>
                            {rol.nombreRol}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Estatus</label>
                    <select
                      name="estatus"
                      value={formData.estatus}
                      onChange={handleInputChange}
                    >
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  </div>
                </div>

                {/* Evaluaciones */}
                <div className="form-section">
                  <h3>⭐ Evaluaciones</h3>
                  
                  <div className="form-group">
                    <label>Desempeño (0-5 estrellas)</label>
                    <div className="rating-input">
                      {renderStars(formData.desempeno || 0, 'desempeno')}
                      <span className="rating-value">{(formData.desempeno || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Popularidad (0-5 estrellas)</label>
                    <div className="rating-input">
                      {renderStars(formData.popularidad || 0, 'popularidad')}
                      <span className="rating-value">{(formData.popularidad || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Imágenes */}
                <div className="form-section full-width">
                  <h3>📷 Imágenes</h3>
                  
                  <div className="image-uploads">
                    {/* Foto Avatar */}
                    <div className="image-upload-group">
                      <label>Foto Avatar</label>
                      <div className="image-upload-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'fotoavatar')}
                          className="file-input"
                          id="fotoavatar"
                        />
                        <label htmlFor="fotoavatar" className="file-input-label">
                          {imagePreview.fotoavatar ? (
                            <img src={imagePreview.fotoavatar} alt="Avatar preview" className="image-preview" />
                          ) : (
                            <div className="upload-placeholder">
                              <span>📷</span>
                              <span>Subir Avatar</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Foto Personal */}
                    <div className="image-upload-group">
                      <label>Foto Personal</label>
                      <div className="image-upload-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'fotopersona')}
                          className="file-input"
                          id="fotopersona"
                        />
                        <label htmlFor="fotopersona" className="file-input-label">
                          {imagePreview.fotopersona ? (
                            <img src={imagePreview.fotopersona} alt="Personal preview" className="image-preview" />
                          ) : (
                            <div className="upload-placeholder">
                              <span>👤</span>
                              <span>Subir Foto Personal</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Foto INE */}
                    <div className="image-upload-group">
                      <label>Foto INE</label>
                      <div className="image-upload-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'fotoine')}
                          className="file-input"
                          id="fotoine"
                        />
                        <label htmlFor="fotoine" className="file-input-label">
                          {imagePreview.fotoine ? (
                            <img src={imagePreview.fotoine} alt="INE preview" className="image-preview" />
                          ) : (
                            <div className="upload-placeholder">
                              <span>🆔</span>
                              <span>Subir INE</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {modalMode === 'create' ? '➕ Crear Usuario' : '💾 Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.isVisible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      
      {/* Estilos Completos (Copiados de ConfigDescuentos) */}
      <style>{`
        .config-container {
          padding: 1.5rem;
          background: #f8fafc;
          min-height: 100vh;
        }

        .usuarios-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: white;
          border-radius: 8px 8px 0 0;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .usuarios-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
        }

        .btn-add-usuario {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
        }

        .btn-add-usuario:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-back {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
          margin-right: 1rem;
        }

        .btn-back:hover {
          background: linear-gradient(135deg, #4f46e5, #4338ca);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(99, 102, 241, 0.4);
        }

        .config-content {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          padding: 1rem;
        }

        .user-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .user-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
        }

        .user-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .user-header-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .user-nombre {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .user-status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-activo {
          background: #dcfce7;
          color: #166534;
        }

        .status-inactivo {
          background: #fee2e2;
          color: #991b1b;
        }

        .user-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-value {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }

        .user-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .btn-edit {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-edit:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transform: translateY(-1px);
        }

        .btn-delete {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-delete:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-1px);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-row.full-width {
          grid-template-columns: 1fr;
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn-cancel {
          padding: 0.75rem 1.5rem;
          background: #f3f4f6;
          color: #374151;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
          color: #111827;
        }

        .btn-save {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
        }

        .btn-save:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-save:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .empty-state p {
          margin: 0;
        }

        .star-rating {
          display: flex;
          gap: 2px;
          align-items: center;
        }

        .star {
          font-size: 1rem;
          color: #fbbf24;
        }

        .star.empty {
          color: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default ConfigUsuarios;