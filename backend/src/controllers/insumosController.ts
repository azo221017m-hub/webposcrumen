import { Request, Response } from 'express';
import pool from '../config/database';

export const getAllInsumos = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('?? Obteniendo todos los insumos...');
    
    const query = `
      SELECT 
        idinsumo,
        tipo_insumo,
        nombre,
        unidad_medida,
        stock_actual,
        stock_minimo,
        costo_promedio_ponderado,
        precio_venta,
        id_cuentacontable,
        activo
      FROM tblposcrumenwebinsumos 
      WHERE activo = 1
      ORDER BY nombre ASC
    `;
    
    const [rows] = await pool.execute(query);
    console.log(`? Se encontraron ${Array.isArray(rows) ? rows.length : 0} insumos`);
    
    res.json({
      success: true,
      data: rows,
      message: 'Insumos obtenidos correctamente'
    });
    
  } catch (error) {
    console.error('? Error al obtener insumos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener insumos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getInsumoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`?? Buscando insumo con ID: ${id}`);
    
    const query = `
      SELECT 
        idinsumo,
        tipo_insumo,
        nombre,
        unidad_medida,
        stock_actual,
        stock_minimo,
        costo_promedio_ponderado,
        precio_venta,
        id_cuentacontable,
        activo
      FROM tblposcrumenwebinsumos 
      WHERE idinsumo = ? AND activo = 1
    `;
    
    const [rows] = await pool.execute(query, [id]);
    const insumos = rows as any[];
    
    if (insumos.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
      return;
    }
    
    console.log(`? Insumo encontrado: ${insumos[0].nombre}`);
    res.json({
      success: true,
      data: insumos[0],
      message: 'Insumo obtenido correctamente'
    });
    
  } catch (error) {
    console.error('? Error al obtener insumo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener insumo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const createInsumo = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      tipo_insumo,
      nombre,
      unidad_medida,
      stock_actual,
      stock_minimo,
      costo_promedio_ponderado,
      precio_venta,
      id_cuentacontable
    } = req.body;
    
    console.log('?? Creando nuevo insumo:', { nombre, tipo_insumo });
    
    if (!nombre || !tipo_insumo || !unidad_medida) {
      res.status(400).json({
        success: false,
        message: 'Los campos nombre, tipo_insumo y unidad_medida son obligatorios'
      });
      return;
    }
    
    const checkQuery = 'SELECT COUNT(*) as count FROM tblposcrumenwebinsumos WHERE nombre = ? AND activo = 1';
    const [checkResult] = await pool.execute(checkQuery, [nombre]);
    const checkRows = checkResult as any[];
    
    if (checkRows[0].count > 0) {
      res.status(409).json({
        success: false,
        message: 'Ya existe un insumo con ese nombre'
      });
      return;
    }
    
    const insertQuery = `
      INSERT INTO tblposcrumenwebinsumos (
        tipo_insumo,
        nombre,
        unidad_medida,
        stock_actual,
        stock_minimo,
        costo_promedio_ponderado,
        precio_venta,
        id_cuentacontable,
        activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;
    
    const [result] = await pool.execute(insertQuery, [
      tipo_insumo,
      nombre,
      unidad_medida,
      stock_actual || 0,
      stock_minimo || 0,
      costo_promedio_ponderado || 0,
      precio_venta || 0,
      id_cuentacontable || null
    ]);
    
    const insertResult = result as any;
    console.log(`? Insumo creado con ID: ${insertResult.insertId}`);
    
    res.status(201).json({
      success: true,
      data: {
        idinsumo: insertResult.insertId,
        ...req.body
      },
      message: 'Insumo creado correctamente'
    });
    
  } catch (error) {
    console.error('? Error al crear insumo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear insumo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const updateInsumo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      tipo_insumo,
      nombre,
      unidad_medida,
      stock_actual,
      stock_minimo,
      costo_promedio_ponderado,
      precio_venta,
      id_cuentacontable
    } = req.body;
    
    console.log(`?? Actualizando insumo ID: ${id}`);
    
    if (!nombre || !tipo_insumo || !unidad_medida) {
      res.status(400).json({
        success: false,
        message: 'Los campos nombre, tipo_insumo y unidad_medida son obligatorios'
      });
      return;
    }
    
    const checkQuery = 'SELECT COUNT(*) as count FROM tblposcrumenwebinsumos WHERE idinsumo = ? AND activo = 1';
    const [checkResult] = await pool.execute(checkQuery, [id]);
    const checkRows = checkResult as any[];
    
    if (checkRows[0].count === 0) {
      res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
      return;
    }
    
    const duplicateQuery = 'SELECT COUNT(*) as count FROM tblposcrumenwebinsumos WHERE nombre = ? AND idinsumo != ? AND activo = 1';
    const [duplicateResult] = await pool.execute(duplicateQuery, [nombre, id]);
    const duplicateRows = duplicateResult as any[];
    
    if (duplicateRows[0].count > 0) {
      res.status(409).json({
        success: false,
        message: 'Ya existe otro insumo con ese nombre'
      });
      return;
    }
    
    const updateQuery = `
      UPDATE tblposcrumenwebinsumos SET
        tipo_insumo = ?,
        nombre = ?,
        unidad_medida = ?,
        stock_actual = ?,
        stock_minimo = ?,
        costo_promedio_ponderado = ?,
        precio_venta = ?,
        id_cuentacontable = ?
      WHERE idinsumo = ? AND activo = 1
    `;
    
    await pool.execute(updateQuery, [
      tipo_insumo,
      nombre,
      unidad_medida,
      stock_actual || 0,
      stock_minimo || 0,
      costo_promedio_ponderado || 0,
      precio_venta || 0,
      id_cuentacontable || null,
      id
    ]);
    
    console.log(`? Insumo actualizado correctamente`);
    
    res.json({
      success: true,
      data: {
        idinsumo: parseInt(id),
        ...req.body
      },
      message: 'Insumo actualizado correctamente'
    });
    
  } catch (error) {
    console.error('? Error al actualizar insumo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar insumo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const deleteInsumo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`??? Eliminando insumo ID: ${id}`);
    
    const checkQuery = 'SELECT COUNT(*) as count FROM tblposcrumenwebinsumos WHERE idinsumo = ? AND activo = 1';
    const [checkResult] = await pool.execute(checkQuery, [id]);
    const checkRows = checkResult as any[];
    
    if (checkRows[0].count === 0) {
      res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
      return;
    }
    
    const deleteQuery = `
      UPDATE tblposcrumenwebinsumos 
      SET activo = 0 
      WHERE idinsumo = ?
    `;
    
    await pool.execute(deleteQuery, [id]);
    console.log(`? Insumo eliminado correctamente`);
    
    res.json({
      success: true,
      message: 'Insumo eliminado correctamente'
    });
    
  } catch (error) {
    console.error('? Error al eliminar insumo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar insumo',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getCuentasContablesForDropdown = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('?? Obteniendo cuentas contables de inventario...');
    
    const query = `
      SELECT 
        idcuentacontable,
        nombrecuentacontable,
        categoriacuentacontable,
        naturalezacuentacontable
      FROM tblposcrumenwebcuentascontables 
      WHERE categoriacuentacontable = 'Inventario'
      ORDER BY nombrecuentacontable ASC
    `;
    
    const [rows] = await pool.execute(query);
    console.log(`? Se encontraron ${Array.isArray(rows) ? rows.length : 0} cuentas contables de inventario`);
    
    res.json({
      success: true,
      data: rows,
      message: 'Cuentas contables obtenidas correctamente'
    });
    
  } catch (error) {
    console.error('? Error al obtener cuentas contables:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener cuentas contables',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
