const terminalContainer = document.getElementById("terminal");
const focusBtn = document.getElementById("focusBtn");
const resetBtn = document.getElementById("resetBtn");

const term = new Terminal({
  cursorBlink: true,
  fontSize: 16,
  convertEol: true,
  theme: {
    background: "#0d1117",
    foreground: "#c9d1d9",
    cursor: "#39ff14"
  }
});

// Important fix for CDN addon
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);

term.open(terminalContainer);
fitAddon.fit();
term.focus();

// Welcome message
term.writeln("\x1b[1;32m✅ Linxe Terminal - Now Fixed!\x1b[0m");
term.writeln("Click inside the terminal and start typing commands.");
term.writeln("Try: help, ls, pwd, whoami, date, clear, echo hello");
term.writeln("─".repeat(50));

const prompt = "user@linxe:~$ ";
let currentLine = "";

// Show prompt at start
term.write(prompt);

term.onData((data) => {
  switch (data) {
    case "\r": // Enter
      term.writeln("");
      processCommand(currentLine);
      currentLine = "";
      term.write(prompt);
      break;

    case "\u007F": // Backspace
      if (currentLine.length > 0) {
        currentLine = currentLine.slice(0, -1);
        term.write("\b \b");
      }
      break;

    default:
      // Ignore control characters
      if (data >= " ") {
        currentLine += data;
        term.write(data);
      }
      break;
  }
});

function processCommand(input) {
  const trimmed = input.trim();

  if (!trimmed) {
    return;
  }

  const parts = trimmed.split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case "help":
      term.writeln("Available commands:");
      term.writeln("  help");
      term.writeln("  ls");
      term.writeln("  pwd");
      term.writeln("  whoami");
      term.writeln("  date");
      term.writeln("  clear");
      term.writeln("  echo [text]");
      break;

    case "ls":
      term.writeln("Documents  Downloads  hello.txt  secret.txt");
      break;

    case "pwd":
      term.writeln("/home/user");
      break;

    case "whoami":
      term.writeln("linux-newbie");
      break;

    case "date":
      term.writeln(new Date().toString());
      break;

    case "clear":
      term.clear();
      break;

    case "echo":
      term.writeln(args.join(" "));
      break;

    default:
      term.writeln(`Command not found: ${command}. Type 'help'`);
      break;
  }
}

function resetTerminal() {
  const confirmed = confirm("Reset the terminal?");
  if (confirmed) {
    location.reload();
  }
}

focusBtn.addEventListener("click", () => {
  term.focus();
});

resetBtn.addEventListener("click", () => {
  resetTerminal();
});

terminalContainer.addEventListener("click", () => {
  term.focus();
});

// Resize support
window.addEventListener("resize", () => {
  fitAddon.fit();
});

// Small delay helps layout settle before fitting
setTimeout(() => {
  fitAddon.fit();
  term.focus();
}, 300);
