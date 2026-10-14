## One Gate Community

A multilingual neighbourhood platform for community notices, complaints, polls, activities, and resident participation.

## Get started

**Requirements:** Node.js, npm, and a Supabase project.

1. Copy `.env.example` to `.env.local` and set your Supabase project URL and publishable key.
2. Run the SQL migration in `supabase/migrations/20261014000000_initial_schema.sql` in the Supabase SQL Editor.
3. Start the app:

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

## Accounts and roles

Create an account in the app. New accounts receive the `citizen` role and must confirm their email if email confirmation is enabled in Supabase Auth. After creating your own account, promote it to developer in the Supabase SQL Editor:

```sql
update public.profiles
set role = 'developer'
where id = (select id from auth.users where lower(email) = lower('you@example.com'));
```

The first developer account seeds the sample community records when it signs in. Assign government officers from the SQL Editor:

```sql
select public.set_user_role(
  (select id from auth.users where lower(email) = lower('officer@example.com')),
  'officer'
);
```

Only developers can publish notices and polls or assign roles. Officers can update complaint statuses. Citizens can file complaints, comment, vote, and participate in activities. Database row-level security enforces these roles; the role shown in the app cannot be changed by visitors.

Complaint submitter phone numbers are not stored in the public community records. Keep `.env.local` private; the app only needs the Supabase publishable key, never a service-role key.

## Available commands

- `npm run dev` — start the development server
- `npm run build` — create a production build in `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run the TypeScript check
