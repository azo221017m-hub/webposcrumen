import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface FormCatModeradorProps {
  onClose: () => void;
  onSuccess: () => void;
}

const FormCatModerador: React.FC<FormCatModeradorProps> = ({ onClose, onSuccess }) => {
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [moderadores, setModeradores] = useState<any[]>([]);
  const [asignados, setAsignados] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModeradores = async () => {
      try {
        const response = await axios.get('/api/moderadores');
        setModeradores(response.data.data || []);
      } catch (err) {
        console.error('Error fetching moderadores:', err);
      }
    };
    fetchModeradores();
  }, []);

  const handleAsignar = (id: number) => {
    if (!asignados.includes(id)) {
      setAsignados([...asignados, id]);
    }
  };

  const handleQuitar = (id: number) => {
    setAsignados(asignados.filter((mod) => mod !== id));
  };

  const handleSubmit = async () => {
    if (!nombreCategoria.trim()) {
      setError('El nombre de la categoría es obligatorio.');
      return;
    }
    if (asignados.length === 0) {
      setError('Debe asignar al menos un moderador.');
      return;
    }

    try {
      const response = await axios.post('/api/moderadores/categorias', {
        nombremodref: nombreCategoria.trim(),
        moderadores: asignados,
      });
      console.log('✅ Categoría creada:', response.data);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('❌ Error al crear categoría:', err);
      setError('Hubo un error al crear la categoría.');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Agregar Categoría</h3>
        {error && <p className="error-msg">{error}</p>}
        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={nombreCategoria}
          onChange={(e) => setNombreCategoria(e.target.value)}
        />
        <div className="listbox-container">
          <div>
            <h4>Moderadores Disponibles</h4>
            <ul>
              {moderadores.map((mod) => (
                <li key={mod.idmoderador}>
                  {mod.nombremoderador}
                  <button onClick={() => handleAsignar(mod.idmoderador)}>➕</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Moderadores Asignados</h4>
            <ul>
              {asignados.map((id) => {
                const mod = moderadores.find((m) => m.idmoderador === id);
                return (
                  <li key={id}>
                    {mod?.nombremoderador}
                    <button onClick={() => handleQuitar(id)}>➖</button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSubmit}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default FormCatModerador;