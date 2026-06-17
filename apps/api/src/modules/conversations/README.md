# Conversations Module (Migration Scaffold)

This module is scaffolded for Week 4 Nest migration.

Current state:
- `conversations.placeholder.controller.ts`
- `conversations.placeholder.service.ts`
- `conversations.module.ts`

Target state:
- `conversations.controller.ts`
- `conversations.service.ts`
- `conversations.repository.ts`
- `dto/` (`create-conversation.dto.ts`, query/params DTOs when needed)

Cross-module dependency:
- Imports `AuthModule` (already wired in `conversations.module.ts`).

Note:
- Placeholder files are temporary and should be replaced incrementally.
