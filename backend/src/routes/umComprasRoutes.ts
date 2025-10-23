// backend/src/routes/umComprasRoutes.ts
// Rutas para gestión de unidades de medida de compra en POSWEBCrumen

import { Router } from 'express'; // Importa Router de Express
import { 
  getUMComprasController, 
  createUMCompraController, 
  updateUMCompraController,
  deleteUMCompraController
} from '../controllers/umComprasController'; // Importa controladores

console.log('🏪 [Routes] Configurando rutas de unidades de medida de compra');

// Crea un router de Express
const router = Router();

// GET /api/um-compras - Obtiene todas las unidades de medida de compra
router.get('/', getUMComprasController);
console.log('✅ [Routes] Ruta GET /api/um-compras configurada');

// POST /api/um-compras - Crea una nueva unidad de medida de compra
router.post('/', createUMCompraController);
console.log('✅ [Routes] Ruta POST /api/um-compras configurada');

// PUT /api/um-compras/:id - Actualiza una unidad de medida de compra
router.put('/:id', updateUMCompraController);
console.log('✅ [Routes] Ruta PUT /api/um-compras/:id configurada');

// DELETE /api/um-compras/:id - Elimina una unidad de medida de compra
router.delete('/:id', deleteUMCompraController);
console.log('✅ [Routes] Ruta DELETE /api/um-compras/:id configurada');

console.log('🏪 [Routes] Todas las rutas de unidades de medida de compra configuradas correctamente');

// Exporta el router para uso en la aplicación principal
export default router;