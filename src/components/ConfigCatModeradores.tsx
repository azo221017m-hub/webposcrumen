import React, { useState, useEffect } from 'react';

interface Categoria {
  idmodref: number;
  nombremodref: string;
}

const ConfigCatModeradores: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);

  useEffect(() => {
    // Simular fetch inicial
    setCategorias([
      { idmodref: 1, nombremodref: 'Categoría 1' },
      { idmodref: 2, nombremodref: 'Categoría 2' },
    ]);
  }, []);

  const handleOpenModal = (categoria?: Categoria) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setNombreCategoria(categoria.nombremodref);
    } else {
      setEditingCategoria(null);
      setNombreCategoria('');
    }
    setIsModalOpen(true);
  };

  const handleSaveCategoria = () => {
    if (editingCategoria) {
      setCategorias((prev) =>
        prev.map((cat) =>
          cat.idmodref === editingCategoria.idmodref
            ? { ...cat, nombremodref: nombreCategoria }
            : cat
        )
      );
    } else {
      setCategorias((prev) => [
        ...prev,
        { idmodref: Date.now(), nombremodref: nombreCategoria },
      ]);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1>Categorías Moderadores</h1>
      <button onClick={() => handleOpenModal()}>Agregar Categoría</button>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.idmodref}>
              <td>{categoria.nombremodref}</td>
              <td>
                <button onClick={() => handleOpenModal(categoria)}>Editar</button>
                <button onClick={() => setCategorias((prev) => prev.filter((cat) => cat.idmodref !== categoria.idmodref))}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div>
          <h2>{editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <input
            value={nombreCategoria}
            onChange={(e) => setNombreCategoria(e.target.value)}
          />
          <button onClick={handleSaveCategoria}>Guardar</button>
          <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default ConfigCatModeradores;