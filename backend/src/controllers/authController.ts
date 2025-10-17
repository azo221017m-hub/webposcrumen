// backend/src/controllers/authController.ts
// Controlador para autenticación de usuarios en POSWEBCrumen

import type { Request, Response } from 'express'; // Importa tipos de Express
import { executeQuery } from '../config/database'; // Importa función para ejecutar consultas
import type { LoginData, Usuario, AccessAttempt, ApiResponse } from '../types'; // Importa tipos personalizados
import bcrypt from 'bcrypt'; // Importa bcrypt para hash de contraseñas

// Controlador para el login de usuarios
export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔐 Iniciando proceso de login'); // Log de inicio
    const { usuario, password }: LoginData = req.body; // Extrae datos del cuerpo de la petición

    // Valida que se proporcionen usuario y contraseña
    if (!usuario || !password) {
      console.log('❌ Faltan datos de login'); // Log de error
      res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos',
        error: 'MISSING_CREDENTIALS'
      } as ApiResponse);
      return;
    }

    console.log(`🔍 Buscando usuario: ${usuario}`); // Log de búsqueda

    // Busca el usuario en la base de datos
    const usuarios = await executeQuery(
      'SELECT * FROM tblposcrumenwebusuarios WHERE usuario = ?',
      [usuario]
    );

    // Si no existe el usuario
    if (!usuarios || usuarios.length === 0) {
      console.log('❌ Usuario no encontrado'); // Log de error
      await registerFailedAttempt(usuario); // Registra intento fallido
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        error: 'INVALID_CREDENTIALS'
      } as ApiResponse);
      return;
    }

    const user: Usuario = usuarios[0]; // Obtiene el primer usuario encontrado

    // Verifica si el usuario está bloqueado
    if (user.estatus === 9) {
      console.log('🚫 Usuario bloqueado por seguridad'); // Log de bloqueo
      res.status(403).json({
        success: false,
        message: 'Usuario bloqueado por seguridad',
        error: 'USER_BLOCKED'
      } as ApiResponse);
      return;
    }

    // Verifica si el usuario está activo
    if (user.estatus !== 1) {
      console.log('⚠️ Usuario inactivo'); // Log de estado
      res.status(403).json({
        success: false,
        message: 'Usuario inactivo',
        error: 'USER_INACTIVE'
      } as ApiResponse);
      return;
    }

    // Verifica la contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Contraseña incorrecta'); // Log de error
      await registerFailedAttempt(usuario); // Registra intento fallido
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        error: 'INVALID_CREDENTIALS'
      } as ApiResponse);
      return;
    }

    // Login exitoso - limpia intentos fallidos
    await clearFailedAttempts(usuario);
    
    console.log('✅ Login exitoso'); // Log de éxito
    
    // Retorna datos del usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userWithoutPassword
      }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error en login:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Función para registrar intentos fallidos de login
const registerFailedAttempt = async (usuario: string): Promise<void> => {
  try {
    console.log(`📝 Registrando intento fallido para: ${usuario}`); // Log de registro

    // Busca intentos previos
    const attempts = await executeQuery(
      'SELECT * FROM tbl_access_attempts WHERE tipo = "usuario" AND referencia = ?',
      [usuario]
    );

    if (attempts.length === 0) {
      // Primer intento fallido - crea nuevo registro
      await executeQuery(
        'INSERT INTO tbl_access_attempts (tipo, referencia, intentos, last_attempt) VALUES (?, ?, 1, NOW())',
        ['usuario', usuario]
      );
      console.log('📝 Primer intento fallido registrado'); // Log de registro
    } else {
      // Incrementa intentos existentes
      const attempt: AccessAttempt = attempts[0];
      const newAttempts = attempt.intentos + 1;
      
      await executeQuery(
        'UPDATE tbl_access_attempts SET intentos = ?, last_attempt = NOW() WHERE id = ?',
        [newAttempts, attempt.id]
      );
      
      console.log(`📝 Intentos actualizados a: ${newAttempts}`); // Log de actualización

      // Si supera 2 intentos, bloquea el usuario
      if (newAttempts > 2) {
        await executeQuery(
          'UPDATE tblposcrumenwebusuarios SET estatus = 9 WHERE usuario = ?',
          [usuario]
        );
        console.log('🚫 Usuario bloqueado por múltiples intentos fallidos'); // Log de bloqueo
      }
    }
  } catch (error) {
    console.error('❌ Error registrando intento fallido:', error); // Log de error
  }
};

// Función para limpiar intentos fallidos después de login exitoso
const clearFailedAttempts = async (usuario: string): Promise<void> => {
  try {
    await executeQuery(
      'DELETE FROM tbl_access_attempts WHERE tipo = "usuario" AND referencia = ?',
      [usuario]
    );
    console.log('🧹 Intentos fallidos limpiados'); // Log de limpieza
  } catch (error) {
    console.error('❌ Error limpiando intentos fallidos:', error); // Log de error
  }
};