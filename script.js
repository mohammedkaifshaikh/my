/* =========================================
   TASKORA
   ADVANCED TODO APP
========================================= */


/* ================= STORAGE ================= */

const STORAGE_KEY = "taskora_tasks_v1";
const STREAK_KEY = "taskora_streak_v1";
const THEME_KEY = "taskora_theme_v1";


let tasks =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];


let currentFilter = "all";

let searchTerm = "";

let editingTaskId = null;


/* ================= DOM ================= */

const taskForm =
    document.getElementById("taskForm");

const taskTitle =
    document.getElementById("taskTitle");

const taskCategory =
    document.getElementById("taskCategory");

const taskPriority =
    document.getElementById("taskPriority");

const taskDate =
    document.getElementById("taskDate");

const taskTime =
    document.getElementById("taskTime");

const taskNotes =
    document.getElementById("taskNotes");

const taskImportant =
    document.getElementById("taskImportant");

const tasksList =
    document.getElementById("tasksList");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const progressText =
    document.getElementById("progressText");

const ringNumber =
    document.getElementById("ringNumber");

const progressCircle =
    document.getElementById("progressCircle");

const progressMessage =
    document.getElementById("progressMessage");

const totalTasks =
    document.getElementById("totalTasks");

const completedTasks =
    document.getElementById("completedTasks");

const pendingTasks =
    document.getElementById("pendingTasks");

const overdueTasks =
    document.getElementById("overdueTasks");

const taskCountText =
    document.getElementById("taskCountText");

const toastContainer =
    document.getElementById("toastContainer");

const celebrationOverlay =
    document.getElementById("celebrationOverlay");

const celebrationTitle =
    document.getElementById("celebrationTitle");

const celebrationMessage =
    document.getElementById("celebrationMessage");

const confettiContainer =
    document.getElementById("confettiContainer");


/* ================= INITIALIZE ================= */

document.addEventListener("DOMContentLoaded", () => {

    loadTheme();

    setToday();

    renderTasks();

    updateDashboard();

    updateClock();

    setInterval(updateClock, 1000);

    setInterval(checkOverdueTasks, 30000);

});


/* ================= DATE ================= */

function setToday() {

    const now = new Date();

    document.getElementById("todayDay")
        .textContent =
        now.toLocaleDateString(
            "en-IN",
            { weekday: "long" }
        );

    document.getElementById("todayDate")
        .textContent =
        now.toLocaleDateString(
            "en-IN",
            {
                month: "short",
                day: "numeric"
            }
        );

    const localDate =
        now.toISOString().split("T")[0];

    taskDate.min = localDate;

}


/* ================= CLOCK ================= */

function updateClock() {

    const now = new Date();

    document.getElementById("liveClock")
        .textContent =
        now.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

}


/* ================= SAVE ================= */

function saveTasks() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );

}


/* ================= CREATE TASK ================= */

taskForm.addEventListener("submit", function(e) {

    e.preventDefault();

    const title =
        taskTitle.value.trim();

    if (!title) {

        showToast(
            "⚠️ Please enter a task name.",
            "warning"
        );

        taskTitle.focus();

        return;
    }


    const task = {

        id: Date.now(),

        title,

        category:
            taskCategory.value,

        priority:
            taskPriority.value,

        date:
            taskDate.value,

        time:
            taskTime.value,

        notes:
            taskNotes.value.trim(),

        important:
            taskImportant.checked,

        completed:
            false,

        createdAt:
            new Date().toISOString(),

        completedAt:
            null
    };


    tasks.unshift(task);

    saveTasks();

    renderTasks();

    updateDashboard();

    taskForm.reset();

    showToast(
        "✅ Task added successfully!",
        "success"
    );

    taskTitle.focus();

});


/* ================= RENDER ================= */

function renderTasks() {

    let filtered =
        getFilteredTasks();

    tasksList.innerHTML = "";

    if (filtered.length === 0) {

        emptyState.style.display =
            "block";

        return;

    }

    emptyState.style.display =
        "none";


    filtered.forEach((task, index) => {

        const card =
            createTaskCard(task, index);

        tasksList.appendChild(card);

    });


    updateTaskCount(filtered.length);

}


/* ================= FILTER ================= */

