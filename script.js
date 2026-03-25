const terminalContainer = document.getElementById("terminal");
const focusBtn = document.getElementById("focusBtn");
const resetLabBtn = document.getElementById("resetLabBtn");
const nextMissionBtn = document.getElementById("nextMissionBtn");
const hintBtn = document.getElementById("hintBtn");
const resetProgressBtn = document.getElementById("resetProgressBtn");

const missionTitleEl = document.getElementById("missionTitle");
const missionDescriptionEl = document.getElementById("missionDescription");
const missionHintEl = document.getElementById("missionHint");
const missionStatusEl = document.getElementById("missionStatus");

const xpValueEl = document.getElementById("xpValue");
const levelValueEl = document.getElementById("levelValue");
const missionCountEl = document.getElementById("missionCount");

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

const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(terminalContainer);
fitAddon.fit();

const STORAGE_KEY = "linxe_v2_progress";
const promptUser = "student";
let currentLine = "";
let currentPath = "/home/student";

let userProgress = {
  xp: 0,
  level: 1,
  missionIndex: 0,
  completed: []
};

const missions = [
  {
    title: "Mission 1: Check your location",
    description: "Type the command that shows your current directory.",
    hint: "Use: pwd",
    validate: (raw, result) => raw.trim() === "pwd",
    reward: 20
  },
  {
    title: "Mission 2: List files",
    description: "Show what files and folders exist in your current directory.",
    hint: "Use: ls",
    validate: (raw, result) => raw.trim() === "ls",
    reward: 20
  },
  {
    title: "Mission 3: Enter Documents",
    description: "Move into the Documents folder.",
    hint: "Use: cd Documents",
    validate: (raw, result) =>
      raw.trim() === "cd Documents" && currentPath === "/home/student/Documents",
    reward: 25
  },
  {
    title: "Mission 4: Create a folder",
    description: "Inside Documents, create a folder named projects.",
    hint: "Use: mkdir projects",
    validate: (raw, result) =>
      raw.trim() === "mkdir projects" &&
      existsInCurrentDir("projects", "dir"),
    reward: 25
  },
  {
    title: "Mission 5: Create a file",
    description: "Inside Documents, create a file named notes.txt.",
    hint: "Use: touch notes.txt",
    validate: (raw, result) =>
      raw.trim() === "touch notes.txt" &&
      existsInCurrentDir("notes.txt", "file"),
    reward: 30
  }
];

function createInitialFileSystem() {
  return {
    type: "dir",
    children: {
      home: {
        type: "dir",
        children: {
          student: {
            type: "dir",
            children: {
              Documents: {
                type: "dir",
                children: {
                  "welcome.txt": {
                    type: "file",
                    content: "Welcome to Linxe. Practice Linux here."
                  }
                }
              },
              Downloads: {
                type: "dir",
                children: {}
              },
              "hello.txt": {
                type: "file",
                content: "Hello from Linxe terminal."
              }
            }
          }
        }
      }
    }
  };
}

let fileSystem = createInitialFileSystem();

function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      userProgress = {
        xp: parsed.xp || 0,
        level: parsed.level || 1,
        missionIndex: parsed.missionIndex || 0,
        completed: Array.isArray(parsed.completed) ? parsed.completed : []
      };
    } catch (error) {
      console.error("Failed to load progress", error);
    }
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
}

function calculateLevel(xp) {
  return Math.floor(xp / 50) + 1;
}

function updateProgressUI() {
  userProgress.level = calculateLevel(userProgress.xp);
  xpValueEl.textContent = userProgress.xp;
  levelValueEl.textContent = userProgress.level;
  missionCountEl.textContent = `${userProgress.completed.length} / ${missions.length}`;
  saveProgress();
}

function getCurrentMission() {
  if (userProgress.missionIndex >= missions.length) {
    return null;
  }
  return missions[userProgress.missionIndex];
}

