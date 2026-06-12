import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";

export default function Lobby({ setPlayerName, initialName = "", autoSearch, setAutoSearch }) {
  const [name, setName] = useState(initialName);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const onQueued = () => {
      setIsSearching(true);
    };

    socket.on("queued", onQueued);
    return () => {
      socket.off("queued", onQueued);
    };
  }, []);

  useEffect(() => {
    if (!isSearching && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearching]);

  // When autoSearch is triggered from outside
  useEffect(() => {
    if (autoSearch && (name.trim() || initialName.trim())) {
      setAutoSearch(false);
      findMatch();
    }
  }, [autoSearch, name, initialName]);

  const findMatch = () => {
    const targetName = name.trim() || initialName.trim();
    if (!targetName) return;
    setPlayerName(targetName);
    socket.emit("find-match", targetName);
  };

  return (
    <div className="card-premium" style={{ maxWidth: 500, margin: "0 auto", textAlign: "center", padding: "40px 30px" }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: 8 }}>Ready for Battle?</h2>
      <p style={{ opacity: 0.7, marginBottom: 24, fontSize: "0.95rem" }}>
        Enter your coder tag and start matching with opponents worldwide.
      </p>

      {!isSearching ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "stretch" }}>
          <input
            ref={inputRef}
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., CodeWizard"
            style={{ textAlign: "center", padding: "12px 16px" }}
            onKeyDown={e => e.key === "Enter" && findMatch()}
          />
          <button onClick={findMatch} disabled={!name.trim() && !initialName.trim()}>
            Find Match
          </button>
        </div>
      ) : (
        <div style={{ padding: "20px 0" }}>
          <div className="pulse-loader" style={{ width: 40, height: 40, marginBottom: 16 }}></div>
          <h3 style={{ margin: "8px 0" }}>Finding an Opponent...</h3>
          <p style={{ opacity: 0.6, fontSize: "0.85rem", margin: 0 }}>Waiting in matchmaking lobby</p>
        </div>
      )}
    </div>
  );
}
