---
name: PRBMS product boundaries
description: Roadtax Pro’s product context, localization, and prototype-only data/integration limits.
---

PRBMS is Roadtax Pro’s business management system for Malaysian vehicle insurance and road tax services. The current direction is English as the primary interface language, Malaysian Ringgit (RM), a professional navy blue, white, and green design, and a mobile-friendly experience for Android.

Keep all customer changes and CSV imports in prototype/demo state only. Use fictional sample data, do not claim records are permanently saved, and do not add a real database, authentication, or insurance/takaful provider integrations unless the user asks for that follow-up work.

Customer records should support a one-to-many relationship with vehicles in future work; vehicle linking is not part of the current prototype registration flow.

Preserve the current module/navigation structure. Do not add separate Policies, Payments, or Settings pages without new direction.

**Why:** The user explicitly prioritized an English-language interface while keeping the current app as an interface-first prototype with no permanent data storage or new pages.

**How to apply:** Keep all customer CRUD and CSV import state session-only. Treat persistence, authentication, role enforcement, vehicle linking, and provider integrations as separate future work requiring explicit user direction.
