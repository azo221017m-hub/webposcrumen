// src/components/ConfigCategorias.tsx
// Componente para gestionar categorías de productos con diseño de minicards

import React, { useState, useEffect } from 'react';
import CategoriaImageUpload from './CategoriaImageUpload';
import axios from 'axios';

import type { ScreenType } from '../types';

// Estilos CSS inline para minicards y modal
const componentStyles = `
  .categorias-container {
    padding: 1.5rem;
    background: #fcf8faff;
    min-height: 100vh;
  }
  
  .categorias-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
  
  .categorias-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .btn-add-categoria {
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-add-categoria:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
  
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .categoria-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
    border: 1px solid #f072dfff;
    transition: all 0.3s ease;
    position: relative;
  }
  
  .categoria-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .card-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #2d3748;
    margin: 0;
    margin-bottom: 0.5rem;
  }
  
  .card-status {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .status-active {
    background: #c6f6d5;
    color: #22543d;
  }
  
  .status-inactive {
    background: #fed7d7;
    color: #742a2a;
  }
  
  .card-description {
    color: #718096;
    margin-bottom: 1rem;
    line-height: 1.5;
  }
  
  .card-image {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 1rem;
    background: #f7fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a0aec0;
    font-size: 0.9rem;
  }
  
  .card-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  
  .btn-card-action {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .btn-edit-card {
    background: #e6fffa;
    color: #234e52;
    border: 1px solid #b2f5ea;
  }
  
  .btn-edit-card:hover {
    background: #b2f5ea;
    transform: translateY(-2px);
  }
  
  .btn-delete-card {
    background: #fed7d7;
    color: #742a2a;
    border: 1px solid #feb2b2;
  }
  
  .btn-delete-card:hover {
    background: #feb2b2;
    transform: translateY(-2px);
  }
  
  .btn-regresar {
    padding: 0.75rem 1.5rem;
    background: #4a5568;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .btn-regresar:hover {
    background: #2d3748;
    transform: translateY(-2px);
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 0;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px 12px 0 0;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .btn-close {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-footer {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
  }
  
  .audit-info {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: #f9fafb;
    border-radius: 6px;
  }
  
  .audit-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    font-size: 0.875rem;
  }
`;

// Interfaz para las categorías según la tabla tblposcrumenwebcategorias
interface Categoria {
  idCategoria: number; // int(11) AI PK
  nombre: string; // varchar(100)
  imagencategoria?: string; // longblob (base64 string para display)
  descripcion?: string; // text
  estatus: number; // tinyint(1) - 1=activo, 0=inactivo
  fechaRegistroauditoria: string; // Fecha/hora de insert
  usuarioauditoria: string; // valor de usuario desde login
  fechamodificacionauditoria: string; // Fecha/hora de update
  idnegocio: number; // valor de usuario desde login
}

// Props del componente
interface ConfigCategoriasProps {
  onNavigate: (screen: ScreenType) => void;
}

