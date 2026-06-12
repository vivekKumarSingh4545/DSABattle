import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";

export default function Chat({ playerName, problem, opponent }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Clear chat logs when a new problem / rematch occurs
  useEffect(() => {
    setMessages([]);
  }, [problem?.id]);

  useEffect(() => {
    const onMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive-message", onMessage);
    return () => {
      socket.off("receive-message", onMessage);
    };
  }, []);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !problem) return;
    socket.emit("send-message", input.trim());
    setInput("");
  };

  return (
    <div className="card-premium" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: 10 }}>
        <span style={{ fontSize: "1.2rem" }}>💬</span>
        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Match Chat</h3>
      </div>

      {!problem ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5, fontSize: "0.9rem", textAlign: "center", padding: "0 20px", lineHeight: 1.5 }}>
          Join a match to start chatting with your opponent in real time.
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Messages Feed */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 4, marginBottom: 12 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", opacity: 0.4, fontSize: "0.8rem", marginTop: 20 }}>
                No messages yet. Send a friendly bantering message!
              </div>
            )}
            {messages.map((m, i) => {
              const isMe = m.sender === playerName;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMe ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    alignSelf: isMe ? "flex-end" : "flex-start"
                  }}
                >
                  <div style={{ fontSize: "0.75rem", opacity: 0.5, marginBottom: 2, paddingLeft: 4, paddingRight: 4 }}>
                    {isMe ? "You" : m.sender} • {m.timestamp}
                  </div>
                  <div
                    style={{
                      background: isMe ? "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)" : "#1F2937",
                      color: "#FFF",
                      borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                      padding: "8px 12px",
                      fontSize: "0.9rem",
                      lineHeight: 1.4,
                      wordBreak: "break-word",
                      boxShadow: isMe ? "0 2px 8px rgba(99, 102, 241, 0.2)" : "none",
                      border: isMe ? "none" : "1px solid rgba(255, 255, 255, 0.05)"
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: "8px 12px", fontSize: "0.85rem" }}
            />
            <button type="submit" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
