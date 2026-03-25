const STORAGE_KEY = "linxe_v4_progress";
const HOME_PATH = "/home/student";

const terminalOutput = document.getElementById("terminalOutput");
const terminalInput = document.getElementById("terminalInput");
const terminalPrompt = document.getElementById("terminalPrompt");

const openLabTopBtn = document.getElementById("openLabTopBtn");
const startHeroBtn = document.getElementById("startHeroBtn");
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

let currentPath = HOME_PATH;

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
    reward: 20,
    validate: (raw) => raw.trim() === "pwd"
  },
  {
    title: "Mission 2: List files",
    description: "Show the files and folders in your current directory.",
    hint: "Use: ls",
    reward: 20,
    validate: (raw) => raw.trim() === "ls"
  },
  {
    title: "Mission 3: Open Documents",
    description: "Move into the Documents folder.",
    hint: "Use: cd Documents",
    reward: 25,
    validate: (raw) =>
      raw.trim() === "cd Documents" && currentPath === `${HOME_PATH}/Documents`
  },
  {
    title: "Mission 4: Create a folder",
    description: "Inside Documents, create a folder named projects.",
    hint: "Use: mkdir projects",
    reward: 25,
    validate: (raw) =>
      raw.trim() === "mkdir projects" && existsInCurrentDir("projects", "dir")
  },
  {
    title: "Mission 5: Create a file",
    description: "Inside Documents, create a file named notes.txt.",
    hint: "Use: touch notes.txt",
    reward: 30,
    validate: (raw) =>
      raw.trim() === "touch notes.txt" && existsInCurrentDir("notes.txt", "file")
  },
  {
    title: "Mission 6: Read a file",
    description: "Read the contents of welcome.txt.",
    hint: "Use: cat welcome.txt",
    reward: 35,
    validate: (raw) => raw.trim() === "cat welcome.txt"
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
                    content: "Welcome to Linxe. This is your first Linux practice file."
                  }
                }
              },
              Downloads: {
                type: "dir",
                children: {}
              },
              "hello.txt": {
                type: "file",
                content: "Hello from Linxe."
              }
            }
          }
        }
      }
    }
  };
}

let fileSystem = createInitialFileSystem();

function printLine(text = "") {
  const line = document.createElement("div");
  line.className = "terminal-line";
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function printPromptLine(command) {
  printLine(`${getPrompt()} ${command}`);
}

function getPrompt() {
  return `student@linxe:${currentPath.replace(HOME_PATH, "~") || "~"}$`;
}

function updatePrompt() {
  terminalPrompt.textContent = getPrompt();
}

function calculateLevel(xp) {
  return Math.floor(xp / 50) + 1;
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
}

function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    userProgress = {
      xp: parsed.xp || 0,
      level: parsed.level || 1,
      missionIndex: parsed.missionIndex || 0,
      completed: Array.isArray(parsed.completed) ? parsed.completed : []
    };
  } catch (e) {
    console.error("Could not load progress", e);
  }
}

function updateProgressUI() {
  userProgress.level = calculateLevel(userProgress.xp);
  xpValueEl.textContent = userProgress.xp;
  levelValueEl.textContent = userProgress.level;
  missionCountEl.textContent = `${userProgress.completed.length} / ${missions.length}`;
  saveProgress();
}

function getCurrentMission() {
  if (userProgress.missionIndex >= missions.length) return null;
  return missions[userProgress.missionIndex];
}

function updateMissionUI() {
  const mission = getCurrentMission();

  if (!mission) {
    missionTitleEl.textContent = "All missions completed";
    missionDescriptionEl.textContent = "You finished the current beginner path.";
    missionHintEl.textContent = "Reset progress or keep practicing freely.";
    missionStatusEl.textContent = "All missions complete ✅";
    return;
  }

  missionTitleEl.textContent = mission.title;
  missionDescriptionEl.textContent = mission.description;
  missionHintEl.textContent = "Use the hint button if needed.";
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
  if (!inputPath || inputPath === "~") return HOME_PATH;
  if (inputPath.startsWith("/")) return normalizePath(inputPath);
  if (inputPath === ".") return currentPath;
  return normalizePath(`${currentPath}/${inputPath}`);
}

