# fuel-station-dashboard

A simple real-time fuel station dashboard that can run locally via Node.js + Socket.IO or be hosted globally using Firebase Hosting and Firestore.

## 🚀 Run locally (Node + Socket.IO)

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open in a browser:

- Local: `http://localhost:3000`

## 🌍 Make it accessible globally (Firebase Hosting)

This repo includes Firebase client code that syncs pump status via Firestore. To make the app available publicly:

1. Install the Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Log in and initialize hosting (run once):

```bash
firebase login
firebase init hosting
```

- Select your Firebase project
- Set the public directory to `.`
- Choose **No** for single-page app rewrites (unless you want it)

3. Add your Firebase config values to `index.html` (replace the placeholder values in `firebaseConfig`).

4. Deploy:

```bash
firebase deploy
```

Your site will be published at a URL like `https://<your-project>.web.app`.

---

### Optional: Keep using the local Node server

If you still want the Node + Socket.IO version for local testing:

```bash
npm install
npm start
```

Then open `http://localhost:3000`.
