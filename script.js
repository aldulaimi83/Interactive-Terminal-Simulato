// Enhanced fake filesystem (persists in memory during session)
let fs = {
  '~': {
    type: 'dir',
    children: {
      'Documents': { type: 'dir', children: { 'notes.txt': { type: 'file', content: 'Learn Linux every day!\n' } } },
      'Downloads': { type: 'dir', children: {} },
      'hello.txt': { type: 'file', content: 'Hello from Linxe! Welcome to your first Linux adventure.\n' },
      'secret.txt': { type: 'file', content: 'Congratulations! You found the secret file.\nFlag: linxe{you_are_getting_good}\n' }
    }
  }
};

let currentDir = '~';
let commandHistory = [];
let historyIndex = -1;

const term = new Terminal({
  cursorBlink: true,
  fontSize: 16,
  fontFamily: 'Courier New, monospace',
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
    white: '#f8f8f2'
  }
});

const fitAddon = new FitAddon.FitAddon();
const webglAddon = new WebglAddon.WebglAddon();
const searchAddon = new SearchAddon.SearchAddon();

term.loadAddon(fitAddon);
term.loadAddon(webglAddon);
term.loadAddon(searchAddon);

const terminalDiv = document.getElementById('terminal');
term.open(terminalDiv);
fitAddon.fit();

// Welcome
term.writeln('\x1b[1;32mWelcome to Linxe Terminal Simulator\x1b[0m');
term.writeln('A realistic Linux learning environment in your browser');
term.writeln('Type \x1b[33mhelp\x1b[0m for commands. Files you create will persist during this session.');
term.writeln('─'.repeat(60));
prompt();

function prompt() {
  term.write(`\r\n\x1b[32muser@linxe\x1b[0m:\x1b[34m${currentDir}\x1b[0m$ `);
}

let currentLine = '';

term.onKey(({ key, domEvent }) => {
  const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

  if (domEvent.key === 'Enter') {
    if (currentLine.trim()) {
      commandHistory.unshift(currentLine);
      historyIndex = -1;
      term.writeln(''); 
      processCommand(currentLine);
    } else {
      term.writeln('');
    }
    currentLine = '';
    prompt();
  } 
  else if (domEvent.key === 'Backspace') {
    if (currentLine.length > 0) {
      currentLine = currentLine.slice(0, -1);
      term.write('\b \b');
    }
  } 
  else if (domEvent.key === 'ArrowUp') {
    if (commandHistory.length > 0) {
      historyIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
      replaceLine(commandHistory[historyIndex]);
    }
  } 
  else if (domEvent.key === 'ArrowDown') {
    if (historyIndex > 0) {
      historyIndex--;
      replaceLine(commandHistory[historyIndex]);
    } else {
      historyIndex = -1;
      replaceLine('');
    }
  } 
  else if (domEvent.key === 'Tab') {
    term.write('  '); // simple hint
    term.writeln('\x1b[90m(Tab auto-complete coming soon...)\x1b[0m');
  } 
  else if (printable) {
    currentLine += key;
    term.write(key);
  }
});

function replaceLine(newLine) {
  while (currentLine.length > 0) {
    term.write('\b \b');
    currentLine = currentLine.slice(0, -1);
  }
  currentLine = newLine;
  term.write(currentLine);
}

function getDirObject(path) {
  return fs[path] || null;
}

function processCommand(cmd) {
  const parts = cmd.trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case 'help':
      term.writeln('Available commands: help, ls, pwd, cd, touch, mkdir, rm, cat, tree, clear, echo, whoami, date');
      break;

    case 'ls':
      const dir = getDirObject(currentDir);
      if (dir && dir.type === 'dir') {
        Object.keys(dir.children).forEach(item => {
          const isDir = dir.children[item].type === 'dir';
          term.write(isDir ? `\x1b[34m${item}\x1b[0m  ` : `${item}  `);
        });
        term.writeln('');
      }
      break;

    case 'pwd':
      term.writeln(`/home/user${currentDir === '~' ? '' : '/' + currentDir}`);
      break;

    case 'cd':
      if (!args[0] || args[0] === '~' || args[0] === '..') {
        currentDir = '~';
      } else if (getDirObject(args[0])) {
        currentDir = args[0];
      } else {
        term.writeln(`cd: no such directory: ${args[0]}`);
      }
      break;

    case 'touch':
      if (args[0]) {
        const dir = getDirObject(currentDir);
        if (dir) dir.children[args[0]] = { type: 'file', content: '' };
        term.writeln(`Created empty file: ${args[0]}`);
      }
      break;

    case 'mkdir':
      if (args[0]) {
        const dir = getDirObject(currentDir);
        if (dir) dir.children[args[0]] = { type: 'dir', children: {} };
        term.writeln(`Directory created: ${args[0]}`);
      }
      break;

    case 'cat':
      if (args[0]) {
        const dir = getDirObject(currentDir);
        if (dir && dir.children[args[0]] && dir.children[args[0]].type === 'file') {
          term.writeln(dir.children[args[0]].content);
        } else {
          term.writeln(`cat: ${args[0]}: No such file`);
        }
      }
      break;

    case 'rm':
      if (args[0]) {
        const dir = getDirObject(currentDir);
        if (dir && dir.children[args[0]]) {
          delete dir.children[args[0]];
          term.writeln(`Removed: ${args[0]}`);
        }
      }
      break;

    case 'tree':
      term.writeln('.\n├── Documents\n│   └── notes.txt\n├── Downloads\n├── hello.txt\n└── secret.txt');
      break;

    case 'clear':
      term.clear();
      break;

    case 'echo':
      term.writeln(args.join(' '));
      break;

    case 'whoami':
      term.writeln('linux-newbie');
      break;

    case 'date':
      term.writeln(new Date().toString());
      break;

    default:
      if (cmd.trim()) term.writeln(`bash: ${command}: command not found... type 'help'`);
  }
}

// Lesson auto-type function
window.runLesson = function(cmd) {
  term.writeln(`\r\n\x1b[33mRunning lesson command:\x1b[0m ${cmd}`);
  currentLine = cmd;
  processCommand(cmd);
  currentLine = '';
  prompt();
};

// Resize handler
window.addEventListener('resize', () => fitAddon.fit());

// Initial fit
setTimeout(() => fitAddon.fit(), 100);
