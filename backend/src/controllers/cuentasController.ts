// backend/src/controllers/cuentasController.ts
// Controlador para gestión de cuentas contables en POSWEBCrumen

import type { Request, Response } from 'express'; // Importa tipos de Express
import pool from '../config/database'; // Importa pool de conexiones
import type { ApiResponse, NaturalezaMovimiento, CategoriaCompra, CategoriaGasto } from '../types'; // Importa tipos personalizados

// Tipos para datos de entrada sin ID (para creación y actualización)
interface CreateCuentaContableData {
  nombrecuentacontable: string;
  categoriacuentacontable: CategoriaCompra | CategoriaGasto;
  naturalezacuentacontable: NaturalezaMovimiento;
}

interface UpdateCuentaContableData extends CreateCuentaContableData {}

// Controlador para obtener todas las cuentas contables
export const getAllTiposMovimiento = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('💳 Obteniendo todas las cuentas contables'); // Log de inicio
    
    // Consulta todas las cuentas contables de la nueva tabla
    const [rows] = await pool.execute(`
      SELECT 
        idcuentacontable, nombrecuentacontable, categoriacuentacontable, naturalezacuentacontable
      FROM tblposcrumenwebcuentascontables 
      ORDER BY naturalezacuentacontable, categoriacuentacontable, nombrecuentacontable
    `);
    const cuentasContables = rows as any[];

    console.log(`✅ Se encontraron ${cuentasContables.length} cuentas contables`); // Log de resultado
    
    res.json({
      success: true,
      message: 'Cuentas contables obtenidas exitosamente',
      data: cuentasContables
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo cuentas contables:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error obteniendo cuentas contables',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para crear una nueva cuenta contable
export const createTipoMovimiento = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('💳 Creando nueva cuenta contable'); // Log de inicio
    const cuentaData: CreateCuentaContableData = req.body; // Extrae datos del cuerpo

    // Valida campos requeridos
    const requiredFields = ['nombrecuentacontable', 'categoriacuentacontable', 'naturalezacuentacontable'];
    const missingFields = requiredFields.filter(field => 
      cuentaData[field as keyof CreateCuentaContableData] === undefined || 
      cuentaData[field as keyof CreateCuentaContableData] === null ||
      cuentaData[field as keyof CreateCuentaContableData] === ''
    );
    
    if (missingFields.length > 0) {
      console.log(`❌ Faltan campos requeridos: ${missingFields.join(', ')}`); // Log de validación
      res.status(400).json({
        success: false,
        message: `Faltan campos requeridos: ${missingFields.join(', ')}`,
        error: 'MISSING_FIELDS'
      } as ApiResponse);
      return;
    }

    // Valida que naturalezacuentacontable tenga un valor válido
    const validNaturalezas: NaturalezaMovimiento[] = ['COMPRA', 'GASTO'];
    if (!validNaturalezas.includes(cuentaData.naturalezacuentacontable)) {
      console.log(`❌ Valor inválido para naturalezacuentacontable: ${cuentaData.naturalezacuentacontable}`); // Log de validación
      res.status(400).json({
        success: false,
        message: `naturalezacuentacontable debe ser uno de: ${validNaturalezas.join(', ')}`,
        error: 'INVALID_NATURALEZA'
      } as ApiResponse);
      return;
    }

    // Valida categorías según naturaleza
    const categoriasCompra: CategoriaCompra[] = ['Inventario', 'activo fijo', 'servicios', 'administrativas', 'extraodinarias', 'inversión'];
    const categoriasGasto: CategoriaGasto[] = ['operación', 'financiero', 'extraorinario'];
    
    if (cuentaData.naturalezacuentacontable === 'COMPRA') {
      if (!categoriasCompra.includes(cuentaData.categoriacuentacontable as CategoriaCompra)) {
        console.log(`❌ Categoría inválida para COMPRA: ${cuentaData.categoriacuentacontable}`); // Log de validación
        res.status(400).json({
          success: false,
          message: `Para naturaleza COMPRA, categoría debe ser uno de: ${categoriasCompra.join(', ')}`,
          error: 'INVALID_CATEGORIA_COMPRA'
        } as ApiResponse);
        return;
      }
    } else if (cuentaData.naturalezacuentacontable === 'GASTO') {
      if (!categoriasGasto.includes(cuentaData.categoriacuentacontable as CategoriaGasto)) {
        console.log(`❌ Categoría inválida para GASTO: ${cuentaData.categoriacuentacontable}`); // Log de validación
        res.status(400).json({
          success: false,
          message: `Para naturaleza GASTO, categoría debe ser uno de: ${categoriasGasto.join(', ')}`,
          error: 'INVALID_CATEGORIA_GASTO'
        } as ApiResponse);
        return;
      }
    }

    // Valida longitud del nombre
    if (cuentaData.nombrecuentacontable.length > 100) {
      console.log('❌ Nombre de cuenta contable muy largo'); // Log de validación
      res.status(400).json({
        success: false,
        message: 'El nombre de la cuenta contable no puede exceder 100 caracteres',
        error: 'NAME_TOO_LONG'
      } as ApiResponse);
      return;
    }

    // Verifica si ya existe una cuenta contable con el mismo nombre
    const [existingRows] = await pool.execute(
      'SELECT idcuentacontable FROM tblposcrumenwebcuentascontables WHERE nombrecuentacontable = ?',
      [cuentaData.nombrecuentacontable]
    );
    const existingCuenta = existingRows as any[];

    if (existingCuenta.length > 0) {
      console.log(`❌ Ya existe una cuenta contable con el nombre: ${cuentaData.nombrecuentacontable}`); // Log de duplicado
      res.status(409).json({
        success: false,
        message: 'Ya existe una cuenta contable con ese nombre',
        error: 'DUPLICATE_NAME'
      } as ApiResponse);
      return;
    }

    // Inserta la nueva cuenta contable
    const [result] = await pool.execute(`
      INSERT INTO tblposcrumenwebcuentascontables 
      (nombrecuentacontable, categoriacuentacontable, naturalezacuentacontable)
      VALUES (?, ?, ?)
    `, [
      cuentaData.nombrecuentacontable,
      cuentaData.categoriacuentacontable,
      cuentaData.naturalezacuentacontable
    ]);
    const insertResult = result as any;

    console.log(`✅ Cuenta contable creada con ID: ${insertResult.insertId}`); // Log de éxito
    
    res.status(201).json({
      success: true,
      message: 'Cuenta contable creada exitosamente',
      data: { idcuentacontable: insertResult.insertId }
    } as ApiResponse);  } catch (error) {
    console.error('❌ Error creando cuenta contable:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error creando cuenta contable',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para actualizar una cuenta contable existente
export const updateTipoMovimiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Extrae ID de los parámetros
    const cuentaData: UpdateCuentaContableData = req.body; // Extrae datos del cuerpo
    
    console.log(`💳 Actualizando cuenta contable ID: ${id}`); // Log de inicio

    // Valida que el ID sea un número válido
    const cuentaId = parseInt(id);
    if (isNaN(cuentaId) || cuentaId <= 0) {
      console.log(`❌ ID inválido: ${id}`); // Log de validación
      res.status(400).json({
        success: false,
        message: 'ID de cuenta contable inválido',
        error: 'INVALID_ID'
      } as ApiResponse);
      return;
    }

    // Verifica si la cuenta contable existe
    const [existingRows] = await pool.execute(
      'SELECT idcuentacontable FROM tblposcrumenwebcuentascontables WHERE idcuentacontable = ?',
      [cuentaId]
    );
    const existingCuenta = existingRows as any[];

    if (existingCuenta.length === 0) {
      console.log(`❌ Cuenta contable no encontrada con ID: ${cuentaId}`); // Log de no encontrado
      res.status(404).json({
        success: false,
        message: 'Cuenta contable no encontrada',
        error: 'NOT_FOUND'
      } as ApiResponse);
      return;
    }

    // Valida campos requeridos para actualización
    const requiredFields = ['nombrecuentacontable', 'categoriacuentacontable', 'naturalezacuentacontable'];
    const missingFields = requiredFields.filter(field => 
      cuentaData[field as keyof UpdateCuentaContableData] === undefined ||
      cuentaData[field as keyof UpdateCuentaContableData] === null ||
      cuentaData[field as keyof UpdateCuentaContableData] === ''
    );
    
    if (missingFields.length > 0) {
      console.log(`❌ Faltan campos requeridos: ${missingFields.join(', ')}`); // Log de validación
      res.status(400).json({
        success: false,
        message: `Faltan campos requeridos: ${missingFields.join(', ')}`,
        error: 'MISSING_FIELDS'
      } as ApiResponse);
      return;
    }

    // Valida que naturalezacuentacontable tenga un valor válido
    const validNaturalezas: NaturalezaMovimiento[] = ['COMPRA', 'GASTO'];
    if (!validNaturalezas.includes(cuentaData.naturalezacuentacontable)) {
      console.log(`❌ Valor inválido para naturalezacuentacontable: ${cuentaData.naturalezacuentacontable}`); // Log de validación
      res.status(400).json({
        success: false,
        message: `naturalezacuentacontable debe ser uno de: ${validNaturalezas.join(', ')}`,
        error: 'INVALID_NATURALEZA'
      } as ApiResponse);
      return;
    }

    // Valida categorías según naturaleza
    const categoriasCompra: CategoriaCompra[] = ['Inventario', 'activo fijo', 'servicios', 'administrativas', 'extraodinarias', 'inversión'];
    const categoriasGasto: CategoriaGasto[] = ['operación', 'financiero', 'extraorinario'];
    
    if (cuentaData.naturalezacuentacontable === 'COMPRA') {
      if (!categoriasCompra.includes(cuentaData.categoriacuentacontable as CategoriaCompra)) {
        console.log(`❌ Categoría inválida para COMPRA: ${cuentaData.categoriacuentacontable}`); // Log de validación
        res.status(400).json({
          success: false,
          message: `Para naturaleza COMPRA, categoría debe ser uno de: ${categoriasCompra.join(', ')}`,
          error: 'INVALID_CATEGORIA_COMPRA'
        } as ApiResponse);
        return;
      }
    } else if (cuentaData.naturalezacuentacontable === 'GASTO') {
      if (!categoriasGasto.includes(cuentaData.categoriacuentacontable as CategoriaGasto)) {
        console.log(`❌ Categoría inválida para GASTO: ${cuentaData.categoriacuentacontable}`); // Log de validación
        res.status(400).json({
          success: false,
          message: `Para naturaleza GASTO, categoría debe ser uno de: ${categoriasGasto.join(', ')}`,
          error: 'INVALID_CATEGORIA_GASTO'
        } as ApiResponse);
        return;
      }
    }

    // Valida longitud del nombre
    if (cuentaData.nombrecuentacontable.length > 100) {
      console.log('❌ Nombre de cuenta contable muy largo'); // Log de validación
      res.status(400).json({
        success: false,
        message: 'El nombre de la cuenta contable no puede exceder 100 caracteres',
        error: 'NAME_TOO_LONG'
      } as ApiResponse);
      return;
    }

    // Verifica si ya existe otra cuenta contable con el mismo nombre (excluyendo la actual)
    const [duplicateRows] = await pool.execute(
      'SELECT idcuentacontable FROM tblposcrumenwebcuentascontables WHERE nombrecuentacontable = ? AND idcuentacontable != ?',
      [cuentaData.nombrecuentacontable, cuentaId]
    );
    const duplicateCuenta = duplicateRows as any[];

    if (duplicateCuenta.length > 0) {
      console.log(`❌ Ya existe otra cuenta contable con el nombre: ${cuentaData.nombrecuentacontable}`); // Log de duplicado
      res.status(409).json({
        success: false,
        message: 'Ya existe otra cuenta contable con ese nombre',
        error: 'DUPLICATE_NAME'
      } as ApiResponse);
      return;
    }

    // Actualiza la cuenta contable
    await pool.execute(`
      UPDATE tblposcrumenwebcuentascontables 
      SET nombrecuentacontable = ?, categoriacuentacontable = ?, naturalezacuentacontable = ?
      WHERE idcuentacontable = ?
    `, [
      cuentaData.nombrecuentacontable,
      cuentaData.categoriacuentacontable,
      cuentaData.naturalezacuentacontable,
      cuentaId
    ]);

    console.log(`✅ Cuenta contable actualizada exitosamente ID: ${cuentaId}`); // Log de éxito

    res.json({
      success: true,
      message: 'Cuenta contable actualizada exitosamente',
      data: { idcuentacontable: cuentaId }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error actualizando cuenta contable:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error actualizando cuenta contable',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para obtener una cuenta contable por ID
export const getTipoMovimientoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Extrae ID de los parámetros
    console.log(`💳 Obteniendo cuenta contable ID: ${id}`); // Log de inicio

    // Valida que el ID sea un número válido
    const cuentaId = parseInt(id);
    if (isNaN(cuentaId) || cuentaId <= 0) {
      console.log(`❌ ID inválido: ${id}`); // Log de validación
      res.status(400).json({
        success: false,
        message: 'ID de cuenta contable inválido',
        error: 'INVALID_ID'
      } as ApiResponse);
      return;
    }

    // Busca la cuenta contable por ID
    const [cuentaRows] = await pool.execute(
      'SELECT idcuentacontable, nombrecuentacontable, categoriacuentacontable, naturalezacuentacontable FROM tblposcrumenwebcuentascontables WHERE idcuentacontable = ?',
      [cuentaId]
    );
    const cuenta = cuentaRows as any[];

    if (cuenta.length === 0) {
      console.log(`❌ Cuenta contable no encontrada con ID: ${cuentaId}`); // Log de no encontrado
      res.status(404).json({
        success: false,
        message: 'Cuenta contable no encontrada',
        error: 'NOT_FOUND'
      } as ApiResponse);
      return;
    }

    console.log(`✅ Cuenta contable encontrada: ${cuenta[0].nombrecuentacontable}`); // Log de éxito

    res.json({
      success: true,
      message: 'Cuenta contable obtenida exitosamente',
      data: cuenta[0]
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo cuenta contable:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error obteniendo cuenta contable',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};