const ConfigCategorias: React.FC<ConfigCategoriasProps> = ({ onNavigate }) => {
  // Estados del componente
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estatus: 1,
    imagencategoria: '' // Para almacenar la ruta de imagen
  });

  // Estado para el archivo de imagen seleccionado
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Utilidad para obtener la URL de la imagen (base64, dataURL, fallback)
  function getImageUrl(imagencategoria?: string): string {
    if (!imagencategoria || imagencategoria === 'null' || imagencategoria === 'undefined') {
      return '';
    }
    // Si es una ruta relativa (archivo físico)
    if (typeof imagencategoria === 'string' && imagencategoria.startsWith('/uploads/categorias/')) {
      // Asume que el backend sirve archivos estáticos desde /uploads
      return `http://localhost:4000${imagencategoria}`;
    }
    // Si ya tiene prefijo data:image
    if (typeof imagencategoria === 'string' && imagencategoria.startsWith('data:image')) {
      return imagencategoria;
    }
    // Si es base64 puro (legacy)
    if (typeof imagencategoria === 'string' && imagencategoria.length > 200 && /^[A-Za-z0-9+/=]+$/.test(imagencategoria)) {
      let mime = "image/png";
      if (imagencategoria.startsWith("/9j/")) mime = "image/jpeg";
      else if (imagencategoria.startsWith("R0lGOD")) mime = "image/gif";
      else if (imagencategoria.startsWith("iVBORw")) mime = "image/png";
      return `data:${mime};base64,${imagencategoria}`;
    }
    return '';
  }

  // Log de montaje del componente
  useEffect(() => {
    console.log('🏷️ ConfigCategorias montado'); // Log de montaje
    cargarCategorias();
    
    return () => {
      console.log('🏷️ ConfigCategorias desmontado'); // Log de desmontaje
    };
  }, []);

  // Función para cargar categorías desde el backend
  const cargarCategorias = async (): Promise<void> => {
    try {
      console.log('📊 Cargando categorías desde el backend'); // Log de carga
      setLoading(true);
      
      const response = await fetch('http://localhost:4000/api/categorias');
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${data.data.length} categorías cargadas`); // Log de éxito
        setCategorias(data.data);
      } else {
        console.error('❌ Error al cargar categorías:', data.message); // Log de error
        // Datos de ejemplo si falla la API (usando estructura correcta de BD)
        const categoriasEjemplo: Categoria[] = [
          {
            idCategoria: 1,
            nombre: 'Bebidas',
            descripcion: 'Bebidas frías y calientes',
            estatus: 1,
            fechaRegistroauditoria: new Date().toISOString(),
            fechamodificacionauditoria: new Date().toISOString(),
            usuarioauditoria: 'admin',
            idnegocio: 1
          },
          {
            idCategoria: 2,
            nombre: 'Comidas',
            descripcion: 'Platos principales y entradas',
            estatus: 1,
            fechaRegistroauditoria: new Date().toISOString(),
            fechamodificacionauditoria: new Date().toISOString(),
            usuarioauditoria: 'admin',
            idnegocio: 1
          },
          {
            idCategoria: 3,
            nombre: 'Postres',
            descripcion: 'Dulces y postres',
            estatus: 0, // Ejemplo de categoría inactiva
            fechaRegistroauditoria: new Date().toISOString(),
            fechamodificacionauditoria: new Date().toISOString(),
            usuarioauditoria: 'admin',
            idnegocio: 1
          }
        ];
        setCategorias(categoriasEjemplo);
      }
    } catch (error) {
      console.error('💥 Error al cargar categorías:', error); // Log de error
      // Datos de ejemplo en caso de error
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir modal de nueva categoría
  const abrirModalNuevo = (): void => {
    console.log('➕ Abriendo modal para nueva categoría'); // Log de acción
    setSelectedCategoria(null);
    setIsEditing(false);
    setFormData({
      nombre: '',
      descripcion: '',
      estatus: 1,
      imagencategoria: ''
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  // Función para abrir modal de edición
  const abrirModalEdicion = (categoria: Categoria): void => {
    console.log(`✏️ Abriendo modal para editar categoría ID: ${categoria.idCategoria}`); // Log de acción
    setSelectedCategoria(categoria);
    setIsEditing(true);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      estatus: categoria.estatus,
      imagencategoria: categoria.imagencategoria || ''
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  // Función para cerrar modal
  const cerrarModal = (): void => {
    console.log('❌ Cerrando modal de categoría'); // Log de acción
    setShowModal(false);
    setSelectedCategoria(null);
    setIsEditing(false);
    setFormData({
      nombre: '',
      descripcion: '',
      estatus: 1,
      imagencategoria: ''
    });
    setSelectedFile(null);
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  // Función para manejar cambios en la imagen (usada por CategoriaImageUpload)
  const handleImageChange = (file: File | null): void => {
    setSelectedFile(file);
  };

  // Función para guardar categoría
  const guardarCategoria = async (): Promise<void> => {
    try {
      console.log('💾 Guardando categoría:', formData); // Log de guardado
      if (!formData.nombre.trim()) {
        alert('El nombre de la categoría es requerido');
        return;
      }
      const url = isEditing 
        ? `http://localhost:4000/api/categorias/${selectedCategoria?.idCategoria}`
        : 'http://localhost:4000/api/categorias';
      let response;
      if (!isEditing) {
        // Crear FormData para POST (insertar)
        const form = new FormData();
        form.append('nombre', formData.nombre);
        form.append('descripcion', formData.descripcion);
        form.append('estatus', String(formData.estatus));
        form.append('usuarioauditoria', 'admin');
        form.append('idnegocio', '1');
        if (selectedFile) {
          form.append('imagencategoria', selectedFile);
        }
        response = await axios.post(url, form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // PUT: solo enviar datos si se modificó
        response = await axios.put(url, {
          ...formData,
          usuarioauditoria: 'admin',
          idnegocio: 1
        });
      }
      const data = response.data;
      if (data.success) {
        console.log('✅ Categoría guardada exitosamente'); // Log de éxito
        cerrarModal();
        cargarCategorias();
      } else {
        console.error('❌ Error al guardar categoría:', data.message); // Log de error
        alert('Error al guardar la categoría: ' + data.message);
      }
    } catch (error: any) {
      console.error('💥 Error al guardar categoría:', error); // Log de error
      alert('Error de conexión al guardar la categoría');
    }
  };

  // Función para eliminar categoría
  const eliminarCategoria = async (categoria: Categoria): Promise<void> => {
    try {
      console.log(`🗑️ Eliminando categoría ID: ${categoria.idCategoria}`); // Log de eliminación
      const response = await axios.delete(`http://localhost:4000/api/categorias/${categoria.idCategoria}`);
      const data = response.data;
      if (data.success) {
        console.log('✅ Categoría eliminada exitosamente'); // Log de éxito
        cargarCategorias(); // Recargar la lista
      } else {
        console.error('❌ Error al eliminar categoría:', data.message); // Log de error
        alert('Error al eliminar la categoría: ' + data.message);
      }
    } catch (error) {
      console.error('💥 Error al eliminar categoría:', error); // Log de error
      alert('Error de conexión al eliminar la categoría');
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <style>{componentStyles}</style>
      <div className="categorias-container">
        
        {/* Botón de regresar */}
        <button 
          className="btn-regresar"
          onClick={() => {
            console.log('🔙 Navegando de vuelta al tablero inicial');
            onNavigate('tablero-inicial');
          }}
        >
          ← Regresar al Tablero
        </button>

        {/* Header con título y botón agregar */}
        <div className="categorias-header">
          <h1 className="categorias-title">
            🏷️ Gestión de C4tegorías
          </h1>
          <button 
            className="btn-add-categoria"
            onClick={abrirModalNuevo}
            disabled={loading}
          >
            ➕ Agregar Categoría
          </button>
        </div>

        {/* Contenido principal - Grid de minicards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Cargando categorías...</p>
          </div>
        ) : (
          <div className="cards-grid">
            {categorias.map((categoria) => (
              <div key={categoria.idCategoria} className="categoria-card">
                {/* Header de la card */}
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{categoria.nombre}</h3>
                    <span className={`card-status ${categoria.estatus === 1 ? 'status-active' : 'status-inactive'}`}>
                      {categoria.estatus === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                {/* Imagen de la categoría o texto si no hay */}
                <div className="minicard-image-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px'}}>
                  {getImageUrl(categoria.imagencategoria) ? (
                    <img
                      className="minicard-image"
                      src={getImageUrl(categoria.imagencategoria)}
                      alt={categoria.nombre}
                      style={{maxHeight: '100%', maxWidth: '100%'}}
                    />
                  ) : (
                    <span style={{color: '#a0aec0', fontSize: '1rem'}}>sin img</span>
                  )}
                </div>
                {/* Descripción */}
                <div className="card-description">
                  {categoria.descripcion || 'Sin descripción disponible'}
                </div>
                {/* Información adicional */}
                <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginBottom: '1rem' }}>
                  <div>ID: {categoria.idCategoria} | Negocio: {categoria.idnegocio}</div>
                  <div>Creado: {formatearFecha(categoria.fechaRegistroauditoria)}</div>
                  <div>Usuario: {categoria.usuarioauditoria || '-'}</div>
                </div>
                {/* Botones de acción */}
                <div className="card-actions">
                  <button 
                    className="btn-card-action btn-edit-card"
                    onClick={() => abrirModalEdicion(categoria)}
                    title="Editar categoría"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn-card-action btn-delete-card"
                    onClick={() => eliminarCategoria(categoria)}
                    title="Eliminar categoría"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
            {/* Mensaje cuando no hay categorías */}
            {categorias.length === 0 && (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '3rem',
                background: 'white',
                borderRadius: '12px',
                border: '2px dashed #e2e8f0'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: '0.5' }}>📷</div>
                <h3 style={{ color: '#4a5568', marginBottom: '0.5rem' }}>No hay categorías registradas</h3>
                <p style={{ color: '#718096', marginBottom: '1.5rem' }}>Comienza creando tu primera categoría</p>
                <button 
                  className="btn-add-categoria" 
                  onClick={abrirModalNuevo}
                  style={{ position: 'relative', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                >
                  ➕ Crear primera categoría
                </button>
              </div>
            )}
          </div>
        )}

      {/* Modal para crear/editar categoría */}
      {showModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? '✏️ Editar Categoría' : '➕ Nueva Categoría'}</h2>
              <button className="btn-close" onClick={cerrarModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ingrese el nombre de la categoría"
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="imagencategoria">Archivo de imagen</label>
                <CategoriaImageUpload
                  onFileSelect={handleImageChange}
                  initialImage={selectedFile ? URL.createObjectURL(selectedFile) : getImageUrl(formData.imagencategoria)}
                  disabled={false}
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Ingrese una descripción opcional"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="estatus">Estado</label>
                <select
                  id="estatus"
                  name="estatus"
                  value={formData.estatus.toString()}
                  onChange={(e) => setFormData(prev => ({ ...prev, estatus: parseInt(e.target.value) }))}
                >
                  <option value="1">Activo</option>
                  <option value="0">Inactivo</option>
                </select>
              </div>

              {/* Información de auditoría para edición */}
              {isEditing && selectedCategoria && (
                <div className="audit-info">
                  <h4>📋 Información de Auditoría</h4>
                  <div className="audit-grid">
                    <div>
                      <strong>Creado:</strong> {formatearFecha(selectedCategoria.fechaRegistroauditoria)}
                    </div>
                    <div>
                      <strong>Por:</strong> {selectedCategoria.usuarioauditoria || '-'}
                    </div>
                    <div>
                      <strong>Modificado:</strong> {formatearFecha(selectedCategoria.fechamodificacionauditoria)}
                    </div>
                    <div>
                      <strong>ID Negocio:</strong> {selectedCategoria.idnegocio}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={cerrarModal}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={guardarCategoria}>
                {isEditing ? 'Actualizar' : 'Crear'} Categoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

// (Removed duplicate default export and placeholder component)
export default ConfigCategorias;