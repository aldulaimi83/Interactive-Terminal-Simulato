// Fake file system
const fakeFS = {
  '~': ['Documents', 'Downloads', 'hello.txt', 'secret.txt'],
  'Documents': ['report.txt', 'notes.md'],
  'Downloads': ['linux-cheatsheet.pdf']
};

let currentPath = '~';
let commandHistory = [];
let historyIndex = -1;

const term = new Terminal({
  cursorBlink: true,
  theme: {
    background: '#0d1117',
    foreground: '#c9d1d9',
    cursor: '#39ff14',
    black: '#000000',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#bd93f9',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#bfbfbf'
  },
  fontSize: 15,
  fontFamily: 'Courier New, monospace',
  convertEol: true
});

const fitAddon = new FitAddon();
term.loadAddon(fitAddon);

const terminalDiv = document.getElementById('terminal');
term.open(terminalDiv);
fitAddon.fit();

// Welcome message
term.writeln('\x1b[32mWelcome to Linxe — Realistic Linux Terminal\x1b[0m');
term.writeln('Type \x1b[33mhelp\x1b[0m for available commands.');
term.writeln('────────────────────────────────────────────────────');
term.write('\r\nuser@linxe:~$ ');

// Current prompt
let currentLine = '';

term.onKey(e => {
  const ev = e.domEvent;
  const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

  if (ev.key === 'Enter') {
    if (currentLine.trim()) {
      commandHistory.unshift(currentLine);
      historyIndex = -1;
      processCommand(currentLine);
    }
    currentLine = '';
    term.write('\r\nuser@linxe:' + currentPath + '$ ');
  } 
  else if (ev.key === 'Backspace') {
    if (currentLine.length > 0) {
      currentLine = currentLine.slice(0, -1);
      term.write('\b \b');
    }
  } 
  else if (ev.key === 'ArrowUp') {
    if (commandHistory.length > 0) {
      historyIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
      replaceCurrentLine(commandHistory[historyIndex]);
    }
  } 
  else if (ev.key === 'ArrowDown') {
    if (historyIndex > 0) {
      historyIndex--;
      replaceCurrentLine(commandHistory[historyIndex]);
    } else if (historyIndex === 0) {
      historyIndex = -1;
      replaceCurrentLine('');
    }
  } 
  else if (printable) {
    currentLine += e.key;
    term.write(e.key);
  }
});

function replaceCurrentLine(newLine) {
  // Clear current line
  for (let i = 0; i < currentLine.length; i++) {
    term.write('\b \b');
  }
  currentLine = newLine;
  term.write(currentLine);
}

function processCommand(cmd) {
  const parts = cmd.trim().split(' ');
  const command = parts[0].toLowerCase();

  term.writeln(''); // new line after command

  switch (command) {
    case 'help':
      term.writeln('Available commands:');
      term.writeln('  help, ls, pwd, whoami, date, clear, echo [text], cd [dir]');
      break;

    case 'ls':
      const files = fakeFS[currentPath] || [];
      term.writeln(files.join('   '));
      break;

    case 'pwd':
      term.writeln('/home/user' + (currentPath === '~' ? '' : '/' + currentPath));
      break;

    case 'whoami':
      term.writeln('linux-newbie');
      break;

    case 'date':
      term.writeln(new Date().toString());
      break;

    case 'clear':
      term.clear();
      term.writeln('\x1b[32mTerminal cleared\x1b[0m');
      break;

    case 'echo':
      term.writeln(parts.slice(1).join(' '));
      break;

    case 'cd':
      const target = parts[1];
      if (!target || target === '~' || target === '..') {
        currentPath = '~';
      } else if (fakeFS[target]) {
        currentPath = target;
      } else {
        term.writeln(`cd: no such directory: ${target}`);
      }
      break;

    default:
      if (cmd.trim()) {
        term.writeln(`bash: ${command}: command not found`);
        term.writeln('Type "help" to see available commands.');
      }
  }
}

// Auto-resize when window changes
window.addEventListener('resize', () => fitAddon.fit());
