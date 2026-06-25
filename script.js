const socket = io("https://letstok-backend.onrender.com");

// ======================
// AUTH
// ======================
const username = localStorage.getItem("name");

if (!username) {
    window.location.href = "index.html";
}

// ======================
// ELEMENTS
// ======================
const messages = document.getElementById("messages");
const users = document.getElementById("users");
const input = document.getElementById("input");
const dmList = document.getElementById("dmList");

// ======================
// STATE
// ======================
let mode = "global"; // global | dm
let currentDMUser = null;
let dmChats = {}; // store DM history locally

// ======================
// JOIN SERVER
// ======================
socket.emit("join", username);

// ======================
// PAGE SWITCHING
// ======================
function openServer() {
    document.getElementById("serverPage").style.display = "flex";
    document.getElementById("dmPage").style.display = "none";
    mode = "global";
    currentDMUser = null;
}

function openDMPage() {
    document.getElementById("serverPage").style.display = "none";
    document.getElementById("dmPage").style.display = "block";
}

// ======================
// SEND MESSAGE
// ======================
function send() {
    const text = input.value.trim();
    if (!text) return;

    if (mode === "global") {
        socket.emit("message", text);
    }

    if (mode === "dm" && currentDMUser) {
        socket.emit("dmMessage", {
            to: currentDMUser,
            text
        });
    }

    input.value = "";
}

// Enter key
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
});

// ======================
// RECEIVE GLOBAL / DM MESSAGES
// ======================
socket.on("message", (data) => {
    const li = document.createElement("li");

    const time = new Date(data.time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    li.innerHTML = `
        <strong>${data.user}</strong>
        <small style="opacity:0.5; margin-left:8px;">${time}</small>
        <br>
        ${data.text}
    `;

    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
});

// ======================
// ONLINE USERS
// ======================
socket.on("users", (list) => {
    users.innerHTML = "";

    list.forEach(u => {
        if (u === username) return;

        const li = document.createElement("li");
        li.textContent = "🟢 " + u;

        li.onclick = () => openDM(u);

        users.appendChild(li);
    });
});

// ======================
// DM SYSTEM (FRONTEND UI)
// ======================
function openDM(user) {
    mode = "dm";
    currentDMUser = user;

    // switch page
    openDMPage();

    // show DM header
    dmList.innerHTML = `
        <h3>Chat with ${user}</h3>
        <button onclick="backToGlobal()">← Back</button>
    `;

    socket.emit("joinDM", user);
}

function backToGlobal() {
    openServer();
}

// ======================
// DM CREATE (from input box)
// ======================
function startDM() {
    const user = document.getElementById("dmInput").value.trim();
    if (!user) return;

    openDM(user);
}

// ======================
// GLOBAL FUNCTIONS (MAKE BUTTONS WORK IN HTML)
// ======================
window.openServer = openServer;
window.openDMPage = openDMPage;
window.startDM = startDM;
window.send = send;
window.backToGlobal = backToGlobal;
