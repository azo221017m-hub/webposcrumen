// src/components/ConfigAsignaModeradores.tsx
import React, { useEffect, useState } from 'react';
import type { ApiResponse } from '../types';

interface Props {
  onBack: () => void;
  idNegocio: number;
}

interface ModeradorGrupo {
  id: number;
  idmoderador_grupo: number;
  fechaRegistro: string;
  nombremodref: string;
  nombremoderador: string;
}
interface GrupoRef {
  idmodref: number;
  nombremodref: string;
}
interface Moderador {
  idmoderador: number;
  nombremoderador: string;
}

const ConfigAsignaModeradores: React.FC<Props> = ({ onBack, idNegocio }) => {
  const [asignaciones, setAsignaciones] = useState<ModeradorGrupo[]>([]);
  const [grupos, setGrupos] = useState<GrupoRef[]>([]);
  const [moderadores, setModeradores] = useState<Moderador[]>([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<number | null>(null);
  const [moderadoresSeleccionados, setModeradoresSeleccionados] = useState<number[]>([]);

  useEffect(() => {
    fetch(`/api/moderadores-miembros?idnegocio=${idNegocio}`)
      .then(res => res.json())
      .then((data: ApiResponse<ModeradorGrupo[]>) => {
        if (data.success && data.data) setAsignaciones(data.data);
      });
  }, [idNegocio]);


  useEffect(() => {
    fetch(`/api/grupos?idnegocio=${idNegocio}`)
      .then(res => res.json())
      .then((data: ApiResponse<GrupoRef[]>) => {
        if (data.success && data.data) setGrupos(data.data);
      });
    fetch(`/api/moderadores?idnegocio=${idNegocio}`)
      .then(res => res.json())
      .then((data: ApiResponse<Moderador[]>) => {
        if (data.success && data.data) setModeradores(data.data);
      });
  }, [idNegocio]);

  const handleGrupoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGrupoSeleccionado(Number(e.target.value));
    console.log('🔄 Grupo seleccionado:', e.target.value);
  };

  // Manejar selección de moderadores
  const handleModeradorCheck = (id: number, checked: boolean) => {
    setModeradoresSeleccionados(prev =>
      checked ? [...prev, id] : prev.filter(mid => mid !== id)
    );
    console.log('🔄 Moderador', id, 'checked:', checked);
  };

  // Guardar asignaciones
  const handleGuardar = async () => {
    if (!grupoSeleccionado) {
      alert('Selecciona un grupo antes de guardar.');
      return;
    }
    if (!idNegocio) {
      alert('ID de negocio no válido.');
      return;
    }
    // Construir array de miembros con checked
    const miembros = moderadores.map(m => ({
      id: m.idmoderador,
      checked: moderadoresSeleccionados.includes(m.idmoderador)
    }));
    if (miembros.length === 0) {
      alert('No hay moderadores disponibles.');
      return;
    }
    if (!miembros.some(m => m.checked)) {
      alert('Selecciona al menos un moderador antes de guardar.');
      return;
    }
    const body = {
      idmoderador_grupo: grupoSeleccionado,
      miembros,
      idnegocio: idNegocio
    };
    console.log('📡 [FRONT] Body POST:', JSON.stringify(body));
    const res = await fetch('/api/moderadores-miembros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data: ApiResponse<any> = await res.json();
    console.log('📡 [API] Respuesta POST:', data);
    if (data.success) {
      alert('Asignación guardada correctamente');
      // Recargar asignaciones
      fetch(`/api/moderadores-miembros?idnegocio=${idNegocio}`)
        .then(res => res.json())
        .then((data: ApiResponse<ModeradorGrupo[]>) => {
          if (data.success && data.data) setAsignaciones(data.data);
        });
    } else {
      alert('Error al guardar asignación: ' + data.message);
    }
  };

  // Editar asignación (solo muestra datos por ahora)
  // Removed duplicate declaration of handleEditarAsignacion

  // Eliminar asignación
  const handleEliminarAsignacion = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta asignación?')) return;
    try {
      const res = await fetch(`/api/moderadores-miembros/${id}`, { method: 'DELETE' });
      const data: ApiResponse<any> = await res.json();
      if (data.success) {
        alert('Asignación eliminada correctamente');
        // Recargar asignaciones
        fetch(`/api/moderadores-miembros?idnegocio=${idNegocio}`)
          .then(res => res.json())
          .then((data: ApiResponse<ModeradorGrupo[]>) => {
            if (data.success && data.data) setAsignaciones(data.data);
          });
      } else {
        alert('Error al eliminar asignación: ' + data.message);
      }
    } catch (err) {
      alert('Error al eliminar asignación');
    }
  };
  
  // Editar asignación (solo muestra datos por ahora)
  const handleEditarAsignacion = (asig: ModeradorGrupo) => {
    alert(`Editar asignación:\nGrupo: ${asig.nombremodref}\nModerador: ${asig.nombremoderador}`);
    // Aquí podrías abrir un modal o setear estado para edición
  };


  return (
    <div className="config-screen">
      {/* Botón para regresar */}
      <button onClick={onBack} className="btn-primary">← Regresa a Tablero Inicial</button>
      <h2>Asignar Moderadores</h2>
      {/* Dropdown de grupos */}
      <div>
        <label>Grupo:</label>
        <select value={grupoSeleccionado ?? ''} onChange={handleGrupoChange}>
          <option value="">Selecciona un grupo</option>
          {grupos.map(grupo => (
            <option key={grupo.idmodref} value={grupo.idmodref}>{grupo.nombremodref}</option>
          ))}
        </select>
      </div>

      {/* Lista de moderadores en grid con checkboxes */}
      <div>
        <label>Moderadores:</label>
        <div className="moderadores-grid">
          {moderadores.map(mod => (
            <div className="moderador-item" key={mod.idmoderador}>
              <label>
                <input
                  type="checkbox"
                  checked={moderadoresSeleccionados.includes(mod.idmoderador)}
                  onChange={e => handleModeradorCheck(mod.idmoderador, e.target.checked)}
                />
                <span>{mod.nombremoderador}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleGuardar} className="btn-primary">Guardar</button>
      <h3>Asignaciones actuales</h3>
      <table className="asignaciones-table">
        <thead>
          <tr>
            <th>Grupo</th>
            <th>Moderador</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asignaciones.map(asig => (
            <tr key={asig.id}>
              <td>{asig.nombremodref}</td>
              <td>{asig.nombremoderador}</td>
              <td>{asig.fechaRegistro}</td>
              <td>
                <button onClick={() => handleEditarAsignacion(asig)}>Editar</button>
                <button onClick={() => handleEliminarAsignacion(asig.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConfigAsignaModeradores;
