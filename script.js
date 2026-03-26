const STORAGE_KEY = "linxe_v6_progress";
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
const commandSearch = document.getElementById("commandSearch");
const commandGuideGrid = document.getElementById("commandGuideGrid");
const badgeList = document.getElementById("badgeList");

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

const commandDocs = [
  {
    name: "pwd",
    description: "Show the current directory path.",
    syntax: "pwd",
    example: "pwd",
    lesson: "Basics"
  },
  {
    name: "whoami",
    description: "Show the current username.",
    syntax: "whoami",
    example: "whoami",
    lesson: "Basics"
  },
  {
    name: "date",
    description: "Show the current date and time.",
    syntax: "date",
    example: "date",
    lesson: "Basics"
  },
  {
    name: "echo",
    description: "Print text to the terminal.",
    syntax: "echo <text>",
    example: "echo hello",
    lesson: "Basics"
  },
  {
    name: "clear",
    description: "Clear the terminal output.",
    syntax: "clear",
    example: "clear",
    lesson: "Basics"
  },
  {
    name: "history",
    description: "Show previously used commands.",
    syntax: "history",
    example: "history",
    lesson: "Basics"
  },
  {
    name: "ls",
    description: "List files and folders in the current directory.",
    syntax: "ls",
    example: "ls",
    lesson: "Navigation"
  },
  {
    name: "ls -a",
    description: "List all files, including hidden files that start with a dot.",
    syntax: "ls -a",
    example: "ls -a",
    lesson: "Navigation"
  },
  {
    name: "cd",
    description: "Move to another directory.",
    syntax: "cd <folder>",
    example: "cd Documents",
    lesson: "Navigation"
  },
  {
    name: "mkdir",
    description: "Create a new folder.",
    syntax: "mkdir <folder-name>",
    example: "mkdir practice",
    lesson: "Files"
  },
  {
    name: "rmdir",
    description: "Remove an empty folder.",
    syntax: "rmdir <folder-name>",
    example: "rmdir emptyfolder",
    lesson: "Files"
  },
  {
    name: "touch",
    description: "Create a new empty file.",
    syntax: "touch <file-name>",
    example: "touch notes.txt",
    lesson: "Files"
  },
  {
    name: "cat",
    description: "Display the content of a file.",
    syntax: "cat <file-name>",
    example: "cat welcome.txt",
    lesson: "Files"
  },
  {
    name: "cp",
    description: "Copy a file.",
    syntax: "cp <source> <destination>",
    example: "cp notes.txt backup.txt",
    lesson: "Files"
  },
  {
    name: "mv",
    description: "Move or rename a file or folder.",
    syntax: "mv <source> <destination>",
    example: "mv notes.txt journal.txt",
    lesson: "Files"
  },
  {
    name: "rm",
    description: "Delete a file.",
    syntax: "rm <file-name>",
    example: "rm backup.txt",
    lesson: "Files"
  },
  {
    name: "head",
    description: "Show the first lines of a file.",
    syntax: "head <file-name>",
    example: "head welcome.txt",
    lesson: "Search"
  },
  {
    name: "tail",
    description: "Show the last lines of a file.",
    syntax: "tail <file-name>",
    example: "tail welcome.txt",
    lesson: "Search"
  },
  {
    name: "grep",
    description: "Search for text inside a file.",
    syntax: "grep <word> <file-name>",
    example: "grep Linux welcome.txt",
    lesson: "Search"
  },
  {
    name: "find",
    description: "Search for a file name in the fake file system.",
    syntax: "find <file-name>",
    example: "find welcome.txt",
    lesson: "Search"
  },
  {
    name: "chmod",
    description: "Change fake file permissions, such as making a file executable.",
    syntax: "chmod +x <file-name>",
    example: "chmod +x script.sh",
    lesson: "Permissions"
  },
  {
    name: "man",
    description: "Show the built-in command description for a specific command.",
    syntax: "man <command>",
    example: "man grep",
    lesson: "Guide"
  }
];

