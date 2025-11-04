import React, { useState } from 'react';

interface FormModCatModeradorProps {
  categoria: { idmodref?: number; nombremodref: string } | null;
  onSave: (categoria: { idmodref?: number; nombremodref: string }) => void;
  onClose: () => void;
}

const FormModCatModerador: React.FC<FormModCatModeradorProps> = ({ categoria, onSave, onClose }) => {
  const [nombremodref, setNombremodref] = useState(categoria?.nombremodref || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ idmodref: categoria?.idmodref, nombremodref });
  };

  return (
    <div className="modal">
      <form className="modal-form" onSubmit={handleSubmit}>
        <h2>{categoria ? 'Editar Categoría Moderador' : 'Agregar Categoría Moderador'}</h2>
        <label>
          Nombre de Categoría:
          <input
            type="text"
            value={nombremodref}
            onChange={(e) => setNombremodref(e.target.value)}
            required
          />
        </label>
        <div className="modal-actions">
          <button type="submit">Guardar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default FormModCatModerador;