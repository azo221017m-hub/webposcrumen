// src/components/ConfigUnidaddeMedidaCompra.tsx
// Componente para configuración de unidades de medida de compra en POSWEBCrumen

import React, { useState, useEffect } from 'react'; // Hooks de React
// Tipos locales para las operaciones de crear/actualizar UMCompra (evita dependencia de ../types)
type CreateUMCompraData = {
  nombreUmCompra: string;
  valor: number;
  umMatPrima: string;
  valorConvertido: number;
  usuario: string;
};

type UpdateUMCompraData = {
  nombreUmCompra: string;
  valor: number;
  umMatPrima: string;
  valorConvertido: number;
};
import * as api from '../services/api'; // Servicios API (usar import por namespace para coincidir con las exportaciones)
import Toast from './Toast'; // Componente de notificaciones
import '../styles/ConfigScreens.css'; // Estilos del componente

// Tipo local para UMCompra (coincide con la forma que usa este componente y la API)
interface UMCompra {
  idUmCompra: number;
  nombreUmCompra: string;
  valor: number | string;
  umMatPrima: string;
  valorConvertido: number | string;
  usuario: string;
  fechaRegistro: string;
}

// Opciones para el dropdown de unidades de materia prima
const UNIDADES_MATERIA_PRIMA = [
  { value: 'Lt', label: 'Litros (Lt)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'Kl', label: 'Kilolitros (Kl)' },
  { value: 'gr', label: 'Gramos (gr)' },
  { value: 'pza', label: 'Piezas (pza)' }
];

/**
 * Función helper para formatear números de manera segura
 */
const formatNumber = (value: number | string | null | undefined, decimals: number = 3): string => {
  const num = Number(value);
  return isNaN(num) ? '0.000' : num.toFixed(decimals);
};

/**
 * Componente ConfigUnidaddeMedidaCompra
 * Permite mostrar, crear, editar y eliminar unidades de medida de compra
 */
const ConfigUnidaddeMedidaCompra: React.FC = () => {
  // Estados para el manejo de datos y UI
  const [umCompras, setUmCompras] = useState<UMCompra[]>([]); // Lista de UMCompras
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga
  const [showForm, setShowForm] = useState<boolean>(false); // Control del formulario
  const [editingUMCompra, setEditingUMCompra] = useState<UMCompra | null>(null); // UMCompra en edición
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null); // Notificación

  // Estados del formulario
  const [formData, setFormData] = useState<CreateUMCompraData>({
    nombreUmCompra: '',
    valor: 0,
    umMatPrima: 'Lt',
    valorConvertido: 0,
    usuario: localStorage.getItem('usuario') || 'admin' // Usuario actual del localStorage
  });

  // Efecto para cargar UMCompras al montar el componente
  useEffect(() => {
    loadUMCompras();
  }, []);

  /**
   * Carga todas las unidades de medida de compra desde la API
   */
  const loadUMCompras = async (): Promise<void> => {
    try {
      setLoading(true); // Inicia el estado de carga
      console.log('📋 Cargando unidades de medida de compra...');
      
      const response: { success?: boolean; data?: UMCompra[]; message?: string } | any = await api.getUMCompras(); // Llama a la API
      
      if (response && response.success && response.data) {
        setUmCompras(response.data); // Actualiza el estado
        console.log(`✅ ${response.data.length} unidades de medida de compra cargadas`);
      } else {
        throw new Error((response && response.message) || 'Error al cargar unidades de medida de compra');
      }
    } catch (error) {
      console.error('❌ Error al cargar unidades de medida de compra:', error);
      showToast('Error al cargar las unidades de medida de compra', 'error');
    } finally {
      setLoading(false); // Finaliza el estado de carga
    }
  };

  /**
   * Muestra una notificación toast
   */
  const showToast = (message: string, type: 'success' | 'error'): void => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000); // Auto-ocultar después de 5 segundos
  };

  /**
   * Maneja los cambios en los campos del formulario
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: ['valor', 'valorConvertido'].includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  /**
   * Abre el formulario para crear una nueva UMCompra
   */
  const handleAddNew = (): void => {
    setEditingUMCompra(null); // Limpia la edición
    setFormData({
      nombreUmCompra: '',
      valor: 0,
      umMatPrima: 'Lt',
      valorConvertido: 0,
      usuario: localStorage.getItem('usuario') || 'admin'
    });
    setShowForm(true); // Muestra el formulario
  };

  /**
   * Abre el formulario para editar una UMCompra existente
   */
  const handleEdit = (umCompra: UMCompra): void => {
    setEditingUMCompra(umCompra); // Establece la UMCompra en edición
    setFormData({
      nombreUmCompra: umCompra.nombreUmCompra,
      valor: Number(umCompra.valor), // Convierte a número
      umMatPrima: umCompra.umMatPrima,
      valorConvertido: Number(umCompra.valorConvertido), // Convierte a número
      usuario: localStorage.getItem('usuario') || 'admin'
    });
    setShowForm(true); // Muestra el formulario
  };

  /**
   * Cancela la edición y cierra el formulario
   */
  const handleCancel = (): void => {
    setShowForm(false); // Oculta el formulario
    setEditingUMCompra(null); // Limpia la edición
  };

  /**
   * Guarda una UMCompra (crear o actualizar)
   */
  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    // Validaciones básicas
    if (!formData.nombreUmCompra.trim()) {
      showToast('El nombre de la unidad de medida es obligatorio', 'error');
      return;
    }

    if (isNaN(Number(formData.valor)) || Number(formData.valor) <= 0) {
      showToast('El valor debe ser un número válido mayor a 0', 'error');
      return;
    }

    if (isNaN(Number(formData.valorConvertido)) || Number(formData.valorConvertido) <= 0) {
      showToast('El valor convertido debe ser un número válido mayor a 0', 'error');
      return;
    }

    // Verificar si ya existe una UMCompra con el mismo nombre (solo al crear)
    if (!editingUMCompra) {
      const exists = umCompras.some(um => 
        um.nombreUmCompra.toLowerCase().trim() === formData.nombreUmCompra.toLowerCase().trim()
      );
      if (exists) {
        showToast('Ya existe una unidad de medida de compra con ese nombre', 'error');
        return;
      }
    }

    try {
      if (editingUMCompra) {
        // Actualizar UMCompra existente
        console.log(`🔄 Actualizando UMCompra ID: ${editingUMCompra.idUmCompra}`);
        
        const updateData: UpdateUMCompraData = {
          nombreUmCompra: formData.nombreUmCompra,
          valor: formData.valor,
          umMatPrima: formData.umMatPrima,
          valorConvertido: formData.valorConvertido
        };
        
        // La función de la API podría no devolver un objeto; forzamos any para poder inspeccionarla
        const response: any = await api.updateUMCompra(editingUMCompra.idUmCompra, updateData);
        
        // Si la API no retorna un objeto con 'success', consideramos la operación exitosa (no se lanzó excepción)
        if (!response || response.success === undefined) {
          showToast('Unidad de medida de compra actualizada correctamente', 'success');
          setShowForm(false); // Oculta el formulario
          loadUMCompras(); // Recarga la lista
        } else if (response.success) {
          showToast('Unidad de medida de compra actualizada correctamente', 'success');
          setShowForm(false); // Oculta el formulario
          loadUMCompras(); // Recarga la lista
        } else {
          throw new Error(response.message || 'Error al actualizar la unidad de medida de compra');
        }
      } else {
        // Crear nueva UMCompra
        console.log('📦 Creando nueva UMCompra');
        
        const response: any = await api.createUMCompra(formData);
        
        // Manejar caso donde la API no retorna un objeto (void) o no incluye 'success'
        if (!response || response.success === undefined) {
          showToast('Unidad de medida de compra creada correctamente', 'success');
          setShowForm(false); // Oculta el formulario
          setEditingUMCompra(null); // Limpia la edición
          // Reinicia el formulario
          setFormData({
            nombreUmCompra: '',
            valor: 0,
            umMatPrima: 'Lt',
            valorConvertido: 0,
            usuario: localStorage.getItem('usuario') || 'admin'
          });
          loadUMCompras(); // Recarga la lista
        } else if (response.success) {
          showToast('Unidad de medida de compra creada correctamente', 'success');
          setShowForm(false); // Oculta el formulario
          setEditingUMCompra(null); // Limpia la edición
          // Reinicia el formulario
          setFormData({
            nombreUmCompra: '',
            valor: 0,
            umMatPrima: 'Lt',
            valorConvertido: 0,
            usuario: localStorage.getItem('usuario') || 'admin'
          });
          loadUMCompras(); // Recarga la lista
        } else {
          throw new Error(response.message || 'Error al crear la unidad de medida de compra');
        }
      }
    } catch (error) {
      console.error('❌ Error al guardar UMCompra:', error);
      showToast(error instanceof Error ? error.message : 'Error al guardar la unidad de medida de compra', 'error');
    }
  };

  /**
   * Elimina una UMCompra
   */
  const handleDelete = async (umCompra: UMCompra): Promise<void> => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la unidad de medida "${umCompra.nombreUmCompra}"?`)) {
      return; // Cancela si el usuario no confirma
    }

    try {
      console.log(`🗑️ Eliminando UMCompra ID: ${umCompra.idUmCompra}`);
      
      const response: any = await api.deleteUMCompra(umCompra.idUmCompra);
      
      // Manejar caso donde la API no retorna un objeto (void) o no incluye 'success'
      if (!response || response.success === undefined) {
        showToast('Unidad de medida de compra eliminada correctamente', 'success');
        loadUMCompras(); // Recarga la lista
      } else if (response.success) {
        showToast('Unidad de medida de compra eliminada correctamente', 'success');
        loadUMCompras(); // Recarga la lista
      } else {
        throw new Error(response.message || 'Error al eliminar la unidad de medida de compra');
      }
    } catch (error) {
      console.error('❌ Error al eliminar UMCompra:', error);
      showToast(error instanceof Error ? error.message : 'Error al eliminar la unidad de medida de compra', 'error');
    }
  };

  /**
   * Navega de regreso al tablero inicial
   */
  const handleGoBack = (): void => {
    // Dispara un evento personalizado para regresar al tablero inicial
    const event = new CustomEvent('navigateToHome');
    window.dispatchEvent(event);
  };

  return (
    <div className="config-screen">
      {/* Header de la pantalla */}
      <div className="config-header">
        <div className="config-title-container">
          <h2 className="config-title">
            📏 Configuración de Unidades de Medida de Compra
          </h2>
          <p className="config-subtitle">
            Gestiona las unidades de medida para compras y conversiones
          </p>
        </div>
        <div className="config-actions">
          <button 
            className="btn-back" 
            onClick={handleGoBack}
            title="Regresar al Tablero Inicial"
          >
            ← Regresar
          </button>
          <button 
            className="btn-primary" 
            onClick={handleAddNew}
            title="Agregar nueva unidad de medida de compra"
          >
            + Agregar Nueva
          </button>
        </div>
      </div>

      {/* Formulario de creación/edición */}
      {showForm && (
        <div className="config-form-container">
          <form onSubmit={handleSave} className="config-form">
            <h3 className="form-title">
              {editingUMCompra ? '✏️ Editar Unidad de Medida' : '➕ Nueva Unidad de Medida'}
            </h3>
            
            <div className="form-grid">
              {/* Campo: Nombre */}
              <div className="form-group">
                <label htmlFor="nombreUmCompra" className="form-label">
                  📝 Nombre de la Unidad *
                </label>
                <input
                  type="text"
                  id="nombreUmCompra"
                  name="nombreUmCompra"
                  value={formData.nombreUmCompra}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ej: Bolsa de 5kg, Caja de 12 unidades"
                  required
                />
              </div>

              {/* Campo: Valor */}
              <div className="form-group">
                <label htmlFor="valor" className="form-label">
                  💰 Valor de Conversión *
                </label>
                <input
                  type="number"
                  id="valor"
                  name="valor"
                  value={formData.valor}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0.00"
                  step="0.001"
                  min="0.001"
                  required
                />
              </div>

              {/* Campo: Unidad de Materia Prima */}
              <div className="form-group">
                <label htmlFor="umMatPrima" className="form-label">
                  📏 Unidad de Materia Prima *
                </label>
                <select
                  id="umMatPrima"
                  name="umMatPrima"
                  value={formData.umMatPrima}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  {UNIDADES_MATERIA_PRIMA.map(unidad => (
                    <option key={unidad.value} value={unidad.value}>
                      {unidad.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo: Valor Convertido */}
              <div className="form-group">
                <label htmlFor="valorConvertido" className="form-label">
                  🔄 Valor Convertido *
                </label>
                <input
                  type="number"
                  id="valorConvertido"
                  name="valorConvertido"
                  value={formData.valorConvertido}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0.000"
                  step="0.001"
                  min="0.001"
                  required
                />
              </div>
            </div>

            {/* Botones del formulario */}
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                ❌ Cancelar
              </button>
              <button type="submit" className="btn-save">
                💾 {editingUMCompra ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de UMCompras */}
      <div className="config-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Cargando unidades de medida de compra...</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="config-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Valor</th>
                  <th>Unidad MP</th>
                  <th>Valor Convertido</th>
                  <th>Usuario</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {umCompras.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="no-data">
                      📭 No hay unidades de medida de compra registradas
                    </td>
                  </tr>
                ) : (
                  umCompras.map((umCompra) => (
                    <tr key={umCompra.idUmCompra}>
                      <td>{umCompra.idUmCompra}</td>
                      <td className="text-bold">{umCompra.nombreUmCompra}</td>
                      <td className="text-right">{formatNumber(umCompra.valor)}</td>
                      <td className="text-center">
                        <span className="badge badge-info">{umCompra.umMatPrima}</span>
                      </td>
                      <td className="text-right">{formatNumber(umCompra.valorConvertido)}</td>
                      <td>{umCompra.usuario}</td>
                      <td>{new Date(umCompra.fechaRegistro).toLocaleDateString('es-ES')}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(umCompra)}
                            title="Editar unidad de medida"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(umCompra)}
                            title="Eliminar unidad de medida"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumen de estadísticas */}
      <div className="config-stats">
        <div className="stat-card">
          <h4>📊 Total Unidades</h4>
          <p className="stat-value">{umCompras.length}</p>
        </div>
        <div className="stat-card">
          <h4>📏 Unidades Únicas</h4>
          <p className="stat-value">
            {new Set(umCompras.map(um => um.umMatPrima)).size}
          </p>
        </div>
      </div>

      {/* Componente Toast para notificaciones */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ConfigUnidaddeMedidaCompra;