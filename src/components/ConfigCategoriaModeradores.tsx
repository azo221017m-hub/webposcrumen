import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'; // Importa el hook de autenticación

// Define la interfaz para las categorías de moderadores
interface CategoriaModerador {
  idmodref: number;
  nombremodref: string;
}

// Componente para gestionar categorías de moderadores
const ConfigCategoriaModeradores: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // Estado para edición
  const [editCategoria, setEditCategoria] = useState<CategoriaModerador | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [categorias, setCategorias] = useState<CategoriaModerador[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [nombreCategoria, setNombreCategoria] = useState('');
  const auth = useAuth(); // Accede al contexto de autenticación

  // Cargar categorías al montar el componente
  useEffect(() => {
    console.log('📡 Cargando categorías de moderadores...');
    fetch('/api/categorias-moderadores')
      .then((res) => res.json())
      .then((data) => {
        console.log('✅ Categorías cargadas:', data);
        setCategorias(data);
      })
      .catch((err) => console.error('❌ Error al cargar categorías:', err));
  }, []);

  // Manejar el envío del formulario para agregar una categoría
  const handleAddCategoria = () => {
    // Validación: nombre no vacío
    if (!nombreCategoria.trim()) {
      alert('Debes ingresar el nombre de la categoría.');
      return;
    }
    // Validación: nombre único
    if (categorias.some(c => c.nombremodref.trim().toLowerCase() === nombreCategoria.trim().toLowerCase())) {
      alert('Ya existe una categoría con ese nombre.');
      return;
    }
    // ...existing code...
    fetch('/api/categorias-moderadores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombremodref: nombreCategoria,
        idnegocio: auth.user?.idNegocio ?? 1,
        usuario: auth.user?.alias
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('✅ Categoría agregada:', data);
        setCategorias([...categorias, data]);
        setShowModal(false);
        setNombreCategoria('');
      })
      .catch((err) => console.error('❌ Error al agregar categoría:', err));
  };

  return (
    <div className="config-screen">
      {/* Botón para regresar al tablero inicial */}
      <button onClick={onBack}>← Regresar a TableroInicial</button>

      {/* Tabla de categorías */}
      <h2>Categorías de Moderadores</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.idmodref}>
              <td>{categoria.idmodref}</td>
              <td>{categoria.nombremodref}</td>
              <td>
                <button onClick={() => {
                  setEditCategoria(categoria);
                  setEditNombre(categoria.nombremodref);
                }}>Editar</button>
                <button onClick={() => {
                  if (window.confirm('¿Seguro que deseas eliminar esta categoría?')) {
                    fetch(`/api/categorias-moderadores/${categoria.idmodref}`, {
                      method: 'DELETE',
                    })
                      .then((res) => res.json())
                      .then(() => {
                        setCategorias(categorias.filter(c => c.idmodref !== categoria.idmodref));
                      })
                      .catch((err) => console.error('❌ Error al eliminar categoría:', err));
                  }
                }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botón para agregar una nueva categoría */}
      <button onClick={() => setShowModal(true)}>Agregar Categoría Moderador</button>

      {/* Modal para agregar categoría */}
      {showModal && (
        <div className="modal">
          <h3>Agregar Categoría</h3>
          <input
            type="text"
            placeholder="Nombre de la categoría"
            value={nombreCategoria}
            onChange={(e) => setNombreCategoria(e.target.value)}
          />
          <button onClick={handleAddCategoria}>Guardar</button>
          <button onClick={() => setShowModal(false)}>Cancelar</button>
        </div>
      )}

      {/* Modal para editar categoría */}
      {editCategoria && (
        <div className="modal">
          <h3>Editar Categoría</h3>
          <input
            type="text"
            value={editNombre}
            onChange={(e) => setEditNombre(e.target.value)}
          />
          <button onClick={() => {
            fetch(`/api/categorias-moderadores/${editCategoria.idmodref}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nombremodref: editNombre }),
            })
              .then((res) => res.json())
              .then(() => {
                setCategorias(categorias.map(c => c.idmodref === editCategoria.idmodref ? { ...c, nombremodref: editNombre } : c));
                setEditCategoria(null);
              })
              .catch((err) => console.error('❌ Error al editar categoría:', err));
          }}>Guardar</button>
          <button onClick={() => setEditCategoria(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default ConfigCategoriaModeradores;