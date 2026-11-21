# ResQMeal - Surplus Food Rescue & Redistribution Network

A high-reliability digital corridor for surplus food redistribution across India, connecting restaurants, community kitchens, NGOs, and verified volunteers with live tracking, cold-chain compliance, and safety standards.

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Database & ORM:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth v5 (Auth.js)
- **Styling & UI:** Tailwind CSS v4, Lucide Icons, Leaflet / Carto maps

## Getting Started

1. Clone and install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
DATABASE_URL="postgresql://user:password@host:port/database"
AUTH_SECRET="your-secret-here"
AUTH_TRUST_HOST=true
NEXT_PUBLIC_CARTO_API_KEY="..."
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."
```

3. Setup database:
```bash
npx prisma db push
npm run db:seed
```

4. Run the development server:
```bash
npm run dev
```

## Deployment on Vercel
- Set root directory to repository root.
- Add `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, and public map keys.
- Prisma client generation is handled automatically via `postinstall` and `build` scripts.