function getNodeByPath(path) {
  const normalized = normalizePath(path);
  if (normalized === "/") return fileSystem;

  const parts = normalized.split("/").filter(Boolean);
  let node = fileSystem;

  for (const part of parts) {
    if (!node.children || !node.children[part]) return null;
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
  const node = dir.children[name];
  if (!node) return false;
  return node.type === type;
}

function checkMissionCompletion(rawCommand) {
  const mission = getCurrentMission();
  if (!mission) return;

  const completed = mission.validate(rawCommand);
  if (!completed) return;

  if (!userProgress.completed.includes(userProgress.missionIndex)) {
    userProgress.completed.push(userProgress.missionIndex);
    userProgress.xp += mission.reward;
    userProgress.missionIndex += 1;
    updateProgressUI();

    missionStatusEl.textContent = `Completed! +${mission.reward} XP ✅`;
    printLine("");
    printLine(`Mission complete! +${mission.reward} XP`);

    const nextMission = getCurrentMission();
    if (nextMission) {
      printLine(`Next: ${nextMission.title}`);
    } else {
      printLine("You completed all beginner missions!");
    }

    updateMissionUI();
  }
}

function processCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return;

  printPromptLine(trimmed);

  const parts = trimmed.split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case "help":
      printLine("Available commands:");
      printLine("help");
      printLine("ls");
      printLine("pwd");
      printLine("cd <folder>");
      printLine("mkdir <name>");
      printLine("touch <name>");
      printLine("cat <file>");
      printLine("echo <text>");
      printLine("clear");
      break;

    case "ls": {
      const dir = getCurrentDirectoryNode();
      if (!dir || dir.type !== "dir") {
        printLine("Error: current directory not found.");
      } else {
        const names = Object.keys(dir.children);
        printLine(names.length ? names.join("  ") : "(empty)");
      }
      break;
    }

    case "pwd":
      printLine(currentPath);
      break;

    case "cd": {
      const target = args.join(" ").trim() || "~";
      const resolved = resolvePath(target);
      const node = getNodeByPath(resolved);

      if (!node) {
        printLine(`cd: no such file or directory: ${target}`);
      } else if (node.type !== "dir") {
        printLine(`cd: not a directory: ${target}`);
      } else {
        currentPath = resolved;
        updatePrompt();
      }
      break;
    }

    case "mkdir": {
      const name = args.join(" ").trim();
      if (!name) {
        printLine("mkdir: missing folder name");
        break;
      }

      const dir = getCurrentDirectoryNode();
      if (dir.children[name]) {
        printLine(`mkdir: cannot create directory '${name}': File exists`);
      } else {
        dir.children[name] = { type: "dir", children: {} };
      }
      break;
    }

    case "touch": {
      const name = args.join(" ").trim();
      if (!name) {
        printLine("touch: missing file name");
        break;
      }

      const dir = getCurrentDirectoryNode();
      if (!dir.children[name]) {
        dir.children[name] = { type: "file", content: "" };
      }
      break;
    }

    case "cat": {
      const name = args.join(" ").trim();
      if (!name) {
        printLine("cat: missing file name");
        break;
      }

      const dir = getCurrentDirectoryNode();
      const node = dir.children[name];

      if (!node) {
        printLine(`cat: ${name}: No such file`);
      } else if (node.type !== "file") {
        printLine(`cat: ${name}: Is a directory`);
      } else {
        printLine(node.content || "(empty file)");
      }
      break;
    }

    case "echo":
      printLine(args.join(" "));
      break;

    case "clear":
      terminalOutput.innerHTML = "";
      break;

    default:
      printLine(`Command not found: ${command}. Type 'help'`);
      break;
  }

  checkMissionCompletion(trimmed);
}

function initTerminal() {
  terminalOutput.innerHTML = "";
  printLine("Welcome to Linxe");
  printLine("Learn Linux through interactive missions.");
  printLine("Type help to see available commands.");
  printLine("--------------------------------------------------");
  updatePrompt();
}

function resetLab() {
  fileSystem = createInitialFileSystem();
  currentPath = HOME_PATH;
  initTerminal();
  missionStatusEl.textContent = "Lab reset. Progress kept.";
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
  currentPath = HOME_PATH;

  updateProgressUI();
  updateMissionUI();
  initTerminal();
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

function scrollToLabAndFocus() {
  document.getElementById("lab").scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => terminalInput.focus(), 350);
}

terminalInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const value = terminalInput.value;
    terminalInput.value = "";
    processCommand(value);
  }
});

document.getElementById("terminalWrap").addEventListener("click", () => {
  terminalInput.focus();
});

openLabTopBtn.addEventListener("click", scrollToLabAndFocus);
startHeroBtn.addEventListener("click", scrollToLabAndFocus);
focusBtn.addEventListener("click", () => terminalInput.focus());
resetLabBtn.addEventListener("click", resetLab);
nextMissionBtn.addEventListener("click", goNextMission);
hintBtn.addEventListener("click", showHint);
resetProgressBtn.addEventListener("click", resetAllProgress);

loadProgress();
updateProgressUI();
updateMissionUI();
initTerminal();
