// backend/src/controllers/umComprasController.ts
// Controlador para gestión de unidades de medida de compra en POSWEBCrumen

import type { Request, Response } from 'express'; // Tipos de Express
import { executeQuery } from '../config/database'; // Función para ejecutar consultas
import type { CreateUMCompraData, UpdateUMCompraData, UMCompra, ApiResponse } from '../types'; // Tipos definidos

/**
 * Obtiene todas las unidades de medida de compra
 * Endpoint: GET /api/um-compras
 * @param req - Objeto de petición de Express
 * @param res - Objeto de respuesta de Express
 */
export const getUMComprasController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Obteniendo todas las unidades de medida de compra...');

    // Query para obtener todas las UMCompras ordenadas por fecha de registro descendente
    const query = `
      SELECT 
        idUmCompra,
        nombreUmCompra,
        valor,
        umMatPrima,
        valorConvertido,
        fechaRegistro,
        fechaActualizacion,
        usuario
      FROM tblposrumenwebumcompra
      ORDER BY fechaRegistro DESC
    `;

    const umCompras = await executeQuery(query);
    console.log(`✅ ${umCompras.length} unidades de medida de compra encontradas`);

    res.status(200).json({
      success: true,
      message: `${umCompras.length} unidades de medida de compra encontradas`,
      data: umCompras
    });

  } catch (error) {
    console.error('❌ Error al obtener unidades de medida de compra:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener unidades de medida de compra',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Crea una nueva unidad de medida de compra
 * Endpoint: POST /api/um-compras
 * @param req - Objeto de petición de Express
 * @param res - Objeto de respuesta de Express
 */
export const createUMCompraController = async (req: Request, res: Response): Promise<void> => {
  try {
    const umCompraData: CreateUMCompraData = req.body;
    console.log('📦 Creando nueva unidad de medida de compra:', umCompraData);

    // Validaciones básicas
    if (!umCompraData.nombreUmCompra || !umCompraData.nombreUmCompra.trim()) {
      res.status(400).json({
        success: false,
        message: 'El nombre de la unidad de medida de compra es obligatorio'
      });
      return;
    }

    if (isNaN(Number(umCompraData.valor)) || Number(umCompraData.valor) <= 0) {
      res.status(400).json({
        success: false,
        message: 'El valor debe ser un número válido mayor a 0'
      });
      return;
    }

    // Validar umMatPrima
    const unidadesValidas = ['Lt', 'ml', 'Kl', 'gr', 'pza'];
    if (!umCompraData.umMatPrima || !unidadesValidas.includes(umCompraData.umMatPrima)) {
      res.status(400).json({
        success: false,
        message: 'La unidad de materia prima debe ser una de: Lt, ml, Kl, gr, pza'
      });
      return;
    }

    if (isNaN(Number(umCompraData.valorConvertido)) || Number(umCompraData.valorConvertido) <= 0) {
      res.status(400).json({
        success: false,
        message: 'El valor convertido debe ser un número válido mayor a 0'
      });
      return;
    }

    if (!umCompraData.usuario || !umCompraData.usuario.trim()) {
      res.status(400).json({
        success: false,
        message: 'El usuario es obligatorio'
      });
      return;
    }

    // Verificar si ya existe una UMCompra con el mismo nombre
    const existeQuery = `
      SELECT idUmCompra 
      FROM tblposrumenwebumcompra 
      WHERE nombreUmCompra = ?
    `;
    
    const existeUMCompra = await executeQuery(existeQuery, [umCompraData.nombreUmCompra.trim()]);
    
    if (existeUMCompra.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Ya existe una unidad de medida de compra con ese nombre'
      });
      return;
    }

    // Query para insertar la nueva UMCompra
    const insertQuery = `
      INSERT INTO tblposrumenwebumcompra (
        nombreUmCompra,
        valor,
        umMatPrima,
        valorConvertido,
        fechaRegistro,
        fechaActualizacion,
        usuario
      ) VALUES (?, ?, ?, ?, NOW(), NOW(), ?)
    `;

    const insertParams = [
      umCompraData.nombreUmCompra.trim(),
      Number(umCompraData.valor),
      umCompraData.umMatPrima,
      Number(umCompraData.valorConvertido),
      umCompraData.usuario.trim()
    ];

    console.log('📝 Insertando UMCompra con parámetros:', insertParams);
    
    const result = await executeQuery(insertQuery, insertParams);
    
    if (result.affectedRows === 1) {
      console.log(`✅ UMCompra creada exitosamente con ID: ${result.insertId}`);
      
      res.status(201).json({
        success: true,
        message: 'Unidad de medida de compra creada exitosamente',
        data: {
          idUmCompra: result.insertId,
          ...umCompraData
        }
      });
    } else {
      throw new Error('No se pudo insertar la unidad de medida de compra');
    }

  } catch (error) {
    console.error('❌ Error al crear unidad de medida de compra:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear la unidad de medida de compra',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Actualiza una unidad de medida de compra existente
 * Endpoint: PUT /api/um-compras/:id
 * @param req - Objeto de petición de Express
 * @param res - Objeto de respuesta de Express
 */
export const updateUMCompraController = async (req: Request, res: Response): Promise<void> => {
  try {
    const umCompraId = parseInt(req.params.id);
    const updateData: UpdateUMCompraData = req.body;
    
    console.log(`🔄 Actualizando UMCompra ID: ${umCompraId}`, updateData);

    // Validar ID
    if (isNaN(umCompraId) || umCompraId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de unidad de medida de compra inválido'
      });
      return;
    }

    // Validaciones de datos
    if (!updateData.nombreUmCompra || !updateData.nombreUmCompra.trim()) {
      res.status(400).json({
        success: false,
        message: 'El nombre de la unidad de medida de compra es obligatorio'
      });
      return;
    }

    if (isNaN(Number(updateData.valor)) || Number(updateData.valor) <= 0) {
      res.status(400).json({
        success: false,
        message: 'El valor debe ser un número válido mayor a 0'
      });
      return;
    }

    // Validar umMatPrima
    const unidadesValidas = ['Lt', 'ml', 'Kl', 'gr', 'pza'];
    if (!updateData.umMatPrima || !unidadesValidas.includes(updateData.umMatPrima)) {
      res.status(400).json({
        success: false,
        message: 'La unidad de materia prima debe ser una de: Lt, ml, Kl, gr, pza'
      });
      return;
    }

    if (isNaN(Number(updateData.valorConvertido)) || Number(updateData.valorConvertido) <= 0) {
      res.status(400).json({
        success: false,
        message: 'El valor convertido debe ser un número válido mayor a 0'
      });
      return;
    }

    // Verificar si existe la UMCompra
    const existeQuery = `
      SELECT idUmCompra 
      FROM tblposrumenwebumcompra 
      WHERE idUmCompra = ?
    `;
    
    const existeUMCompra = await executeQuery(existeQuery, [umCompraId]);
    
    if (existeUMCompra.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Unidad de medida de compra no encontrada'
      });
      return;
    }

    // Verificar si ya existe otra UMCompra con el mismo nombre (excluyendo la actual)
    const duplicadoQuery = `
      SELECT idUmCompra 
      FROM tblposrumenwebumcompra 
      WHERE nombreUmCompra = ? AND idUmCompra != ?
    `;
    
    const duplicado = await executeQuery(duplicadoQuery, [updateData.nombreUmCompra.trim(), umCompraId]);
    
    if (duplicado.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Ya existe otra unidad de medida de compra con ese nombre'
      });
      return;
    }

    // Query para actualizar la UMCompra
    const updateQuery = `
      UPDATE tblposrumenwebumcompra SET
        nombreUmCompra = ?,
        valor = ?,
        umMatPrima = ?,
        valorConvertido = ?,
        fechaActualizacion = NOW()
      WHERE idUmCompra = ?
    `;

    const updateParams = [
      updateData.nombreUmCompra.trim(),
      Number(updateData.valor),
      updateData.umMatPrima,
      Number(updateData.valorConvertido),
      umCompraId
    ];

    console.log('🔄 Actualizando UMCompra con parámetros:', updateParams);
    
    const result = await executeQuery(updateQuery, updateParams);
    
    if (result.affectedRows === 1) {
      console.log(`✅ UMCompra ID: ${umCompraId} actualizada exitosamente`);
      
      res.status(200).json({
        success: true,
        message: 'Unidad de medida de compra actualizada exitosamente',
        data: {
          idUmCompra: umCompraId,
          ...updateData
        }
      });
    } else {
      throw new Error('No se pudo actualizar la unidad de medida de compra');
    }

  } catch (error) {
    console.error('❌ Error al actualizar unidad de medida de compra:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar la unidad de medida de compra',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Elimina una unidad de medida de compra
 * Endpoint: DELETE /api/um-compras/:id
 * @param req - Objeto de petición de Express
 * @param res - Objeto de respuesta de Express
 */
export const deleteUMCompraController = async (req: Request, res: Response): Promise<void> => {
  try {
    const umCompraId = parseInt(req.params.id);
    
    console.log(`🗑️ Eliminando UMCompra ID: ${umCompraId}`);

    // Validar ID
    if (isNaN(umCompraId) || umCompraId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID de unidad de medida de compra inválido'
      });
      return;
    }

    // Verificar si existe la UMCompra
    const existeQuery = `
      SELECT idUmCompra 
      FROM tblposrumenwebumcompra 
      WHERE idUmCompra = ?
    `;
    
    const existeUMCompra = await executeQuery(existeQuery, [umCompraId]);
    
    if (existeUMCompra.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Unidad de medida de compra no encontrada'
      });
      return;
    }

    // Query para eliminar la UMCompra
    const deleteQuery = `
      DELETE FROM tblposrumenwebumcompra 
      WHERE idUmCompra = ?
    `;

    console.log(`🗑️ Eliminando UMCompra con ID: ${umCompraId}`);
    
    const result = await executeQuery(deleteQuery, [umCompraId]);
    
    if (result.affectedRows === 1) {
      console.log(`✅ UMCompra ID: ${umCompraId} eliminada exitosamente`);
      
      res.status(200).json({
        success: true,
        message: 'Unidad de medida de compra eliminada exitosamente'
      });
    } else {
      throw new Error('No se pudo eliminar la unidad de medida de compra');
    }

  } catch (error) {
    console.error('❌ Error al eliminar unidad de medida de compra:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar la unidad de medida de compra',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};