function getFilteredTasks() {

    let result =
        [...tasks];


    if (currentFilter === "active") {

        result =
            result.filter(
                task => !task.completed
            );

    }


    if (currentFilter === "completed") {

        result =
            result.filter(
                task => task.completed
            );

    }


    if (currentFilter === "important") {

        result =
            result.filter(
                task => task.important
            );

    }


    if (currentFilter === "overdue") {

        result =
            result.filter(
                task =>
                    !task.completed &&
                    isOverdue(task)
            );

    }


    if (searchTerm) {

        const query =
            searchTerm.toLowerCase();

        result =
            result.filter(task =>

                task.title
                    .toLowerCase()
                    .includes(query)

                ||

                task.category
                    .toLowerCase()
                    .includes(query)

                ||

                task.notes
                    .toLowerCase()
                    .includes(query)

            );

    }


    return result;

}


/* ================= CREATE CARD ================= */

function createTaskCard(task, index) {

    const card =
        document.createElement("article");

    card.className =
        "task-card" +
        (task.completed ? " completed" : "");

    card.style.animationDelay =
        `${index * 0.04}s`;


    const dueText =
        getDueText(task);

    const overdue =
        isOverdue(task);


    card.innerHTML = `

        <button
            class="task-check"
            aria-label="Complete task"
            data-action="complete"
            data-id="${task.id}"
        >
            ✓
        </button>


        <div class="task-main">

            <div class="task-title-row">

                <h3 class="task-title">
                    ${escapeHTML(task.title)}
                </h3>

                ${
                    task.important
                    ?
                    `<span class="star">★</span>`
                    :
                    ""
                }

            </div>


            <div class="task-meta">

                <span class="badge">
                    ${getCategoryIcon(task.category)}
                    ${escapeHTML(task.category)}
                </span>

                <span class="priority ${task.priority}">
                    ${getPriorityText(task.priority)}
                </span>

                ${
                    dueText
                    ?
                    `<span class="due-date ${overdue ? "overdue" : ""}">
                        ${dueText}
                    </span>`
                    :
                    ""
                }

            </div>


            ${
                task.notes
                ?
                `<div class="task-progress">
                    <div style="width:${task.completed ? 100 : 20}%"></div>
                </div>`
                :
                ""
            }

        </div>


        <div class="task-actions">

            ${
                !task.completed
                ?
                `<button
                    class="task-action"
                    title="Start focus timer"
                    data-action="timer"
                    data-id="${task.id}"
                >
                    ⏱️
                </button>`
                :
                ""
            }


            <button
                class="task-action"
                title="View details"
                data-action="view"
                data-id="${task.id}"
            >
                👁
            </button>


            <button
                class="task-action"
                title="Edit task"
                data-action="edit"
                data-id="${task.id}"
            >
                ✏️
            </button>


            <button
                class="task-action"
                title="Delete task"
                data-action="delete"
                data-id="${task.id}"
            >
                🗑
            </button>

        </div>

    `;


    return card;

}


/* ================= TASK ACTIONS ================= */

tasksList.addEventListener("click", function(e) {

    const button =
        e.target.closest("[data-action]");

    if (!button) return;


    const id =
        Number(button.dataset.id);

    const action =
        button.dataset.action;


    if (action === "complete") {

        completeTask(id);

    }


    if (action === "delete") {

        deleteTask(id);

    }


    if (action === "edit") {

        editTask(id);

    }


    if (action === "view") {

        viewTask(id);

    }


    if (action === "timer") {

        openTimer(id);

    }

});


/* ================= COMPLETE ================= */

function completeTask(id) {

    const task =
        tasks.find(t => t.id === id);

    if (!task) return;


    if (task.completed) return;


    task.completed = true;

    task.completedAt =
        new Date().toISOString();


    saveTasks();

    renderTasks();

    updateDashboard();

    updateStreak();


    celebrateTask(task);

}


/* ================= DELETE ================= */

function deleteTask(id) {

    const task =
        tasks.find(t => t.id === id);

    if (!task) return;


    const confirmed =
        confirm(
            `Delete "${task.title}"?`
        );


    if (!confirmed) return;


    tasks =
        tasks.filter(
            t => t.id !== id
        );


    saveTasks();

    renderTasks();

    updateDashboard();


    showToast(
        "🗑️ Task deleted.",
        "success"
    );

}


