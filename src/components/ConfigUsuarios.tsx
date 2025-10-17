// src/components/ConfigUsuarios.tsx
// Componente para gestión de usuarios

import { useState, useEffect } from 'react'; // Importa hooks de React
import type { Usuario, CreateUsuarioData } from '../types'; // Importa tipos
import apiService from '../services/api'; // Importa servicio de API
import '../styles/ConfigScreens.css'; // Importa estilos

// Interfaz para las props del componente
interface ConfigUsuariosProps {
  onBack: () => void; // Función para regresar
}

// Componente de configuración de usuarios
const ConfigUsuarios: React.FC<ConfigUsuariosProps> = ({ onBack }) => {
  // Estado para la lista de usuarios
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  // Estado de carga
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Estado para mostrar formulario
  const [showForm, setShowForm] = useState<boolean>(false);
  
  // Estado para datos del formulario
  const [formData, setFormData] = useState<CreateUsuarioData>({
    idNegocio: 1,
    idRol: 1,
    nombre: '',
    usuario: '',
    password: '',
    email: '',
    usuarioAuditoria: 'admin'
  });

  // Estado para mensajes
  const [message, setMessage] = useState<string>('');

  // Efecto para cargar usuarios al montar
  useEffect(() => {
    loadUsuarios(); // Carga los usuarios
  }, []);

  // Función para cargar usuarios
  const loadUsuarios = async (): Promise<void> => {
    try {
      console.log('👥 Cargando usuarios...'); // Log de carga
      setIsLoading(true);
      
      const response = await apiService.getUsuarios();
      
      if (response.success && response.data) {
        setUsuarios(response.data);
        console.log(`✅ ${response.data.length} usuarios cargados`); // Log de éxito
      } else {
        setMessage('Error cargando usuarios');
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      setMessage('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para crear usuario
  const handleCreateUser = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      console.log('👤 Creando usuario...'); // Log de creación
      
      const response = await apiService.createUsuario(formData);
      
      if (response.success) {
        setMessage('Usuario creado exitosamente');
        setShowForm(false);
        setFormData({
          idNegocio: 1,
          idRol: 1,
          nombre: '',
          usuario: '',
          password: '',
          email: '',
          usuarioAuditoria: 'admin'
        });
        loadUsuarios(); // Recarga la lista
      } else {
        setMessage(response.message || 'Error creando usuario');
      }
    } catch (error) {
      console.error('❌ Error creando usuario:', error);
      setMessage('Error de conexión');
    }
  };

  return (
    <div className="config-screen">
      {/* Header */}
      <div className="config-header">
        <button className="back-button" onClick={onBack}>
          ← Regresar
        </button>
        <h1>Gestión de Usuarios</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Mensaje */}
      {message && (
        <div className="message">
          {message}
        </div>
      )}

      {/* Formulario de nuevo usuario */}
      {showForm && (
        <div className="form-modal">
          <div className="form-card card">
            <h2>Nuevo Usuario</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Usuario</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.usuario}
                  onChange={(e) => setFormData({...formData, usuario: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="data-table">
        {isLoading ? (
          <div className="loading">Cargando usuarios...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.idUsuario}>
                  <td>{usuario.idUsuario}</td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.usuario}</td>
                  <td>{usuario.email}</td>
                  <td>
                    <span className={`status ${usuario.estatus === 1 ? 'active' : 'inactive'}`}>
                      {usuario.estatus === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-small">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ConfigUsuarios;