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
  { name: "man", description: "Show the built-in command help.", syntax: "man <command>", example: "man grep", lesson: "Guide" },
  { name: "wc", description: "Count lines, words, and characters in a file.", syntax: "wc <file>", example: "wc welcome.txt", lesson: "Pipes" },
  { name: "wc -l", description: "Count only the number of lines in a file.", syntax: "wc -l <file>", example: "wc -l welcome.txt", lesson: "Pipes" },
  { name: "sort", description: "Sort lines of a file alphabetically.", syntax: "sort <file>", example: "sort tips.txt", lesson: "Pipes" },
  { name: "ps", description: "Show the list of running processes.", syntax: "ps", example: "ps", lesson: "Processes" },
  { name: "kill", description: "Terminate a process by its PID.", syntax: "kill <pid>", example: "kill 1234", lesson: "Processes" },
  { name: "top", description: "Show live system processes (simulated).", syntax: "top", example: "top", lesson: "Processes" },
  { name: "uname", description: "Show system and kernel information.", syntax: "uname -a", example: "uname -a", lesson: "Processes" },
  { name: "df", description: "Show disk space usage for all drives.", syntax: "df", example: "df", lesson: "Processes" },
  { name: "ping", description: "Send ICMP packets to a host to test connectivity.", syntax: "ping <host>", example: "ping google.com", lesson: "Network" },
  { name: "curl", description: "Transfer data from or to a server URL.", syntax: "curl <url>", example: "curl https://api.youooo.com", lesson: "Network" },
  { name: "ifconfig", description: "Show or configure network interfaces.", syntax: "ifconfig", example: "ifconfig", lesson: "Network" },
  { name: "ssh", description: "Securely connect to a remote server.", syntax: "ssh user@host", example: "ssh student@linux.youooo.com", lesson: "Network" },
  { name: "nslookup", description: "Query DNS to look up a domain name.", syntax: "nslookup <domain>", example: "nslookup google.com", lesson: "Network" },
  { name: "grep -n", description: "Search for text in a file and show line numbers.", syntax: "grep -n <pattern> <file>", example: "grep -n Tip tips.txt", lesson: "Text" }
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
  { lesson: "Lesson 4: Search & Permissions", title: "Mission 20: Make script executable", description: "Use chmod to make script.sh executable.", hint: "Use: chmod +x script.sh", reward: 35, validate: (raw) => raw.trim() === "chmod +x script.sh" && hasExecutablePermission("script.sh") },

  // Lesson 5: Pipes & Redirection
  { lesson: "Lesson 5: Pipes & Redirection", title: "Mission 21: Write to a file", description: "Use echo with > to write 'hello world' into output.txt.", hint: "Use: echo hello world > output.txt", reward: 30, validate: (raw) => raw.trim() === "echo hello world > output.txt" },
  { lesson: "Lesson 5: Pipes & Redirection", title: "Mission 22: Append to a file", description: "Use >> to append 'more text' to output.txt.", hint: "Use: echo more text >> output.txt", reward: 30, validate: (raw) => raw.trim() === "echo more text >> output.txt" },
  { lesson: "Lesson 5: Pipes & Redirection", title: "Mission 23: Go to Documents", description: "Navigate into the Documents folder.", hint: "Use: cd ~/Documents", reward: 20, validate: () => currentPath === `${HOME_PATH}/Documents` },
  { lesson: "Lesson 5: Pipes & Redirection", title: "Mission 24: Count words in file", description: "Count words in welcome.txt.", hint: "Use: wc welcome.txt", reward: 30, validate: (raw) => raw.trim() === "wc welcome.txt" },
  { lesson: "Lesson 5: Pipes & Redirection", title: "Mission 25: Pipe ls to grep", description: "List only .txt files using a pipe.", hint: "Use: ls | grep .txt", reward: 35, validate: (raw) => raw.trim() === "ls | grep .txt" },

  // Lesson 6: Processes
  { lesson: "Lesson 6: Processes", title: "Mission 26: Show processes", description: "Display the list of running processes.", hint: "Use: ps", reward: 30, validate: (raw) => raw.trim() === "ps" },
  { lesson: "Lesson 6: Processes", title: "Mission 27: System info", description: "Show full system and kernel information.", hint: "Use: uname -a", reward: 30, validate: (raw) => raw.trim() === "uname -a" },
  { lesson: "Lesson 6: Processes", title: "Mission 28: Disk space", description: "Show available disk space on all drives.", hint: "Use: df", reward: 30, validate: (raw) => raw.trim() === "df" },
  { lesson: "Lesson 6: Processes", title: "Mission 29: Kill a process", description: "Terminate the process with PID 1234.", hint: "Use: kill 1234", reward: 35, validate: (raw) => raw.trim() === "kill 1234" },
  { lesson: "Lesson 6: Processes", title: "Mission 30: Live process monitor", description: "Open the live process monitor.", hint: "Use: top", reward: 35, validate: (raw) => raw.trim() === "top" },

  // Lesson 7: Networking
  { lesson: "Lesson 7: Networking", title: "Mission 31: Ping a server", description: "Send a ping to google.com to test network.", hint: "Use: ping google.com", reward: 30, validate: (raw) => raw.trim() === "ping google.com" },
  { lesson: "Lesson 7: Networking", title: "Mission 32: Network config", description: "Display your network interface configuration.", hint: "Use: ifconfig", reward: 30, validate: (raw) => raw.trim() === "ifconfig" },
  { lesson: "Lesson 7: Networking", title: "Mission 33: Fetch a URL", description: "Use curl to fetch https://api.youooo.com.", hint: "Use: curl https://api.youooo.com", reward: 35, validate: (raw) => raw.trim() === "curl https://api.youooo.com" },
  { lesson: "Lesson 7: Networking", title: "Mission 34: SSH example", description: "Connect via SSH to student@linux.youooo.com.", hint: "Use: ssh student@linux.youooo.com", reward: 35, validate: (raw) => raw.trim() === "ssh student@linux.youooo.com" },
  { lesson: "Lesson 7: Networking", title: "Mission 35: DNS lookup", description: "Look up the DNS record for google.com.", hint: "Use: nslookup google.com", reward: 35, validate: (raw) => raw.trim() === "nslookup google.com" },

  // Lesson 8: Text Processing
  { lesson: "Lesson 8: Text Processing", title: "Mission 36: Count lines", description: "Count only the number of lines in welcome.txt.", hint: "Use: wc -l welcome.txt", reward: 35, validate: (raw) => raw.trim() === "wc -l welcome.txt" },
  { lesson: "Lesson 8: Text Processing", title: "Mission 37: Sort a file", description: "Sort lines in tips.txt alphabetically.", hint: "Use: sort tips.txt", reward: 35, validate: (raw) => raw.trim() === "sort tips.txt" },
  { lesson: "Lesson 8: Text Processing", title: "Mission 38: Grep with line numbers", description: "Search for 'Tip' in tips.txt showing line numbers.", hint: "Use: grep -n Tip tips.txt", reward: 40, validate: (raw) => raw.trim() === "grep -n Tip tips.txt" },
  { lesson: "Lesson 8: Text Processing", title: "Mission 39: Triple pipe chain", description: "Count how many .txt files exist using a pipe chain.", hint: "Use: ls | grep .txt | wc -l", reward: 40, validate: (raw) => raw.trim() === "ls | grep .txt | wc -l" },
  { lesson: "Lesson 8: Text Processing", title: "Mission 40: Command chaining", description: "Show system info and current directory back to back.", hint: "Use: uname -a && pwd", reward: 50, validate: (raw) => raw.trim() === "uname -a && pwd" }
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
  },
  { question: "Which symbol writes command output to a file (overwrite)?", options: [">", ">>", "|", "&"], answer: ">" },
  { question: "Which symbol appends output to an existing file?", options: [">>", ">", "|", "<"], answer: ">>" },
  { question: "Which command counts lines and words in a file?", options: ["wc", "count", "len", "size"], answer: "wc" },
  { question: "Which command shows running processes?", options: ["ps", "top", "ls", "run"], answer: "ps" },
  { question: "Which command tests network connectivity?", options: ["ping", "curl", "ssh", "ifconfig"], answer: "ping" },
  { question: "Which symbol pipes output of one command to another?", options: ["|", ">", "&", ">>"], answer: "|" },
  { question: "Which command shows disk space usage?", options: ["df", "du", "ls", "disk"], answer: "df" },
  { question: "Which command shows OS and kernel version?", options: ["uname", "sysinfo", "info", "os"], answer: "uname" },
  { question: "Which command transfers data from a URL?", options: ["curl", "wget", "fetch", "ping"], answer: "curl" },
  { question: "Which grep flag shows matching line numbers?", options: ["-n", "-l", "-v", "-r"], answer: "-n" }
];

