// backend/src/controllers/rolesController.ts
// Controlador para gestión de roles de usuario

import type { Request, Response } from 'express'; // Importa tipos de Express
import { executeQuery } from '../config/database'; // Importa función para ejecutar consultas
import type { ApiResponse } from '../types'; // Importa tipos personalizados

// Controlador para obtener todos los roles
export const getRolesController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('👥 Obteniendo lista de roles de usuario'); // Log de inicio

    // Consulta todos los roles de la base de datos
    const roles = await executeQuery(
      'SELECT idRol, nombreRol FROM tblposcrumenwebrolesdeusuario WHERE estatus = 1 ORDER BY nombreRol',
      []
    );

    console.log(`✅ ${roles.length} roles encontrados`); // Log de resultados

    // Retorna la lista de roles
    res.json({
      success: true,
      message: 'Roles obtenidos exitosamente',
      data: roles
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo roles:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};