/* ================= EDIT ================= */

function editTask(id) {

    const task =
        tasks.find(t => t.id === id);

    if (!task) return;


    taskTitle.value =
        task.title;

    taskCategory.value =
        task.category;

    taskPriority.value =
        task.priority;

    taskDate.value =
        task.date;

    taskTime.value =
        task.time;

    taskNotes.value =
        task.notes;

    taskImportant.checked =
        task.important;


    tasks =
        tasks.filter(
            t => t.id !== id
        );


    saveTasks();

    renderTasks();

    updateDashboard();


    document
        .querySelector(".add-task-card")
        .scrollIntoView({
            behavior: "smooth"
        });


    showToast(
        "✏️ Task loaded for editing. Save it as a new task.",
        "success"
    );

}


/* ================= VIEW TASK ================= */

function viewTask(id) {

    const task =
        tasks.find(t => t.id === id);

    if (!task) return;


    document.getElementById("modalTitle")
        .textContent =
        task.title;


    document.getElementById("modalContent")
        .innerHTML = `

            <div style="
                display:grid;
                gap:15px;
                margin-top:20px;
            ">

                <div>
                    <small style="color:var(--muted)">
                        Category
                    </small>

                    <p>
                        ${getCategoryIcon(task.category)}
                        ${escapeHTML(task.category)}
                    </p>
                </div>


                <div>
                    <small style="color:var(--muted)">
                        Priority
                    </small>

                    <p>
                        ${getPriorityText(task.priority)}
                    </p>
                </div>


                <div>
                    <small style="color:var(--muted)">
                        Due
                    </small>

                    <p>
                        ${getDueText(task) || "No deadline"}
                    </p>
                </div>


                <div>
                    <small style="color:var(--muted)">
                        Status
                    </small>

                    <p>
                        ${
                            task.completed
                            ?
                            "✅ Completed"
                            :
                            "⏳ Pending"
                        }
                    </p>
                </div>


                ${
                    task.notes
                    ?
                    `<div>
                        <small style="color:var(--muted)">
                            Notes
                        </small>

                        <p style="line-height:1.7">
                            ${escapeHTML(task.notes)}
                        </p>
                    </div>`
                    :
                    ""
                }

            </div>
        `;


    document
        .getElementById("taskModal")
        .classList.add("show");

}


/* ================= MODAL ================= */

document
    .getElementById("modalClose")
    .addEventListener("click", () => {

        document
            .getElementById("taskModal")
            .classList.remove("show");

    });


document
    .getElementById("taskModal")
    .addEventListener("click", e => {

        if (
            e.target.id === "taskModal"
        ) {

            e.currentTarget
                .classList.remove("show");

        }

    });


/* ================= DASHBOARD ================= */

function updateDashboard() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            t => t.completed
        ).length;

    const pending =
        total - completed;

    const overdue =
        tasks.filter(
            t =>
                !t.completed &&
                isOverdue(t)
        ).length;


    let percentage = 0;

    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) * 100
            );

    }


    totalTasks.textContent =
        total;

    completedTasks.textContent =
        completed;

    pendingTasks.textContent =
        pending;

    overdueTasks.textContent =
        overdue;


    progressText.textContent =
        `${percentage}%`;

    ringNumber.textContent =
        `${percentage}%`;


    const circumference =
        2 * Math.PI * 50;

    const offset =
        circumference -
        (percentage / 100) * circumference;


    progressCircle.style.strokeDasharray =
        circumference;

    progressCircle.style.strokeDashoffset =
        offset;


    if (percentage === 0) {

        progressMessage.textContent =
            "Let's get started! 🚀";

    } else if (percentage < 50) {

        progressMessage.textContent =
            "Nice start. Keep going! 💪";

    } else if (percentage < 100) {

        progressMessage.textContent =
            "You're more than halfway! 🔥";

    } else {

        progressMessage.textContent =
            "Perfect day! You crushed it! 🏆";

    }

}


/* ================= COUNT ================= */

function updateTaskCount(count) {

    taskCountText.textContent =
        `${count} ${count === 1 ? "task" : "tasks"}`;

}


/* ================= OVERDUE ================= */