const challengePool = [
  { text: "Type the command to show your current path.", answer: "pwd" },
  { text: "Type the command to show hidden files too.", answer: "ls -a" },
  { text: "Type the command to print hello.", answer: "echo hello" },
  { text: "Type the command to show the current user.", answer: "whoami" },
  { text: "Type the command to clear the terminal.", answer: "clear" },
  { text: "Type the command to count words in welcome.txt.", answer: "wc welcome.txt" },
  { text: "Type the command to show running processes.", answer: "ps" },
  { text: "Type the command to ping google.com.", answer: "ping google.com" },
  { text: "Type the command to show system info.", answer: "uname -a" },
  { text: "Type the command to show disk space.", answer: "df" },
  { text: "Type the command to sort tips.txt.", answer: "sort tips.txt" },
  { text: "Type the command to show network config.", answer: "ifconfig" },
  { text: "Type the command to count lines in welcome.txt.", answer: "wc -l welcome.txt" },
  { text: "Type a pipe command to list only .txt files.", answer: "ls | grep .txt" },
  { text: "Type the command to look up google.com DNS.", answer: "nslookup google.com" }
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
      <div class="guide-example-row">
        <div class="guide-example">Example: ${cmd.example}</div>
        <button class="copy-cmd-btn secondary" data-cmd="${cmd.example}">Copy</button>
      </div>
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
    search: completed >= 16,
    pipes: completed >= 20,
    processes: completed >= 25,
    networking: completed >= 30,
    text: completed >= 35
  };

  function trackCard(key, num, title, desc) {
    const u = unlocked[key];
    return `
      <article class="track-card ${u ? "active" : "locked-track"}">
        <div class="track-tag ${u ? "" : "muted"}">${u ? "Unlocked" : "Locked"}</div>
        <h4>Lesson ${num} — ${title}</h4>
        <p>${desc}</p>
      </article>`;
  }

  lessonTrackGrid.innerHTML =
    trackCard("basics",     1, "Basics",              "pwd, whoami, date, echo, clear, history") +
    trackCard("navigation", 2, "Navigation",           "ls, ls -a, cd, relative paths, hidden files") +
    trackCard("files",      3, "Files",                "touch, cat, cp, mv, rm, mkdir, rmdir, nano") +
    trackCard("search",     4, "Search & Permissions", "head, tail, grep, find, chmod, man") +
    trackCard("pipes",      5, "Pipes & Redirection",  "echo >, >>, wc, sort, ls | grep") +
    trackCard("processes",  6, "Processes",             "ps, kill, top, uname, df") +
    trackCard("networking", 7, "Networking",            "ping, curl, ifconfig, ssh, nslookup") +
    trackCard("text",       8, "Text Processing",       "wc -l, sort -u, grep -n, pipe chains");
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
    { name: "Basics",      unlocked: completed >= 5  },
    { name: "Navigation",  unlocked: completed >= 9  },
    { name: "Files",       unlocked: completed >= 16 },
    { name: "Search",      unlocked: completed >= 20 },
    { name: "Pipes",       unlocked: completed >= 25 },
    { name: "Processes",   unlocked: completed >= 30 },
    { name: "Network",     unlocked: completed >= 35 },
    { name: "Text Pro",    unlocked: completed >= 40 },
    { name: "Quiz",        unlocked: userProgress.quizCorrect >= 3 }
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

