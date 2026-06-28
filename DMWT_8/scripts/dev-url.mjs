import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:net";

const testPath = "/";
const localUrlPattern = /https?:\/\/localhost:\d+/;
const studioUrlPattern = /https?:\/\/localhost:5555/;
const studioPort = "5555";
let buffer = "";
let printedTestUrl = false;
let studioBuffer = "";
let printedStudioUrl = false;
let childExited = false;
let shuttingDown = false;
let prismaStudio = null;

function command(name) {
  return process.platform === "win32" ? `${name}.cmd` : name;
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function runSetup(label, cmd, args, options = {}) {
  const { retries = 0, retryDelayMs = 1500, fatal = false, ...spawnOptions } = options;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    process.stdout.write(`- ${label}${attempt > 0 ? ` (Versuch ${attempt + 1}/${retries + 1})` : ""}...\n`);

    const result = spawnSync(cmd, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      ...spawnOptions,
    });

    if (result.status === 0) return true;

    if (attempt < retries) {
      process.stdout.write("- Datenbank ist noch nicht bereit, versuche es gleich erneut.\n");
      sleep(retryDelayMs);
      continue;
    }

    process.stderr.write(`- ${label} fehlgeschlagen.\n`);
    if (fatal) {
      process.exit(result.status ?? 1);
    }

    return false;
  }

  return false;
}

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

function canListenOnPort(port) {
  return new Promise((resolve) => {
    const server = createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port);
  });
}

const databaseStarted = runSetup("Starte Datenbank-Container", "docker", ["compose", "up", "-d"]);

if (databaseStarted) {
  runSetup("Wende Datenbank-Migrationen an", command("npx"), ["prisma", "migrate", "deploy"], {
    retries: 8,
    retryDelayMs: 1500,
  });
} else {
  process.stderr.write("- Datenbank-Container wurde nicht gestartet. Die Webseite startet trotzdem.\n");
  process.stderr.write("- Falls die Umfrage speichern soll: Docker Desktop starten und danach npm run dev erneut ausfuehren.\n");
}

process.stdout.write(`- Datenbank:     ${getDatabaseLabel()}\n`);
process.stdout.write(`- DB-Webansicht: http://localhost:${studioPort}\n`);

const nextDev = spawn(command("next"), ["dev"], {
  detached: process.platform !== "win32",
  stdio: ["inherit", "pipe", "pipe"],
});

if (await canListenOnPort(Number(studioPort))) {
  prismaStudio = spawn(command("prisma"), ["studio", "--port", studioPort, "--browser", "none"], {
    detached: process.platform !== "win32",
    env: { ...process.env, BROWSER: "none" },
    stdio: ["ignore", "pipe", "pipe"],
  });
} else {
  printedStudioUrl = true;
  process.stdout.write(`- Prisma Studio: http://localhost:${studioPort} (laeuft bereits)\n`);
}

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

if (prismaStudio) {
  pipeWithStudioUrl(prismaStudio.stdout, process.stdout);
  pipeWithStudioUrl(prismaStudio.stderr, process.stderr);

  prismaStudio.on("error", () => {
    process.stderr.write("- Prisma Studio konnte nicht gestartet werden. Nutze alternativ: npx prisma studio\n");
  });
}

nextDev.on("error", (error) => {
  process.stderr.write(`- Next.js konnte nicht gestartet werden: ${error.message}\n`);
  stopNextDev("SIGTERM");
  process.exit(1);
});

function stopNextDev(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  [nextDev, prismaStudio].filter(Boolean).forEach((child) => {
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

    [nextDev, prismaStudio].filter(Boolean).forEach((child) => {
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
