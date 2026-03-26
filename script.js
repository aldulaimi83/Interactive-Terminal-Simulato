const STORAGE_KEY = "linxe_v7_progress";
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
const lessonTrackGrid = document.getElementById("lessonTrackGrid");

const lessonTitleEl = document.getElementById("lessonTitle");
const missionTitleEl = document.getElementById("missionTitle");
const missionDescriptionEl = document.getElementById("missionDescription");
const missionHintEl = document.getElementById("missionHint");
const missionStatusEl = document.getElementById("missionStatus");

const xpValueEl = document.getElementById("xpValue");
const levelValueEl = document.getElementById("levelValue");
const missionCountEl = document.getElementById("missionCount");

const challengeTextEl = document.getElementById("challengeText");
const challengeTimerEl = document.getElementById("challengeTimer");
const challengeStatusEl = document.getElementById("challengeStatus");
const startChallengeBtn = document.getElementById("startChallengeBtn");
const stopChallengeBtn = document.getElementById("stopChallengeBtn");

const quizQuestionEl = document.getElementById("quizQuestion");
const quizOptionsEl = document.getElementById("quizOptions");
const quizStatusEl = document.getElementById("quizStatus");
const nextQuizBtn = document.getElementById("nextQuizBtn");

let currentPath = HOME_PATH;
let commandHistory = [];
let historyIndex = -1;

let nanoMode = {
  active: false,
  fileName: "",
  buffer: []
};

let challengeState = {
  active: false,
  timer: 60,
  interval: null,
  answer: ""
};

let userProgress = {
  xp: 0,
  level: 1,
  missionIndex: 0,
  completed: [],
  quizCorrect: 0
};

const commandDocs = [
  { name: "pwd", description: "Show the current directory path.", syntax: "pwd", example: "pwd", lesson: "Basics" },
  { name: "whoami", description: "Show the current username.", syntax: "whoami", example: "whoami", lesson: "Basics" },
  { name: "date", description: "Show the current date and time.", syntax: "date", example: "date", lesson: "Basics" },
  { name: "echo", description: "Print text to the terminal.", syntax: "echo <text>", example: "echo hello", lesson: "Basics" },
  { name: "clear", description: "Clear the terminal output.", syntax: "clear", example: "clear", lesson: "Basics" },
  { name: "history", description: "Show previously used commands.", syntax: "history", example: "history", lesson: "Basics" },
  { name: "ls", description: "List visible files and folders.", syntax: "ls", example: "ls", lesson: "Navigation" },
  { name: "ls -a", description: "List all files, including hidden files.", syntax: "ls -a", example: "ls -a", lesson: "Navigation" },
  { name: "cd", description: "Move to another directory.", syntax: "cd <folder>", example: "cd Documents", lesson: "Navigation" },
  { name: "mkdir", description: "Create a new folder.", syntax: "mkdir <folder-name>", example: "mkdir practice", lesson: "Files" },
  { name: "rmdir", description: "Remove an empty folder.", syntax: "rmdir <folder-name>", example: "rmdir emptyfolder", lesson: "Files" },
  { name: "touch", description: "Create a new empty file.", syntax: "touch <file-name>", example: "touch notes.txt", lesson: "Files" },
  { name: "cat", description: "Display the content of a file.", syntax: "cat <file-name>", example: "cat welcome.txt", lesson: "Files" },
  { name: "cp", description: "Copy a file.", syntax: "cp <source> <destination>", example: "cp notes.txt backup.txt", lesson: "Files" },
  { name: "mv", description: "Move or rename a file or folder.", syntax: "mv <source> <destination>", example: "mv notes.txt journal.txt", lesson: "Files" },
  { name: "rm", description: "Delete a file.", syntax: "rm <file-name>", example: "rm backup.txt", lesson: "Files" },
  { name: "nano", description: "Open a simple editor mode for a file.", syntax: "nano <file-name>", example: "nano notes.txt", lesson: "Files" },
  { name: "head", description: "Show the first lines of a file.", syntax: "head <file-name>", example: "head welcome.txt", lesson: "Search" },
  { name: "tail", description: "Show the last lines of a file.", syntax: "tail <file-name>", example: "tail welcome.txt", lesson: "Search" },
  { name: "grep", description: "Search for text inside a file.", syntax: "grep <word> <file-name>", example: "grep Linux welcome.txt", lesson: "Search" },
  { name: "find", description: "Search for a file name in the fake file system.", syntax: "find <file-name>", example: "find welcome.txt", lesson: "Search" },
  { name: "chmod", description: "Change fake file permissions.", syntax: "chmod +x <file-name>", example: "chmod +x script.sh", lesson: "Permissions" },
  { name: "man", description: "Show the built-in command help.", syntax: "man <command>", example: "man grep", lesson: "Guide" }
];