function handlePipe(trimmed) {
  const segments = trimmed.split("|").map(s => s.trim());

  // capture output of first command
  let lines = [];
  const firstParts = segments[0].split(" ");
  const firstCmd = firstParts[0].toLowerCase();
  const firstArgs = firstParts.slice(1);

  if (firstCmd === "ls") {
    const dir = getCurrentDirectoryNode();
    if (dir && dir.type === "dir") {
      const showAll = firstArgs[0] === "-a";
      lines = Object.entries(dir.children)
        .filter(([, n]) => showAll || !n.hidden)
        .map(([name]) => name);
    }
  } else if (firstCmd === "cat") {
    const node = getFileInCurrentDir(firstArgs[0]);
    if (node && node.type === "file") lines = node.content.split("\n");
  }

  // apply each subsequent segment
  for (let i = 1; i < segments.length; i++) {
    const segParts = segments[i].split(" ");
    const segCmd = segParts[0].toLowerCase();
    const segArgs = segParts.slice(1);

    if (segCmd === "grep") {
      const pattern = (segArgs[0] || "").toLowerCase();
      lines = lines.filter(l => l.toLowerCase().includes(pattern));
    } else if (segCmd === "wc") {
      if (segArgs[0] === "-l") {
        printLine(`  ${lines.length}`);
        return;
      } else {
        const text = lines.join("\n");
        printLine(`  ${lines.length}  ${text.split(/\s+/).filter(w => w).length}  ${text.length}`);
        return;
      }
    } else if (segCmd === "sort") {
      lines = [...lines].sort();
    }
  }

  if (lines.length === 0) printLine("(no output)");
  else lines.forEach(l => printLine(l));
}

