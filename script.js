
// =====================
// SOCKET (MUST LOAD FIRST AFTER CDN)
// =====================
const socket = io("https://letstok-backend.onrender.com");

// =====================
// AUTH
// =====================
const username = localStorage.getItem("name");

if (!username) {
    window.location.href = "index.html";
}

// =====================
// STATE (GLOBAL APP STATE)
// =====================
const state = {
    mode: "global",       // global | dm
    currentDM: null
};

// =====================
// DOM ELEMENTS
// =====================
const messages = document.getElementById("messages");
const users = document.getElementById("users");
const input = document.getElementById("input");
const dmList = document.getElementById("dmList");

// =====================
// JOIN SERVER
// =====================
socket.emit("join", username);

// =====================
// PAGE NAVIGATION
// =====================
function openServer() {
    state.mode = "global";

    document.getElementById("serverPage").classList.remove("hidden");
    document.getElementById("dmPage").classList.add("hidden");
}

function openDMPage() {
    document.getElementById("serverPage").classList.add("hidden");
    document.getElementById("dmPage").classList.remove("hidden");
}

// =====================
// SEND MESSAGE
// =====================
function send() {
    const text = input.value.trim();
    if (!text) return;

    if (state.mode === "global") {
        socket.emit("message", text);
    }

    if (state.mode === "dm" && state.currentDM) {
        socket.emit("dmMessage", {
            to: state.currentDM,
            text
        });
    }

    input.value = "";
}

// Enter key support
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
});

// =====================
// RECEIVE GLOBAL / DM MESSAGES
// =====================
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

// =====================
// ONLINE USERS
// =====================
socket.on("users", (list) => {
    users.innerHTML = "";

    list.forEach(user => {
        if (user === username) return;

        const li = document.createElement("li");
        li.textContent = "🟢 " + user;

        li.onclick = () => openDM(user);

        users.appendChild(li);
    });
});

// =====================
// DM SYSTEM (UI ONLY FOR NOW)
// =====================
function openDM(user) {
    state.mode = "dm";
    state.currentDM = user;

    openDMPage();

    dmList.innerHTML = `
        <h3>Chat with ${user}</h3>
        <button onclick="openServer()">← Back to Server</button>
        <hr>
        <p>DM system active (backend room already working)</p>
    `;

    socket.emit("joinDM", user);
}

// =====================
// START DM FROM INPUT
// =====================
function startDM() {
    const user = document.getElementById("dmInput").value.trim();
    if (!user) return;

    openDM(user);
}

// =====================
// GLOBAL EXPOSURE (IMPORTANT FOR HTML BUTTONS)
// =====================
window.openServer = openServer;
window.openDMPage = openDMPage;
window.send = send;
window.startDM = startDM;
window.openDM = openDM;

