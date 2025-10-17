// backend/src/routes/rolesRoutes.ts
// Rutas para gestión de roles de usuario

import { Router } from 'express'; // Importa Router de Express
import { getRolesController } from '../controllers/rolesController'; // Importa controlador

// Crea el router de roles
const router = Router();

// Ruta para obtener todos los roles
router.get('/', getRolesController);

// Exporta el router
export default router;