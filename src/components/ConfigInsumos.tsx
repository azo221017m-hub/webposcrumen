// src/components/ConfigInsumos.tsx
// Componente para gestión de insumos con tabla de datos y formulario de inserción

import React, { useState, useEffect } from 'react';
import type { Insumo, CreateInsumoData, ApiResponse, Usuario, Categoria } from '../types/index';
import { getInsumos, createInsumo, getCategoriasDropdown } from '../services/api';
import Toast from './Toast';
import '../styles/ConfigScreens.css';

// Interfaz para props del componente
interface ConfigInsumosProps {
  currentUser: Usuario; // Usuario autenticado actual
  onBack?: () => void; // Función para regresar al TableroInicial
}

// Componente principal de configuración de insumos
const ConfigInsumos: React.FC<ConfigInsumosProps> = ({ currentUser, onBack }) => {
  // Estados para el manejo de datos y UI
  const [insumos, setInsumos] = useState<Insumo[]>([]); // Lista de insumos
  const [categorias, setCategorias] = useState<Categoria[]>([]); // Lista de categorías para dropdown
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga
  const [submitting, setSubmitting] = useState<boolean>(false); // Estado de envío de formulario
  const [, setIsEditing] = useState<boolean>(false); // Control del modo edición
  const [, setEditingId] = useState<number | null>(null); // ID del insumo siendo editado

  // Estados para el formulario de nuevo insumo
  const [formData, setFormData] = useState<CreateInsumoData>({
    nombre: '',
    costo_promedio_ponderado: 0,
    unidad_medida: '',
    tipo_insumo: 'INSUMO',
    stock_actual: 0,
    stock_minimo: 0,
    precio_venta: 0,
    precio_referencia: 0,
    id_categoria: 0,
    id_proveedor: undefined,
    activo: true,
    usuario: currentUser.usuario // Llenar automáticamente con el usuario logueado
  });

  // Estados para Toast de notificaciones
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Estados para calculadora de precio (solo para PRODUCTO)
  const [porcentajeUtilidad, setPorcentajeUtilidad] = useState<number>(0);

  // Función para mostrar notificaciones
  const mostrarToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    // Auto-ocultar después de 3 segundos
    setTimeout(() => setShowToast(false), 3000);
  };

  // Funciones para calculadora de precio de venta
  const calcularPrecioPorUtilidad = (costo: number, utilidad: number): number => {
    if (costo <= 0 || utilidad < 0) return 0;
    return costo + (costo * utilidad / 100);
  };

  const calcularUtilidadPorPrecio = (costo: number, precio: number): number => {
    if (costo <= 0 || precio <= 0) return 0;
    return ((precio - costo) / costo) * 100;
  };

  const handleUtilidadChange = (utilidad: number): void => {
    setPorcentajeUtilidad(utilidad);
    const nuevoPrecio = calcularPrecioPorUtilidad(formData.costo_promedio_ponderado, utilidad);
    setFormData(prev => ({ ...prev, precio_venta: Number(nuevoPrecio.toFixed(2)) }));
  };

  const handlePrecioChange = (precio: number): void => {
    const nuevaUtilidad = calcularUtilidadPorPrecio(formData.costo_promedio_ponderado, precio);
    setPorcentajeUtilidad(Number(nuevaUtilidad.toFixed(2)));
  };

  // Función para cargar insumos desde la API
  const cargarInsumos = async () => {
    try {
      setLoading(true);
      console.log('Cargando insumos...');
      
      const response: ApiResponse<Insumo[]> = await getInsumos();
      console.log('Respuesta de insumos:', response);
      
      if (response.success && response.data) {
        setInsumos(response.data);
        mostrarToast(`${response.data.length} insumos cargados correctamente`, 'success');
      } else {
        setInsumos([]);
        mostrarToast(response.message || 'Error al cargar insumos', 'error');
      }
    } catch (error) {
      console.error('Error al cargar insumos:', error);
      setInsumos([]);
      mostrarToast('Error de conexión al cargar insumos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar categorías para el dropdown
  const cargarCategorias = async () => {
    try {
      console.log('Cargando categorías para dropdown...');
      
      const response: ApiResponse<Categoria[]> = await getCategoriasDropdown();
      console.log('Respuesta de categorías:', response);
      
      if (response.success && response.data) {
        setCategorias(response.data);
      } else {
        setCategorias([]);
        mostrarToast('Error al cargar categorías', 'error');
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategorias([]);
      mostrarToast('Error de conexión al cargar categorías', 'error');
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarInsumos();
    cargarCategorias();
  }, []);

  // Para insumos tipo "INSUMO", la categoría se maneja automáticamente en el backend
  // No se requiere lógica adicional en el frontend

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let newFormData = {
      ...formData,
      [name]: ['costo_promedio_ponderado', 'stock_actual', 'stock_minimo', 'precio_venta', 'precio_referencia', 'id_categoria', 'id_proveedor'].includes(name) 
        ? Number(value) 
        : value
    };

    // Lógica condicional para tipo de insumo
    if (name === 'tipo_insumo') {
      if (value === 'PRODUCTO') {
        // Si es PRODUCTO, rellenar unidad de medida con 'pza'
        newFormData.unidad_medida = 'pza';
      } else if (value === 'INSUMO') {
        // Si es INSUMO, ocultar precio y usar categoría automática (el backend la manejará)
        newFormData.precio_venta = 0;
        newFormData.id_categoria = 0; // El backend creará/usará la categoría INSUMO automáticamente
        setPorcentajeUtilidad(0); // Resetear utilidad
      }
    }

    // Actualizar cálculos de utilidad cuando cambia el precio o costo (solo para PRODUCTO)
    if (formData.tipo_insumo === 'PRODUCTO') {
      if (name === 'precio_venta') {
        handlePrecioChange(Number(value));
      } else if (name === 'costo_promedio_ponderado') {
        // Recalcular precio manteniendo el mismo porcentaje de utilidad
        const nuevoPrecio = calcularPrecioPorUtilidad(Number(value), porcentajeUtilidad);
        newFormData.precio_venta = Number(nuevoPrecio.toFixed(2));
      }
    }

    setFormData(newFormData);
  };

  // Función para manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      mostrarToast('El nombre del insumo es obligatorio', 'error');
      return;
    }

    if (!formData.unidad_medida.trim()) {
      mostrarToast('La unidad de medida es obligatoria', 'error');
      return;
    }

    // Validar categoría solo para PRODUCTO
    if (formData.tipo_insumo === 'PRODUCTO' && formData.id_categoria === 0) {
      mostrarToast('Debe seleccionar una categoría para productos', 'error');
      return;
    }

    // Para INSUMO, no se requiere validación de categoría ya que el backend la creará automáticamente
    // La categoría "INSUMO" se manejará automáticamente en el backend

    if (formData.costo_promedio_ponderado < 0) {
      mostrarToast('El costo promedio ponderado no puede ser negativo', 'error');
      return;
    }

    if (formData.stock_actual < 0) {
      mostrarToast('El stock actual no puede ser negativo', 'error');
      return;
    }

    if (formData.stock_minimo < 0) {
      mostrarToast('El stock mínimo no puede ser negativo', 'error');
      return;
    }

    if (formData.precio_venta < 0) {
      mostrarToast('El precio de venta no puede ser negativo', 'error');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Enviando nuevo insumo:', formData);
      
      // Preparar datos con usuario automático y lógica condicional
      const insumoData: CreateInsumoData = {
        ...formData,
        nombre: formData.nombre.trim(),
        unidad_medida: formData.unidad_medida.trim(),
        // Para INSUMO, el backend manejará la categoría automáticamente
        // Para PRODUCTO, usar la categoría seleccionada
        id_categoria: formData.tipo_insumo === 'INSUMO' ? 0 : formData.id_categoria,
        usuario: currentUser.usuario
      };

      const response: ApiResponse = await createInsumo(insumoData);
      console.log('Respuesta de creación:', response);
      
      if (response.success) {
        mostrarToast('Insumo creado exitosamente', 'success');
        
        // Limpiar formulario
        setFormData({
          nombre: '',
          costo_promedio_ponderado: 0,
          unidad_medida: '',
          tipo_insumo: 'INSUMO',
          stock_actual: 0,
          stock_minimo: 0,
          precio_venta: 0,
          precio_referencia: 0,
          id_categoria: 0,
          id_proveedor: undefined,
          activo: true,
          usuario: currentUser.usuario // Mantener el usuario logueado
        });
        
        // Recargar lista de insumos
        await cargarInsumos();
      } else {
        mostrarToast(response.message || 'Error al crear el insumo', 'error');
      }
    } catch (error) {
      console.error('Error al crear insumo:', error);
      mostrarToast('Error de conexión al crear insumo', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Función para formatear fecha para display
  const formatearFecha = (fecha: string): string => {
    try {
      return new Date(fecha).toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  };

  // Función para formatear números como moneda
  const formatearMoneda = (valor: any): string => {
    try {
      const numero = Number(valor);
      if (isNaN(numero)) return '$0.00';
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(numero);
    } catch (error) {
      console.error('Error formateando moneda:', error);
      return '$0.00';
    }
  };

  // Función para formatear números decimales de forma segura
  const formatearDecimal = (valor: any, decimales: number = 3): string => {
    try {
      const numero = Number(valor);
      if (isNaN(numero)) return '0.000';
      return numero.toFixed(decimales);
    } catch (error) {
      console.error('Error formateando decimal:', error);
      return '0.000';
    }
  };

  // Función para comparar stock de forma segura
  const esStockBajo = (existencia: any, stockMinimo: any): boolean => {
    try {
      const exist = Number(existencia);
      const minimo = Number(stockMinimo);
      if (isNaN(exist) || isNaN(minimo)) return false;
      return exist <= minimo;
    } catch (error) {
      return false;
    }
  };

  // Función para editar insumo

  // Función para iniciar edición

  // Función para resetear formulario
  const resetForm = (): void => {
    setFormData({
      nombre: '',
      costo_promedio_ponderado: 0,
      unidad_medida: '',
      tipo_insumo: 'INSUMO',
      stock_actual: 0,
      stock_minimo: 0,
      precio_venta: 0,
      precio_referencia: 0,
      id_categoria: 0, // Para INSUMO, el backend manejará la categoría automáticamente
      id_proveedor: undefined,
      activo: true,
      usuario: currentUser.usuario
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Función para cancelar edición/creación

  // Función para obtener nombre de categoría
  const obtenerNombreCategoria = (idCategoria: number): string => {
    const categoria = categorias.find(c => c.idCategoria === idCategoria);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  return (
    <div className="config-screen">
      {/* Header con título y botón de regreso */}
      <div className="config-header">
        <div className="config-title-section">
          <h1 className="config-title">Gestión de Insumos</h1>
          <p className="config-subtitle">Administra los insumos del inventario</p>
        </div>
        {onBack && (
          <button 
            className="btn-secondary config-back-btn"
            onClick={onBack}
            type="button"
          >
            ← Regresar
          </button>
        )}
      </div>

      <div className="config-content">
        {/* Formulario de nuevo insumo */}
        <div className="config-form-section insumos-form-section">
          <h2 className="section-title insumos-section-title">Nuevo Insumo</h2>
          <form onSubmit={handleSubmit} className="config-form">
            <div className="form-grid insumos-form-grid">
              {/* Campo nombre del insumo */}
              <div className="form-group">
                <label htmlFor="nombre" className="form-label">
                  Nombre del Insumo *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ingrese el nombre del insumo"
                  maxLength={150}
                  required
                />
              </div>

              {/* Campo tipo de insumo - movido arriba */}
              <div className="form-group">
                <label htmlFor="tipo_insumo" className="form-label">
                  Tipo de Insumo *
                </label>
                <select
                  id="tipo_insumo"
                  name="tipo_insumo"
                  value={formData.tipo_insumo}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="INSUMO">INSUMO</option>
                  <option value="PRODUCTO">PRODUCTO</option>
                </select>
              </div>

              {/* Campo unidad de medida - dropdown o readonly según tipo */}
              <div className="form-group">
                <label htmlFor="unidad_medida" className="form-label">
                  Unidad de Medida *
                </label>
                {formData.tipo_insumo === 'PRODUCTO' ? (
                  <input
                    type="text"
                    id="unidad_medida"
                    name="unidad_medida"
                    value={formData.unidad_medida}
                    className="form-input"
                    readOnly
                    style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  />
                ) : (
                  <select
                    id="unidad_medida"
                    name="unidad_medida"
                    value={formData.unidad_medida}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Seleccione unidad</option>
                    <option value="Kg">Kg</option>
                    <option value="Lt">Lt</option>
                    <option value="ml">ml</option>
                    <option value="gr">gr</option>
                    <option value="pza">pza</option>
                  </select>
                )}
              </div>

              {/* Campo categoría - solo visible para PRODUCTO */}
              {formData.tipo_insumo === 'PRODUCTO' && (
                <div className="form-group">
                  <label htmlFor="id_categoria" className="form-label">
                    Categoría *
                  </label>
                  <select
                    id="id_categoria"
                    name="id_categoria"
                    value={formData.id_categoria}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value={0}>Seleccione una categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.idCategoria} value={categoria.idCategoria}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Campo costo promedio ponderado */}
              <div className="form-group">
                <label htmlFor="costo_promedio_ponderado" className="form-label">
                  Costo Promedio Ponderado
                </label>
                <input
                  type="number"
                  id="costo_promedio_ponderado"
                  name="costo_promedio_ponderado"
                  value={formData.costo_promedio_ponderado}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0.00"
                  min="0"
                  step="0.0001"
                />
              </div>

              {/* Campo stock actual */}
              <div className="form-group">
                <label htmlFor="stock_actual" className="form-label">
                  Stock Inicial/Actual
                </label>
                <input
                  type="number"
                  id="stock_actual"
                  name="stock_actual"
                  value={formData.stock_actual}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0"
                  min="0"
                  step="0.001"
                />
              </div>

              {/* Campo stock mínimo */}
              <div className="form-group">
                <label htmlFor="stock_minimo" className="form-label">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  id="stock_minimo"
                  name="stock_minimo"
                  value={formData.stock_minimo}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0"
                  min="0"
                  step="0.001"
                />
              </div>

              {/* Campo precio de venta - Solo visible para PRODUCTO */}
              {formData.tipo_insumo === 'PRODUCTO' && (
                <>
                  <div className="form-group">
                    <label htmlFor="precio_venta" className="form-label">
                      Precio de Venta
                    </label>
                    <input
                      type="number"
                      id="precio_venta"
                      name="precio_venta"
                      value={formData.precio_venta}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Calculadora de utilidad */}
                  <div className="form-group calculadora-utilidad">
                    <label className="form-label">💰 Calculadora de Utilidad</label>
                    <div className="utilidad-calculator">
                      <div className="calc-row">
                        <label htmlFor="porcentajeUtilidad" className="calc-label">% Utilidad:</label>
                        <input
                          type="number"
                          id="porcentajeUtilidad"
                          value={porcentajeUtilidad}
                          onChange={(e) => handleUtilidadChange(Number(e.target.value))}
                          className="calc-input"
                          placeholder="0"
                          min="0"
                          step="0.1"
                        />
                        <span className="calc-unit">%</span>
                      </div>
                      <div className="calc-info">
                        <div className="calc-detail">
                          <span className="calc-detail-label">Costo:</span>
                          <span className="calc-detail-value">${formData.costo_promedio_ponderado.toFixed(2)}</span>
                        </div>
                        <div className="calc-detail">
                          <span className="calc-detail-label">Precio:</span>
                          <span className="calc-detail-value">${formData.precio_venta.toFixed(2)}</span>
                        </div>
                        <div className="calc-detail">
                          <span className="calc-detail-label">Ganancia:</span>
                          <span className="calc-detail-value">${(formData.precio_venta - formData.costo_promedio_ponderado).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Campo usuario - oculto porque se llena automáticamente */}
            </div>

            {/* Botón de envío */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Guardando...' : 'Guardar Insumo'}
              </button>
              <button
                type="button"
                className="btn-secondary btn-cancel"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* Tabla de insumos existentes */}
        <div className="config-table-section insumos-table-section">
          <h2 className="section-title insumos-section-title">
            Insumos Registrados ({insumos.length})
          </h2>
          
          {loading ? (
            <div className="loading-message">
              <p>Cargando insumos...</p>
            </div>
          ) : insumos.length === 0 ? (
            <div className="empty-message insumos-empty-message">
              <p className="insumos-empty-title">No hay insumos registrados</p>
              <p className="empty-subtitle insumos-empty-subtitle">Crea el primer insumo usando el formulario superior</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table insumos-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Unidad</th>
                    <th>Tipo</th>
                    <th>Categoría</th>
                    <th>Costo Prom.</th>
                    <th>Existencia</th>
                    <th>Stock Mín.</th>
                    <th>Precio Vta.</th>
                    <th>Fecha Registro</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {insumos.map((insumo) => (
                    <tr key={insumo.id_insumo}>
                      <td className="text-center">{insumo.id_insumo}</td>
                      <td className="text-bold insumo-nombre">{insumo.nombre}</td>
                      <td className="text-center insumo-unidad">{insumo.unidad_medida}</td>
                      <td className="text-center">
                        <span className={`insumo-tipo-badge ${insumo.tipo_insumo.toLowerCase()}`}>
                          {insumo.tipo_insumo}
                        </span>
                      </td>
                      <td className="insumo-categoria">{obtenerNombreCategoria(insumo.id_categoria)}</td>
                      <td className="text-right insumo-costo">{formatearMoneda(insumo.costo_promedio_ponderado)}</td>
                      <td className="text-right insumo-existencia">
                        <span className={esStockBajo(insumo.stock_actual, insumo.stock_minimo) ? 'stock-bajo' : ''}>
                          {formatearDecimal(insumo.stock_actual, 3)}
                        </span>
                      </td>
                      <td className="text-right insumo-stock-min">{formatearDecimal(insumo.stock_minimo, 3)}</td>
                      <td className="text-right insumo-precio">{formatearMoneda(insumo.precio_venta)}</td>
                      <td className="text-date insumo-fecha">{formatearFecha(insumo.fecha_registro)}</td>
                      <td className="insumo-usuario">{insumo.usuario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Componente Toast para notificaciones */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ConfigInsumos;