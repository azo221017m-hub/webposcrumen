// backend/src/routes/insumosRoutes.ts
// Rutas para gestión de insumos con tabla tblposcrumenwebinsumos

import { Router } from 'express'; // Importa Router de Express
import { 
  getAllInsumos, 
  getInsumoById,
  createInsumo, 
  updateInsumo, 
  deleteInsumo,
  getCuentasContablesForDropdown 
} from '../controllers/insumosController'; // Importa controladores

// Crea una instancia del router
const router = Router();

// Ruta GET para obtener cuentas contables para dropdown (debe ir antes que /:id)
// Endpoint: GET /api/insumos/cuentas-dropdown
router.get('/cuentas-dropdown', getCuentasContablesForDropdown);

// Ruta GET para obtener todos los insumos
// Endpoint: GET /api/insumos
router.get('/', getAllInsumos);

// Ruta GET para obtener un insumo específico por ID
// Endpoint: GET /api/insumos/:id
// Params: id (id_insumo)
router.get('/:id', getInsumoById);

// Ruta POST para crear un nuevo insumo
// Endpoint: POST /api/insumos
// Body: CreateInsumoData
router.post('/', createInsumo);

// Ruta PUT para actualizar un insumo existente
// Endpoint: PUT /api/insumos/:id
// Params: id (id_insumo)
// Body: CreateInsumoData
router.put('/:id', updateInsumo);

// Ruta DELETE para desactivar un insumo (soft delete)
// Endpoint: DELETE /api/insumos/:id
// Params: id (id_insumo)
router.delete('/:id', deleteInsumo);

// Exporta el router para uso en app principal
export default router;