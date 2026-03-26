const STORAGE_KEY = "linxe_v5_progress";
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

const lessonTitleEl = document.getElementById("lessonTitle");
const missionTitleEl = document.getElementById("missionTitle");
const missionDescriptionEl = document.getElementById("missionDescription");
const missionHintEl = document.getElementById("missionHint");
const missionStatusEl = document.getElementById("missionStatus");

const xpValueEl = document.getElementById("xpValue");
const levelValueEl = document.getElementById("levelValue");
const missionCountEl = document.getElementById("missionCount");

let currentPath = HOME_PATH;
let commandHistory = [];
let historyIndex = -1;

let userProgress = {
  xp: 0,
  level: 1,
  missionIndex: 0,
  completed: []
};

const missions = [
  {
    lesson: "Lesson 1: Basics",
    title: "Mission 1: Check your location",
    description: "Type the command that shows your current directory.",
    hint: "Use: pwd",
    reward: 20,
    validate: (raw) => raw.trim() === "pwd"
  },
  {
    lesson: "Lesson 1: Basics",
    title: "Mission 2: Show your username",
    description: "Type the command that shows the current user.",
    hint: "Use: whoami",
    reward: 20,
    validate: (raw) => raw.trim() === "whoami"
  },
  {
    lesson: "Lesson 1: Basics",
    title: "Mission 3: Show the date",
    description: "Display the current date and time.",
    hint: "Use: date",
    reward: 20,
    validate: (raw) => raw.trim() === "date"
  },
  {
    lesson: "Lesson 2: Navigation",
    title: "Mission 4: List files",
    description: "Show the files and folders in your current directory.",
    hint: "Use: ls",
    reward: 20,
    validate: (raw) => raw.trim() === "ls"
  },
  {
    lesson: "Lesson 2: Navigation",
    title: "Mission 5: Open Documents",
    description: "Move into the Documents folder.",
    hint: "Use: cd Documents",
    reward: 25,
    validate: (raw) => raw.trim() === "cd Documents" && currentPath === `${HOME_PATH}/Documents`
  },
  {
    lesson: "Lesson 2: Navigation",
    title: "Mission 6: Go back one folder",
    description: "Move back to your home folder from Documents.",
    hint: "Use: cd ..",
    reward: 25,
    validate: (raw) => raw.trim() === "cd .." && currentPath === HOME_PATH
  },
  {
    lesson: "Lesson 3: Files and Folders",
    title: "Mission 7: Create a folder",
    description: "Create a folder named practice inside your home folder.",
    hint: "Use: mkdir practice",
    reward: 25,
    validate: (raw) => raw.trim() === "mkdir practice" && existsInCurrentDir("practice", "dir")
  },
  {
    lesson: "Lesson 3: Files and Folders",
    title: "Mission 8: Enter practice",
    description: "Move into the practice folder.",
    hint: "Use: cd practice",
    reward: 25,
    validate: (raw) => raw.trim() === "cd practice" && currentPath === `${HOME_PATH}/practice`
  },
  {
    lesson: "Lesson 3: Files and Folders",
    title: "Mission 9: Create a file",
    description: "Create a file named notes.txt inside practice.",
    hint: "Use: touch notes.txt",
    reward: 30,
    validate: (raw) => raw.trim() === "touch notes.txt" && existsInCurrentDir("notes.txt", "file")
  },
  {
    lesson: "Lesson 3: Files and Folders",
    title: "Mission 10: Rename the file",
    description: "Rename notes.txt to journal.txt.",
    hint: "Use: mv notes.txt journal.txt",
    reward: 30,
    validate: (raw) => raw.trim() === "mv notes.txt journal.txt" && existsInCurrentDir("journal.txt", "file")
  },
  {
    lesson: "Lesson 3: Files and Folders",
    title: "Mission 11: Copy the file",
    description: "Copy journal.txt to backup.txt.",
    hint: "Use: cp journal.txt backup.txt",
    reward: 30,
    validate: (raw) => raw.trim() === "cp journal.txt backup.txt" && existsInCurrentDir("backup.txt", "file")
  },
  {
    lesson: "Lesson 3: Files and Folders",
    title: "Mission 12: Remove the copy",
    description: "Delete backup.txt.",
    hint: "Use: rm backup.txt",
    reward: 30,
    validate: (raw) => raw.trim() === "rm backup.txt" && !existsInCurrentDir("backup.txt", "file")
  },
  {
    lesson: "Lesson 4: Search and Text",
    title: "Mission 13: Go to Documents",
    description: "Move to the Documents folder.",
    hint: "Use: cd ../Documents or cd /home/student/Documents",
    reward: 25,
    validate: (raw) => currentPath === `${HOME_PATH}/Documents`
  },
  {
    lesson: "Lesson 4: Search and Text",
    title: "Mission 14: Read the first part of the file",
    description: "Show the beginning of welcome.txt.",
    hint: "Use: head welcome.txt",
    reward: 30,
    validate: (raw) => raw.trim() === "head welcome.txt"
  },
  {
    lesson: "Lesson 4: Search and Text",
    title: "Mission 15: Search for Linux",
    description: "Search for the word Linux inside welcome.txt.",
    hint: "Use: grep Linux welcome.txt",
    reward: 35,
    validate: (raw) => raw.trim() === "grep Linux welcome.txt"
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
                    content: "Welcome to Linxe. Linux practice starts here.\nUse this file to test head, tail, and grep.\nKeep learning one command at a time."
                  },
                  "tips.txt": {
                    type: "file",
                    content: "Tip 1: Use pwd to show your current path.\nTip 2: Use ls to list files.\nTip 3: Use cd to move between folders."
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
  const shownPath = currentPath.replace(HOME_PATH, "~") || "~";
  return `student@linxe:${shownPath}$`;
}

function updatePrompt() {
  terminalPrompt.textContent = getPrompt();
}

function calculateLevel(xp) {
  return Math.floor(xp / 60) + 1;
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
    lessonTitleEl.textContent = "All Lessons Completed";
    missionTitleEl.textContent = "All missions completed";
    missionDescriptionEl.textContent = "You finished the current beginner path.";
    missionHintEl.textContent = "Reset progress or keep practicing freely.";
    missionStatusEl.textContent = "All missions complete ✅";
    return;
  }

  lessonTitleEl.textContent = mission.lesson;
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

function getFileInCurrentDir(name) {
  const dir = getCurrentDirectoryNode();
  if (!dir || dir.type !== "dir") return null;
  return dir.children[name] || null;
}

function listAllFiles(node, current, results) {
  if (node.type === "file") {
    results.push(current);
    return;
  }

  for (const [name, child] of Object.entries(node.children || {})) {
    const nextPath = current === "/" ? `/${name}` : `${current}/${name}`;
    listAllFiles(child, nextPath, results);
  }
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

  commandHistory.push(trimmed);
  historyIndex = commandHistory.length;

  printPromptLine(trimmed);

  const parts = trimmed.split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case "help":
      printLine("Available commands:");
      printLine("help, ls, pwd, whoami, date, echo, clear");
      printLine("cd, mkdir, touch, cat, rm, cp, mv, rmdir");
      printLine("head, tail, grep, find, history");
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

    case "whoami":
      printLine("student");
      break;

    case "date":
      printLine(new Date().toString());
      break;

    case "echo":
      printLine(args.join(" "));
      break;

    case "clear":
      terminalOutput.innerHTML = "";
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

    case "rmdir": {
      const name = args.join(" ").trim();
      if (!name) {
        printLine("rmdir: missing directory name");
        break;
      }

      const dir = getCurrentDirectoryNode();
      const node = dir.children[name];

      if (!node) {
        printLine(`rmdir: failed to remove '${name}': No such directory`);
      } else if (node.type !== "dir") {
        printLine(`rmdir: failed to remove '${name}': Not a directory`);
      } else if (Object.keys(node.children).length > 0) {
        printLine(`rmdir: failed to remove '${name}': Directory not empty`);
      } else {
        delete dir.children[name];
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

      const node = getFileInCurrentDir(name);

      if (!node) {
        printLine(`cat: ${name}: No such file`);
      } else if (node.type !== "file") {
        printLine(`cat: ${name}: Is a directory`);
      } else {
        const lines = node.content ? node.content.split("\n") : ["(empty file)"];
        lines.forEach(line => printLine(line));
      }
      break;
    }

    case "head": {
      const name = args.join(" ").trim();
      const node = getFileInCurrentDir(name);
      if (!node || node.type !== "file") {
        printLine(`head: cannot open '${name}'`);
      } else {
        node.content.split("\n").slice(0, 2).forEach(line => printLine(line));
      }
      break;
    }

    case "tail": {
      const name = args.join(" ").trim();
      const node = getFileInCurrentDir(name);
      if (!node || node.type !== "file") {
        printLine(`tail: cannot open '${name}'`);
      } else {
        node.content.split("\n").slice(-2).forEach(line => printLine(line));
      }
      break;
    }

    case "grep": {
      const searchTerm = args[0];
      const fileName = args[1];
      if (!searchTerm || !fileName) {
        printLine("grep: usage grep <text> <file>");
        break;
      }

      const node = getFileInCurrentDir(fileName);
      if (!node || node.type !== "file") {
        printLine(`grep: ${fileName}: No such file`);
      } else {
        const matched = node.content
          .split("\n")
          .filter(line => line.toLowerCase().includes(searchTerm.toLowerCase()));

        if (matched.length === 0) {
          printLine("(no matches)");
        } else {
          matched.forEach(line => printLine(line));
        }
      }
      break;
    }

    case "find": {
      const name = args[0];
      if (!name) {
        printLine("find: usage find <name>");
        break;
      }

      const all = [];
      listAllFiles(fileSystem, "/", all);
      const matches = all.filter(path => path.endsWith(`/${name}`) || path === `/${name}`);

      if (matches.length === 0) {
        printLine("(no matches)");
      } else {
        matches.forEach(match => printLine(match));
      }
      break;
    }

    case "rm": {
      const name = args.join(" ").trim();
      if (!name) {
        printLine("rm: missing file name");
        break;
      }

      const dir = getCurrentDirectoryNode();
      const node = dir.children[name];

      if (!node) {
        printLine(`rm: cannot remove '${name}': No such file`);
      } else if (node.type !== "file") {
        printLine(`rm: cannot remove '${name}': Is a directory`);
      } else {
        delete dir.children[name];
      }
      break;
    }

    case "cp": {
      const source = args[0];
      const destination = args[1];

      if (!source || !destination) {
        printLine("cp: usage cp <source> <destination>");
        break;
      }

      const dir = getCurrentDirectoryNode();
      const sourceNode = dir.children[source];

      if (!sourceNode) {
        printLine(`cp: cannot stat '${source}': No such file`);
      } else if (sourceNode.type !== "file") {
        printLine(`cp: '${source}' is not a file`);
      } else {
        dir.children[destination] = {
          type: "file",
          content: sourceNode.content
        };
      }
      break;
    }

    case "mv": {
      const source = args[0];
      const destination = args[1];

      if (!source || !destination) {
        printLine("mv: usage mv <source> <destination>");
        break;
      }

      const dir = getCurrentDirectoryNode();
      const sourceNode = dir.children[source];

      if (!sourceNode) {
        printLine(`mv: cannot stat '${source}': No such file or directory`);
      } else {
        dir.children[destination] = sourceNode;
        delete dir.children[source];
      }
      break;
    }

    case "history": {
      commandHistory.forEach((cmd, index) => {
        printLine(`${index + 1}  ${cmd}`);
      });
      break;
    }

    default:
      printLine(`Command not found: ${command}. Type 'help'`);
      break;
  }

  checkMissionCompletion(trimmed);
}

function initTerminal() {
  terminalOutput.innerHTML = "";
  printLine("Welcome to Linxe V5");
  printLine("Learn Linux through interactive missions.");
  printLine("Type help to see available commands.");
  printLine("Use arrow up/down for command history.");
  printLine("--------------------------------------------------");
  updatePrompt();
}

function resetLab() {
  fileSystem = createInitialFileSystem();
  currentPath = HOME_PATH;
  commandHistory = [];
  historyIndex = -1;
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
  commandHistory = [];
  historyIndex = -1;

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
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (commandHistory.length > 0) {
      historyIndex = Math.max(0, historyIndex - 1);
      terminalInput.value = commandHistory[historyIndex];
    }
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    if (commandHistory.length > 0) {
      historyIndex = Math.min(commandHistory.length, historyIndex + 1);
      terminalInput.value = historyIndex < commandHistory.length ? commandHistory[historyIndex] : "";
    }
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
