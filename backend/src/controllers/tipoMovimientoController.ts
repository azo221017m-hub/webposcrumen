// backend/src/controllers/tipoMovimientoController.ts
// Controlador para gestión de tipos de movimiento en POSWEBCrumen

import type { Request, Response } from 'express'; // Tipos de Express
import { executeQuery } from '../config/database'; // Función para ejecutar consultas
import type { CreateTipoMovimientoData, UpdateTipoMovimientoData, TipoMovimiento, ApiResponse } from '../types'; // Tipos definidos

/**
 * Obtiene todos los tipos de movimiento
 * Endpoint: GET /api/tipo-movimiento
 * @param req - Objeto de petición de Express
 * @param res - Objeto de respuesta de Express
 */
export const getTipoMovimientosController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Obteniendo todos los tipos de movimiento...');

    // Query para obtener todos los tipos de movimiento ordenados por nombre
    const query = `
      SELECT 
        idtipomovimiento,
        nombretipomovimiento,
        categoriatipomovimiento
      FROM tblposcrumenwebtipomovimiento
      ORDER BY categoriatipomovimiento, nombretipomovimiento ASC
    `;

    const tipoMovimientos = await executeQuery(query);
    console.log(`✅ ${tipoMovimientos.length} tipos de movimiento encontrados`);

    res.status(200).json({
      success: true,
      message: `${tipoMovimientos.length} tipos de movimiento encontrados`,
      data: tipoMovimientos
    });

  } catch (error) {
    console.error('❌ Error al obtener tipos de movimiento:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener tipos de movimiento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Crea un nuevo tipo de movimiento
 * Endpoint: POST /api/tipo-movimiento
 * @param req - Objeto de petición de Express
 * @param res - Objeto de respuesta de Express
 */
export const createTipoMovimientoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const tipoMovimientoData: CreateTipoMovimientoData = req.body;
    console.log('📦 Creando nuevo tipo de movimiento:', tipoMovimientoData);

    // Validaciones básicas
    if (!tipoMovimientoData.nombretipomovimiento || !tipoMovimientoData.nombretipomovimiento.trim()) {
      res.status(400).json({
        success: false,
        message: 'El nombre del tipo de movimiento es obligatorio'
      });
      return;
    }

    if (!tipoMovimientoData.categoriatipomovimiento || !tipoMovimientoData.categoriatipomovimiento.trim()) {
      res.status(400).json({
        success: false,
        message: 'La categoría del tipo de movimiento es obligatoria'
      });
      return;
    }

    // Validar categorías permitidas
    const categoriasValidas = [
      'Gastos de operación',
      'Gastos financieros',
      'Gastos extraordinarios',
      'Compras de inventario',
      'Compras de activos fijos',
      'Compras de servicios',
      'Compras administrativas',
      'Compras extraordinarias / inversión'
    ];

    if (!categoriasValidas.includes(tipoMovimientoData.categoriatipomovimiento)) {
      res.status(400).json({
        success: false,
        message: 'La categoría debe ser una de las opciones válidas'
      });
      return;
    }

    // Verificar si ya existe un tipo de movimiento con el mismo nombre
    const existeQuery = `
      SELECT idtipomovimiento 
      FROM tblposcrumenwebtipomovimiento 
      WHERE nombretipomovimiento = ?
    `;
    
    const existeTipoMovimiento = await executeQuery(existeQuery, [tipoMovimientoData.nombretipomovimiento.trim()]);
    
    if (existeTipoMovimiento.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Ya existe un tipo de movimiento con ese nombre'
      });
      return;
    }

    // Query para insertar el nuevo tipo de movimiento
    const insertQuery = `
      INSERT INTO tblposcrumenwebtipomovimiento (
        nombretipomovimiento,
        categoriatipomovimiento
      ) VALUES (?, ?)
    `;

    const insertParams = [
      tipoMovimientoData.nombretipomovimiento.trim(),
      tipoMovimientoData.categoriatipomovimiento.trim()
    ];

    console.log('📝 Insertando tipo de movimiento con parámetros:', insertParams);
    
    const result = await executeQuery(insertQuery, insertParams);
    
    if (result.affectedRows === 1) {
      console.log(`✅ Tipo de movimiento creado exitosamente con ID: ${result.insertId}`);
      
      res.status(201).json({
        success: true,
        message: 'Tipo de movimiento creado exitosamente',
        data: {
          idtipomovimiento: result.insertId,
          ...tipoMovimientoData
        }
      });
    } else {
      throw new Error('No se pudo insertar el tipo de movimiento');
    }

  } catch (error) {
    console.error('❌ Error al crear tipo de movimiento:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear el tipo de movimiento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Actualiza un tipo de movimiento existente
 * Endpoint: PUT /api/tipo-movimiento/:id
 * @param req - Objeto de petición de Express
 * @param res - Objeto de respuesta de Express
 */
export const updateTipoMovimientoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const tipoMovimientoId = parseInt(req.params.id);
    const updateData: UpdateTipoMovimientoData = req.body;
    
    console.log(`🔄 Actualizando tipo de movimiento ID: ${tipoMovimientoId}`, updateData);

    // Validar ID
    if (isNaN(tipoMovimientoId) || tipoMovimientoId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de tipo de movimiento inválido'
      });
      return;
    }

    // Validaciones de datos
    if (!updateData.nombretipomovimiento || !updateData.nombretipomovimiento.trim()) {
      res.status(400).json({
        success: false,
        message: 'El nombre del tipo de movimiento es obligatorio'
      });
      return;
    }

    if (!updateData.categoriatipomovimiento || !updateData.categoriatipomovimiento.trim()) {
      res.status(400).json({
        success: false,
        message: 'La categoría del tipo de movimiento es obligatoria'
      });
      return;
    }

    // Validar categorías permitidas
    const categoriasValidas = [
      'Gastos de operación',
      'Gastos financieros',
      'Gastos extraordinarios',
      'Compras de inventario',
      'Compras de activos fijos',
      'Compras de servicios',
      'Compras administrativas',
      'Compras extraordinarias / inversión'
    ];

    if (!categoriasValidas.includes(updateData.categoriatipomovimiento)) {
      res.status(400).json({
        success: false,
        message: 'La categoría debe ser una de las opciones válidas'
      });
      return;
    }

    // Verificar si existe el tipo de movimiento
    const existeQuery = `
      SELECT idtipomovimiento 
      FROM tblposcrumenwebtipomovimiento 
      WHERE idtipomovimiento = ?
    `;
    
    const existeTipoMovimiento = await executeQuery(existeQuery, [tipoMovimientoId]);
    
    if (existeTipoMovimiento.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Tipo de movimiento no encontrado'
      });
      return;
    }

    // Verificar si ya existe otro tipo de movimiento con el mismo nombre (excluyendo el actual)
    const duplicadoQuery = `
      SELECT idtipomovimiento 
      FROM tblposcrumenwebtipomovimiento 
      WHERE nombretipomovimiento = ? AND idtipomovimiento != ?
    `;
    
    const duplicado = await executeQuery(duplicadoQuery, [updateData.nombretipomovimiento.trim(), tipoMovimientoId]);
    
    if (duplicado.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Ya existe otro tipo de movimiento con ese nombre'
      });
      return;
    }

    // Query para actualizar el tipo de movimiento
    const updateQuery = `
      UPDATE tblposcrumenwebtipomovimiento SET
        nombretipomovimiento = ?,
        categoriatipomovimiento = ?
      WHERE idtipomovimiento = ?
    `;

    const updateParams = [
      updateData.nombretipomovimiento.trim(),
      updateData.categoriatipomovimiento.trim(),
      tipoMovimientoId
    ];

    console.log('🔄 Actualizando tipo de movimiento con parámetros:', updateParams);
    
    const result = await executeQuery(updateQuery, updateParams);
    
    if (result.affectedRows === 1) {
      console.log(`✅ Tipo de movimiento ID: ${tipoMovimientoId} actualizado exitosamente`);
      
      res.status(200).json({
        success: true,
        message: 'Tipo de movimiento actualizado exitosamente',
        data: {
          idtipomovimiento: tipoMovimientoId,
          ...updateData
        }
      });
    } else {
      throw new Error('No se pudo actualizar el tipo de movimiento');
    }

  } catch (error) {
    console.error('❌ Error al actualizar tipo de movimiento:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar el tipo de movimiento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Elimina un tipo de movimiento
 * Endpoint: DELETE /api/tipo-movimiento/:id
 * @param req - Objeto de petición de Express
 * @param res - Objeto de respuesta de Express
 */
export const deleteTipoMovimientoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const tipoMovimientoId = parseInt(req.params.id);
    
    console.log(`🗑️ Eliminando tipo de movimiento ID: ${tipoMovimientoId}`);

    // Validar ID
    if (isNaN(tipoMovimientoId) || tipoMovimientoId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de tipo de movimiento inválido'
      });
      return;
    }

    // Verificar si existe el tipo de movimiento
    const existeQuery = `
      SELECT idtipomovimiento 
      FROM tblposcrumenwebtipomovimiento 
      WHERE idtipomovimiento = ?
    `;
    
    const existeTipoMovimiento = await executeQuery(existeQuery, [tipoMovimientoId]);
    
    if (existeTipoMovimiento.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Tipo de movimiento no encontrado'
      });
      return;
    }

    // Query para eliminar el tipo de movimiento
    const deleteQuery = `
      DELETE FROM tblposcrumenwebtipomovimiento 
      WHERE idtipomovimiento = ?
    `;

    console.log(`🗑️ Eliminando tipo de movimiento con ID: ${tipoMovimientoId}`);
    
    const result = await executeQuery(deleteQuery, [tipoMovimientoId]);
    
    if (result.affectedRows === 1) {
      console.log(`✅ Tipo de movimiento ID: ${tipoMovimientoId} eliminado exitosamente`);
      
      res.status(200).json({
        success: true,
        message: 'Tipo de movimiento eliminado exitosamente'
      });
    } else {
      throw new Error('No se pudo eliminar el tipo de movimiento');
    }

  } catch (error) {
    console.error('❌ Error al eliminar tipo de movimiento:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar el tipo de movimiento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};