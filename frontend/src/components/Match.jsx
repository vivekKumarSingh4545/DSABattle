import { useEffect, useState } from "react";
import { socket } from "../socket";
import Editor from "@monaco-editor/react";

const STARTER_TEMPLATES = {
  python: `# Write your solution here\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().splitlines()\n    if not lines:\n        return\n    # your code here\n\nif __name__ == '__main__':\n    solve()`,
  java: `// Write your solution here\nimport java.util.*;\nimport java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // your code here\n    }\n}`,
  cpp: `// Write your solution here\n#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}`
};

export default function Match({ me, opponent, problem, onQuit, onFindAnother }) {
  const [lang, setLang] = useState("cpp"); // "python" | "java" | "cpp"
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editor resizing states
  const [editorHeight, setEditorHeight] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizerHovered, setIsResizerHovered] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(400);
  const [hideControls, setHideControls] = useState(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.clientY);
    setStartHeight(editorHeight);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const deltaY = e.clientY - startY;
      const newHeight = startHeight + deltaY;
      // Limit height between 150px and 900px
      if (newHeight >= 150 && newHeight <= 900) {
        setEditorHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, startY, startHeight]);

  // Rematch / navigation coordination states
  const [hasVotedNext, setHasVotedNext] = useState(false);
  const [opponentVotedNext, setOpponentVotedNext] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);

  // Set default code template when language or problem changes
  useEffect(() => {
    setCode(STARTER_TEMPLATES[lang]);
  }, [lang, problem.id]);

  // Reset voting states when new match / problem begins
  useEffect(() => {
    setHasVotedNext(false);
    setOpponentVotedNext(false);
    setOpponentLeft(false);
    setResult("");
    setFeedback("");
    setIsSubmitting(false);
  }, [problem.id]);

  useEffect(() => {
    const onResult = ({ winner, message }) => {
      setIsSubmitting(false);
      setResult(winner === me ? "🎉 You win!" : `💀 ${opponent} won`);
      setFeedback(message);
      setHideControls(false);
    };
    const onFeedback = (msg) => {
      setIsSubmitting(false);
      setFeedback(msg);
      setHideControls(false);
    };

    const onOpponentVotedNext = () => {
      setOpponentVotedNext(true);
    };

    const onOpponentLeft = () => {
      setOpponentLeft(true);
    };

    socket.on("match-result", onResult);
    socket.on("submission-feedback", onFeedback);
    socket.on("opponent-voted-next", onOpponentVotedNext);
    socket.on("opponent-left", onOpponentLeft);

    return () => {
      socket.off("match-result", onResult);
      socket.off("submission-feedback", onFeedback);
      socket.off("opponent-voted-next", onOpponentVotedNext);
      socket.off("opponent-left", onOpponentLeft);
    };
  }, [me, opponent]);

  const submit = () => {
    setFeedback("");
    setIsSubmitting(true);
    setHideControls(false);
    socket.emit("submit", { code, language: lang });
  };

  const handleNextQuestion = () => {
    setHasVotedNext(true);
    socket.emit("vote-next-question");
  };

  const handleFindAnother = () => {
    socket.emit("leave-match");
    onFindAnother();
  };

  const handleQuit = () => {
    socket.emit("leave-match");
    onQuit();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.7fr", gap: 24, alignItems: "stretch", height: "calc(100vh - 160px)", position: "relative" }}>
      {isDragging && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          cursor: "ns-resize",
          background: "transparent",
        }} />
      )}
      {/* Problem Specification Card */}
      <div className="card-premium" style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", overflowY: "auto" }}>
        <div>
          <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#818CF8", fontWeight: 700 }}>
            DSA Battle Arena
          </span>
          <h2 style={{ fontSize: "2rem", marginTop: 4, marginBottom: 8 }}>{problem.title}</h2>
        </div>

        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: 16 }}>
          <h4 style={{ color: "#E2E8F0", marginBottom: 12 }}>Problem Description</h4>
          <div 
            className="problem-statement-container"
            style={{ 
              opacity: 0.95, 
              lineHeight: 1.6, 
              fontSize: "0.95rem"
            }}
            dangerouslySetInnerHTML={{ __html: problem.statement }}
          />
        </div>

        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: 16, border: "1px solid rgba(255,255,255,0.04)" }}>
          <h4 style={{ color: "#818CF8", marginBottom: 6, fontSize: "0.9rem" }}>Input/Output Note</h4>
          <p style={{ opacity: 0.8, fontSize: "0.85rem", margin: 0, fontFamily: "Fira Code, monospace", whiteSpace: "pre-wrap" }}>
            {problem.note}
          </p>
        </div>

        {/* Testcases Overview */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", marginTop: 16 }}>
          <h4 style={{ marginBottom: 10, fontSize: "0.95rem" }}>Sample Case</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "#111827", padding: 10, borderRadius: 6, fontSize: "0.8rem" }}>
              <div style={{ opacity: 0.5, marginBottom: 4, fontWeight: "bold" }}>Sample Input</div>
              <pre style={{ margin: 0, fontFamily: "Fira Code, monospace" }}>
                {problem.test_cases?.[0]?.input || "N/A"}
              </pre>
            </div>
            <div style={{ background: "#111827", padding: 10, borderRadius: 6, fontSize: "0.8rem" }}>
              <div style={{ opacity: 0.5, marginBottom: 4, fontWeight: "bold" }}>Expected Output</div>
              <pre style={{ margin: 0, fontFamily: "Fira Code, monospace", color: "#10B981" }}>
                {problem.test_cases?.[0]?.output || "N/A"}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Editor & Actions */}
      <div className="card-premium" style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: 12 }}>
          <div>
            <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>Dueling against:</span>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#F43F5E" }}>🔥 {opponent}</div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={() => setHideControls(!hideControls)}
              style={{
                padding: "6px 12px",
                fontSize: "0.85rem",
                background: hideControls ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.05)",
                border: hideControls ? "1px solid #6366F1" : "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "6px",
                color: hideControls ? "#818CF8" : "#E2E8F0",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              {hideControls ? "Show Options" : "Hide Options"}
            </button>
            <select value={lang} onChange={e => setLang(e.target.value)} style={{ padding: "6px 12px", fontSize: "0.9rem" }}>
              <option value="python">Python 3</option>
              <option value="cpp">C++ (g++)</option>
              <option value="java">Java (JDK)</option>
            </select>
          </div>
        </div>

        {/* Monaco Editor Container */}
        <div id="resizable-editor-container" style={{ height: hideControls ? "100%" : `${editorHeight}px`, flex: hideControls ? 1 : "none", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 8, overflow: "hidden", background: "#1e1e1e", minHeight: "150px", position: "relative" }}>
          <Editor
            height="100%"
            language={lang}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              fontSize: 14,
              fontFamily: "Fira Code, monospace",
              minimap: { enabled: false },
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
            }}
          />
        </div>

        {/* Draggable Divider */}
        {!hideControls && (
          <div
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsResizerHovered(true)}
            onMouseLeave={() => setIsResizerHovered(false)}
            style={{
              height: "12px",
              margin: "-8px 0",
              cursor: "ns-resize",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              userSelect: "none"
            }}
          >
            <div style={{
              width: "60px",
              height: "4px",
              borderRadius: "2px",
              background: isDragging || isResizerHovered ? "#818CF8" : "rgba(255, 255, 255, 0.15)",
              boxShadow: isDragging || isResizerHovered ? "0 0 8px #818CF8" : "none",
              transition: "all 0.2s"
            }} />
          </div>
        )}

        {/* Submission / Results Panel */}
        {!hideControls && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={submit} disabled={isSubmitting || !!result} style={{ width: "100%", padding: "12px" }}>
                {isSubmitting ? "Judging..." : "Submit Solution"}
              </button>
            </div>

            {feedback && (
              <div style={{
                background: feedback.includes("Passed") || feedback.includes("passed") ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)",
                border: feedback.includes("Passed") || feedback.includes("passed") ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(244, 63, 94, 0.2)",
                borderRadius: 8,
                padding: 12,
                fontSize: "0.9rem"
              }}>
                <strong style={{ color: feedback.includes("Passed") || feedback.includes("passed") ? "#10B981" : "#F43F5E" }}>
                  {feedback.includes("Passed") || feedback.includes("passed") ? "Success" : "Feedback"}
                </strong>
                <pre style={{ margin: "6px 0 0 0", fontFamily: "Fira Code, monospace", fontSize: "0.8rem", whiteSpace: "pre-wrap", opacity: 0.9 }}>
                  {feedback}
                </pre>
              </div>
            )}

            {result && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
                <div style={{
                  textAlign: "center",
                  padding: "16px",
                  borderRadius: 8,
                  background: result.includes("win") ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
                  border: result.includes("win") ? "2px solid #10B981" : "2px solid #F43F5E",
                }}>
                  <h2 style={{ margin: 0, color: result.includes("win") ? "#10B981" : "#F43F5E" }}>{result}</h2>
                </div>

                {/* Rematch status notifications */}
                {opponentLeft && (
                  <div style={{ color: "#F43F5E", fontSize: "0.9rem", textAlign: "center", fontWeight: "bold" }}>
                    ⚠️ {opponent} has left the match lobby.
                  </div>
                )}
                {opponentVotedNext && !hasVotedNext && (
                  <div style={{ color: "#10B981", fontSize: "0.9rem", textAlign: "center", fontWeight: "bold" }}>
                    💡 {opponent} wants a rematch! Click "Next Question" to play.
                  </div>
                )}

                {/* Options Row */}
                <div style={{ display: "flex", gap: 12, width: "100%" }}>
                  <button 
                    onClick={handleNextQuestion} 
                    disabled={hasVotedNext || opponentLeft} 
                    style={{ 
                      flex: 1.2, 
                      background: hasVotedNext ? "#374151" : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      boxShadow: hasVotedNext ? "none" : "0 4px 12px rgba(16, 185, 129, 0.3)",
                      color: hasVotedNext ? "#9CA3AF" : "#FFF"
                    }}
                  >
                    {hasVotedNext ? "Waiting for Opponent..." : "Next Question"}
                  </button>
                  <button 
                    onClick={handleFindAnother} 
                    style={{ 
                      flex: 1.2, 
                      background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)" 
                    }}
                  >
                    Find Another
                  </button>
                  <button 
                    onClick={handleQuit} 
                    style={{ 
                      flex: 0.8, 
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.15)"
                    }}
                  >
                    Quit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
