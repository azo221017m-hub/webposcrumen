// backend/src/controllers/umMovimientoController.ts
// Controlador para gestión de unidades de medida de compra en POSWEBCrumen

import type { Request, Response } from 'express'; // Importa tipos de Express
import { executeQuery } from '../config/database'; // Importa función para ejecutar consultas
import type { UMMovimiento, ApiResponse } from '../types'; // Importa tipos personalizados

// Tipos para datos de entrada sin ID y fechas (para creación y actualización)
interface CreateUMMovimientoData {
  nombreUmCompra: string;
  valor: number;
  umMatPrima: 'Kl' | 'Lt' | 'gr' | 'ml' | 'pza';
  valorConvertido: number;
  usuario?: string;
}

interface UpdateUMMovimientoData extends CreateUMMovimientoData {}

// Controlador para obtener todas las unidades de medida de compra
export const getAllUMMovimientos = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📏 Obteniendo todas las unidades de medida de compra'); // Log de inicio
    
    // Consulta todas las unidades de medida de compra
    const umMovimientos = await executeQuery(`
      SELECT 
        idUmCompra, nombreUmCompra, valor, umMatPrima, valorConvertido,
        fechaRegistro, fechaActualizacion, usuario
      FROM tblposrumenwebumcompra 
      ORDER BY fechaRegistro DESC
    `);

    // Transforma los datos para asegurar que los valores numéricos sean números
    const transformedData = umMovimientos.map((um: any) => ({
      ...um,
      valor: parseFloat(um.valor),
      valorConvertido: parseFloat(um.valorConvertido)
    }));

    console.log(`✅ Se encontraron ${umMovimientos.length} unidades de medida`); // Log de resultado
    
    res.json({
      success: true,
      message: 'Unidades de medida obtenidas exitosamente',
      data: transformedData
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo unidades de medida:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error obteniendo unidades de medida',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para crear una nueva unidad de medida de compra
export const createUMMovimiento = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📏 Creando nueva unidad de medida de compra'); // Log de inicio
    const umData: CreateUMMovimientoData = req.body; // Extrae datos del cuerpo

    // Valida campos requeridos
    const requiredFields = ['nombreUmCompra', 'valor', 'umMatPrima', 'valorConvertido'];
    const missingFields = requiredFields.filter(field => 
      umData[field as keyof CreateUMMovimientoData] === undefined || 
      umData[field as keyof CreateUMMovimientoData] === null ||
      umData[field as keyof CreateUMMovimientoData] === ''
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

    // Valida que umMatPrima tenga un valor válido
    const validUmMatPrima = ['Kl', 'Lt', 'gr', 'ml', 'pza'];
    if (!validUmMatPrima.includes(umData.umMatPrima)) {
      console.log(`❌ Valor inválido para umMatPrima: ${umData.umMatPrima}`); // Log de validación
      res.status(400).json({
        success: false,
        message: `umMatPrima debe ser uno de: ${validUmMatPrima.join(', ')}`,
        error: 'INVALID_UM_MATPRIMA'
      } as ApiResponse);
      return;
    }

    // Valida que valor y valorConvertido sean números positivos
    if (umData.valor <= 0 || umData.valorConvertido <= 0) {
      console.log('❌ Valor y valorConvertido deben ser números positivos'); // Log de validación
      res.status(400).json({
        success: false,
        message: 'Valor y valorConvertido deben ser números positivos',
        error: 'INVALID_VALUES'
      } as ApiResponse);
      return;
    }

    // Valida longitud del nombre
    if (umData.nombreUmCompra.length > 100) {
      console.log('❌ Nombre de unidad de medida muy largo'); // Log de validación
      res.status(400).json({
        success: false,
        message: 'El nombre de la unidad de medida no puede exceder 100 caracteres',
        error: 'NAME_TOO_LONG'
      } as ApiResponse);
      return;
    }

    // Verifica si ya existe una unidad de medida con el mismo nombre
    const existingUM = await executeQuery(
      'SELECT idUmCompra FROM tblposrumenwebumcompra WHERE nombreUmCompra = ?',
      [umData.nombreUmCompra]
    );

    if (existingUM.length > 0) {
      console.log(`❌ Ya existe una unidad de medida con el nombre: ${umData.nombreUmCompra}`); // Log de duplicado
      res.status(409).json({
        success: false,
        message: 'Ya existe una unidad de medida con ese nombre',
        error: 'DUPLICATE_NAME'
      } as ApiResponse);
      return;
    }

    // Inserta la nueva unidad de medida
    const result = await executeQuery(`
      INSERT INTO tblposrumenwebumcompra 
      (nombreUmCompra, valor, umMatPrima, valorConvertido, fechaRegistro, fechaActualizacion, usuario)
      VALUES (?, ?, ?, ?, NOW(), NOW(), ?)
    `, [
      umData.nombreUmCompra,
      umData.valor,
      umData.umMatPrima,
      umData.valorConvertido,
      umData.usuario || 'sistema'
    ]);

    console.log(`✅ Unidad de medida creada con ID: ${result.insertId}`); // Log de éxito

    res.status(201).json({
      success: true,
      message: 'Unidad de medida creada exitosamente',
      data: { idUmCompra: result.insertId }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error creando unidad de medida:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error creando unidad de medida',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para actualizar una unidad de medida de compra existente
export const updateUMMovimiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Extrae ID de los parámetros
    const umData: UpdateUMMovimientoData = req.body; // Extrae datos del cuerpo
    
    console.log(`📏 Actualizando unidad de medida ID: ${id}`); // Log de inicio

    // Valida que el ID sea un número válido
    const umId = parseInt(id);
    if (isNaN(umId) || umId <= 0) {
      console.log(`❌ ID inválido: ${id}`); // Log de validación
      res.status(400).json({
        success: false,
        message: 'ID de unidad de medida inválido',
        error: 'INVALID_ID'
      } as ApiResponse);
      return;
    }

    // Verifica si la unidad de medida existe
    const existingUM = await executeQuery(
      'SELECT idUmCompra FROM tblposrumenwebumcompra WHERE idUmCompra = ?',
      [umId]
    );

    if (existingUM.length === 0) {
      console.log(`❌ Unidad de medida no encontrada con ID: ${umId}`); // Log de no encontrado
      res.status(404).json({
        success: false,
        message: 'Unidad de medida no encontrada',
        error: 'NOT_FOUND'
      } as ApiResponse);
      return;
    }

    // Valida campos requeridos
    const requiredFields = ['nombreUmCompra', 'valor', 'umMatPrima', 'valorConvertido'];
    const missingFields = requiredFields.filter(field => 
      umData[field as keyof UpdateUMMovimientoData] === undefined || 
      umData[field as keyof UpdateUMMovimientoData] === null ||
      umData[field as keyof UpdateUMMovimientoData] === ''
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

    // Valida que umMatPrima tenga un valor válido
    const validUmMatPrima = ['Kl', 'Lt', 'gr', 'ml', 'pza'];
    if (!validUmMatPrima.includes(umData.umMatPrima)) {
      console.log(`❌ Valor inválido para umMatPrima: ${umData.umMatPrima}`); // Log de validación
      res.status(400).json({
        success: false,
        message: `umMatPrima debe ser uno de: ${validUmMatPrima.join(', ')}`,
        error: 'INVALID_UM_MATPRIMA'
      } as ApiResponse);
      return;
    }

    // Valida que valor y valorConvertido sean números positivos
    if (umData.valor <= 0 || umData.valorConvertido <= 0) {
      console.log('❌ Valor y valorConvertido deben ser números positivos'); // Log de validación
      res.status(400).json({
        success: false,
        message: 'Valor y valorConvertido deben ser números positivos',
        error: 'INVALID_VALUES'
      } as ApiResponse);
      return;
    }

    // Valida longitud del nombre
    if (umData.nombreUmCompra.length > 100) {
      console.log('❌ Nombre de unidad de medida muy largo'); // Log de validación
      res.status(400).json({
        success: false,
        message: 'El nombre de la unidad de medida no puede exceder 100 caracteres',
        error: 'NAME_TOO_LONG'
      } as ApiResponse);
      return;
    }

    // Verifica si ya existe otra unidad de medida con el mismo nombre
    const duplicateUM = await executeQuery(
      'SELECT idUmCompra FROM tblposrumenwebumcompra WHERE nombreUmCompra = ? AND idUmCompra != ?',
      [umData.nombreUmCompra, umId]
    );

    if (duplicateUM.length > 0) {
      console.log(`❌ Ya existe otra unidad de medida con el nombre: ${umData.nombreUmCompra}`); // Log de duplicado
      res.status(409).json({
        success: false,
        message: 'Ya existe otra unidad de medida con ese nombre',
        error: 'DUPLICATE_NAME'
      } as ApiResponse);
      return;
    }

    // Actualiza la unidad de medida
    await executeQuery(`
      UPDATE tblposrumenwebumcompra 
      SET nombreUmCompra = ?, valor = ?, umMatPrima = ?, valorConvertido = ?, 
          fechaActualizacion = NOW(), usuario = ?
      WHERE idUmCompra = ?
    `, [
      umData.nombreUmCompra,
      umData.valor,
      umData.umMatPrima,
      umData.valorConvertido,
      umData.usuario || 'sistema',
      umId
    ]);

    console.log(`✅ Unidad de medida actualizada exitosamente ID: ${umId}`); // Log de éxito

    res.json({
      success: true,
      message: 'Unidad de medida actualizada exitosamente',
      data: { idUmCompra: umId }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error actualizando unidad de medida:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error actualizando unidad de medida',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para obtener una unidad de medida específica por ID
export const getUMMovimientoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Extrae ID de los parámetros
    console.log(`📏 Obteniendo unidad de medida ID: ${id}`); // Log de inicio

    // Valida que el ID sea un número válido
    const umId = parseInt(id);
    if (isNaN(umId) || umId <= 0) {
      console.log(`❌ ID inválido: ${id}`); // Log de validación
      res.status(400).json({
        success: false,
        message: 'ID de unidad de medida inválido',
        error: 'INVALID_ID'
      } as ApiResponse);
      return;
    }

    // Consulta la unidad de medida específica
    const umMovimientos = await executeQuery(`
      SELECT 
        idUmCompra, nombreUmCompra, valor, umMatPrima, valorConvertido,
        fechaRegistro, fechaActualizacion, usuario
      FROM tblposrumenwebumcompra 
      WHERE idUmCompra = ?
    `, [umId]);

    if (umMovimientos.length === 0) {
      console.log(`❌ Unidad de medida no encontrada con ID: ${umId}`); // Log de no encontrado
      res.status(404).json({
        success: false,
        message: 'Unidad de medida no encontrada',
        error: 'NOT_FOUND'
      } as ApiResponse);
      return;
    }

    // Transforma los datos para asegurar que los valores numéricos sean números
    const transformedData = {
      ...umMovimientos[0],
      valor: parseFloat(umMovimientos[0].valor),
      valorConvertido: parseFloat(umMovimientos[0].valorConvertido)
    };

    console.log(`✅ Unidad de medida encontrada ID: ${umId}`); // Log de éxito
    
    res.json({
      success: true,
      message: 'Unidad de medida obtenida exitosamente',
      data: transformedData
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo unidad de medida:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error obteniendo unidad de medida',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};