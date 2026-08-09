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

  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className="app-header" style={{ position: "relative", zIndex: 50 }}>
        <div className="app-logo">DSA BATTLE</div>
        {playerName && (
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontSize: "0.95rem", opacity: 0.8 }}>
              Playing as: <strong style={{ color: "#818CF8" }}>{playerName}</strong>
            </div>
            {problem && (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    padding: "8px 16px",
                    background: showDropdown ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.05)",
                    border: showDropdown ? "1px solid #6366F1" : "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: showDropdown ? "#818CF8" : "#E2E8F0",
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "all 0.2s"
                  }}
                >
                  💬 Match Chat & Score
                </button>
                {showDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "120%",
                      right: 0,
                      width: "350px",
                      height: "600px",
                      maxHeight: "80vh",
                      background: "#111827",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      padding: 16,
                      zIndex: 100
                    }}
                  >
                    <div style={{ height: "190px", overflow: "hidden", minHeight: 0, flexShrink: 0 }}>
                      <Leaderboard />
                    </div>
                    <div style={{ flex: 1, minHeight: 0 }}>
                      <Chat playerName={playerName} problem={problem} opponent={opponent} />
                    </div>
                  </div>
                )}
              </div>
            )}
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
          <div className="grid-layout" style={{ gridTemplateColumns: "1fr" }}>
            <Match 
              me={playerName} 
              opponent={opponent} 
              problem={problem} 
              onQuit={onQuit}
              onFindAnother={onFindAnother}
            />
          </div>
        )}
      </main>
    </div>
  );
}
