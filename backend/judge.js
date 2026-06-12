const { exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

function normalize(s) {
  return (s || "").toString().trim().replace(/\r/g, "");
}

async function runOnce({ code, language, input, timeLimitMs = 5000 }) {
  const jobId = crypto.randomBytes(8).toString("hex");
  const dir = path.join(os.tmpdir(), `judge-${jobId}`);
  await fs.ensureDir(dir);

  let cmd;
  try {
    if (language === "python") {
      const file = path.join(dir, "Solution.py");
      await fs.writeFile(file, code, "utf8");
      cmd = `python3 ${file}`;
    } else if (language === "java") {
      const src = path.join(dir, "Solution.java");
      await fs.writeFile(src, code, "utf8");
      cmd = `cd '${dir}' && javac Solution.java && java -Xmx256m -cp . Solution`;
    } else if (language === "cpp") {
      const src = path.join(dir, "Solution.cpp");
      await fs.writeFile(src, code, "utf8");
      cmd = `cd '${dir}' && g++ -O3 -std=c++17 Solution.cpp -o Solution && ./Solution`;
    } else {
      throw new Error("Unsupported language");
    }

    const out = await new Promise((resolve, reject) => {
      const child = exec(
        cmd,
        { timeout: timeLimitMs, maxBuffer: 1024 * 1024, shell: "/bin/sh" },
        (err, stdout, stderr) => {
          if (err) {
            return reject(new Error(stderr?.trim() || err.message || "Runtime Error"));
          }
          resolve(stdout);
        }
      );
      if (input) {
        child.stdin.write(input);
      }
      child.stdin.end();
    });

    return { ok: true, stdout: normalize(out) };
  } finally {
    try { await fs.remove(dir); } catch {}
  }
}

async function judgeSubmission({ code, language, problem }) {
  for (const tc of problem.test_cases) {
    let res;
    // retry once on failure
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        res = await runOnce({ code, language, input: tc.input + "\n" });
        break;
      } catch (e) {
        if (attempt === 1) {
          return { success: false, message: `Judge Error: ${e.message}` };
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    if (!res.ok) {
      return { success: false, message: `Runtime Error: ${res.error || ""}` };
    }
    if (normalize(res.stdout) !== normalize(tc.output)) {
      return {
        success: false,
        message: `Wrong Answer on input:\n${tc.input}\nExpected: ${tc.output}\nGot: ${res.stdout}`
      };
    }
  }
  return { success: true, message: "All test cases passed." };
}

module.exports = { judgeSubmission };