const missions = [
  {
    lesson: "Lesson 1: Basics",
    title: "Mission 1: Show your location",
    description: "Type the command that shows your current directory.",
    hint: "Use: pwd",
    reward: 20,
    validate: (raw) => raw.trim() === "pwd"
  },
  {
    lesson: "Lesson 1: Basics",
    title: "Mission 2: Show your username",
    description: "Display the current user.",
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
    lesson: "Lesson 1: Basics",
    title: "Mission 4: Print text",
    description: "Print the word hello to the terminal.",
    hint: "Use: echo hello",
    reward: 20,
    validate: (raw) => raw.trim() === "echo hello"
  },
  {
    lesson: "Lesson 2: Navigation",
    title: "Mission 5: List files",
    description: "List the files and folders in your current directory.",
    hint: "Use: ls",
    reward: 20,
    validate: (raw) => raw.trim() === "ls"
  },
  {
    lesson: "Lesson 2: Navigation",
    title: "Mission 6: Show hidden files",
    description: "List all files including hidden files.",
    hint: "Use: ls -a",
    reward: 25,
    validate: (raw) => raw.trim() === "ls -a"
  },
  {
    lesson: "Lesson 2: Navigation",
    title: "Mission 7: Open Documents",
    description: "Move into the Documents folder.",
    hint: "Use: cd Documents",
    reward: 25,
    validate: (raw) => raw.trim() === "cd Documents" && currentPath === `${HOME_PATH}/Documents`
  },
  {
    lesson: "Lesson 2: Navigation",
    title: "Mission 8: Go back home",
    description: "Move back to your home folder.",
    hint: "Use: cd ..",
    reward: 25,
    validate: (raw) => raw.trim() === "cd .." && currentPath === HOME_PATH
  },
  {
    lesson: "Lesson 3: Files",
    title: "Mission 9: Create a folder",
    description: "Create a folder named practice.",
    hint: "Use: mkdir practice",
    reward: 25,
    validate: (raw) => raw.trim() === "mkdir practice" && existsInCurrentDir("practice", "dir")
  },
  {
    lesson: "Lesson 3: Files",
    title: "Mission 10: Enter practice",
    description: "Move into the practice folder.",
    hint: "Use: cd practice",
    reward: 25,
    validate: (raw) => raw.trim() === "cd practice" && currentPath === `${HOME_PATH}/practice`
  },
  {
    lesson: "Lesson 3: Files",
    title: "Mission 11: Create a file",
    description: "Create a file named notes.txt.",
    hint: "Use: touch notes.txt",
    reward: 30,
    validate: (raw) => raw.trim() === "touch notes.txt" && existsInCurrentDir("notes.txt", "file")
  },
  {
    lesson: "Lesson 3: Files",
    title: "Mission 12: Rename the file",
    description: "Rename notes.txt to journal.txt.",
    hint: "Use: mv notes.txt journal.txt",
    reward: 30,
    validate: (raw) => raw.trim() === "mv notes.txt journal.txt" && existsInCurrentDir("journal.txt", "file")
  },
  {
    lesson: "Lesson 3: Files",
    title: "Mission 13: Copy the file",
    description: "Copy journal.txt to backup.txt.",
    hint: "Use: cp journal.txt backup.txt",
    reward: 30,
    validate: (raw) => raw.trim() === "cp journal.txt backup.txt" && existsInCurrentDir("backup.txt", "file")
  },
  {
    lesson: "Lesson 3: Files",
    title: "Mission 14: Delete the copy",
    description: "Delete backup.txt.",
    hint: "Use: rm backup.txt",
    reward: 30,
    validate: (raw) => raw.trim() === "rm backup.txt" && !existsInCurrentDir("backup.txt", "file")
  },
  {
    lesson: "Lesson 4: Search & Permissions",
    title: "Mission 15: Go to Documents",
    description: "Move to the Documents folder.",
    hint: "Use: cd ../Documents",
    reward: 25,
    validate: () => currentPath === `${HOME_PATH}/Documents`
  },
  {
    lesson: "Lesson 4: Search & Permissions",
    title: "Mission 16: Read the first lines",
    description: "Show the beginning of welcome.txt.",
    hint: "Use: head welcome.txt",
    reward: 30,
    validate: (raw) => raw.trim() === "head welcome.txt"
  },
  {
    lesson: "Lesson 4: Search & Permissions",
    title: "Mission 17: Search for Linux",
    description: "Search for the word Linux in welcome.txt.",
    hint: "Use: grep Linux welcome.txt",
    reward: 35,
    validate: (raw) => raw.trim() === "grep Linux welcome.txt"
  },
  {
    lesson: "Lesson 4: Search & Permissions",
    title: "Mission 18: Make script executable",
    description: "Use chmod to make script.sh executable.",
    hint: "Use: chmod +x script.sh",
    reward: 35,
    validate: (raw) => raw.trim() === "chmod +x script.sh" && hasExecutablePermission("script.sh")
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
              ".bashrc": {
                type: "file",
                content: "export PATH=/usr/local/bin:$PATH",
                hidden: true,
                executable: false
              },
              ".secret": {
                type: "file",
                content: "This is a hidden practice file.",
                hidden: true,
                executable: false
              },
              Documents: {
                type: "dir",
                children: {
                  "welcome.txt": {
                    type: "file",
                    content: "Welcome to Linxe.\nLinux practice starts here.\nUse this file to test head, tail, and grep.",
                    executable: false
                  },
                  "tips.txt": {
                    type: "file",
                    content: "Tip 1: Use pwd.\nTip 2: Use ls.\nTip 3: Use cd.",
                    executable: false
                  },
                  "script.sh": {
                    type: "file",
                    content: "#!/bin/bash\necho Running practice script",
                    executable: false
                  }
                }
              },
              Downloads: {
                type: "dir",
                children: {}
              },
              "hello.txt": {
                type: "file",
                content: "Hello from Linxe.",
                executable: false
              }
            }
          }
        }
      }
    }
  };
}