const missions = [
  { lesson: "Lesson 1: Basics", title: "Mission 1: Show your location", description: "Type the command that shows your current directory.", hint: "Use: pwd", reward: 20, validate: (raw) => raw.trim() === "pwd" },
  { lesson: "Lesson 1: Basics", title: "Mission 2: Show your username", description: "Display the current user.", hint: "Use: whoami", reward: 20, validate: (raw) => raw.trim() === "whoami" },
  { lesson: "Lesson 1: Basics", title: "Mission 3: Show the date", description: "Display the current date and time.", hint: "Use: date", reward: 20, validate: (raw) => raw.trim() === "date" },
  { lesson: "Lesson 1: Basics", title: "Mission 4: Print text", description: "Print the word hello to the terminal.", hint: "Use: echo hello", reward: 20, validate: (raw) => raw.trim() === "echo hello" },
  { lesson: "Lesson 1: Basics", title: "Mission 5: Show history", description: "Display your command history.", hint: "Use: history", reward: 20, validate: (raw) => raw.trim() === "history" },

  { lesson: "Lesson 2: Navigation", title: "Mission 6: List files", description: "List files and folders in the current directory.", hint: "Use: ls", reward: 20, validate: (raw) => raw.trim() === "ls" },
  { lesson: "Lesson 2: Navigation", title: "Mission 7: Show hidden files", description: "List all files including hidden files.", hint: "Use: ls -a", reward: 25, validate: (raw) => raw.trim() === "ls -a" },
  { lesson: "Lesson 2: Navigation", title: "Mission 8: Open Documents", description: "Move into the Documents folder.", hint: "Use: cd Documents", reward: 25, validate: (raw) => raw.trim() === "cd Documents" && currentPath === `${HOME_PATH}/Documents` },
  { lesson: "Lesson 2: Navigation", title: "Mission 9: Go back home", description: "Move back to your home folder.", hint: "Use: cd ..", reward: 25, validate: (raw) => raw.trim() === "cd .." && currentPath === HOME_PATH },

  { lesson: "Lesson 3: Files", title: "Mission 10: Create a folder", description: "Create a folder named practice.", hint: "Use: mkdir practice", reward: 25, validate: (raw) => raw.trim() === "mkdir practice" && existsInCurrentDir("practice", "dir") },
  { lesson: "Lesson 3: Files", title: "Mission 11: Enter practice", description: "Move into the practice folder.", hint: "Use: cd practice", reward: 25, validate: (raw) => raw.trim() === "cd practice" && currentPath === `${HOME_PATH}/practice` },
  { lesson: "Lesson 3: Files", title: "Mission 12: Create a file", description: "Create a file named notes.txt.", hint: "Use: touch notes.txt", reward: 30, validate: (raw) => raw.trim() === "touch notes.txt" && existsInCurrentDir("notes.txt", "file") },
  { lesson: "Lesson 3: Files", title: "Mission 13: Rename the file", description: "Rename notes.txt to journal.txt.", hint: "Use: mv notes.txt journal.txt", reward: 30, validate: (raw) => raw.trim() === "mv notes.txt journal.txt" && existsInCurrentDir("journal.txt", "file") },
  { lesson: "Lesson 3: Files", title: "Mission 14: Copy the file", description: "Copy journal.txt to backup.txt.", hint: "Use: cp journal.txt backup.txt", reward: 30, validate: (raw) => raw.trim() === "cp journal.txt backup.txt" && existsInCurrentDir("backup.txt", "file") },
  { lesson: "Lesson 3: Files", title: "Mission 15: Delete the copy", description: "Delete backup.txt.", hint: "Use: rm backup.txt", reward: 30, validate: (raw) => raw.trim() === "rm backup.txt" && !existsInCurrentDir("backup.txt", "file") },
  { lesson: "Lesson 3: Files", title: "Mission 16: Edit a file", description: "Open notes2.txt with nano, type some text, then save with :wq", hint: "Use: touch notes2.txt, then nano notes2.txt, type text, then :wq", reward: 35, validate: () => editedAndSavedFile("notes2.txt") },

  { lesson: "Lesson 4: Search & Permissions", title: "Mission 17: Go to Documents", description: "Move to the Documents folder.", hint: "Use: cd ../Documents", reward: 25, validate: () => currentPath === `${HOME_PATH}/Documents` },
  { lesson: "Lesson 4: Search & Permissions", title: "Mission 18: Read the first lines", description: "Show the beginning of welcome.txt.", hint: "Use: head welcome.txt", reward: 30, validate: (raw) => raw.trim() === "head welcome.txt" },
  { lesson: "Lesson 4: Search & Permissions", title: "Mission 19: Search for Linux", description: "Search for the word Linux in welcome.txt.", hint: "Use: grep Linux welcome.txt", reward: 35, validate: (raw) => raw.trim() === "grep Linux welcome.txt" },
  { lesson: "Lesson 4: Search & Permissions", title: "Mission 20: Make script executable", description: "Use chmod to make script.sh executable.", hint: "Use: chmod +x script.sh", reward: 35, validate: (raw) => raw.trim() === "chmod +x script.sh" && hasExecutablePermission("script.sh") }
];

