import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const testPath = "/test";
const localUrlPattern = /https?:\/\/localhost:\d+/;
const studioUrlPattern = /https?:\/\/localhost:5555/;
const studioPort = "5555";
let buffer = "";
let printedTestUrl = false;
let studioBuffer = "";
let printedStudioUrl = false;
let childExited = false;
let shuttingDown = false;

function getDatabaseLabel() {
  try {
    const env = readFileSync(".env", "utf8");
    const match = env.match(/^DATABASE_URL\s*=\s*["']?([^"'\n]+)["']?/m);
    if (!match) return "nicht gefunden";

    const url = new URL(match[1]);
    const schema = url.searchParams.get("schema");
    return `${url.protocol}//${url.hostname}:${url.port}${url.pathname}${schema ? `?schema=${schema}` : ""}`;
  } catch {
    return "nicht gefunden";
  }
}

process.stdout.write(`- Datenbank:     ${getDatabaseLabel()}\n`);
process.stdout.write(`- DB-Webansicht: http://localhost:${studioPort}\n`);

const nextDev = spawn("next", ["dev"], {
  detached: process.platform !== "win32",
  stdio: ["inherit", "pipe", "pipe"],
});

const prismaStudio = spawn("prisma", ["studio", "--port", studioPort, "--browser", "none"], {
  detached: process.platform !== "win32",
  env: { ...process.env, BROWSER: "none" },
  stdio: ["ignore", "pipe", "pipe"],
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

function pipeWithStudioUrl(stream, output) {
  stream.on("data", (chunk) => {
    output.write(chunk);

    if (printedStudioUrl) return;

    studioBuffer = `${studioBuffer}${chunk.toString("utf8")}`.slice(-2000);
    const match = studioBuffer.match(studioUrlPattern);

    if (match) {
      printedStudioUrl = true;
      process.stdout.write(`- Prisma Studio: ${match[0]}\n`);
    }
  });
}

pipeWithTestUrl(nextDev.stdout, process.stdout);
pipeWithTestUrl(nextDev.stderr, process.stderr);
pipeWithStudioUrl(prismaStudio.stdout, process.stdout);
pipeWithStudioUrl(prismaStudio.stderr, process.stderr);

prismaStudio.on("error", () => {
  process.stderr.write("- Prisma Studio konnte nicht gestartet werden. Nutze alternativ: npx prisma studio\n");
});

function stopNextDev(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  [nextDev, prismaStudio].forEach((child) => {
    if (!child.pid) return;

    try {
      if (process.platform === "win32") {
        child.kill(signal);
      } else {
        process.kill(-child.pid, signal);
      }
    } catch {
      child.kill(signal);
    }
  });

  setTimeout(() => {
    if (childExited) return;

    [nextDev, prismaStudio].forEach((child) => {
      if (!child.pid) return;

      try {
        if (process.platform === "win32") {
          child.kill("SIGKILL");
        } else {
          process.kill(-child.pid, "SIGKILL");
        }
      } catch {
        // The child process already exited.
      }
    });
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
