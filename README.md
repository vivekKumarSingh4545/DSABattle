# ⚔️ DSABattle – Real-Time 1v1 Competitive Coding Platform

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)

### Live 1v1 Coding Duels, Powered by Real-Time Sockets

A real-time competitive programming platform where developers face off head-to-head, solving DSA problems live against an opponent — under pressure, on the clock.

Built for speed, fairness, and the thrill of a live coding duel.

</div>

---

# 🌐 Live Demo

### 🚀 Deployment

https://dsabattle2.vercel.app/

---

# 📌 Overview

DSABattle turns competitive programming into a live, head-to-head experience. Instead of solving problems in isolation, two players are matched into a real-time room, given the same problem, and race to submit a correct solution first.

The platform handles matchmaking, live progress tracking, real-time verdicts, and match history — all synced instantly between opponents via Socket.IO.

---

# ✨ Key Features

## ⚔️ Real-Time 1v1 Battles

- Enter your name and jump straight into matchmaking — no signup required
- Live matchmaking and pairing
- Synchronized problem delivery to both players
- Instant opponent progress visibility
- Match timer synced across both clients

---

## 🧠 Problem & Submission Engine

- Curated DSA problem bank across difficulty levels
- Live code submission during a match
- Real-time pass/fail verdicts

---

## 📊 Matchmaking & Stats

- Instant queue-based opponent matching by name
- Per-session match results (winner, time taken, problems solved)

---

## 🔄 Real-Time Sync & Reliability

- Socket.IO-based bidirectional communication
- Room-based match isolation
- Reconnection handling for dropped connections
- Dockerized for consistent local & production environments

---

# 🛠️ Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

# ⚡ Real-Time Engine (Socket.IO)

Socket.IO powers the live core of DSABattle — every match runs as an isolated room where state is synced instantly between both players.

Implemented capabilities include:

- Room-based match sessions
- Live opponent progress broadcasting
- Real-time submission verdict push
- Match timer synchronization
- Graceful disconnect/reconnect handling

---

# 🏗️ System Architecture

```text
Player enters name
   │
   ▼
React Frontend
   │
   ▼
Socket.IO Layer  <───────►  Matchmaking Service
   │
   ▼
Express/Node Backend
   │
 ┌────────────┐
 ▼            ▼
MongoDB     Code Execution Engine
(Matches,   (Submission Judging)
Problems)
```

---

# 📂 Project Structure

```bash
dsabattle/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── sockets/
│   │   └── App.js
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── sockets/
│   ├── utils/
│   └── server.js
├── docker-compose.yml
└── README.md
```

---

# 🚀 Setup Instructions

## 1. Clone Repository

```bash
git clone https://github.com/vivekKumarSingh4545/dsabattle.git
cd dsabattle
```

## 2. Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

## 3. Configure Environment Variables

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
```

## 4. Run with Docker

```bash
docker-compose up --build
```

## 5. Run Locally (without Docker)

```bash
# Backend
cd server && npm run dev

# Frontend
cd client && npm start
```

The app runs at `http://localhost:3000`.

---

# 🎮 How It Works

1. **Enter your name** — no signup or login required.
2. **Find a match** to get paired with an opponent instantly.
3. Both players receive the **same problem** at the same moment.
4. Code, submit, and get **instant verdicts**.
5. First correct solver — **wins the battle**.

---

# 📊 Learning Outcomes

This project strengthened understanding of:

- Real-time bidirectional communication with Socket.IO
- Room-based state synchronization
- Matchmaking system design
- Dockerized multi-service deployment
- Handling race conditions in live multiplayer systems

---

# 💡 Future Improvements

- [ ] Optional accounts with persistent stats and rating
- [ ] ELO-based ranked matchmaking
- [ ] Spectator mode for live matches
- [ ] Multi-language code execution support
- [ ] Tournament / bracket mode
- [ ] Custom private rooms for friendly matches
- [ ] Match replay / submission history viewer

---

# ⚠️ Notes

- Built for live, fair, low-latency 1v1 competitive coding.
- Designed with scalability of concurrent match rooms in mind.
- Docker ensures consistent behavior across local and production environments.

---

# 👨‍💻 Author

### Vivek Kumar Singh
Full-Stack Development • Real-Time Systems • Competitive Programming

## 🔗 Connect With Me

https://github.com/vivekKumarSingh4545

https://www.linkedin.com/in/vivekkumarsingh4545/

---

# 📜 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you found this project interesting, consider giving it a star — it helps and motivates further development.