function isOverdue(task) {

    if (
        task.completed ||
        !task.date
    ) return false;


    let deadline =
        task.date;


    if (task.time) {

        deadline +=
            `T${task.time}`;

    } else {

        deadline +=
            "T23:59";

    }


    return new Date(deadline) < new Date();

}


function getDueText(task) {

    if (!task.date) {

        return "";

    }


    const date =
        new Date(
            task.date + "T00:00"
        );


    const dateText =
        date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short"
            }
        );


    if (task.time) {

        return `📅 ${dateText} • ${task.time}`;

    }


    return `📅 ${dateText}`;

}


function checkOverdueTasks() {

    renderTasks();

    updateDashboard();

}


/* ================= SEARCH ================= */

searchInput.addEventListener(
    "input",
    function() {

        searchTerm =
            this.value.trim();

        renderTasks();

    }
);


/* ================= FILTERS ================= */

document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(
                        ".filter-btn"
                    )
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );


                this.classList.add("active");


                currentFilter =
                    this.dataset.filter;


                renderTasks();

            }
        );

    });


/* ================= CLEAR COMPLETED ================= */

document
    .getElementById("clearCompletedBtn")
    .addEventListener("click", () => {

        const completed =
            tasks.filter(
                t => t.completed
            ).length;


        if (!completed) {

            showToast(
                "There are no completed tasks.",
                "warning"
            );

            return;

        }


        if (
            !confirm(
                `Remove ${completed} completed task(s)?`
            )
        ) return;


        tasks =
            tasks.filter(
                t => !t.completed
            );


        saveTasks();

        renderTasks();

        updateDashboard();


        showToast(
            "🧹 Completed tasks cleared.",
            "success"
        );

    });


/* ================= COLLAPSE FORM ================= */

document
    .getElementById("collapseFormBtn")
    .addEventListener("click", function() {

        taskForm.classList.toggle(
            "collapsed"
        );


        this.textContent =
            taskForm.classList.contains(
                "collapsed"
            )
            ?
            "+"
            :
            "−";

    });


/* ================= THEME ================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        );


    if (theme === "dark") {

        document.body.classList.add("dark");

        document.getElementById("themeBtn")
            .textContent = "☀️";

    }

}


document
    .getElementById("themeBtn")
    .addEventListener("click", () => {

        document.body.classList.toggle("dark");


        const dark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            THEME_KEY,
            dark ? "dark" : "light"
        );


        document.getElementById("themeBtn")
            .textContent =
            dark ? "☀️" : "🌙";

    });


/* ================= NOTIFICATIONS ================= */

document
    .getElementById("notificationBtn")
    .addEventListener("click", async () => {

        if (!("Notification" in window)) {

            showToast(
                "Your browser doesn't support notifications.",
                "warning"
            );

            return;

        }


        const permission =
            await Notification.requestPermission();


        if (permission === "granted") {

            new Notification(
                "Taskora 🔔",
                {
                    body:
                        "Notifications are now enabled!"
                }
            );


            showToast(
                "🔔 Notifications enabled!",
                "success"
            );

        } else {

            showToast(
                "Notification permission was not granted.",
                "warning"
            );

        }

    });


/* ================= TIMER ================= */

let timerInterval = null;

let timerSeconds = 25 * 60;

let timerTotalSeconds = 25 * 60;

let timerRunning = false;

let activeTimerTask = null;


function openTimer(id) {

    const task =
        tasks.find(t => t.id === id);

    if (!task) return;


    activeTimerTask =
        task;


    document.getElementById(
        "timerTaskName"
    ).textContent =
        task.title;


    timerSeconds =
        25 * 60;

    timerTotalSeconds =
        25 * 60;

    timerRunning =
        false;


    clearInterval(timerInterval);


    updateTimerDisplay();


    document
        .getElementById("timerModal")
        .classList.add("show");

}


/* TIMER START / PAUSE */

document
    .getElementById("timerStartPause")
    .addEventListener("click", () => {

        if (timerRunning) {

            pauseTimer();

        } else {

            startTimer();

        }

    });


function startTimer() {

    timerRunning = true;


    document
        .getElementById("timerStartPause")
        .textContent = "Ⅱ";


    timerInterval =
        setInterval(() => {

            timerSeconds--;

            updateTimerDisplay();


            if (timerSeconds <= 0) {

                timerFinished();

            }

        }, 1000);

}


