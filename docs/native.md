# Freely as a real app — iPhone, Android, Windows, Mac

The website stays exactly as it is. These are wrappers around the same build, so a fix you push reaches
all of them the next time each one is rebuilt.

What's already in the repo:

| Folder | What it is |
|---|---|
| `capacitor.config.json` | the app's name, its id (`com.freely.app`) and which folder to load |
| `android/` | the Android project — open it in Android Studio |
| `ios/App/` | the iPhone project — open it in Xcode |
| `ios/UpcomingWidget/` | the home-screen widget's code, waiting to be added as a target (step 6) |
| `electron/` | the Windows/Mac desktop wrapper |
| `src/native.js` | the only app code that knows it's in an app: status bar, back button, sign-in links, widget data |

Everyday command, after any change to the app:

```bash
npm run sync
```

That rebuilds the website and copies it into both phone projects.

---

## 1 · What you need

- **iPhone app:** a Mac, Xcode (free, App Store), and an **Apple Developer account — $99/year**. There is no
  way around the Mac for building or submitting.
- **Android app:** Android Studio (free, works on your Windows PC) and a **Google Play account — $25 once**.
- **Windows/Mac desktop:** nothing extra to try it; a developer account only if you want it signed.

---

## 2 · Try the Android app first (you can do this today, on your PC)

1. Install **Android Studio** from developer.android.com/studio (accept the default components).
2. In the project folder, run:
   ```bash
   npm run android
   ```
   That builds the site, copies it in, and opens Android Studio.
3. Wait for the bottom status bar to finish "Gradle sync" the first time (a few minutes).
4. Plug in an Android phone with USB debugging on, or press the ▶ button to use the built-in emulator.

If it runs, the shell is sound and the iPhone build will behave the same.

---

## 3 · The iPhone app (on a Mac)

1. Copy the project folder to the Mac (or clone it from GitHub), then in it:
   ```bash
   npm install
   npm run ios
   ```
   Xcode opens on `ios/App/App.xcworkspace`.
2. Click the blue **App** at the top of the left sidebar → **Signing & Capabilities**.
   - Tick **Automatically manage signing**.
   - **Team:** your Apple Developer account.
   - **Bundle Identifier:** `com.freely.app` (change it only before the very first submission — it can't
     be changed afterwards).
3. Pick your iPhone (or a simulator) at the top and press ▶.

---

## 4 · Sign-in inside the app

Email and password work as they are. Google sign-in and password-reset links have to be told how to come
back into the app — the app answers to `freely://`, which is already registered in both projects.

In **Supabase → Authentication → URL Configuration → Redirect URLs**, add:

```
freely://auth
```

(keep your website URL there too). Nothing else changes: `src/native.js` catches the link, hands the code
to Supabase and the session lands in the app.

---

## 5 · The App Group — the widget's mailbox

The app and the widget are separate programs; they talk through a shared box called an App Group.

1. In Xcode, **App** target → **Signing & Capabilities** → **+ Capability** → **App Groups** → **+** →
   name it exactly:
   ```
   group.com.freely.app
   ```
2. You'll repeat this for the widget target in the next step. The same name must appear on both, and it
   must match `capacitor.config.json` → `plugins.Preferences.group`.

---

## 6 · Add the widget (once, in Xcode)

1. **File → New → Target… → Widget Extension**. Name it `UpcomingWidget`. Untick "Include Live Activity"
   and "Include Configuration Intent". Click Finish, then **Activate** the scheme when asked.
2. Xcode creates a folder with a sample widget. Delete the sample `UpcomingWidget.swift` it generated
   ("Move to Trash") and drag in **`ios/UpcomingWidget/UpcomingWidget.swift`** from this repo.
   In the dialog, tick **Copy items if needed** and tick only the **UpcomingWidget** target.
3. Select the **UpcomingWidget** target → **Signing & Capabilities** → **+ Capability** → **App Groups**
   → tick `group.com.freely.app`.
4. Drag **`ios/UpcomingWidget/WidgetReloadPlugin.swift`** into the project as well, this time ticking only
   the **App** target. (Skip this and the widget still updates, just up to half an hour later.)
5. Press ▶. On the phone: long-press the home screen → **+** → search **Freely** → add **Upcoming**.

It shows your next few dated tasks, in the same words the app uses ("Tomorrow", "2d overdue"), and tapping
it opens Freely. Small shows 2, medium 3, large 6.

---

## 7 · Sending it to the App Store

1. In Xcode: **Product → Destination → Any iOS Device**, then **Product → Archive**.
2. When the Organizer opens: **Distribute App → App Store Connect → Upload**.
3. At appstoreconnect.apple.com, create the app, fill in the description, upload screenshots, and submit
   for review. First review is usually 1–3 days.

Things Apple will ask for that are worth preparing: a privacy policy URL (what Freely stores and why), a
support URL, and screenshots at the sizes they list. Both can live on the landing page.

---

## 8 · The Windows and Mac desktop app

Electron is deliberately **not** installed by default — it would download a browser on every Cloudflare
deploy and slow the website build. Install it only when you want a desktop build:

```bash
npm install --save-dev electron electron-builder
npm run desktop          # opens Freely in a desktop window
npm run desktop:build    # makes an installer in desktop-builds/
```

On Windows that produces a `.exe` installer; on a Mac, a `.dmg`. Each platform's installer must be built
on that platform. Unsigned builds warn on first launch ("unknown developer") — signing needs the same
Apple account for Mac, or a code-signing certificate for Windows.

---

## 9 · What to expect afterwards

- **One codebase.** A change to the app is a `git push` for the website, and `npm run sync` + a rebuild
  for the phone apps.
- **App review:** Apple rejects apps that are "just a website". Freely is fine on that front — it works
  offline-first, syncs, and now has a widget — but the listing should show the app doing app things.
- **Updates:** small web-only changes can go out without a new app release, because the app loads the
  bundled build; anything native (the widget, permissions) needs a new submission.
