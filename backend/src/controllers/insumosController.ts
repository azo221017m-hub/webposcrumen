// backend/src/controllers/insumosController.ts
// Controlador para gestión de insumos

import { Request, Response } from 'express';
import { executeQuery } from '../config/database';
import type { Insumo, CreateInsumoData } from '../types';

// Controlador para obtener todos los insumos
export const getInsumosController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📦 Obteniendo lista de insumos');

    // Query para obtener insumos con información de categoría
    const query = `
      SELECT 
        i.id_insumo,
        i.nombre,
        i.costo_promedio_ponderado,
        i.unidad_medida,
        i.tipo_insumo,
        i.stock_actual,
        i.stock_minimo,
        i.precio_venta,
        i.precio_referencia,
        i.id_categoria,
        i.id_proveedor,
        i.activo,
        i.fecha_registro,
        i.fecha_actualizacion,
        i.usuario,
        c.nombre as nombreCategoria
      FROM tblposcrumenwebinsumos i
      LEFT JOIN tblposcrumenwebcategorias c ON i.id_categoria = c.idCategoria
      ORDER BY i.fecha_registro DESC
    `;

    const insumos = await executeQuery(query);
    console.log(`✅ ${insumos.length} insumos encontrados`);

    // Los tipos ya están en el formato correcto, no necesitan mapeo
    res.status(200).json({
      success: true,
      message: `${insumos.length} insumos encontrados`,
      data: insumos
    });

  } catch (error) {
    console.error('❌ Error al obtener insumos:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener insumos',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Controlador para crear un nuevo insumo
export const createInsumoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const insumoData: CreateInsumoData = req.body;
    console.log('📦 Creando nuevo insumo:', insumoData);

    // Validaciones básicas
    if (!insumoData.nombre || !insumoData.nombre.trim()) {
      res.status(400).json({
        success: false,
        message: 'El nombre del insumo es obligatorio'
      });
      return;
    }

    if (!insumoData.unidad_medida || !insumoData.unidad_medida.trim()) {
      res.status(400).json({
        success: false,
        message: 'La unidad de medida es obligatoria'
      });
      return;
    }

    if (!insumoData.tipo_insumo || !['INSUMO', 'PRODUCTO'].includes(insumoData.tipo_insumo)) {
      res.status(400).json({
        success: false,
        message: 'El tipo de insumo debe ser INSUMO o PRODUCTO'
      });
      return;
    }

    if (insumoData.id_categoria === undefined || insumoData.id_categoria === null || isNaN(Number(insumoData.id_categoria))) {
      res.status(400).json({
        success: false,
        message: 'La categoría es obligatoria y debe ser un número válido'
      });
      return;
    }

    if (isNaN(Number(insumoData.costo_promedio_ponderado)) || Number(insumoData.costo_promedio_ponderado) < 0) {
      res.status(400).json({
        success: false,
        message: 'El costo promedio ponderado debe ser un número válido mayor o igual a 0'
      });
      return;
    }

    if (isNaN(Number(insumoData.stock_actual)) || Number(insumoData.stock_actual) < 0) {
      res.status(400).json({
        success: false,
        message: 'El stock actual debe ser un número válido mayor o igual a 0'
      });
      return;
    }

    if (isNaN(Number(insumoData.stock_minimo)) || Number(insumoData.stock_minimo) < 0) {
      res.status(400).json({
        success: false,
        message: 'El stock mínimo debe ser un número válido mayor o igual a 0'
      });
      return;
    }

    if (isNaN(Number(insumoData.precio_venta)) || Number(insumoData.precio_venta) < 0) {
      res.status(400).json({
        success: false,
        message: 'El precio de venta debe ser un número válido mayor o igual a 0'
      });
      return;
    }

    // Verificar o crear categoría para insumos
    if (insumoData.tipo_insumo === 'INSUMO') {
      console.log('🔍 Procesando insumo tipo INSUMO, buscando categoría...');
      
      // Buscar la categoría "INSUMO"
      let categoriaInsumo = await executeQuery(
        'SELECT idCategoria FROM tblposcrumenwebcategorias WHERE nombre = ? AND estatus = 1',
        ['INSUMO']
      );

      console.log('📝 Resultado búsqueda categoría INSUMO:', categoriaInsumo);

      if (categoriaInsumo.length === 0) {
        console.log('➕ Categoría INSUMO no existe, creándola...');
        
        // Si no existe, crearla
        const result = await executeQuery(
          'INSERT INTO tblposcrumenwebcategorias (nombre, descripcion, estatus, fechaRegistro, fechaActualizacion, usuario) VALUES (?, ?, ?, ?, ?, ?)',
          ['INSUMO', 'Categoría automática para insumos', 1, 
           new Date().toISOString().slice(0, 19).replace('T', ' '),
           new Date().toISOString().slice(0, 19).replace('T', ' '),
           insumoData.usuario || 'sistema']
        );
        insumoData.id_categoria = result.insertId;
        console.log('✅ Categoría INSUMO creada automáticamente con ID:', result.insertId);
      } else {
        insumoData.id_categoria = categoriaInsumo[0].idCategoria;
        console.log('✅ Usando categoría INSUMO existente con ID:', categoriaInsumo[0].idCategoria);
      }
    } else {
      // Para productos, verificar que la categoría especificada existe
      if (insumoData.id_categoria !== 0) {
        const categoriaExists = await executeQuery(
          'SELECT idCategoria FROM tblposcrumenwebcategorias WHERE idCategoria = ? AND estatus = 1',
          [insumoData.id_categoria]
        );

        if (categoriaExists.length === 0) {
          res.status(400).json({
            success: false,
            message: 'La categoría especificada no existe o está inactiva'
          });
          return;
        }
      }
    }

    // Verificar que no existe un insumo con el mismo nombre
    const insumoExists = await executeQuery(
      'SELECT id_insumo FROM tblposcrumenwebinsumos WHERE nombre = ?',
      [insumoData.nombre.trim()]
    );

    if (insumoExists.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Ya existe un insumo con este nombre'
      });
      return;
    }

    // Preparar datos para inserción
    const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const query = `
      INSERT INTO tblposcrumenwebinsumos (
        nombre,
        costo_promedio_ponderado,
        unidad_medida,
        tipo_insumo,
        stock_actual,
        stock_minimo,
        precio_venta,
        precio_referencia,
        id_categoria,
        id_proveedor,
        activo,
        fecha_registro,
        fecha_actualizacion,
        usuario
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      insumoData.nombre.trim(),
      Number(insumoData.costo_promedio_ponderado),
      insumoData.unidad_medida.trim(),
      insumoData.tipo_insumo, // Usar valor directo sin mapeo
      Number(insumoData.stock_actual),
      Number(insumoData.stock_minimo),
      Number(insumoData.precio_venta),
      Number(insumoData.precio_referencia || 0),
      Number(insumoData.id_categoria),
      insumoData.id_proveedor ? Number(insumoData.id_proveedor) : null,
      insumoData.activo !== undefined ? insumoData.activo : true,
      fechaActual,
      fechaActual,
      insumoData.usuario || 'sistema'
    ];

    console.log('🔍 Ejecutando query:', query);
    console.log('📝 Parámetros:', params);
    console.log('🔄 Tipo de insumo:', insumoData.tipo_insumo);

    const result = await executeQuery(query, params);
    console.log('✅ Insumo creado exitosamente. ID:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Insumo creado exitosamente',
      data: { id_insumo: result.insertId }
    });

  } catch (error) {
    console.error('❌ Error al crear insumo:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear insumo',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Controlador para actualizar un insumo
export const updateInsumoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const insumoData: Partial<CreateInsumoData> = req.body;
    
    console.log('📦 Actualizando insumo ID:', id, 'Datos:', insumoData);

    // Validar que el ID sea válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de insumo inválido'
      });
      return;
    }

    // Verificar que el insumo existe
    const insumoExists = await executeQuery(
      'SELECT idInsumo FROM tblposcrumenwebinsumos WHERE idInsumo = ?',
      [Number(id)]
    );

    if (insumoExists.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
      return;
    }

    // Construir query de actualización dinámicamente
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (insumoData.nombre !== undefined) {
      if (!insumoData.nombre.trim()) {
        res.status(400).json({
          success: false,
          message: 'El nombre del insumo no puede estar vacío'
        });
        return;
      }
      updateFields.push('nombre = ?');
      updateValues.push(insumoData.nombre.trim());
    }

    if (insumoData.costo_promedio_ponderado !== undefined) {
      if (isNaN(Number(insumoData.costo_promedio_ponderado)) || Number(insumoData.costo_promedio_ponderado) < 0) {
        res.status(400).json({
          success: false,
          message: 'El costo promedio ponderado debe ser un número válido mayor o igual a 0'
        });
        return;
      }
      updateFields.push('costo_promedio_ponderado = ?');
      updateValues.push(Number(insumoData.costo_promedio_ponderado));
    }

    if (insumoData.unidad_medida !== undefined) {
      if (!insumoData.unidad_medida.trim()) {
        res.status(400).json({
          success: false,
          message: 'La unidad de medida no puede estar vacía'
        });
        return;
      }
      updateFields.push('unidad_medida = ?');
      updateValues.push(insumoData.unidad_medida.trim());
    }

    if (insumoData.tipo_insumo !== undefined) {
      if (!['INSUMO', 'PRODUCTO'].includes(insumoData.tipo_insumo)) {
        res.status(400).json({
          success: false,
          message: 'El tipo de insumo debe ser INSUMO o PRODUCTO'
        });
        return;
      }
      updateFields.push('tipo_insumo = ?');
      updateValues.push(insumoData.tipo_insumo); // Usar valor directo
    }

    if (insumoData.stock_actual !== undefined) {
      if (isNaN(Number(insumoData.stock_actual)) || Number(insumoData.stock_actual) < 0) {
        res.status(400).json({
          success: false,
          message: 'El stock actual debe ser un número válido mayor o igual a 0'
        });
        return;
      }
      updateFields.push('stock_actual = ?');
      updateValues.push(Number(insumoData.stock_actual));
    }

    if (insumoData.stock_minimo !== undefined) {
      if (isNaN(Number(insumoData.stock_minimo)) || Number(insumoData.stock_minimo) < 0) {
        res.status(400).json({
          success: false,
          message: 'El stock mínimo debe ser un número válido mayor o igual a 0'
        });
        return;
      }
      updateFields.push('stock_minimo = ?');
      updateValues.push(Number(insumoData.stock_minimo));
    }

    if (insumoData.precio_venta !== undefined) {
      if (isNaN(Number(insumoData.precio_venta)) || Number(insumoData.precio_venta) < 0) {
        res.status(400).json({
          success: false,
          message: 'El precio de venta debe ser un número válido mayor o igual a 0'
        });
        return;
      }
      updateFields.push('precio_venta = ?');
      updateValues.push(Number(insumoData.precio_venta));
    }

    if (insumoData.precio_referencia !== undefined) {
      if (isNaN(Number(insumoData.precio_referencia)) || Number(insumoData.precio_referencia) < 0) {
        res.status(400).json({
          success: false,
          message: 'El precio de referencia debe ser un número válido mayor o igual a 0'
        });
        return;
      }
      updateFields.push('precio_referencia = ?');
      updateValues.push(Number(insumoData.precio_referencia));
    }

    if (insumoData.id_categoria !== undefined) {
      if (isNaN(Number(insumoData.id_categoria))) {
        res.status(400).json({
          success: false,
          message: 'La categoría debe ser un número válido'
        });
        return;
      }

      // Verificar que la categoría existe
      const categoriaExists = await executeQuery(
        'SELECT idCategoria FROM tblposcrumenwebcategorias WHERE idCategoria = ? AND estatus = 1',
        [insumoData.id_categoria]
      );

      if (categoriaExists.length === 0) {
        res.status(400).json({
          success: false,
          message: 'La categoría especificada no existe o está inactiva'
        });
        return;
      }

      updateFields.push('id_categoria = ?');
      updateValues.push(Number(insumoData.id_categoria));
    }

    if (insumoData.id_proveedor !== undefined) {
      if (insumoData.id_proveedor !== null && isNaN(Number(insumoData.id_proveedor))) {
        res.status(400).json({
          success: false,
          message: 'El proveedor debe ser un número válido'
        });
        return;
      }
      updateFields.push('id_proveedor = ?');
      updateValues.push(insumoData.id_proveedor ? Number(insumoData.id_proveedor) : null);
    }

    if (insumoData.activo !== undefined) {
      updateFields.push('activo = ?');
      updateValues.push(insumoData.activo);
    }

    if (insumoData.usuario !== undefined) {
      updateFields.push('usuario = ?');
      updateValues.push(insumoData.usuario);
    }

    // Siempre actualizar la fecha de actualización
    updateFields.push('fecha_actualizacion = ?');
    updateValues.push(new Date().toISOString().slice(0, 19).replace('T', ' '));

    if (updateFields.length === 1) { // Solo fecha_actualizacion
      res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
      return;
    }

    const query = `UPDATE tblposcrumenwebinsumos SET ${updateFields.join(', ')} WHERE id_insumo = ?`;
    updateValues.push(Number(id));

    console.log('🔍 Ejecutando query:', query);
    console.log('📝 Parámetros:', updateValues);

    await executeQuery(query, updateValues);
    console.log('✅ Insumo actualizado exitosamente');

    res.status(200).json({
      success: true,
      message: 'Insumo actualizado exitosamente',
      data: { id_insumo: Number(id) }
    });

  } catch (error) {
    console.error('❌ Error al actualizar insumo:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar insumo',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Controlador para eliminar un insumo
export const deleteInsumoController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { usuario } = req.body;
    
    console.log('🗑️ Eliminando insumo ID:', id, 'Usuario:', usuario);

    // Validar que el ID sea válido
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: 'ID de insumo inválido'
      });
      return;
    }

    // Verificar que el insumo existe
    const insumoExists = await executeQuery(
      'SELECT id_insumo, nombre FROM tblposcrumenwebinsumos WHERE id_insumo = ?',
      [Number(id)]
    );

    if (insumoExists.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
      return;
    }

    // Eliminar el insumo
    const query = 'DELETE FROM tblposcrumenwebinsumos WHERE id_insumo = ?';
    
    console.log('🔍 Ejecutando query:', query);
    console.log('📝 Parámetros:', [Number(id)]);

    await executeQuery(query, [Number(id)]);
    console.log('✅ Insumo eliminado exitosamente');

    res.status(200).json({
      success: true,
      message: `Insumo "${insumoExists[0].nombre}" eliminado exitosamente`,
      data: { id_insumo: Number(id) }
    });

  } catch (error) {
    console.error('❌ Error al eliminar insumo:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar insumo',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Controlador para buscar insumos por filtro de nombre
export const buscarInsumosController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Soportar tanto parámetros de ruta como query parameters
    const filtroParam = req.params.filtro;
    const { busqueda, tipo } = req.query;
    
    const filtro = filtroParam || busqueda as string;
    
    console.log('🔍 Buscando insumos con filtro:', filtro, 'Tipo:', tipo);

    // Validar que el filtro no esté vacío
    if (!filtro || filtro.trim().length < 2) {
      res.status(400).json({
        success: false,
        message: 'El filtro debe tener al menos 2 caracteres',
        data: []
      });
      return;
    }

    // Construir query dinámicamente según los filtros
    let query = `
      SELECT 
        id_insumo,
        nombre,
        unidad_medida,
        costo_promedio_ponderado,
        tipo_insumo,
        stock_actual,
        id_categoria
      FROM tblposcrumenwebinsumos
      WHERE nombre LIKE ?
    `;
    
    const queryParams: any[] = [`%${filtro.trim()}%`];
    
    // Agregar filtro por tipo si se especifica
    if (tipo && tipo !== 'ALL') {
      query += ' AND tipo_insumo = ?';
      queryParams.push(tipo as string); // Usar valor directo
    }
    
    query += ' ORDER BY nombre LIMIT 20';

    const insumos = await executeQuery(query, queryParams);
    
    console.log(`✅ ${insumos.length} insumos encontrados con filtro "${filtro}" ${tipo ? `tipo "${tipo}"` : ''}`);

    res.status(200).json({
      success: true,
      message: `${insumos.length} insumos encontrados`,
      data: insumos
    });

  } catch (error) {
    console.error('❌ Error al buscar insumos:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al buscar insumos',
      data: [],
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};