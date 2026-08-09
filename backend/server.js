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
        if (m.timerId) clearTimeout(m.timerId);
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

      const startTime = Date.now();
      const durationMs = 60 * 60 * 1000; // 1 hour

      const timerId = setTimeout(() => {
        const m = matches.get(matchId);
        if (m && !m.winner) {
          const p1Score = m.maxTestCasesPassed[p1.name] || 0;
          const p2Score = m.maxTestCasesPassed[p2.name] || 0;
          
          if (p1Score > p2Score) {
            m.winner = p1.name;
            m.scores[p1.name] = (m.scores[p1.name] || 0) + 1;
            io.to(m.roomId).emit("match-result", { winner: m.winner, message: `Time's up! ${p1.name} wins by passing more test cases (${p1Score} to ${p2Score}).` });
          } else if (p2Score > p1Score) {
            m.winner = p2.name;
            m.scores[p2.name] = (m.scores[p2.name] || 0) + 1;
            io.to(m.roomId).emit("match-result", { winner: m.winner, message: `Time's up! ${p2.name} wins by passing more test cases (${p2Score} to ${p1Score}).` });
          } else {
            m.winner = "Draw";
            io.to(m.roomId).emit("match-result", { winner: "Draw", message: `Time's up! It's a draw (both passed ${p1Score} test cases).` });
          }
          io.to(m.roomId).emit("leaderboard-update", getMatchLeaderboard(m));
        }
      }, durationMs);

      matches.set(matchId, {
        roomId,
        problem,
        players: { [p1.socketId]: p1.name, [p2.socketId]: p2.name },
        winner: null,
        votesNext: new Set(),
        playedProblemIds: new Set([problem.id]),
        scores: { [p1.name]: 0, [p2.name]: 0 },
        maxTestCasesPassed: { [p1.name]: 0, [p2.name]: 0 },
        timerId,
        startTime,
        durationMs
      });

      playerToMatch.set(p1.socketId, matchId);
      playerToMatch.set(p2.socketId, matchId);

      io.sockets.sockets.get(p1.socketId)?.join(roomId);
      io.sockets.sockets.get(p2.socketId)?.join(roomId);

      io.to(roomId).emit("match-found", {
        matchId,
        roomId,
        problem: { id: problem.id, title: problem.title, difficulty: problem.difficulty, statement: problem.statement, note: problem.note, test_cases: problem.test_cases },
        players: [p1.name, p2.name],
        matchStartTime: startTime,
        durationMs
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
      
      const playerName = m.players[socket.id];
      if (result.passedCount > (m.maxTestCasesPassed[playerName] || 0)) {
        m.maxTestCasesPassed[playerName] = result.passedCount;
      }

      if (result.success) {
        m.winner = m.players[socket.id];
        m.scores[m.winner] = (m.scores[m.winner] || 0) + 1;
        if (m.timerId) clearTimeout(m.timerId);
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

      if (m.timerId) clearTimeout(m.timerId);

      const startTime = Date.now();
      const durationMs = 60 * 60 * 1000;
      const timerId = setTimeout(() => {
        const currentM = matches.get(matchId);
        if (currentM && !currentM.winner) {
          const pNames = Object.values(currentM.players);
          const p1Score = currentM.maxTestCasesPassed[pNames[0]] || 0;
          const p2Score = currentM.maxTestCasesPassed[pNames[1]] || 0;
          
          if (p1Score > p2Score) {
            currentM.winner = pNames[0];
            currentM.scores[pNames[0]] = (currentM.scores[pNames[0]] || 0) + 1;
            io.to(currentM.roomId).emit("match-result", { winner: currentM.winner, message: `Time's up! ${pNames[0]} wins by passing more test cases (${p1Score} to ${p2Score}).` });
          } else if (p2Score > p1Score) {
            currentM.winner = pNames[1];
            currentM.scores[pNames[1]] = (currentM.scores[pNames[1]] || 0) + 1;
            io.to(currentM.roomId).emit("match-result", { winner: currentM.winner, message: `Time's up! ${pNames[1]} wins by passing more test cases (${p2Score} to ${p1Score}).` });
          } else {
            currentM.winner = "Draw";
            io.to(currentM.roomId).emit("match-result", { winner: "Draw", message: `Time's up! It's a draw (both passed ${p1Score} test cases).` });
          }
          io.to(currentM.roomId).emit("leaderboard-update", getMatchLeaderboard(currentM));
        }
      }, durationMs);

      m.playedProblemIds.add(newProblem.id);
      m.problem = newProblem;
      m.winner = null;
      m.votesNext.clear();
      m.maxTestCasesPassed = {};
      Object.values(m.players).forEach(p => { m.maxTestCasesPassed[p] = 0; });
      m.timerId = timerId;
      m.startTime = startTime;
      m.durationMs = durationMs;

      io.to(m.roomId).emit("match-found", {
        matchId,
        roomId: m.roomId,
        problem: { id: newProblem.id, title: newProblem.title, difficulty: newProblem.difficulty, statement: newProblem.statement, note: newProblem.note, test_cases: newProblem.test_cases },
        players: Object.values(m.players),
        matchStartTime: startTime,
        durationMs
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
      timestamp: new Date().toISOString()
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
