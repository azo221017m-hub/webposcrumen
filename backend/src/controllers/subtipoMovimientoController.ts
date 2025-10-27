// backend/src/controllers/subtipoMovimientoController.ts
// Controlador para gestión de subtipos de movimiento en POSWEBCrumen

import type { Request, Response } from 'express'; // Tipos de Express
import { executeQuery } from '../config/database'; // Función para ejecutar consultas
import type { CreateSubtipoMovimientoData, UpdateSubtipoMovimientoData, SubtipoMovimiento, ApiResponse } from '../types'; // Tipos definidos

/**
 * Obtiene todos los subtipos de movimiento
 * Endpoint: GET /api/subtipo-movimiento
 * @param req - Objeto de petición de Express
 * @param res - Objeto de respuesta de Express
 */
export const getSubtipoMovimientosController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Obteniendo todos los subtipos de movimiento...');

    // Query para obtener todos los subtipos con información del tipo de movimiento
    const query = `
      SELECT 
        s.idsubtipomovimiento,
        s.nombretiposubmovimiento,
        s.idtipomovimiento,
        s.preciosubtipomovimiento,
        t.nombretipomovimiento
      FROM tblposcrumenwebtiposubmovimiento s
      LEFT JOIN tblposcrumenwebtipomovimiento t ON s.idtipomovimiento = t.idtipomovimiento
      ORDER BY t.nombretipomovimiento, s.nombretiposubmovimiento ASC
    `;

    const subtipoMovimientos = await executeQuery(query);
    console.log(`✅ ${subtipoMovimientos.length} subtipos de movimiento encontrados`);

    res.status(200).json({
      success: true,
      message: `${subtipoMovimientos.length} subtipos de movimiento encontrados`,
      data: subtipoMovimientos
    });

  } catch (error) {
    console.error('❌ Error al obtener subtipos de movimiento:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener subtipos de movimiento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Crea un nuevo subtipo de movimiento
 * Endpoint: POST /api/subtipo-movimiento
 * @param req - Objeto de petición de Express
 * @param res - Objeto de respuesta de Express
 */
export const createSubtipoMovimientoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const subtipoMovimientoData: CreateSubtipoMovimientoData = req.body;
    console.log('📦 Creando nuevo subtipo de movimiento:', subtipoMovimientoData);

    // Validaciones básicas
    if (!subtipoMovimientoData.nombretiposubmovimiento || !subtipoMovimientoData.nombretiposubmovimiento.trim()) {
      res.status(400).json({
        success: false,
        message: 'El nombre del subtipo de movimiento es obligatorio'
      });
      return;
    }

    if (!subtipoMovimientoData.idtipomovimiento || isNaN(Number(subtipoMovimientoData.idtipomovimiento))) {
      res.status(400).json({
        success: false,
        message: 'El tipo de movimiento es obligatorio y debe ser válido'
      });
      return;
    }

    if (isNaN(Number(subtipoMovimientoData.preciosubtipomovimiento)) || Number(subtipoMovimientoData.preciosubtipomovimiento) < 0) {
      res.status(400).json({
        success: false,
        message: 'El precio del subtipo debe ser un número válido mayor o igual a 0'
      });
      return;
    }

    // Verificar si existe el tipo de movimiento
    const tipoMovimientoQuery = `
      SELECT idtipomovimiento, nombretipomovimiento 
      FROM tblposcrumenwebtipomovimiento 
      WHERE idtipomovimiento = ?
    `;
    
    const tipoMovimiento = await executeQuery(tipoMovimientoQuery, [subtipoMovimientoData.idtipomovimiento]);
    
    if (tipoMovimiento.length === 0) {
      res.status(404).json({
        success: false,
        message: 'El tipo de movimiento seleccionado no existe'
      });
      return;
    }

    // Verificar si ya existe un subtipo con el mismo nombre para este tipo de movimiento
    const existeQuery = `
      SELECT idsubtipomovimiento 
      FROM tblposcrumenwebtiposubmovimiento 
      WHERE nombretiposubmovimiento = ? AND idtipomovimiento = ?
    `;
    
    const existeSubtipo = await executeQuery(existeQuery, [
      subtipoMovimientoData.nombretiposubmovimiento.trim(), 
      subtipoMovimientoData.idtipomovimiento
    ]);
    
    if (existeSubtipo.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Ya existe un subtipo de movimiento con ese nombre para este tipo de movimiento'
      });
      return;
    }

    // Query para insertar el nuevo subtipo de movimiento
    const insertQuery = `
      INSERT INTO tblposcrumenwebtiposubmovimiento (
        nombretiposubmovimiento,
        idtipomovimiento,
        preciosubtipomovimiento
      ) VALUES (?, ?, ?)
    `;

    const insertParams = [
      subtipoMovimientoData.nombretiposubmovimiento.trim(),
      Number(subtipoMovimientoData.idtipomovimiento),
      Number(subtipoMovimientoData.preciosubtipomovimiento)
    ];

    console.log('📝 Insertando subtipo de movimiento con parámetros:', insertParams);
    
    const result = await executeQuery(insertQuery, insertParams);
    
    if (result.affectedRows === 1) {
      console.log(`✅ Subtipo de movimiento creado exitosamente con ID: ${result.insertId}`);
      
      res.status(201).json({
        success: true,
        message: 'Subtipo de movimiento creado exitosamente',
        data: {
          idsubtipomovimiento: result.insertId,
          ...subtipoMovimientoData,
          nombretipomovimiento: tipoMovimiento[0].nombretipomovimiento
        }
      });
    } else {
      throw new Error('No se pudo insertar el subtipo de movimiento');
    }

  } catch (error) {
    console.error('❌ Error al crear subtipo de movimiento:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear el subtipo de movimiento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Actualiza un subtipo de movimiento existente
 * Endpoint: PUT /api/subtipo-movimiento/:id
 * @param req - Objeto de petición de Express
 * @param res - Objeto de respuesta de Express
 */
export const updateSubtipoMovimientoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const subtipoMovimientoId = parseInt(req.params.id);
    const updateData: UpdateSubtipoMovimientoData = req.body;
    
    console.log(`🔄 Actualizando subtipo de movimiento ID: ${subtipoMovimientoId}`, updateData);

    // Validar ID
    if (isNaN(subtipoMovimientoId) || subtipoMovimientoId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de subtipo de movimiento inválido'
      });
      return;
    }

    // Validaciones de datos
    if (!updateData.nombretiposubmovimiento || !updateData.nombretiposubmovimiento.trim()) {
      res.status(400).json({
        success: false,
        message: 'El nombre del subtipo de movimiento es obligatorio'
      });
      return;
    }

    if (!updateData.idtipomovimiento || isNaN(Number(updateData.idtipomovimiento))) {
      res.status(400).json({
        success: false,
        message: 'El tipo de movimiento es obligatorio y debe ser válido'
      });
      return;
    }

    if (isNaN(Number(updateData.preciosubtipomovimiento)) || Number(updateData.preciosubtipomovimiento) < 0) {
      res.status(400).json({
        success: false,
        message: 'El precio del subtipo debe ser un número válido mayor o igual a 0'
      });
      return;
    }

    // Verificar si existe el subtipo de movimiento
    const existeQuery = `
      SELECT idsubtipomovimiento 
      FROM tblposcrumenwebtiposubmovimiento 
      WHERE idsubtipomovimiento = ?
    `;
    
    const existeSubtipo = await executeQuery(existeQuery, [subtipoMovimientoId]);
    
    if (existeSubtipo.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Subtipo de movimiento no encontrado'
      });
      return;
    }

    // Verificar si existe el tipo de movimiento
    const tipoMovimientoQuery = `
      SELECT idtipomovimiento, nombretipomovimiento 
      FROM tblposcrumenwebtipomovimiento 
      WHERE idtipomovimiento = ?
    `;
    
    const tipoMovimiento = await executeQuery(tipoMovimientoQuery, [updateData.idtipomovimiento]);
    
    if (tipoMovimiento.length === 0) {
      res.status(404).json({
        success: false,
        message: 'El tipo de movimiento seleccionado no existe'
      });
      return;
    }

    // Verificar si ya existe otro subtipo con el mismo nombre para este tipo (excluyendo el actual)
    const duplicadoQuery = `
      SELECT idsubtipomovimiento 
      FROM tblposcrumenwebtiposubmovimiento 
      WHERE nombretiposubmovimiento = ? AND idtipomovimiento = ? AND idsubtipomovimiento != ?
    `;
    
    const duplicado = await executeQuery(duplicadoQuery, [
      updateData.nombretiposubmovimiento.trim(), 
      updateData.idtipomovimiento,
      subtipoMovimientoId
    ]);
    
    if (duplicado.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Ya existe otro subtipo de movimiento con ese nombre para este tipo de movimiento'
      });
      return;
    }

    // Query para actualizar el subtipo de movimiento
    const updateQuery = `
      UPDATE tblposcrumenwebtiposubmovimiento SET
        nombretiposubmovimiento = ?,
        idtipomovimiento = ?,
        preciosubtipomovimiento = ?
      WHERE idsubtipomovimiento = ?
    `;

    const updateParams = [
      updateData.nombretiposubmovimiento.trim(),
      Number(updateData.idtipomovimiento),
      Number(updateData.preciosubtipomovimiento),
      subtipoMovimientoId
    ];

    console.log('🔄 Actualizando subtipo de movimiento con parámetros:', updateParams);
    
    const result = await executeQuery(updateQuery, updateParams);
    
    if (result.affectedRows === 1) {
      console.log(`✅ Subtipo de movimiento ID: ${subtipoMovimientoId} actualizado exitosamente`);
      
      res.status(200).json({
        success: true,
        message: 'Subtipo de movimiento actualizado exitosamente',
        data: {
          idsubtipomovimiento: subtipoMovimientoId,
          ...updateData,
          nombretipomovimiento: tipoMovimiento[0].nombretipomovimiento
        }
      });
    } else {
      throw new Error('No se pudo actualizar el subtipo de movimiento');
    }

  } catch (error) {
    console.error('❌ Error al actualizar subtipo de movimiento:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar el subtipo de movimiento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Elimina un subtipo de movimiento
 * Endpoint: DELETE /api/subtipo-movimiento/:id
 * @param req - Objeto de petición de Express
 * @param res - Objeto de respuesta de Express
 */
export const deleteSubtipoMovimientoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const subtipoMovimientoId = parseInt(req.params.id);
    
    console.log(`🗑️ Eliminando subtipo de movimiento ID: ${subtipoMovimientoId}`);

    // Validar ID
    if (isNaN(subtipoMovimientoId) || subtipoMovimientoId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de subtipo de movimiento inválido'
      });
      return;
    }

    // Verificar si existe el subtipo de movimiento
    const existeQuery = `
      SELECT idsubtipomovimiento 
      FROM tblposcrumenwebtiposubmovimiento 
      WHERE idsubtipomovimiento = ?
    `;
    
    const existeSubtipo = await executeQuery(existeQuery, [subtipoMovimientoId]);
    
    if (existeSubtipo.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Subtipo de movimiento no encontrado'
      });
      return;
    }

    // Query para eliminar el subtipo de movimiento
    const deleteQuery = `
      DELETE FROM tblposcrumenwebtiposubmovimiento 
      WHERE idsubtipomovimiento = ?
    `;

    console.log(`🗑️ Eliminando subtipo de movimiento con ID: ${subtipoMovimientoId}`);
    
    const result = await executeQuery(deleteQuery, [subtipoMovimientoId]);
    
    if (result.affectedRows === 1) {
      console.log(`✅ Subtipo de movimiento ID: ${subtipoMovimientoId} eliminado exitosamente`);
      
      res.status(200).json({
        success: true,
        message: 'Subtipo de movimiento eliminado exitosamente'
      });
    } else {
      throw new Error('No se pudo eliminar el subtipo de movimiento');
    }

  } catch (error) {
    console.error('❌ Error al eliminar subtipo de movimiento:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar el subtipo de movimiento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};