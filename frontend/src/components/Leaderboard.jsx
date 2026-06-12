import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchLB = async () => {
      try {
        const res = await fetch("https://dsabattle-1.onrender.com/leaderboard");
        setRows(await res.json());
      } catch (e) {
        console.error("Leaderboard fetch error:", e);
      }
    };
    fetchLB();

    const onUpdate = (data) => setRows(data);
    socket.on("leaderboard-update", onUpdate);
    return () => socket.off("leaderboard-update", onUpdate);
  }, []);

  const getRankBadge = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <div className="card-premium" style={{ alignSelf: "stretch", height: "100%", boxSizing: "border-box", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "1.25rem" }}>🏆</span>
        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Scoreboard</h3>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: "8px 0", textAlign: "center", opacity: 0.5, fontSize: "0.9rem" }}>
          Scoreboard will appear during battle.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "8px",
                background: i === 0 ? "rgba(245, 158, 11, 0.08)" : "rgba(255, 255, 255, 0.03)",
                border: i === 0 ? "1px solid rgba(245, 158, 11, 0.2)" : "1px solid transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontWeight: "700", width: 24, fontSize: "0.95rem" }}>
                  {getRankBadge(i)}
                </span>
                <span style={{ fontWeight: "600", fontSize: "0.95rem", color: i === 0 ? "#F59E0B" : "#F3F4F6" }}>
                  {r.name}
                </span>
              </div>
              <div style={{ fontWeight: "800", color: "#6366F1", fontSize: "1rem" }}>
                {r.score} pts
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
