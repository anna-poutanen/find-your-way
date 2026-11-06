# Find Your Way

A production-style foundation for the Hearts Against Homelessness resource directory.

## Included in this build

- Public resource search, filters, and detail pages
- Sign in and persistent profiles
- User favourites and anonymous shelter messaging
- Shelter submissions and multi-member organization data model
- Admin approval queue and audit log
- CSV preview plus XLS/XLSX/PDF upload queue
- Cloudflare D1 persistence and R2 file storage
- Responsive, accessible UI designed for mobile-first use

## Local development

```bash
npm run dev
```

The first locally signed-in account becomes the development admin. Hosted authentication is provided by Sites. Before a public launch, replace the first-user bootstrap with an explicit owner allowlist.

## Email relay

Conversation and relay-token storage is implemented. Sending and inbound replies require a transactional email provider, verified sending domain, and webhook secret before production messaging is enabled.
