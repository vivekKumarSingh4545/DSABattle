import { useState, useCallback, useEffect } from "react";
import Lobby from "./components/Lobby";
import Match from "./components/Match";
import Leaderboard from "./components/Leaderboard";
import Chat from "./components/Chat";
import { socket } from "./socket";
import "./App.css";

export default function App() {
  const [playerName, setPlayerName] = useState("");
  const [opponent, setOpponent] = useState("");
  const [problem, setProblem] = useState(null);
  const [autoSearch, setAutoSearch] = useState(false);

  useEffect(() => {
    const onMatch = (payload) => {
      const myName = playerName.trim() || payload.players[0]; // fallback
      const others = payload.players.filter(n => n !== myName);
      setOpponent(others[0] || "Opponent");
      setProblem(payload.problem);
    };

    socket.on("match-found", onMatch);
    return () => {
      socket.off("match-found", onMatch);
    };
  }, [playerName]);

  const onQuit = useCallback(() => {
    setProblem(null);
    setOpponent("");
    setAutoSearch(false);
  }, []);

  const onFindAnother = useCallback(() => {
    setProblem(null);
    setOpponent("");
    setAutoSearch(true);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="app-header">
        <div className="app-logo">DSA BATTLE</div>
        {playerName && (
          <div style={{ fontSize: "0.95rem", opacity: 0.8 }}>
            Playing as: <strong style={{ color: "#818CF8" }}>{playerName}</strong>
          </div>
        )}
      </header>

      <main className="app-container" style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: !problem ? "center" : "stretch" }}>
        {!problem ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
            <Lobby 
              setPlayerName={setPlayerName} 
              initialName={playerName}
              autoSearch={autoSearch}
              setAutoSearch={setAutoSearch}
            />
          </div>
        ) : (
          <div className="grid-layout">
            <div>
              <Match 
                me={playerName} 
                opponent={opponent} 
                problem={problem} 
                onQuit={onQuit}
                onFindAnother={onFindAnother}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignSelf: "stretch", height: "calc(100vh - 160px)" }}>
              <div style={{ height: "190px", overflow: "hidden", minHeight: 0 }}>
                <Leaderboard />
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <Chat playerName={playerName} problem={problem} opponent={opponent} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
