const term = new Terminal({
  cursorBlink: true,
  fontSize: 16,
  theme: {
    background: '#0d1117',
    foreground: '#c9d1d9',
    cursor: '#39ff14'
  }
});

const fitAddon = new FitAddon();
term.loadAddon(fitAddon);

const terminalContainer = document.getElementById('terminal');
term.open(terminalContainer);
fitAddon.fit();

// Welcome message
term.writeln('\x1b[1;32m✅ Linxe Terminal - Now Fixed!\x1b[0m');
term.writeln('Click inside the terminal and start typing commands.');
term.writeln('Try: help, ls, pwd, date, clear, echo hello');
term.writeln('─'.repeat(50));

// Simple command processor
let currentLine = '';

term.onData(data => {
  switch (data) {
    case '\r': // Enter
      term.writeln('');
      if (currentLine.trim()) {
        processCommand(currentLine);
      }
      currentLine = '';
      term.write('\r\nuser@linxe:~$ ');
      break;

    case '\u007F': // Backspace
      if (currentLine.length > 0) {
        currentLine = currentLine.slice(0, -1);
        term.write('\b \b');
      }
      break;

    default:
      currentLine += data;
      term.write(data);
  }
});

function processCommand(cmd) {
  const command = cmd.trim().toLowerCase();

  switch (command) {
    case 'help':
      term.writeln('Available: help, ls, pwd, whoami, date, echo [text], clear');
      break;
    case 'ls':
      term.writeln('Documents  Downloads  hello.txt  secret.txt');
      break;
    case 'pwd':
      term.writeln('/home/user');
      break;
    case 'whoami':
      term.writeln('linux-newbie');
      break;
    case 'date':
      term.writeln(new Date().toString());
      break;
    case 'clear':
      term.clear();
      break;
    case 'echo':
      // For simplicity, just echo the command itself
      term.writeln(cmd.slice(5));
      break;
    default:
      if (command) term.writeln(`Command not found: ${command}. Type 'help'`);
  }
}

function resetTerminal() {
  if (confirm('Reset the terminal?')) {
    location.reload();
  }
}

// Auto focus and resize
setTimeout(() => {
  fitAddon.fit();
  terminalContainer.focus();
}, 300);

window.addEventListener('resize', () => fitAddon.fit());
