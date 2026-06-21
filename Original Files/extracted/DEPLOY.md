# FlowSpace — Deployment Guide
**Estimated time: 20 minutes | Cost: $0**

You will end up with:
- A live URL (e.g. `https://flowspace-yourname.vercel.app`)
- User accounts (email/password + optional Google login)
- Real-time cross-device sync — open on phone and laptop simultaneously

---

## Prerequisites
Install these once if you don't have them:
- [Node.js 18+](https://nodejs.org) — download the LTS version
- [Git](https://git-scm.com)

---

## Step 1 — Create a Supabase project (free, 2 min)

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign up free
2. Click **New project**
3. Name it `flowspace`, choose a region close to you, set a database password, click **Create**
4. Wait ~2 minutes for provisioning

**Get your keys:**
- Go to **Project Settings** → **API**
- Copy: **Project URL** (looks like `https://xxxx.supabase.co`)
- Copy: **anon / public** key (long string starting with `eyJ`)
- Save both — you'll need them in Step 3

---

## Step 2 — Set up the database (2 min)

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `schema.sql` from this package, copy its entire contents
4. Paste into the SQL editor, click **Run** (green button)
5. You should see "Success. No rows returned"

**Optional: Enable Google Login**
1. Supabase dashboard → **Authentication** → **Providers** → **Google**
2. Toggle it on — follow the instructions to create a Google OAuth app
3. Paste the Client ID and Secret into Supabase

---

## Step 3 — Set up the project locally (5 min)

Open your terminal and run these commands one by one:

```bash
# Create a new Vite + React project
npm create vite@latest flowspace -- --template react
cd flowspace

# Install dependencies
npm install @supabase/supabase-js
npm install

# Remove the default files you don't need
rm src/App.jsx src/App.css src/index.css
```

Now copy your project files:
- Copy `FlowSpace.jsx` from this package → paste as `src/App.jsx`
- Copy `index.css` content below → create `src/index.css`

**Create your environment file:**
Create a file called `.env` in the `flowspace/` folder (not inside `src/`):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJYOUR-ANON-KEY-HERE
```

Replace with your actual values from Step 1.

**Update `src/main.jsx`** to import the CSS:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**Create `src/index.css`** with just:
```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body { overflow: hidden; }
```

**Test it locally:**
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) — you should see the FlowSpace login screen.

---

## Step 4 — Deploy to Vercel (5 min, free forever)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follow the prompts — accept all defaults)
vercel

# When asked "Want to override the settings?" → No
# Vercel will give you a URL like: https://flowspace-abc123.vercel.app
```

**Add your environment variables to Vercel:**
```bash
vercel env add VITE_SUPABASE_URL
# paste your Supabase URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# paste your anon key when prompted

# Redeploy with the env vars
vercel --prod
```

**That's it.** Your app is live. Share the URL with yourself — log in from your phone and your laptop and watch tasks sync in real time.

---

## Step 5 — Custom domain (optional, 2 min)

If you have a domain (e.g. via Namecheap or Cloudflare):
1. Vercel dashboard → your project → **Settings** → **Domains**
2. Add your domain, follow the DNS instructions

---

## How cross-device sync works

Every change (add task, complete task, drag to reorder, add note) is:
1. Applied **immediately** to your local UI (optimistic update — feels instant)
2. Saved to Supabase in the background
3. **Broadcast via WebSocket** to all other devices logged into the same account
4. Applied to those devices in under 200ms

If you go offline, changes queue locally. When you reconnect, they sync automatically.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Missing Supabase URL" on load | Check your `.env` file has no spaces around `=` |
| Login button does nothing | Check browser console for CORS errors; verify your Supabase URL |
| Data not syncing across devices | Make sure realtime is enabled — re-run the schema.sql Step 4 |
| Vercel build fails | Run `npm run build` locally first to see the error |
| Google login not working | Verify the redirect URL in Google Console matches `https://your-project.supabase.co/auth/v1/callback` |

---

## Project structure after setup

```
flowspace/
├── src/
│   ├── App.jsx          ← FlowSpace.jsx (renamed)
│   ├── main.jsx         ← entry point
│   └── index.css        ← minimal reset
├── .env                 ← your Supabase keys (never commit this)
├── .gitignore           ← make sure .env is listed
├── package.json
└── vite.config.js       ← unchanged from Vite default
```

---

## Updating the app

When you want to make changes:
```bash
# Edit src/App.jsx, then:
vercel --prod
```

Vercel redeploys in ~30 seconds.
