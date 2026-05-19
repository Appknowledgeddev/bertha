# Birtha Feedback

A lightweight Next.js feedback board for Birtha, built to be easier to host and maintain than the Laravel prototype.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

## Local run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase table

Create a table named `feedback_requests`:

```sql
create table if not exists public.feedback_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null default 'Feature Requests',
  status text not null default 'In Review',
  author_name text not null default 'Anonymous',
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  created_at timestamptz not null default now()
);
```

If you already created the table earlier, run this too:

```sql
alter table public.feedback_requests
  add column if not exists downvotes integer not null default 0;
```

Create a second table to track anonymous votes per browser:

```sql
create table if not exists public.feedback_votes (
  feedback_id uuid not null references public.feedback_requests (id) on delete cascade,
  voter_token text not null,
  vote_value smallint not null check (vote_value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (feedback_id, voter_token)
);
```

If you created `feedback_votes` before this change, run:

```sql
alter table public.feedback_votes
  add column if not exists vote_value smallint;

update public.feedback_votes
set vote_value = 1
where vote_value is null;

alter table public.feedback_votes
  alter column vote_value set not null;
```

Create a third table for comments:

```sql
create table if not exists public.feedback_comments (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedback_requests (id) on delete cascade,
  author_name text not null default 'Anonymous',
  body text not null,
  created_at timestamptz not null default now()
);
```

For the quickest setup, disable RLS for now or create policies that allow your app's service role access.

## Auth model

- Public users do not log in.
- Public users can submit ideas, vote, and comment.
- Public users can keep one active vote direction per request per browser.
- Only admins log in at `/admin/login`.
