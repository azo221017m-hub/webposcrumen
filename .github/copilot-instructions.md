<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# POSWEBCrumen - Instrucciones para GitHub Copilot

Este proyecto es una aplicación fullstack de punto de venta (POS) desarrollada con tecnologías modernas.

## Estructura del Proyecto

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: MySQL (Azure)
- **Estilos**: CSS puro (sin frameworks)

## Tecnologías y Convenciones

### Frontend (`/src/`)
- Usar TypeScript estricto con tipos explícitos
- Componentes funcionales con hooks
- CSS modules o archivos CSS independientes
- Fetch API para llamadas HTTP
- Manejo de estado con useState/useEffect

### Backend (`/backend/src/`)
- Node.js con Express y TypeScript
- Controladores para lógica de negocio
- Rutas RESTful organizadas
- Middleware para CORS y validación
- Conexión segura a MySQL con pool

### Base de Datos
- MySQL con tablas principales:
  - `tblposcrumenwebusuarios`
  - `tblposcrumenwebnegocio`

## Patrones de Código

### Comentarios
- Cada función, clase y archivo debe tener comentarios explicativos
- Usar comentarios de línea (`//`) para explicar lógica compleja
- Incluir logs con console.log para debugging

### Tipos TypeScript
- Importar tipos explícitamente: `import type { Type } from 'module'`
- Definir interfaces para props de componentes
- Usar tipos para respuestas de API

### Estructura de Archivos
- Componentes en `/src/components/`
- Servicios en `/src/services/`
- Tipos en `/src/types/`
- Estilos en `/src/styles/`

## Características Implementadas

✅ Pantalla de presentación animada  
✅ Sistema de login con validación  
✅ Dashboard con indicadores  
✅ Gestión de usuarios (CRUD)  
✅ Gestión de negocios (CRUD)  
✅ Navegación lateral responsive  
✅ Encriptación de contraseñas  

## Convenciones de Naming

- **Componentes**: PascalCase (`LoginScreen.tsx`)
- **Funciones**: camelCase (`handleLogin`)
- **Archivos CSS**: kebab-case (`login-screen.css`)
- **Variables**: camelCase (`currentUser`)
- **Constantes**: UPPER_CASE (`API_BASE_URL`)

## Endpoints API

- `GET /health` - Health check
- `POST /api/auth/login` - Autenticación
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `GET /api/negocios` - Listar negocios
- `POST /api/negocios` - Crear negocio
- `PUT /api/negocios/:id` - Actualizar negocio

Al generar código para este proyecto, seguir estas convenciones y mantener consistencia con el estilo existente.