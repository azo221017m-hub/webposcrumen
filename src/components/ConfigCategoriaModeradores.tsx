import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'; // Importa el hook de autenticación

// Define la interfaz para las categorías de moderadores
interface CategoriaModerador {
  idmodref: number;
  nombremodref: string;
}

// Componente para gestionar categorías de moderadores
const ConfigCategoriaModeradores: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
    // Depuración: mostrar valores antes de enviar
    console.log('Valor a enviar en nombremodref:', nombreCategoria);
    console.log('IDNEGOCIO a enviar:', auth.user?.idNegocio);
    fetch('/api/categorias-moderadores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombremodref: nombreCategoria,
        idnegocio: auth.user?.idNegocio ?? 1, // Fuerza idnegocio=1 si está undefined
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
              <td>{categoria.idmodref}</td><td>{categoria.nombremodref}</td><td><button>Editar</button><button>Eliminar</button></td>
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
    </div>
  );
};

export default ConfigCategoriaModeradores;