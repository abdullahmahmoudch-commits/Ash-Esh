# Ash-Esh (اش-اش) 🃏

A real-time online multiplayer card game for 4 players.

---

## Quick Start (Local)

### 1. Start the server
```bash
cd server
npm install
npm start
```

### 2. Start the client (new terminal)
```bash
cd client
npm install
npm start
```

Open http://localhost:3000 in your browser.

---

## Deploy to the Internet (Free)

### Backend → Railway

1. Go to https://railway.app and sign up (free)
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub and push the `server/` folder
4. Set the root directory to `server`
5. Railway auto-detects Node.js and deploys
6. Copy your Railway URL (e.g. `https://ash-esh-server.up.railway.app`)

### Frontend → Vercel

1. Go to https://vercel.com and sign up (free)
2. Click "New Project" → import your GitHub repo
3. Set root directory to `client`
4. Add environment variable:
   - `REACT_APP_SERVER_URL` = your Railway URL from above
5. Deploy → Vercel gives you a live URL like `https://ash-esh.vercel.app`

Share that Vercel URL with friends — they open it in any browser and join your game!

---

## Game Rules Summary

- 107-card deck (2 standard decks − 1 Joker)
- 4 players in 2 teams
- Capture sets by matching ranks on the ground or stealing from other players
- Your "face" = last captured rank = what others need to steal from you
- Joker = wild card, worth 50 points, can be covered and uncovered
- Scoring: 4-of-a-kind = 20pts, 3-of-a-kind = 10pts, Joker = 50pts
- First team to 200 points wins

See `ash-esh-gameplay.md` for full rules.
