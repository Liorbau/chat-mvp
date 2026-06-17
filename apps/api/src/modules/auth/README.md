# Auth Module (Migration Scaffold)

This module is scaffolded for Week 4 Nest migration.

Current state:
- `auth.placeholder.controller.ts`
- `auth.placeholder.service.ts`
- `auth.module.ts`

Target state:
- `auth.controller.ts` (`/auth/signup`, `/auth/login`, `/me`)
- `auth.service.ts`
- `jwt-auth.guard.ts`
- `jwt.strategy.ts`
- `dto/` (`signup.dto.ts`, `login.dto.ts`)

Cross-module dependency:
- Imports `UsersModule` (already wired in `auth.module.ts`).

Note:
- Placeholder files are temporary and should be replaced incrementally.