const quizzes = [
  {
    question: "Which command shows your current directory?",
    options: ["pwd", "cd", "ls", "grep"],
    answer: "pwd"
  },
  {
    question: "Which command lists hidden files too?",
    options: ["ls", "ls -a", "find", "tail"],
    answer: "ls -a"
  },
  {
    question: "Which command copies a file?",
    options: ["mv", "cp", "rm", "cat"],
    answer: "cp"
  },
  {
    question: "Which command searches text inside a file?",
    options: ["grep", "head", "touch", "mkdir"],
    answer: "grep"
  },
  {
    question: "Which command opens the built-in manual help?",
    options: ["help", "guide", "man", "find"],
    answer: "man"
  }
];

const challengePool = [
  { text: "Type the command to show your current path.", answer: "pwd" },
  { text: "Type the command to show hidden files too.", answer: "ls -a" },
  { text: "Type the command to print hello.", answer: "echo hello" },
  { text: "Type the command to show the current user.", answer: "whoami" },
  { text: "Type the command to clear the terminal.", answer: "clear" }
];

const editedFiles = new Set();

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
let currentQuizIndex = 0;

function renderCommandGuide(filterText = "") {
  const query = filterText.trim().toLowerCase();

  const filtered = commandDocs.filter((cmd) =>
    cmd.name.toLowerCase().includes(query) ||
    cmd.description.toLowerCase().includes(query) ||
    cmd.lesson.toLowerCase().includes(query)
  );

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

function renderLessonTracks() {
  const completed = userProgress.completed.length;
  const unlocked = {
    basics: true,
    navigation: completed >= 5,
    files: completed >= 9,
    search: completed >= 16
  };

  lessonTrackGrid.innerHTML = `
    <article class="track-card active">
      <div class="track-tag">Unlocked</div>
      <h4>Lesson 1 — Basics</h4>
      <p>pwd, whoami, date, echo, clear, history</p>
    </article>

    <article class="track-card ${unlocked.navigation ? "active" : "locked-track"}">
      <div class="track-tag ${unlocked.navigation ? "" : "muted"}">${unlocked.navigation ? "Unlocked" : "Locked"}</div>
      <h4>Lesson 2 — Navigation</h4>
      <p>ls, ls -a, cd, relative paths, hidden files</p>
    </article>

    <article class="track-card ${unlocked.files ? "active" : "locked-track"}">
      <div class="track-tag ${unlocked.files ? "" : "muted"}">${unlocked.files ? "Unlocked" : "Locked"}</div>
      <h4>Lesson 3 — Files</h4>
      <p>touch, cat, cp, mv, rm, mkdir, rmdir, nano</p>
    </article>

    <article class="track-card ${unlocked.search ? "active" : "locked-track"}">
      <div class="track-tag ${unlocked.search ? "" : "muted"}">${unlocked.search ? "Unlocked" : "Locked"}</div>
      <h4>Lesson 4 — Search & Permissions</h4>
      <p>head, tail, grep, find, chmod, man</p>
    </article>
  `;
}

function renderQuiz() {
  const quiz = quizzes[currentQuizIndex];
  quizQuestionEl.textContent = quiz.question;
  quizOptionsEl.innerHTML = "";
  quizStatusEl.textContent = "Pick an answer.";

  quiz.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = option;

    btn.addEventListener("click", () => {
      const buttons = [...quizOptionsEl.querySelectorAll(".quiz-option")];
      buttons.forEach((b) => b.disabled = true);

      if (option === quiz.answer) {
        btn.classList.add("correct");
        quizStatusEl.textContent = "Correct ✅";
        userProgress.quizCorrect += 1;
        userProgress.xp += 10;
        updateProgressUI();
      } else {
        btn.classList.add("wrong");
        const correctBtn = buttons.find((b) => b.textContent === quiz.answer);
        if (correctBtn) correctBtn.classList.add("correct");
        quizStatusEl.textContent = `Not quite. Correct answer: ${quiz.answer}`;
      }
    });

    quizOptionsEl.appendChild(btn);
  });
}

