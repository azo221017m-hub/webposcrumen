import React, { useState, useEffect } from 'react';

interface CategoriaModerador {
  idmodref: number;
  nombremodref: string;
  fechaRegistroauditoria: string;
  usuarioauditoria: string;
  fehamodificacionauditoria: string;
  idnegocio: number;
}

const ConfigCatModeradores: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [categorias, setCategorias] = useState<CategoriaModerador[]>([]);
  const [nombreCategoria, setNombreCategoria] = useState('');

  useEffect(() => {
    // Fetch data from the backend
    fetch('/api/categorias-moderadores')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setCategorias(data.data);
        } else {
          console.error('Error fetching categorias:', data.message);
          alert('Error al cargar las categorías.');
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        alert('No se pudo conectar con el servidor.');
      });
  }, []);

  const handleAddCategoria = () => {
    if (!nombreCategoria.trim()) {
      alert('El nombre de la categoría es obligatorio.');
      return;
    }

    const newCategoria = {
      nombremodref: nombreCategoria,
      usuarioauditoria: 'admin', // Replace with actual user
      idnegocio: 1, // Replace with actual negocio ID
    };

    fetch('/api/categorias-moderadores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategoria),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setCategorias((prev) => [...prev, data.data]);
          setNombreCategoria('');
          alert('Categoría agregada con éxito.');
        } else {
          console.error('Error adding categoria:', data.message);
          alert('Error al agregar la categoría.');
        }
      })
      .catch((err) => {
        console.error('Error:', err);
        alert('No se pudo conectar con el servidor.');
      });
  };

  return (
    <div>
      <h1>Categorías Moderadores</h1>
      <button onClick={onBack}>← Regresar a Tablero Inicial</button>
      <div>
        <input
          type="text"
          value={nombreCategoria}
          onChange={(e) => setNombreCategoria(e.target.value)}
          placeholder="Nombre de la Categoría"
        />
        <button onClick={handleAddCategoria}>Agregar Categoría</button>
      </div>
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
                <button onClick={() => console.log('Editar', categoria.idmodref)}>Editar</button>
                <button onClick={() => console.log('Eliminar', categoria.idmodref)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConfigCatModeradores;