// backend/src/controllers/proveedoresController.ts
// Controlador para la gestión de proveedores en POSWEBCrumen

import type { Request, Response } from 'express'; // Importa tipos de Express
import pool from '../config/database'; // Importa pool de conexiones
import type { 
  Proveedor, 
  CreateProveedorData, 
  UpdateProveedorData 
} from '../types'; // Importa tipos de proveedor

/**
 * Obtiene todos los proveedores
 * GET /api/proveedores
 */
export const getProveedores = async (req: Request, res: Response): Promise<void> => {
  console.log('🏪 [Controller] Obteniendo lista de proveedores'); // Log de operación
  
  try {
    // Consulta SQL para obtener todos los proveedores
    const query = `
      SELECT 
        id_proveedor as id,
        nombre,
        rfc,
        telefono,
        correo,
        direccion,
        banco,
        cuenta,
        activo,
        fecha_registro as created_at,
        fecha_registro as updated_at
      FROM tblposcrumenwebproveedores
      ORDER BY nombre ASC
    `;

    console.log('📝 [Controller] Ejecutando consulta SQL:', query); // Log de consulta

    // Ejecuta la consulta
    const [rows] = await pool.execute(query);
    const proveedores = rows as Proveedor[]; // Convierte resultado a tipo Proveedor

    console.log(`✅ [Controller] ${proveedores.length} proveedores encontrados`); // Log de resultado
    
    // Envía respuesta exitosa
    res.json({
      success: true,
      data: proveedores,
      message: 'Proveedores obtenidos correctamente'
    });

  } catch (error) {
    console.error('💥 [Controller] Error al obtener proveedores:', error); // Log de error
    
    // Envía respuesta de error
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor al obtener proveedores'
    });
  }
};

/**
 * Crea un nuevo proveedor
 * POST /api/proveedores
 */