function nextQuiz() {
  currentQuizIndex = (currentQuizIndex + 1) % quizzes.length;
  renderQuiz();
}

function startChallenge() {
  const selected = challengePool[Math.floor(Math.random() * challengePool.length)];
  challengeState.active = true;
  challengeState.timer = 60;
  challengeState.answer = selected.answer;

  challengeTextEl.textContent = selected.text;
  challengeStatusEl.textContent = "Challenge running...";
  challengeTimerEl.textContent = `${challengeState.timer}s`;

  clearInterval(challengeState.interval);
  challengeState.interval = setInterval(() => {
    challengeState.timer -= 1;
    challengeTimerEl.textContent = `${challengeState.timer}s`;

    if (challengeState.timer <= 0) {
      clearInterval(challengeState.interval);
      challengeState.active = false;
      challengeStatusEl.textContent = "Time is up.";
      challengeTextEl.textContent = "Press start to try another challenge.";
    }
  }, 1000);
}

function stopChallenge() {
  clearInterval(challengeState.interval);
  challengeState.active = false;
  challengeTextEl.textContent = "Press start to get a challenge.";
  challengeTimerEl.textContent = "60s";
  challengeStatusEl.textContent = "Challenge stopped.";
}

function checkChallengeAnswer(command) {
  if (!challengeState.active) return;
  if (command.trim() === challengeState.answer) {
    clearInterval(challengeState.interval);
    challengeState.active = false;
    challengeStatusEl.textContent = "Challenge completed ✅";
    userProgress.xp += 15;
    updateProgressUI();
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
  if (nanoMode.active) return `[nano:${nanoMode.fileName}]>`;
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
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      quizCorrect: parsed.quizCorrect || 0
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
  renderLessonTracks();
  saveProgress();
}

function updateBadges() {
  const completed = userProgress.completed.length;

  const badges = [
    { name: "Basics", unlocked: completed >= 5 },
    { name: "Navigation", unlocked: completed >= 9 },
    { name: "Files", unlocked: completed >= 16 },
    { name: "Search", unlocked: completed >= 20 },
    { name: "Quiz", unlocked: userProgress.quizCorrect >= 3 }
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

function editedAndSavedFile(name) {
  return editedFiles.has(`${currentPath}/${name}`) || editedFiles.has(`${HOME_PATH}/practice/${name}`);
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

  printLine("NAME");
  printLine(`  ${doc.name} - ${doc.description}`);
  printLine("SYNTAX");
  printLine(`  ${doc.syntax}`);
  printLine("EXAMPLE");
  printLine(`  ${doc.example}`);
}

function startNano(fileName) {
  const dir = getCurrentDirectoryNode();
  if (!dir.children[fileName]) {
    dir.children[fileName] = { type: "file", content: "", executable: false };
  }

  const node = dir.children[fileName];
  if (node.type !== "file") {
    printLine(`nano: ${fileName} is not a file`);
    return;
  }

  nanoMode.active = true;
  nanoMode.fileName = fileName;
  nanoMode.buffer = node.content ? node.content.split("\n") : [];

  printLine(`[ nano mode ] Editing ${fileName}`);
  printLine(`Type text and press Enter for new lines.`);
  printLine(`Save and exit with :wq`);
  printLine(`Exit without saving with :q`);
  updatePrompt();
}

function handleNanoInput(text) {
  if (text === ":q") {
    nanoMode.active = false;
    nanoMode.fileName = "";
    nanoMode.buffer = [];
    printLine("[ nano closed without saving ]");
    updatePrompt();
    return;
  }

  if (text === ":wq") {
    const node = getFileInCurrentDir(nanoMode.fileName);
    if (node && node.type === "file") {
      node.content = nanoMode.buffer.join("\n");
      editedFiles.add(`${currentPath}/${nanoMode.fileName}`);
    }

    printLine(`[ saved ${nanoMode.fileName} ]`);
    nanoMode.active = false;
    nanoMode.fileName = "";
    nanoMode.buffer = [];
    updatePrompt();
    checkMissionCompletion("nano-save");
    return;
  }

  nanoMode.buffer.push(text);
  printLine(text);
}

function processCommand(input) {
  const trimmed = input.trim();

  if (nanoMode.active) {
    handleNanoInput(input);
    return;
  }

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
      printLine("ls, ls -a, cd, mkdir, rmdir, touch, cat, cp, mv, rm, nano");
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
        .filter(([, node]) => showAll || !node.hidden)
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

    case "nano": {
      const name = args.join(" ").trim();
      if (!name) {
        printLine("nano: missing file name");
        break;
      }
      startNano(name);
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
  checkChallengeAnswer(trimmed);
}

function initTerminal() {
  terminalOutput.innerHTML = "";
  printLine("Welcome to Linxe V7");
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
  nanoMode.active = false;
  nanoMode.fileName = "";
  nanoMode.buffer = [];
  editedFiles.clear();
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
    completed: [],
    quizCorrect: 0
  };

  fileSystem = createInitialFileSystem();
  currentPath = HOME_PATH;
  commandHistory = [];
  historyIndex = -1;
  nanoMode.active = false;
  nanoMode.fileName = "";
  nanoMode.buffer = [];
  editedFiles.clear();
  stopChallenge();

  updateProgressUI();
  updateMissionUI();
  renderQuiz();
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
    if (nanoMode.active) return;
    if (commandHistory.length > 0) {
      historyIndex = Math.max(0, historyIndex - 1);
      terminalInput.value = commandHistory[historyIndex];
    }
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    if (nanoMode.active) return;
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

startChallengeBtn.addEventListener("click", startChallenge);
stopChallengeBtn.addEventListener("click", stopChallenge);
nextQuizBtn.addEventListener("click", nextQuiz);

loadProgress();
updateProgressUI();
updateMissionUI();
renderCommandGuide();
renderLessonTracks();
renderQuiz();
initTerminal();
