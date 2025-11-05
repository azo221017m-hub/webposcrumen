import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthenticatedRequest } from '../types'; // Import the extended Request type

// Obtener todas las categorías de moderadores
export const getCategoriasModeradores = async (req: Request, res: Response) => {
  console.log('📡 [GET] /api/categorias-moderadores - Obteniendo categorías de moderadores');
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tblposcrumenwebmodref ORDER BY idmodref ASC'
    );
    console.log('✅ Categorías obtenidas:', rows);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

// Crear una nueva categoría de moderador
export const createCategoriaModerador = async (req: AuthenticatedRequest, res: Response) => {
  console.log('📡 [POST] /api/categorias-moderadores - Creando nueva categoría:', req.body);
  const { nombremodref } = req.body;
  const usuarioauditoria = req.user?.alias || 'unknown'; // Using extended AuthenticatedRequest
  const idnegocio = req.user?.idNegocio || null; // Using extended AuthenticatedRequest

  if (!nombremodref || !idnegocio) {
    console.error('❌ Nombre de categoría e idnegocio son requeridos');
    return res.status(400).json({ message: 'Nombre de categoría e idnegocio son requeridos' });
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO tblposcrumenwebmodref (nombremodref, fechaRegistroauditoria, usuarioauditoria, fehamodificacionauditoria, idnegocio) VALUES (?, NOW(), ?, NOW(), ?)',
      [nombremodref, usuarioauditoria, idnegocio]
    );
    console.log('✅ Categoría creada con ID:', result.insertId);
    res.json({ idmodref: result.insertId, nombremodref });
  } catch (error) {
    console.error('❌ Error al crear categoría:', error);
    res.status(500).json({ message: 'Error al crear categoría' });
  }
};