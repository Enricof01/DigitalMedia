import { spawn } from "node:child_process";

const testPath = "/test";
const localUrlPattern = /https?:\/\/localhost:\d+/;
let buffer = "";
let printedTestUrl = false;

const nextDev = spawn("next", ["dev"], {
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

process.on("SIGINT", () => nextDev.kill("SIGINT"));
process.on("SIGTERM", () => nextDev.kill("SIGTERM"));

nextDev.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1);
  }

  process.exit(code ?? 0);
});