function handleRedirect(trimmed) {
  const appendMode = / >>/.test(trimmed);
  const operator = appendMode ? ">>" : ">";
  const idx = appendMode ? trimmed.indexOf(">>") : trimmed.lastIndexOf(">");
  const leftCmd = trimmed.slice(0, idx).trim();
  const fileName = trimmed.slice(idx + (appendMode ? 2 : 1)).trim();

  if (!fileName) { printLine("redirect: missing filename"); return; }

  let output = "";
  if (leftCmd.startsWith("echo ")) output = leftCmd.slice(5);

  const dir = getCurrentDirectoryNode();
  if (!dir.children[fileName]) {
    dir.children[fileName] = { type: "file", content: "", executable: false };
  }

  if (appendMode) {
    const existing = dir.children[fileName].content || "";
    dir.children[fileName].content = existing ? existing + "\n" + output : output;
  } else {
    dir.children[fileName].content = output;
  }
}

function executeCore(trimmed) {
  const parts = trimmed.split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case "help":
      printLine("Available commands:");
      printLine("help, pwd, whoami, date, echo, clear, history");
      printLine("ls, ls -a, cd, mkdir, rmdir, touch, cat, cp, mv, rm, nano");
      printLine("head, tail, grep, find, chmod, man");
      printLine("wc, sort, ps, kill, top, uname, df");
      printLine("ping, curl, ifconfig, ssh, nslookup");
      printLine("Supports: cmd > file, cmd >> file, cmd | cmd, cmd && cmd");
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
      if (!dir || dir.type !== "dir") { printLine("Error: current directory not found."); break; }
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
      if (!node) { printLine(`cd: no such file or directory: ${target}`); }
      else if (node.type !== "dir") { printLine(`cd: not a directory: ${target}`); }
      else { currentPath = resolved; updatePrompt(); }
      break;
    }

    case "mkdir": {
      const name = args.join(" ").trim();
      if (!name) { printLine("mkdir: missing folder name"); break; }
      const dir = getCurrentDirectoryNode();
      if (dir.children[name]) { printLine(`mkdir: cannot create directory '${name}': File exists`); }
      else { dir.children[name] = { type: "dir", children: {} }; }
      break;
    }

    case "rmdir": {
      const name = args.join(" ").trim();
      if (!name) { printLine("rmdir: missing directory name"); break; }
      const dir = getCurrentDirectoryNode();
      const node = dir.children[name];
      if (!node) { printLine(`rmdir: failed to remove '${name}': No such directory`); }
      else if (node.type !== "dir") { printLine(`rmdir: failed to remove '${name}': Not a directory`); }
      else if (Object.keys(node.children).length > 0) { printLine(`rmdir: failed to remove '${name}': Directory not empty`); }
      else { delete dir.children[name]; }
      break;
    }

    case "touch": {
      const name = args.join(" ").trim();
      if (!name) { printLine("touch: missing file name"); break; }
      const dir = getCurrentDirectoryNode();
      if (!dir.children[name]) { dir.children[name] = { type: "file", content: "", executable: false }; }
      break;
    }

    case "nano": {
      const name = args.join(" ").trim();
      if (!name) { printLine("nano: missing file name"); break; }
      startNano(name);
      break;
    }

    case "cat": {
      const name = args.join(" ").trim();
      if (!name) { printLine("cat: missing file name"); break; }
      const node = getFileInCurrentDir(name);
      if (!node) { printLine(`cat: ${name}: No such file`); }
      else if (node.type !== "file") { printLine(`cat: ${name}: Is a directory`); }
      else { const lines = node.content ? node.content.split("\n") : ["(empty file)"]; lines.forEach(l => printLine(l)); }
      break;
    }

    case "cp": {
      const source = args[0]; const destination = args[1];
      if (!source || !destination) { printLine("cp: usage cp <source> <destination>"); break; }
      const dir = getCurrentDirectoryNode();
      const sourceNode = dir.children[source];
      if (!sourceNode) { printLine(`cp: cannot stat '${source}': No such file`); }
      else if (sourceNode.type !== "file") { printLine(`cp: '${source}' is not a file`); }
      else { dir.children[destination] = { type: "file", content: sourceNode.content, executable: !!sourceNode.executable }; }
      break;
    }

    case "mv": {
      const source = args[0]; const destination = args[1];
      if (!source || !destination) { printLine("mv: usage mv <source> <destination>"); break; }
      const dir = getCurrentDirectoryNode();
      const sourceNode = dir.children[source];
      if (!sourceNode) { printLine(`mv: cannot stat '${source}': No such file or directory`); }
      else { dir.children[destination] = sourceNode; delete dir.children[source]; }
      break;
    }

    case "rm": {
      const name = args.join(" ").trim();
      if (!name) { printLine("rm: missing file name"); break; }
      const dir = getCurrentDirectoryNode();
      const node = dir.children[name];
      if (!node) { printLine(`rm: cannot remove '${name}': No such file`); }
      else if (node.type !== "file") { printLine(`rm: cannot remove '${name}': Is a directory`); }
      else { delete dir.children[name]; }
      break;
    }

    case "head": {
      const name = args.join(" ").trim();
      const node = getFileInCurrentDir(name);
      if (!node || node.type !== "file") { printLine(`head: cannot open '${name}'`); }
      else { node.content.split("\n").slice(0, 2).forEach(l => printLine(l)); }
      break;
    }

    case "tail": {
      const name = args.join(" ").trim();
      const node = getFileInCurrentDir(name);
      if (!node || node.type !== "file") { printLine(`tail: cannot open '${name}'`); }
      else { node.content.split("\n").slice(-2).forEach(l => printLine(l)); }
      break;
    }

    case "grep": {
      const nFlag = args[0] === "-n";
      const searchTerm = nFlag ? args[1] : args[0];
      const fileName = nFlag ? args[2] : args[1];
      if (!searchTerm || !fileName) { printLine("grep: usage grep [-n] <text> <file>"); break; }
      const node = getFileInCurrentDir(fileName);
      if (!node || node.type !== "file") { printLine(`grep: ${fileName}: No such file`); }
      else {
        const matched = node.content.split("\n")
          .map((line, i) => ({ line, i: i + 1 }))
          .filter(({ line }) => line.toLowerCase().includes(searchTerm.toLowerCase()));
        if (matched.length === 0) { printLine("(no matches)"); }
        else { matched.forEach(({ line, i }) => printLine(nFlag ? `${i}: ${line}` : line)); }
      }
      break;
    }

    case "find": {
      const name = args[0];
      if (!name) { printLine("find: usage find <name>"); break; }
      const all = [];
      listAllFiles(fileSystem, "/", all);
      const matches = all.filter(p => p.endsWith(`/${name}`) || p === `/${name}`);
      if (matches.length === 0) { printLine("(no matches)"); }
      else { matches.forEach(m => printLine(m)); }
      break;
    }

    case "chmod": {
      const mode = args[0]; const fileName = args[1];
      if (!mode || !fileName) { printLine("chmod: usage chmod +x <file>"); break; }
      const node = getFileInCurrentDir(fileName);
      if (!node || node.type !== "file") { printLine(`chmod: cannot access '${fileName}'`); }
      else if (mode === "+x") { node.executable = true; printLine(`Permissions updated for ${fileName}`); }
      else if (mode === "-x") { node.executable = false; printLine(`Permissions updated for ${fileName}`); }
      else { printLine("chmod: only +x and -x are supported in this lab"); }
      break;
    }

    case "man": {
      const target = args[0];
      if (!target) { printLine("man: usage man <command>"); }
      else { showManual(target); }
      break;
    }

    case "wc": {
      const lFlag = args[0] === "-l";
      const fileName = lFlag ? args[1] : args[0];
      if (!fileName) { printLine("wc: missing file name"); break; }
      const node = getFileInCurrentDir(fileName);
      if (!node || node.type !== "file") { printLine(`wc: ${fileName}: No such file`); break; }
      const lines = node.content.split("\n");
      if (lFlag) { printLine(`  ${lines.length} ${fileName}`); }
      else {
        const wordCount = node.content.split(/\s+/).filter(w => w.length > 0).length;
        printLine(`  ${lines.length}  ${wordCount}  ${node.content.length} ${fileName}`);
      }
      break;
    }

    case "sort": {
      const fileName = args[0];
      if (!fileName) { printLine("sort: missing file name"); break; }
      const node = getFileInCurrentDir(fileName);
      if (!node || node.type !== "file") { printLine(`sort: ${fileName}: No such file`); break; }
      node.content.split("\n").filter(l => l.trim()).sort().forEach(l => printLine(l));
      break;
    }

    case "ps":
      printLine("  PID TTY          TIME CMD");
      printLine(" 1234 pts/0    00:00:01 bash");
      printLine(" 5678 pts/0    00:00:00 node");
      printLine(" 9012 pts/0    00:00:00 python3");
      printLine(" 9999 pts/0    00:00:00 ps");
      break;

    case "kill": {
      const pid = args[0];
      if (!pid) { printLine("kill: usage kill <pid>"); break; }
      printLine(`[ process ${pid} terminated ]`);
      break;
    }

    case "top":
      printLine("top - Tasks: 4 total, 1 running, 3 sleeping");
      printLine("  PID USER      %CPU %MEM COMMAND");
      printLine(" 1234 student    0.0  0.1 bash");
      printLine(" 5678 student    0.1  0.4 node");
      printLine(" 9012 student    0.0  0.2 python3");
      printLine("[ simulated — type q to dismiss ]");
      break;

    case "uname":
      if (args[0] === "-a") {
        printLine("Linux linxe 5.15.0-linxe #1 SMP Thu Apr  6 09:00:00 UTC 2026 x86_64 GNU/Linux");
      } else {
        printLine("Linux");
      }
      break;

    case "df":
      printLine("Filesystem     1K-blocks   Used Available Use% Mounted on");
      printLine("/dev/sda1       20480000 8524832  10995168  44% /");
      printLine("tmpfs             512000       0    512000   0% /dev/shm");
      break;

    case "ping": {
      const host = args[0];
      if (!host) { printLine("ping: missing host"); break; }
      printLine(`PING ${host}: 56 bytes of data.`);
      printLine(`64 bytes from ${host}: icmp_seq=0 ttl=56 time=12.4 ms`);
      printLine(`64 bytes from ${host}: icmp_seq=1 ttl=56 time=11.8 ms`);
      printLine(`64 bytes from ${host}: icmp_seq=2 ttl=56 time=13.2 ms`);
      printLine(`--- ${host} ping statistics ---`);
      printLine(`3 packets transmitted, 3 received, 0% packet loss`);
      break;
    }

    case "curl": {
      const url = args[0];
      if (!url) { printLine("curl: missing URL"); break; }
      printLine(`  % Total    % Received % Xferd  Average Speed`);
      printLine(`100   148  100   148    0     0   1480      0`);
      printLine(`{"status":"ok","message":"Simulated response from ${url}"}`);
      break;
    }

    case "ifconfig":
      printLine("eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>");
      printLine("      inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255");
      printLine("      inet6 fe80::1  prefixlen 64  scopeid 0x20<link>");
      printLine("lo:   flags=73<UP,LOOPBACK,RUNNING>");
      printLine("      inet 127.0.0.1  netmask 255.0.0.0");
      break;

    case "ssh": {
      const target = args[0];
      if (!target) { printLine("ssh: usage ssh user@host"); break; }
      printLine(`ssh: Connecting to ${target}...`);
      printLine(`ssh: (Simulated) Connection established. Welcome, student!`);
      break;
    }

    case "nslookup": {
      const domain = args[0];
      if (!domain) { printLine("nslookup: missing domain"); break; }
      printLine(`Server:   8.8.8.8`);
      printLine(`Address:  8.8.8.8#53`);
      printLine(`Non-authoritative answer:`);
      printLine(`Name:   ${domain}`);
      printLine(`Address: 142.250.${Math.floor(Math.random()*200)}.${Math.floor(Math.random()*200)}`);
      break;
    }

    default:
      printLine(`Command not found: ${command}. Type 'help'`);
      break;
  }
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

  // Handle && chaining
  if (trimmed.includes(" && ")) {
    trimmed.split(" && ").forEach(cmd => {
      const c = cmd.trim();
      if (c) executeCore(c);
    });
    checkMissionCompletion(trimmed);
    checkChallengeAnswer(trimmed);
    return;
  }

  // Handle pipes
  if (trimmed.includes(" | ")) {
    handlePipe(trimmed);
    checkMissionCompletion(trimmed);
    checkChallengeAnswer(trimmed);
    return;
  }

  // Handle redirects
  if (/ >>? /.test(trimmed)) {
    handleRedirect(trimmed);
    checkMissionCompletion(trimmed);
    checkChallengeAnswer(trimmed);
    return;
  }

  executeCore(trimmed);
  checkMissionCompletion(trimmed);
  checkChallengeAnswer(trimmed);
}

