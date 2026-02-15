# Vercel Root Directory – If the modal won’t let you click

If you **can’t click the other option or Continue** on the Root Directory screen when importing the repo:

## Option 1: Skip the modal, set root after deploy

1. **Cancel** or **back out** of the Root Directory modal (or leave it as the default and click **Continue** if that works).
2. Finish creating the project (add env vars, then **Deploy**).
3. After the project exists, go to **Project → Settings → General**.
4. Find **Root Directory** → click **Edit**.
5. **Clear** the current value and type: `apps/web`  
   (or use the picker if it works there).
6. Click **Save**.
7. Go to **Deployments** and trigger **Redeploy** on the latest deployment.

Your app lives in `apps/web`, so Vercel must use that as the root for the build to work.

## Option 2: Type the path in the modal

On the Root Directory step, check if there is a **text field** (not only dropdown options):

- Click inside the path/input area and type: `apps/web`
- Then try **Continue**.

## Option 3: Different browser / no extensions

- Try in an **Incognito/Private** window.
- Or another browser (Chrome, Edge, Firefox).
- Disable ad-blockers or extensions that might block clicks on that page.

## Env vars (in Vercel Project → Settings → Environment Variables)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Use the same values as in your local `poker-tracker/.env` or `apps/web/.env.local`.

## After deploy: Supabase redirect URL

In **Supabase → Authentication → URL Configuration**, add your Vercel URL to **Redirect URLs**, e.g.:

- `https://your-project.vercel.app/**`

Then sign-in will work on the live site.
