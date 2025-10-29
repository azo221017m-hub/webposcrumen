# POSWEBCrumen - AI Coding Instructions

Fullstack POS system built with React + TypeScript + Vite (frontend) and Node.js + Express + MySQL (backend).

## Architecture Overview

**Frontend (`/src/`)**: React 19 with TypeScript, Vite build tool, pure CSS styling
**Backend (`/backend/src/`)**: Express + TypeScript with MySQL connection pool
**Database**: Azure MySQL with `tblposcrumenwebusuarios`, `tblposcrumenwebnegocio` core tables
**State Management**: Screen-based navigation with `useAuth` hook, no external state library

## Key Development Patterns

### Screen Navigation System
- Main app uses `ScreenType` state: `'presentation' | 'login' | 'tablero-inicial' | 'config-*'`
- All config screens follow `Config[Entity].tsx` naming and accept `onBack` prop
- Example: `ConfigUsuarios.tsx`, `ConfigNegocios.tsx`

### Type Architecture
- **Shared types**: Both frontend and backend maintain identical interfaces in `/types/index.ts`
- **API responses**: Always use `ApiResponse<T>` wrapper with `success`, `message`, `data?`, `error?`
- **Props**: Use explicit interfaces like `ConfigNegociosProps` or generic `Props` for config components

### Database & API Patterns
- **Connection**: Use `pool.execute<RowDataPacket[]>()` with prepared statements
- **Controllers**: Follow pattern: validation → business logic → response with emoji logging
- **Authentication**: bcrypt hashing, login attempt tracking in `tblposcrumenwebintentoslogin`
- **Soft deletes**: Update `estatus` field instead of hard deletes

### CSS Organization
- **Global styles**: `/src/styles/global.css` with CSS custom properties for color palette
- **Component styles**: Individual CSS files in `/src/styles/` with section headers `/* ===== SECTION ===== */`
- **No frameworks**: Pure CSS with consistent class naming patterns

### Logging Convention
- **Emoji prefixes**: 🔄 (process), ✅ (success), ❌ (error), 📡 (API), 🔍 (query)
- **Verbose logging**: Every API call, database query, and major operation should log

## Critical Development Commands

```bash
# Start development (run both simultaneously)
cd backend && npm run dev  # Backend on :4000
npm run dev               # Frontend on :5173 with API proxy

# Database operations require Azure connection
# Check backend/src/config/database.ts for connection setup
```

## Component Creation Templates

**Config Screen Pattern:**
```typescript
interface Props {
  onBack: () => void;
}

export default function ConfigEntity({ onBack }: Props) {
  // State, API calls, handlers
  return (
    <div className="config-screen">
      <button onClick={onBack}>← Regresar</button>
      {/* Component content */}
    </div>
  );
}
```

**API Service Pattern:**
```typescript
async methodName(): Promise<ApiResponse<EntityType[]>> {
  return this.request<EntityType[]>('/api/endpoint');
}
```

When adding new features, follow existing patterns for screen navigation, database queries with proper logging, and maintain the established TypeScript type consistency between frontend and backend.