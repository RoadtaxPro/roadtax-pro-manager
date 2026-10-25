---
name: PRBMS product boundaries
description: Roadtax Pro’s product context, localization, and prototype-only data/integration limits.
---

PRBMS is Roadtax Pro’s business management system for Malaysian vehicle insurance and road tax services. The user requested Bahasa Melayu as the primary language, Malaysian Ringgit (RM), a professional navy blue, white, and green design, and a mobile-friendly experience for Android.

For the initial prototype, use fictional sample data only. Do not store real customer data or connect insurance/takaful providers unless the user asks for that follow-up work.

Customer records should support a one-to-many relationship with vehicles in future work; vehicle linking is not part of the current prototype registration flow.

**Why:** The user explicitly requested an interface-first prototype and deferred real data storage and insurance integrations.

**How to apply:** Keep current prototype behavior demo-only. Treat persistence, authentication, role enforcement, vehicle linking, and provider integrations as separate future work requiring explicit user direction.