export const createProveedor = async (req: Request, res: Response): Promise<void> => {
  console.log('🏪 [Controller] Creando nuevo proveedor'); // Log de operación
  
  try {
    const proveedorData: CreateProveedorData = req.body; // Obtiene datos del cuerpo
    console.log('📝 [Controller] Datos recibidos:', proveedorData); // Log de datos

    // Validaciones básicas
    if (!proveedorData.nombre || !proveedorData.nombre.trim()) {
      console.log('❌ [Controller] Nombre requerido'); // Log de validación
      res.status(400).json({
        success: false,
        data: null,
        message: 'El nombre del proveedor es requerido'
      });
      return;
    }

    // Query para insertar proveedor
    const query = `
      INSERT INTO tblposcrumenwebproveedores (
        nombre, rfc, telefono, correo, direccion, banco, cuenta, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      proveedorData.nombre.trim(),
      proveedorData.rfc || null,
      proveedorData.telefono || null,
      proveedorData.correo || null,
      proveedorData.direccion || null,
      proveedorData.banco || null,
      proveedorData.cuenta || null,
      proveedorData.activo ?? 1
    ];

    console.log('📝 [Controller] Ejecutando inserción con valores:', values); // Log de valores

    // Ejecuta la inserción
    const [result] = await pool.execute(query, values);
    const insertResult = result as any; // Resultado de inserción

    console.log('✅ [Controller] Proveedor creado con ID:', insertResult.insertId); // Log de éxito

    // Obtiene el proveedor creado
    const getQuery = `
      SELECT 
        id_proveedor as id,
        nombre,
        rfc,
        telefono,
        correo,
        direccion,
        banco,
        cuenta,
        activo,
        fecha_registro as created_at,
        fecha_registro as updated_at
      FROM tblposcrumenwebproveedores 
      WHERE id_proveedor = ?
    `;
    
    const [newProveedorRows] = await pool.execute(getQuery, [insertResult.insertId]);
    const newProveedor = (newProveedorRows as Proveedor[])[0];

    // Envía respuesta exitosa
    res.status(201).json({
      success: true,
      data: newProveedor,
      message: 'Proveedor creado correctamente'
    });

  } catch (error) {
    console.error('💥 [Controller] Error al crear proveedor:', error); // Log de error
    
    // Envía respuesta de error
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor al crear proveedor'
    });
  }
};

/**
 * Actualiza un proveedor existente
 * PUT /api/proveedores/:id
 */
export const updateProveedor = async (req: Request, res: Response): Promise<void> => {
  console.log('🏪 [Controller] Actualizando proveedor'); // Log de operación
  
  try {
    const proveedorId = parseInt(req.params.id); // Obtiene ID del parámetro
    const proveedorData: UpdateProveedorData = req.body; // Obtiene datos del cuerpo

    console.log('📝 [Controller] Actualizando proveedor ID:', proveedorId); // Log de ID
    console.log('📝 [Controller] Datos recibidos:', proveedorData); // Log de datos

    // Validación del ID
    if (isNaN(proveedorId)) {
      console.log('❌ [Controller] ID de proveedor inválido'); // Log de validación
      res.status(400).json({
        success: false,
        data: null,
        message: 'ID de proveedor inválido'
      });
      return;
    }

    // Validaciones básicas
    if (!proveedorData.nombre || !proveedorData.nombre.trim()) {
      console.log('❌ [Controller] Nombre requerido'); // Log de validación
      res.status(400).json({
        success: false,
        data: null,
        message: 'El nombre del proveedor es requerido'
      });
      return;
    }

    // Query para actualizar proveedor
    const query = `
      UPDATE tblposcrumenwebproveedores 
      SET 
        nombre = ?,
        rfc = ?,
        telefono = ?,
        correo = ?,
        direccion = ?,
        banco = ?,
        cuenta = ?,
        activo = ?
      WHERE id_proveedor = ?
    `;

    const values = [
      proveedorData.nombre.trim(),
      proveedorData.rfc || null,
      proveedorData.telefono || null,
      proveedorData.correo || null,
      proveedorData.direccion || null,
      proveedorData.banco || null,
      proveedorData.cuenta || null,
      proveedorData.activo ?? 1,
      proveedorId
    ];

    console.log('📝 [Controller] Ejecutando actualización con valores:', values); // Log de valores

    // Ejecuta la actualización
    const [result] = await pool.execute(query, values);
    const updateResult = result as any; // Resultado de actualización

    // Verifica si se actualizó algún registro
    if (updateResult.affectedRows === 0) {
      console.log('❌ [Controller] Proveedor no encontrado'); // Log de error
      res.status(404).json({
        success: false,
        data: null,
        message: 'Proveedor no encontrado'
      });
      return;
    }

    console.log('✅ [Controller] Proveedor actualizado correctamente'); // Log de éxito

    // Obtiene el proveedor actualizado
    const getQuery = `
      SELECT 
        id_proveedor as id,
        nombre,
        rfc,
        telefono,
        correo,
        direccion,
        banco,
        cuenta,
        activo,
        fecha_registro as created_at,
        fecha_registro as updated_at
      FROM tblposcrumenwebproveedores 
      WHERE id_proveedor = ?
    `;
    
    const [updatedProveedorRows] = await pool.execute(getQuery, [proveedorId]);
    const updatedProveedor = (updatedProveedorRows as Proveedor[])[0];

    // Envía respuesta exitosa
    res.json({
      success: true,
      data: updatedProveedor,
      message: 'Proveedor actualizado correctamente'
    });

  } catch (error) {
    console.error('💥 [Controller] Error al actualizar proveedor:', error); // Log de error
    
    // Envía respuesta de error
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor al actualizar proveedor'
    });
  }
};

/**
 * Elimina un proveedor (soft delete - marca como inactivo)
 * DELETE /api/proveedores/:id
 */
export const deleteProveedor = async (req: Request, res: Response): Promise<void> => {
  console.log('🏪 [Controller] Eliminando proveedor'); // Log de operación
  
  try {
    const proveedorId = parseInt(req.params.id); // Obtiene ID del parámetro

    console.log('📝 [Controller] Eliminando proveedor ID:', proveedorId); // Log de ID

    // Validación del ID
    if (isNaN(proveedorId)) {
      console.log('❌ [Controller] ID de proveedor inválido'); // Log de validación
      res.status(400).json({
        success: false,
        data: null,
        message: 'ID de proveedor inválido'
      });
      return;
    }

    // Query para soft delete (marcar como inactivo)
    const query = `
      UPDATE tblposcrumenwebproveedores 
      SET activo = 0
      WHERE id_proveedor = ?
    `;

    console.log('📝 [Controller] Ejecutando soft delete'); // Log de operación

    // Ejecuta la actualización
    const [result] = await pool.execute(query, [proveedorId]);
    const deleteResult = result as any; // Resultado de eliminación

    // Verifica si se actualizó algún registro
    if (deleteResult.affectedRows === 0) {
      console.log('❌ [Controller] Proveedor no encontrado'); // Log de error
      res.status(404).json({
        success: false,
        data: null,
        message: 'Proveedor no encontrado'
      });
      return;
    }

    console.log('✅ [Controller] Proveedor eliminado correctamente (soft delete)'); // Log de éxito

    // Envía respuesta exitosa
    res.json({
      success: true,
      data: { id: proveedorId },
      message: 'Proveedor eliminado correctamente'
    });

  } catch (error) {
    console.error('💥 [Controller] Error al eliminar proveedor:', error); // Log de error
    
    // Envía respuesta de error
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor al eliminar proveedor'
    });
  }
};