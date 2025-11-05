import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Obtener todas las categorías de moderadores
export const getCategoriasModeradores = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tblposcrumenwebmodref WHERE estatus = 1 ORDER BY idmodref ASC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('❌ Error fetching categorias moderadores:', error);
    res.status(500).json({ success: false, message: 'Error fetching categorias moderadores' });
  }
};

// Crear una nueva categoría de moderador
export const createCategoriaModerador = async (req: Request, res: Response) => {
  console.log('📥 [createCategoriaModerador] Request body:', req.body); // Log the request body

  const { nombremodref, usuarioauditoria, idnegocio } = req.body;

  if (!nombremodref || !usuarioauditoria || !idnegocio) {
    console.error('❌ Missing required fields:', { nombremodref, usuarioauditoria, idnegocio }); // Log missing fields
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    console.log('📤 [createCategoriaModerador] Executing query with params:', {
      nombremodref,
      usuarioauditoria,
      idnegocio,
    }); // Log query parameters

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebmodref 
      (nombremodref, usuarioauditoria, idnegocio, estatus, fechaRegistroauditoria, fehamodificacionauditoria) 
      VALUES (?, ?, ?, 1, NOW(), NOW())`,
      [nombremodref, usuarioauditoria, idnegocio]
    );

    console.log('✅ [createCategoriaModerador] Insert successful:', result); // Log successful insert

    res.json({ success: true, data: { id: result.insertId, nombremodref, usuarioauditoria, idnegocio } });
  } catch (error) {
    console.error('❌ Error creating categoria moderador:', error); // Log detailed error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: 'Error creating categoria moderador', error: errorMessage });
  }
};