function pauseTimer() {

    timerRunning = false;

    clearInterval(timerInterval);


    document
        .getElementById("timerStartPause")
        .textContent = "▶";

}


function resetTimer() {

    pauseTimer();

    timerSeconds =
        timerTotalSeconds;

    updateTimerDisplay();

}


document
    .getElementById("timerReset")
    .addEventListener(
        "click",
        resetTimer
    );


/* ADD MINUTE */

document
    .getElementById("timerAddMinute")
    .addEventListener("click", () => {

        timerSeconds += 60;

        timerTotalSeconds += 60;

        updateTimerDisplay();


        showToast(
            "⏱️ Added 1 minute.",
            "success"
        );

    });


/* PRESETS */

document
    .querySelectorAll(
        ".timer-presets button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const minutes =
                    Number(
                        button.dataset.minutes
                    );


                pauseTimer();


                timerSeconds =
                    minutes * 60;

                timerTotalSeconds =
                    minutes * 60;


                updateTimerDisplay();

            }
        );

    });


/* TIMER DISPLAY */

function updateTimerDisplay() {

    const minutes =
        Math.floor(
            timerSeconds / 60
        );

    const seconds =
        timerSeconds % 60;


    document.getElementById(
        "timerDisplay"
    ).textContent =

        `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;


    const progress =
        100 -
        (
            timerSeconds /
            timerTotalSeconds
        ) * 100;


    document.getElementById(
        "timerProgressBar"
    ).style.width =
        `${progress}%`;

}


function timerFinished() {

    clearInterval(timerInterval);

    timerRunning = false;


    document
        .getElementById("timerStartPause")
        .textContent = "▶";


    playAlarm();


    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        new Notification(
            "⏰ Focus session complete!",
            {
                body:
                    activeTimerTask
                    ?
                    `${activeTimerTask.title} — time is up!`
                    :
                    "Your focus session is complete."
            }
        );

    }


    showToast(
        "⏰ Time's up! Great work!",
        "success"
    );


    setTimeout(() => {

        if (activeTimerTask) {

            celebrateTask(activeTimerTask);

        }

    }, 500);

}


/* ================= ALARM ================= */

function playAlarm() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        const context =
            new AudioContext();


        const oscillator =
            context.createOscillator();

        const gain =
            context.createGain();


        oscillator.connect(gain);

        gain.connect(
            context.destination
        );


        oscillator.frequency.value =
            880;

        oscillator.type =
            "sine";


        gain.gain.setValueAtTime(
            0.001,
            context.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.35,
            context.currentTime + 0.05
        );


        gain.gain.exponentialRampToValueAtTime(
            0.001,
            context.currentTime + 0.5
        );


        oscillator.start();

        oscillator.stop(
            context.currentTime + 0.5
        );


        setTimeout(() => {

            playSecondBeep();

        }, 600);

    } catch (error) {

        console.log(
            "Alarm audio unavailable."
        );

    }

}


function playSecondBeep() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        const context =
            new AudioContext();


        const oscillator =
            context.createOscillator();

        const gain =
            context.createGain();


        oscillator.connect(gain);

        gain.connect(
            context.destination
        );


        oscillator.frequency.value =
            660;

        oscillator.type =
            "sine";


        gain.gain.setValueAtTime(
            0.3,
            context.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.001,
            context.currentTime + 0.6
        );


        oscillator.start();

        oscillator.stop(
            context.currentTime + 0.6
        );

    } catch (error) {

        console.log(error);

    }

}


/* CLOSE TIMER */

document
    .getElementById("timerClose")
    .addEventListener("click", () => {

        pauseTimer();

        document
            .getElementById("timerModal")
            .classList.remove("show");

    });


/* ================= CELEBRATION ================= */

function celebrateTask(task) {

    const completedCount =
        tasks.filter(
            t => t.completed
        ).length;


    if (tasks.length === 1) {

        celebrationTitle.textContent =
            "1st Task Complete! 🎉";

        celebrationMessage.textContent =
            "You started strong! Every big achievement begins with one small win.";

    } else if (
        completedCount === tasks.length
    ) {

        celebrationTitle.textContent =
            "YOU DID IT! 🏆";

        celebrationMessage.textContent =
            "100% complete! You absolutely crushed today's tasks!";

    } else {

        celebrationTitle.textContent =
            "Task Complete! 🎉";

        celebrationMessage.textContent =
            `"${task.title}" is done! That's another win for you. Keep going!`;

    }


    celebrationOverlay
        .classList.add("show");


    createConfetti();

}


