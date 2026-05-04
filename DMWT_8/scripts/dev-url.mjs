import { spawn } from "node:child_process";

const testPath = "/test";
const localUrlPattern = /https?:\/\/localhost:\d+/;
let buffer = "";
let printedTestUrl = false;
let childExited = false;
let shuttingDown = false;

const nextDev = spawn("next", ["dev"], {
  detached: process.platform !== "win32",
  stdio: ["inherit", "pipe", "pipe"],
});

function pipeWithTestUrl(stream, output) {
  stream.on("data", (chunk) => {
    output.write(chunk);

    if (printedTestUrl) return;

    buffer = `${buffer}${chunk.toString("utf8")}`.slice(-2000);
    const match = buffer.match(localUrlPattern);

    if (match) {
      printedTestUrl = true;
      process.stdout.write(`- Test:          ${match[0]}${testPath}\n`);
    }
  });
}

pipeWithTestUrl(nextDev.stdout, process.stdout);
pipeWithTestUrl(nextDev.stderr, process.stderr);

function stopNextDev(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  if (nextDev.pid) {
    try {
      if (process.platform === "win32") {
        nextDev.kill(signal);
      } else {
        process.kill(-nextDev.pid, signal);
      }
    } catch {
      nextDev.kill(signal);
    }
  }

  setTimeout(() => {
    if (childExited || !nextDev.pid) return;

    try {
      if (process.platform === "win32") {
        nextDev.kill("SIGKILL");
      } else {
        process.kill(-nextDev.pid, "SIGKILL");
      }
    } catch {
      // The child process already exited.
    }
  }, 1500).unref();
}

process.on("SIGINT", () => stopNextDev("SIGINT"));
process.on("SIGTERM", () => stopNextDev("SIGTERM"));

nextDev.on("exit", (code, signal) => {
  childExited = true;

  if (signal) {
    process.exit(1);
  }

  process.exit(code ?? 0);
});
