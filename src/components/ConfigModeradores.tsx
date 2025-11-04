import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Toast from './Toast';
import { FaEdit, FaTrash } from 'react-icons/fa';

interface Moderador {
  idmoderador: number;
  nombremoderador: string;
  fechaRegistroauditoria: string;
  usuarioauditoria: string;
  fehamodificacionauditoria: string;
  idnegocio: number;
}

const ConfigModeradores: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const idnegocio = user?.idNegocio || 1;
  const usuarioauditoria = user?.alias || 'unknown';

  const [moderadores, setModeradores] = useState<Moderador[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModerador, setEditingModerador] = useState<Moderador | null>(null);
  const [nombreModerador, setNombreModerador] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Fetch data from the backend
    fetch(`/api/moderadores?idnegocio=${idnegocio}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setModeradores(data.data);
        } else {
          console.error('Error fetching moderadores:', data.message);
        }
      })
      .catch((err) => console.error('Fetch error:', err));
  }, [idnegocio]);

  const handleOpenModal = (moderador?: Moderador) => {
    if (moderador) {
      setEditingModerador(moderador);
      setNombreModerador(moderador.nombremoderador);
    } else {
      setEditingModerador(null);
      setNombreModerador('');
    }
    setIsModalOpen(true);
  };

  const handleSaveModerador = async () => {
    if (!nombreModerador.trim()) {
      console.error('Nombre del moderador es obligatorio.');
      return;
    }

    // Validar duplicados
    const nombreDuplicado = moderadores.some(
      (mod) => mod.nombremoderador.toLowerCase() === nombreModerador.toLowerCase()
    );

    if (nombreDuplicado) {
      alert('El nombre del moderador ya existe. Por favor, elige otro nombre.');
      return;
    }

    const now = new Date().toISOString();
    const payload = {
      nombremoderador: nombreModerador,
      idnegocio,
      usuarioauditoria: usuarioauditoria,
      fechaRegistroauditoria: editingModerador ? undefined : now,
      fehamodificacionauditoria: now,
    };

    const url = editingModerador
      ? `/api/moderadores/${editingModerador.idmoderador}`
      : '/api/moderadores';
    const method = editingModerador ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Backend error response:', errorResponse); // Log backend response
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (editingModerador) {
        setModeradores((prev) =>
          prev.map((mod) => (mod.idmoderador === editingModerador.idmoderador ? data : mod))
        );
      } else {
        setModeradores((prev) => [...prev, data]);
      }
      setIsModalOpen(false);

      setToastMessage('Moderador guardado con éxito');
      setShowToast(true);

      // Refetch moderadores after successful insert
      const fetchModeradores = async () => {
        const response = await fetch('/api/moderadores');
        const data = await response.json();
        if (data.success) {
          setModeradores(data.data);
        }
      };

      await fetchModeradores();
    } catch (error) {
      console.error('Error saving moderador:', error);
      setToastMessage('Error al guardar el moderador');
      setShowToast(true);
    }
  };

  const handleDeleteModerador = (id: number) => {
    fetch(`/api/moderadores/${id}`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete moderador');
        }
        setModeradores((prev) => prev.filter((mod) => mod.idmoderador !== id));
      })
      .catch((error) => {
        console.error('Error deleting moderador:', error);
        alert('No se pudo eliminar el moderador. Intente nuevamente.');
      });
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    gap: '10px',
    width: '100%',
    height: '100%',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const actionButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
  };

  return (
    <div style={gridStyle}>
      <button onClick={onBack}>Regresa Tablero</button>
      <button className="add-button" onClick={() => handleOpenModal()}>Agregar Moderador</button>
      <div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {moderadores.map((moderador) => (
              <tr key={moderador.idmoderador}>
                <td>{moderador.nombremoderador}</td>
                <td>
                  <button style={actionButtonStyle} onClick={() => handleOpenModal(moderador)}>
                    <FaEdit />
                  </button>
                  <button style={actionButtonStyle} onClick={() => handleDeleteModerador(moderador.idmoderador)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal" style={{}}>
          <div className="modal-content">
            <h4>{editingModerador ? 'Editar Moderador' : 'Agregar Moderador'}</h4>
            <input
              type="text"
              value={nombreModerador}
              onChange={(e) => setNombreModerador(e.target.value)}
              placeholder="Nombre del moderador"
            />
            <div className="modal-actions">
              <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button
                onClick={handleSaveModerador}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default ConfigModeradores;
