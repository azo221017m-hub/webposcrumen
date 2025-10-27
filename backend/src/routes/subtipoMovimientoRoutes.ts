// backend/src/routes/subtipoMovimientoRoutes.ts
// Rutas para gestión de subtipos de movimiento en POSWEBCrumen

import express from 'express'; // Framework Express
import {
  getSubtipoMovimientosController,
  createSubtipoMovimientoController,
  updateSubtipoMovimientoController,
  deleteSubtipoMovimientoController
} from '../controllers/subtipoMovimientoController'; // Controladores

// Log de carga del módulo
console.log('🏪 [Routes] Configurando rutas de subtipos de movimiento');

// Crear router de express
const router = express.Router();

/**
 * Ruta para obtener todos los subtipos de movimiento
 * GET /api/subtipo-movimiento
 */
router.get('/', getSubtipoMovimientosController);

/**
 * Ruta para crear un nuevo subtipo de movimiento
 * POST /api/subtipo-movimiento
 */
router.post('/', createSubtipoMovimientoController);

/**
 * Ruta para actualizar un subtipo de movimiento existente
 * PUT /api/subtipo-movimiento/:id
 */
router.put('/:id', updateSubtipoMovimientoController);

/**
 * Ruta para eliminar un subtipo de movimiento
 * DELETE /api/subtipo-movimiento/:id
 */
router.delete('/:id', deleteSubtipoMovimientoController);

// Logs de confirmación
console.log('✅ [Routes] Ruta GET /api/subtipo-movimiento configurada');
console.log('✅ [Routes] Ruta POST /api/subtipo-movimiento configurada');
console.log('✅ [Routes] Ruta PUT /api/subtipo-movimiento/:id configurada');
console.log('✅ [Routes] Ruta DELETE /api/subtipo-movimiento/:id configurada');
console.log('🏪 [Routes] Todas las rutas de subtipos de movimiento configuradas correctamente');

export default router; // Exportar el router