function initTerminal() {
  terminalOutput.innerHTML = "";
  printLine("Welcome to Linxe V8 — Interactive Linux Learning");
  printLine("40 missions · 8 lessons · Pipes · Processes · Networking");
  printLine("Type help to see all commands. Type man <command> for help.");
  printLine("Supports: cmd > file  |  cmd >> file  |  cmd1 | cmd2  |  cmd1 && cmd2");
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

// Copy button for command guide cards
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("copy-cmd-btn")) {
    const example = e.target.dataset.cmd;
    navigator.clipboard.writeText(example).then(() => {
      e.target.textContent = "Copied!";
      setTimeout(() => { e.target.textContent = "Copy"; }, 1500);
    }).catch(() => {
      e.target.textContent = "Copy";
    });
  }
});

renderQuiz();
initTerminal();

// Hero preview typing animation
(function heroType() {
  const lines = [
    { prompt: "student@linxe:~$", cmd: " ls -a" },
    { out: ".bashrc  .secret  Documents  Downloads  hello.txt" },
    { prompt: "student@linxe:~/Documents$", cmd: " cat welcome.txt" },
    { out: "Welcome to Linxe. Linux practice starts here." },
    { prompt: "student@linxe:~$", cmd: " ping google.com" },
    { out: "64 bytes from google.com: icmp_seq=0 ttl=56 time=12.4 ms" },
    { out: "3 packets transmitted, 3 received, 0% packet loss" },
    { out: "" },
    { success: "Mission complete! +30 XP ✅" }
  ];

  const body = document.querySelector(".preview-body");
  if (!body) return;
  body.innerHTML = "";

  let i = 0;
  function next() {
    if (i >= lines.length) {
      setTimeout(() => { body.innerHTML = ""; i = 0; next(); }, 3000);
      return;
    }
    const item = lines[i++];
    const div = document.createElement("div");
    if (item.success) {
      div.className = "success";
      div.textContent = item.success;
      body.appendChild(div);
      setTimeout(next, 900);
    } else if (item.out !== undefined) {
      div.textContent = item.out;
      body.appendChild(div);
      setTimeout(next, 600);
    } else {
      div.innerHTML = `<span class="prompt">${item.prompt}</span><span class="typing-cmd"></span>`;
      body.appendChild(div);
      const span = div.querySelector(".typing-cmd");
      let ci = 0;
      const typeInterval = setInterval(() => {
        span.textContent += item.cmd[ci++];
        if (ci >= item.cmd.length) { clearInterval(typeInterval); setTimeout(next, 400); }
      }, 60);
    }
    body.scrollTop = body.scrollHeight;
  }
  setTimeout(next, 800);
})();
