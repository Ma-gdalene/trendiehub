# TRENDIE MODELS: Supabase and deployment setup

This app uses Supabase Auth, PostgreSQL, Realtime and private Storage. The web client and API use only the public anon/publishable key plus the signed-in user's access token. **Do not configure a service-role key for this app.** User permissions are enforced by database RLS and role-checking database functions.

## 1. Configure the Supabase project

1. Create a Supabase project and keep its project URL and anon/publishable key available.
2. Apply the migration in `supabase/migrations/` from the `artifacts/trendie-models` directory using the Supabase CLI:

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

   The migration creates the profiles, applications, task and submission records, point ledger, announcements, private conversations, notifications, daily tracker, support, audit, RLS policies, RPCs, Realtime publication entries, and three private storage buckets.
3. In Supabase Auth settings, set the public site URL and the allowed redirect URLs for the web app. Enable email confirmation for production. Configure an SMTP provider before relying on production password recovery and confirmation emails.
4. Set these app environment variables:

   | Variable | Where it is used |
   | --- | --- |
   | `VITE_SUPABASE_URL` | Browser Supabase client |
   | `VITE_SUPABASE_ANON_KEY` | Browser Supabase client; public key, protected by RLS |
   | `SUPABASE_URL` | TypeScript API server |
   | `SUPABASE_ANON_KEY` | TypeScript API server |
   | `VITE_API_BASE_URL` | Optional full API base, including `/api`, for split-origin deployments |
   | `ALLOWED_ORIGINS` | Comma-separated exact frontend origins allowed by the API |

   In Replit, the two `VITE_` values are already stored securely. For another host, copy the names from `.env.example` into that host's environment settings; never commit their values.

## 2. Grant the initial administrator explicitly

The app never makes an account an admin because its email matches the agency address. Create and verify the `hellotrendiemodels@gmail.com` account through Supabase Auth first. Then, as the Supabase project owner, verify its Auth user UUID and email in the SQL editor:

```sql
select id, email
from auth.users
where lower(email) = 'hellotrendiemodels@gmail.com';
```

Only after confirming that this is the intended, controlled agency account, assign its verified UUID in the SQL editor (replace the UUID below):

```sql
update public.profiles
set role = 'admin'
where id = 'VERIFIED_AUTH_USER_UUID'
  and lower(email) = 'hellotrendiemodels@gmail.com'
returning id, email, role;
```

The database owner must perform this explicit grant. There is no public registration field, email-based auto-promotion, client-side role update, or service-role key in the application.

## 3. Local development

From the workspace root, set the values in the environment, then run the existing API server and the web artifact. The frontend is served at `/` and the API at `/api`.

```sh
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/trendie-models run dev
```

Use the supplied Supabase project for Auth and database migrations. An empty project is supported; the app displays empty states instead of pretending sample rows are real.

## 4. Deploy outside Replit

- Build the web package with `pnpm --filter @workspace/trendie-models run build` and host `artifacts/trendie-models/dist/public` as a static site.
- Build and run the shared Express API with `pnpm --filter @workspace/api-server run build` and `pnpm --filter @workspace/api-server run start`.
- Give the API `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `ALLOWED_ORIGINS` (the exact frontend origin). Give the frontend its `VITE_SUPABASE_*` values and, when on a separate origin, `VITE_API_BASE_URL=https://YOUR_API_HOST/api`.
- Configure Supabase Auth's site and redirect URLs for the deployed frontend.
- Apply database changes with the Supabase CLI migration flow before publishing application code that depends on them.

The API accepts authenticated bearer tokens, confirms them with Supabase Auth, then makes database calls using the public key and that user's token so PostgreSQL RLS remains in effect. It does not use a database password or privileged service-role key.

## 5. Agency media

Place the supplied TRENDIE MODELS logo and hero photo in the project when they are available. The current build intentionally leaves media slots instead of making up substitutes. Uploads are stored in the private `profile-photos`, `portfolio`, and `task-evidence` buckets. Objects must be under the signed-in model's user-ID folder; signed URLs should be used for viewing private files.