/* ================= CELEBRATION CLOSE ================= */

document
    .getElementById("celebrationClose")
    .addEventListener("click", () => {

        celebrationOverlay
            .classList.remove("show");

        confettiContainer.innerHTML = "";

    });


celebrationOverlay
    .addEventListener("click", e => {

        if (
            e.target === celebrationOverlay
        ) {

            celebrationOverlay
                .classList.remove("show");

            confettiContainer.innerHTML = "";

        }

    });


/* ================= CONFETTI ================= */

function createConfetti() {

    confettiContainer.innerHTML = "";


    const symbols = [
        "✦",
        "◆",
        "●",
        "★",
        "✧"
    ];


    for (
        let i = 0;
        i < 80;
        i++
    ) {

        const piece =
            document.createElement("div");


        piece.className =
            "confetti";


        piece.textContent =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];


        piece.style.left =
            `${Math.random() * 100}%`;


        piece.style.fontSize =
            `${8 + Math.random() * 10}px`;


        piece.style.animationDuration =
            `${2 + Math.random() * 3}s`;


        piece.style.animationDelay =
            `${Math.random() * .8}s`;


        piece.style.transform =
            `rotate(${Math.random() * 360}deg)`;


        confettiContainer
            .appendChild(piece);

    }

}


/* ================= STREAK ================= */

function updateStreak() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    let streakData =
        JSON.parse(
            localStorage.getItem(
                STREAK_KEY
            )
        ) ||
        {
            streak: 0,
            lastDate: null
        };


    if (
        streakData.lastDate === today
    ) {

        return;

    }


    const yesterday =
        new Date();


    yesterday.setDate(
        yesterday.getDate() - 1
    );


    const yesterdayString =
        yesterday
            .toISOString()
            .split("T")[0];


    if (
        streakData.lastDate ===
        yesterdayString
    ) {

        streakData.streak++;

    } else {

        streakData.streak = 1;

    }


    streakData.lastDate =
        today;


    localStorage.setItem(
        STREAK_KEY,
        JSON.stringify(streakData)
    );


    document.getElementById(
        "streakNumber"
    ).textContent =
        streakData.streak;

}


function loadStreak() {

    const data =
        JSON.parse(
            localStorage.getItem(
                STREAK_KEY
            )
        );


    if (data) {

        document.getElementById(
            "streakNumber"
        ).textContent =
            data.streak || 0;

    }

}


loadStreak();


/* ================= TOAST ================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.createElement("div");


    toast.className =
        "toast";


    const icon =
        type === "warning"
        ?
        "⚠️"
        :
        "✓";


    toast.innerHTML = `

        <strong>
            ${icon}
        </strong>

        <span>
            ${escapeHTML(message)}
        </span>

    `;


    toastContainer
        .appendChild(toast);


    setTimeout(() => {

        toast.classList.add("hide");


        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}


/* ================= HELPERS ================= */

function getCategoryIcon(category) {

    const icons = {

        Personal: "👤",

        Work: "💼",

        Study: "📚",

        Health: "❤️",

        Shopping: "🛒"

    };


    return icons[category] || "📌";

}


function getPriorityText(priority) {

    const map = {

        low: "LOW",

        medium: "MEDIUM",

        high: "HIGH"

    };


    return map[priority] || priority;

}


function escapeHTML(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ================= KEYBOARD ================= */

document.addEventListener(
    "keydown",
    e => {

        /*
            Ctrl + K
            Search
        */

        if (
            (e.ctrlKey || e.metaKey) &&
            e.key.toLowerCase() === "k"
        ) {

            e.preventDefault();

            searchInput.focus();

        }


        /*
            Escape
            Close modals
        */

        if (e.key === "Escape") {

            document
                .querySelectorAll(
                    ".modal-overlay.show, .celebration-overlay.show"
                )
                .forEach(modal => {

                    modal.classList.remove(
                        "show"
                    );

                });

        }

    }
);


/* ================= AUTO SAVE ================= */

window.addEventListener(
    "beforeunload",
    saveTasks
);
