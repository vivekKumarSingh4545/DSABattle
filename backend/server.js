const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const problems = require("./problems.json");
const { judgeSubmission } = require("./judge");
const { randomUUID } = require("crypto");

const { exec } = require("child_process");
exec("which g++ && g++ --version", (err, stdout, stderr) => {
  console.log("g++ check:", stdout || stderr || err?.message);
});

const app = express();
app.use(cors({ origin: "https://dsabattle2.vercel.app" }));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "https://dsabattle2.vercel.app" } });

// In-memory state (fine for MVP)
let waiting = null; // { socketId, name }
const matches = new Map(); // matchId -> { roomId, problem, players: { [socketId]: name }, winner: null }
const playerToMatch = new Map(); // socketId -> matchId
const leaderboard = new Map(); // name -> score

function getRandomProblem() {
  return problems[Math.floor(Math.random() * problems.length)];
}
function getMatchLeaderboard(m) {
  if (!m || !m.scores) return [];
  return Object.entries(m.scores)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);
}

// REST: local scoreboard endpoint (always empty on general load)
app.get("/leaderboard", (_req, res) => res.json([]));
app.get("/health", (_req, res) => res.json({ ok: true }));

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  function leaveActiveMatch() {
    const matchId = playerToMatch.get(socket.id);
    if (matchId) {
      const m = matches.get(matchId);
      if (m) {
        socket.leave(m.roomId);
        socket.to(m.roomId).emit("opponent-left");
        // Clean up match entry
        matches.delete(matchId);
      }
      playerToMatch.delete(socket.id);
    }
    // Clear scoreboard for local client
    socket.emit("leaderboard-update", []);
  }

  socket.on("find-match", (playerName) => {
    // If they were in an active match, leave it first
    leaveActiveMatch();

    // join queue or pair immediately
    if (waiting && waiting.socketId !== socket.id) {
      // Create match
      const matchId = randomUUID();
      const roomId = `room-${matchId}`;
      const problem = getRandomProblem();

      const p1 = waiting;
      const p2 = { socketId: socket.id, name: playerName };

      matches.set(matchId, {
        roomId,
        problem,
        players: { [p1.socketId]: p1.name, [p2.socketId]: p2.name },
        winner: null,
        votesNext: new Set(),
        playedProblemIds: new Set([problem.id]),
        scores: { [p1.name]: 0, [p2.name]: 0 }
      });

      playerToMatch.set(p1.socketId, matchId);
      playerToMatch.set(p2.socketId, matchId);

      io.sockets.sockets.get(p1.socketId)?.join(roomId);
      io.sockets.sockets.get(p2.socketId)?.join(roomId);

      io.to(roomId).emit("match-found", {
        matchId,
        roomId,
        problem: { id: problem.id, title: problem.title, statement: problem.statement, note: problem.note, test_cases: problem.test_cases },
        players: [p1.name, p2.name]
      });

      // Emit initial 0-0 scores to room
      io.to(roomId).emit("leaderboard-update", [
        { name: p1.name, score: 0 },
        { name: p2.name, score: 0 }
      ]);

      waiting = null;
    } else {
      waiting = { socketId: socket.id, name: playerName };
      socket.emit("queued");
    }
  });

  socket.on("submit", async ({ code, language }) => {
    const matchId = playerToMatch.get(socket.id);
    if (!matchId) return; // not in match
    const m = matches.get(matchId);
    if (!m || m.winner) return; // already finished

    const problemFull = problems.find(p => p.id === m.problem.id);
    try {
      const result = await judgeSubmission({ code, language, problem: problemFull });
      if (result.success) {
        m.winner = m.players[socket.id];
        m.scores[m.winner] = (m.scores[m.winner] || 0) + 1;
        io.to(m.roomId).emit("match-result", { winner: m.winner, message: result.message });
        io.to(m.roomId).emit("leaderboard-update", getMatchLeaderboard(m));
      } else {
        io.to(socket.id).emit("submission-feedback", result.message);
      }
    } catch (e) {
      io.to(socket.id).emit("submission-feedback", `Judge error: ${e.message || e}`);
    }
  });

  socket.on("vote-next-question", () => {
    const matchId = playerToMatch.get(socket.id);
    if (!matchId) return;
    const m = matches.get(matchId);
    if (!m) return;

    m.votesNext = m.votesNext || new Set();
    m.votesNext.add(socket.id);

    // Alert other players in match room
    socket.to(m.roomId).emit("opponent-voted-next");

    const playerIds = Object.keys(m.players);
    if (playerIds.every(id => m.votesNext.has(id))) {
      // Both voted next question! Start rematch
      m.playedProblemIds = m.playedProblemIds || new Set();
      const unplayedProblems = problems.filter(p => !m.playedProblemIds.has(p.id));

      let newProblem;
      if (unplayedProblems.length > 0) {
        newProblem = unplayedProblems[Math.floor(Math.random() * unplayedProblems.length)];
      } else {
        m.playedProblemIds.clear();
        newProblem = getRandomProblem();
      }

      m.playedProblemIds.add(newProblem.id);
      m.problem = newProblem;
      m.winner = null;
      m.votesNext.clear();

      io.to(m.roomId).emit("match-found", {
        matchId,
        roomId: m.roomId,
        problem: { id: newProblem.id, title: newProblem.title, statement: newProblem.statement, note: newProblem.note, test_cases: newProblem.test_cases },
        players: Object.values(m.players)
      });
    }
  });

  socket.on("send-message", (text) => {
    const matchId = playerToMatch.get(socket.id);
    if (!matchId) return;
    const m = matches.get(matchId);
    if (!m) return;

    io.to(m.roomId).emit("receive-message", {
      sender: m.players[socket.id],
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  socket.on("leave-match", () => {
    leaveActiveMatch();
  });

  socket.on("disconnect", () => {
    if (waiting && waiting.socketId === socket.id) waiting = null;
    leaveActiveMatch();
    console.log("disconnected:", socket.id);
  });
});

const PORT = 5001;
server.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));