function updateMissionUI() {
  const mission = getCurrentMission();

  if (!mission) {
    missionTitleEl.textContent = "All missions completed";
    missionDescriptionEl.textContent = "Amazing work. You finished the beginner path.";
    missionHintEl.textContent = "Try commands freely or reset progress to start over.";
    missionStatusEl.textContent = "All missions complete ✅";
    return;
  }

  missionTitleEl.textContent = mission.title;
  missionDescriptionEl.textContent = mission.description;
  missionHintEl.textContent = "Click the hint button when needed.";
  missionStatusEl.textContent = "Mission not completed yet.";
}

function showHint() {
  const mission = getCurrentMission();
  if (!mission) return;
  missionHintEl.textContent = mission.hint;
}

function normalizePath(path) {
  const parts = path.split("/").filter(Boolean);
  const stack = [];

  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") {
      stack.pop();
    } else {
      stack.push(part);
    }
  }

  return "/" + stack.join("/");
}

function resolvePath(inputPath) {
  if (!inputPath || inputPath === "~") return "/home/student";

  if (inputPath.startsWith("/")) {
    return normalizePath(inputPath);
  }

  if (inputPath === "..") {
    return normalizePath(currentPath + "/..");
  }

  if (inputPath === ".") {
    return currentPath;
  }

  return normalizePath(currentPath + "/" + inputPath);
}

function getNodeByPath(path) {
  const normalized = normalizePath(path);
  if (normalized === "/") return fileSystem;

  const parts = normalized.split("/").filter(Boolean);
  let node = fileSystem;

  for (const part of parts) {
    if (!node.children || !node.children[part]) {
      return null;
    }
    node = node.children[part];
  }

  return node;
}

function getCurrentDirectoryNode() {
  return getNodeByPath(currentPath);
}

function existsInCurrentDir(name, type) {
  const dir = getCurrentDirectoryNode();
  if (!dir || dir.type !== "dir") return false;
  const target = dir.children[name];
  if (!target) return false;
  return target.type === type;
}

function getPrompt() {
  return `${promptUser}@linxe:${currentPath.replace("/home/student", "~")}$ `;
}

function writePrompt() {
  term.write(getPrompt());
}

function printWelcome() {
  term.writeln("\x1b[1;32m✅ Welcome to Linxe V2\x1b[0m");
  term.writeln("Learn Linux by completing missions.");
  term.writeln("Try: help");
  term.writeln("--------------------------------------------------");
  writePrompt();
}

function processCommand(input) {
  const raw = input;
  const trimmed = input.trim();

  if (!trimmed) {
    return { success: true };
  }

  const parts = trimmed.split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case "help":
      term.writeln("Available commands:");
      term.writeln("  help               Show command list");
      term.writeln("  ls                 List files and folders");
      term.writeln("  pwd                Print current directory");
      term.writeln("  cd <folder>        Change directory");
      term.writeln("  mkdir <name>       Create a folder");
      term.writeln("  touch <name>       Create a file");
      term.writeln("  cat <file>         Show file content");
      term.writeln("  echo <text>        Print text");
      term.writeln("  clear              Clear terminal");
      break;

    case "ls": {
      const dir = getCurrentDirectoryNode();
      if (!dir || dir.type !== "dir") {
        term.writeln("Error: current directory not found.");
        break;
      }

      const names = Object.keys(dir.children);
      if (names.length === 0) {
        term.writeln("(empty)");
      } else {
        term.writeln(names.join("  "));
      }
      break;
    }

    case "pwd":
      term.writeln(currentPath);
      break;

    case "cd": {
      const target = args.join(" ").trim();
      const resolved = resolvePath(target || "~");
      const node = getNodeByPath(resolved);

      if (!node) {
        term.writeln(`cd: no such file or directory: ${target}`);
      } else if (node.type !== "dir") {
        term.writeln(`cd: not a directory: ${target}`);
      } else {
        currentPath = resolved;
      }
      break;
    }

    case "mkdir": {
      const name = args.join(" ").trim();
      if (!name) {
        term.writeln("mkdir: missing folder name");
        break;
      }

      const dir = getCurrentDirectoryNode();
      if (dir.children[name]) {
        term.writeln(`mkdir: cannot create directory '${name}': File exists`);
      } else {
        dir.children[name] = {
          type: "dir",
          children: {}
        };
      }
      break;
    }

    case "touch": {
      const name = args.join(" ").trim();
      if (!name) {
        term.writeln("touch: missing file name");
        break;
      }

      const dir = getCurrentDirectoryNode();
      if (!dir.children[name]) {
        dir.children[name] = {
          type: "file",
          content: ""
        };
      }
      break;
    }

    case "cat": {
      const name = args.join(" ").trim();
      if (!name) {
        term.writeln("cat: missing file name");
        break;
      }

      const dir = getCurrentDirectoryNode();
      const node = dir.children[name];

      if (!node) {
        term.writeln(`cat: ${name}: No such file`);
      } else if (node.type !== "file") {
        term.writeln(`cat: ${name}: Is a directory`);
      } else {
        term.writeln(node.content || "(empty file)");
      }
      break;
    }

    case "echo":
      term.writeln(args.join(" "));
      break;

    case "clear":
      term.clear();
      break;

    default:
      term.writeln(`Command not found: ${command}. Type 'help'`);
      break;
  }

  checkMissionCompletion(raw);
  return { success: true };
}

