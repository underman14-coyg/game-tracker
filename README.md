# Save Point — Supabase Version

A cloud-backed personal game diary and backlog tracker.

## What changed from the localStorage MVP

- Adds Supabase Auth
- Stores game metadata in `games`
- Stores your personal tracking data in `user_games`
- Adds Row Level Security so each user only sees their own library
- Keeps the schema IGDB-ready without blindly copying IGDB

## 1. Create Supabase project

Create a new Supabase project.

Then go to:

```text
Supabase Dashboard → SQL Editor → New query
```

Paste and run:

```text
supabase/schema.sql
```

## 2. Add environment variables locally

Create `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these in:

```text
Supabase Dashboard → Project Settings → API
```

Use the Project URL and anon public key.

## 3. Run locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## 4. Deploy to Vercel

In Vercel, add the same environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Then redeploy.

## 5. Auth note

By default, Supabase may require email confirmation before sign-in.

For easier testing, you can disable this in:

```text
Supabase Dashboard → Authentication → Providers → Email
```

Turn off Confirm email.

## Current features

- Sign up / sign in
- Add games manually
- Edit/delete your library entries
- Track status, platform, rating, hours, genre, mood, notes
- Dashboard stats
- Backlog picker
- RLS-protected data

## Next upgrade: IGDB search

Recommended next step:

- Add a server route: `app/api/igdb/search/route.ts`
- Store IGDB credentials as server-only env vars
- Search IGDB from the server
- Insert selected IGDB metadata into `games`
- Add personal tracking row in `user_games`