let fileSystem = createInitialFileSystem();

function renderCommandGuide(filterText = "") {
  const query = filterText.trim().toLowerCase();

  const filtered = commandDocs.filter((cmd) => {
    return (
      cmd.name.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query) ||
      cmd.lesson.toLowerCase().includes(query)
    );
  });

  commandGuideGrid.innerHTML = "";

  filtered.forEach((cmd) => {
    const card = document.createElement("article");
    card.className = "guide-card";
    card.innerHTML = `
      <h4>${cmd.name}</h4>
      <div class="guide-meta">Lesson: ${cmd.lesson}</div>
      <p>${cmd.description}</p>
      <span class="guide-syntax">${cmd.syntax}</span>
      <div class="guide-example">Example: ${cmd.example}</div>
    `;
    commandGuideGrid.appendChild(card);
  });

  if (filtered.length === 0) {
    commandGuideGrid.innerHTML = `
      <article class="guide-card">
        <h4>No command found</h4>
        <p>Try a different search term.</p>
      </article>
    `;
  }
}

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
  updateBadges();
  saveProgress();
}

function updateBadges() {
  const completed = userProgress.completed.length;

  const badges = [
    { name: "Basics", unlocked: completed >= 4 },
    { name: "Navigation", unlocked: completed >= 8 },
    { name: "Files", unlocked: completed >= 14 },
    { name: "Search", unlocked: completed >= 18 }
  ];

  badgeList.innerHTML = "";
  badges.forEach((badge) => {
    const span = document.createElement("span");
    span.className = `badge-pill ${badge.unlocked ? "unlocked" : "locked"}`;
    span.textContent = badge.name;
    badgeList.appendChild(span);
  });
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

function hasExecutablePermission(name) {
  const node = getFileInCurrentDir(name);
  return !!(node && node.type === "file" && node.executable);
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

function showManual(commandName) {
  const doc = commandDocs.find((item) => item.name === commandName);
  if (!doc) {
    printLine(`man: no manual entry for ${commandName}`);
    return;
  }

  printLine(`NAME`);
  printLine(`  ${doc.name} - ${doc.description}`);
  printLine(`SYNTAX`);
  printLine(`  ${doc.syntax}`);
  printLine(`EXAMPLE`);
  printLine(`  ${doc.example}`);
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
      printLine("help, pwd, whoami, date, echo, clear, history");
      printLine("ls, ls -a, cd, mkdir, rmdir, touch, cat, cp, mv, rm");
      printLine("head, tail, grep, find, chmod, man");
      break;

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

    case "history":
      commandHistory.forEach((cmd, index) => {
        printLine(`${index + 1}  ${cmd}`);
      });
      break;

    case "ls": {
      const dir = getCurrentDirectoryNode();
      if (!dir || dir.type !== "dir") {
        printLine("Error: current directory not found.");
        break;
      }

      const showAll = args[0] === "-a";
      const names = Object.entries(dir.children)
        .filter(([name, node]) => showAll || !node.hidden)
        .map(([name]) => name);

      printLine(names.length ? names.join("  ") : "(empty)");
      break;
    }

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
        dir.children[name] = { type: "file", content: "", executable: false };
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
        lines.forEach((line) => printLine(line));
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
          content: sourceNode.content,
          executable: !!sourceNode.executable
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

    case "head": {
      const name = args.join(" ").trim();
      const node = getFileInCurrentDir(name);
      if (!node || node.type !== "file") {
        printLine(`head: cannot open '${name}'`);
      } else {
        node.content.split("\n").slice(0, 2).forEach((line) => printLine(line));
      }
      break;
    }

    case "tail": {
      const name = args.join(" ").trim();
      const node = getFileInCurrentDir(name);
      if (!node || node.type !== "file") {
        printLine(`tail: cannot open '${name}'`);
      } else {
        node.content.split("\n").slice(-2).forEach((line) => printLine(line));
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
          .filter((line) => line.toLowerCase().includes(searchTerm.toLowerCase()));

        if (matched.length === 0) {
          printLine("(no matches)");
        } else {
          matched.forEach((line) => printLine(line));
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
      const matches = all.filter((path) => path.endsWith(`/${name}`) || path === `/${name}`);

      if (matches.length === 0) {
        printLine("(no matches)");
      } else {
        matches.forEach((match) => printLine(match));
      }
      break;
    }

    case "chmod": {
      const mode = args[0];
      const fileName = args[1];

      if (!mode || !fileName) {
        printLine("chmod: usage chmod +x <file>");
        break;
      }

      const node = getFileInCurrentDir(fileName);

      if (!node || node.type !== "file") {
        printLine(`chmod: cannot access '${fileName}'`);
      } else if (mode === "+x") {
        node.executable = true;
        printLine(`Permissions updated for ${fileName}`);
      } else if (mode === "-x") {
        node.executable = false;
        printLine(`Permissions updated for ${fileName}`);
      } else {
        printLine("chmod: only +x and -x are supported in this lab");
      }
      break;
    }

    case "man": {
      const target = args[0];
      if (!target) {
        printLine("man: usage man <command>");
      } else {
        showManual(target);
      }
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
  printLine("Welcome to Linxe V6");
  printLine("Learn Linux through interactive missions.");
  printLine("Type help to see available commands.");
  printLine("Type man <command> for built-in command help.");
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

commandSearch.addEventListener("input", (event) => {
  renderCommandGuide(event.target.value);
});

loadProgress();
updateProgressUI();
updateMissionUI();
renderCommandGuide();
initTerminal();