function checkMissionCompletion(rawCommand) {
  const mission = getCurrentMission();
  if (!mission) return;

  const completed = mission.validate(rawCommand, null);

  if (completed) {
    if (!userProgress.completed.includes(userProgress.missionIndex)) {
      userProgress.completed.push(userProgress.missionIndex);
      userProgress.xp += mission.reward;
      userProgress.missionIndex += 1;
      updateProgressUI();

      missionStatusEl.textContent = `Completed! +${mission.reward} XP ✅`;

      term.writeln("");
      term.writeln(`\x1b[1;32mMission complete! +${mission.reward} XP\x1b[0m`);

      const next = getCurrentMission();
      if (next) {
        term.writeln(`Next: ${next.title}`);
      } else {
        term.writeln("\x1b[1;32mYou completed all beginner missions!\x1b[0m");
      }

      updateMissionUI();
    }
  }
}

function resetLab() {
  fileSystem = createInitialFileSystem();
  currentPath = "/home/student";
  term.clear();
  printWelcome();
  missionStatusEl.textContent = "Lab reset. Mission progress kept.";
}

function resetAllProgress() {
  const confirmed = confirm("Reset all progress and missions?");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  userProgress = {
    xp: 0,
    level: 1,
    missionIndex: 0,
    completed: []
  };
  fileSystem = createInitialFileSystem();
  currentPath = "/home/student";
  updateProgressUI();
  updateMissionUI();
  term.clear();
  printWelcome();
}

function goNextMission() {
  if (userProgress.missionIndex < missions.length - 1) {
    userProgress.missionIndex += 1;
    updateProgressUI();
    updateMissionUI();
    missionStatusEl.textContent = "Skipped to next mission.";
  } else if (userProgress.missionIndex < missions.length) {
    userProgress.missionIndex += 1;
    updateProgressUI();
    updateMissionUI();
  }
}

term.onData((data) => {
  switch (data) {
    case "\r":
      term.writeln("");
      processCommand(currentLine);
      currentLine = "";
      writePrompt();
      break;

    case "\u007F":
      if (currentLine.length > 0) {
        currentLine = currentLine.slice(0, -1);
        term.write("\b \b");
      }
      break;

    default:
      if (data >= " ") {
        currentLine += data;
        term.write(data);
      }
      break;
  }
});

focusBtn.addEventListener("click", () => {
  term.focus();
});

resetLabBtn.addEventListener("click", resetLab);
nextMissionBtn.addEventListener("click", goNextMission);
hintBtn.addEventListener("click", showHint);
resetProgressBtn.addEventListener("click", resetAllProgress);

window.addEventListener("resize", () => {
  fitAddon.fit();
});

terminalContainer.addEventListener("click", () => {
  term.focus();
});

loadProgress();
updateProgressUI();
updateMissionUI();
printWelcome();

setTimeout(() => {
  fitAddon.fit();
  term.focus();
}, 300);
