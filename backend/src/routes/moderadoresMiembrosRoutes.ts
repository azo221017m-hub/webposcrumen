// backend/src/routes/moderadoresMiembrosRoutes.ts
// Rutas para asignaciones de moderadores a grupos

import { Router } from 'express';
import {
  getModeradoresMiembros,
  createModeradoresMiembros,
  updateModeradoresMiembros,
  deleteModeradoresMiembros
} from '../controllers/moderadoresMiembrosController';

const router = Router();

// Obtener todas las asignaciones
router.get('/', getModeradoresMiembros);
// Crear nuevas asignaciones
router.post('/', createModeradoresMiembros);
// Editar una asignación
router.put('/:id', updateModeradoresMiembros);
// Eliminar una asignación
router.delete('/:id', deleteModeradoresMiembros);

export default router;
