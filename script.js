
// =====================
// SOCKET
// =====================
const socket = io("https://prophet-sand-interface-volunteers.trycloudflare.com");

// =====================
// AUTH
// =====================
const username = localStorage.getItem("name");

if (!username) {
    window.location.href = "index.html";
}

// =====================
// STATE
// =====================
const state = {
    mode: "global",
    currentDM: null
};

// =====================
// DOM ELEMENTS (GLOBAL CHAT)
// =====================
const messages = document.getElementById("messages");
const users = document.getElementById("users");
const input = document.getElementById("input");
const dmList = document.getElementById("dmList");

// =====================
// CONNECT
// =====================
socket.emit("join", username);

// =====================
// PAGE SWITCHING
// =====================
function openServer() {
    state.mode = "global";
    state.currentDM = null;

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

// ENTER KEY
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
});

// =====================
// RECEIVE GLOBAL MESSAGE
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
// OPEN DM (REAL CHAT WINDOW)
// =====================
function openDM(user) {
    state.mode = "dm";
    state.currentDM = user;

    openDMPage();

    dmList.innerHTML = `
        <div id="dmHeader">
            <h3>💬 Chat with ${user}</h3>
            <button onclick="openServer()">← Back</button>
        </div>

        <ul id="dmMessages"></ul>

        <div id="dmInputArea">
            <input id="dmInputBox" placeholder="message...">
            <button onclick="sendDM()">Send</button>
        </div>
    `;

    loadHistory(user);
}

// =====================
// SEND DM
// =====================
function sendDM() {
    const input = document.getElementById("dmInputBox");
    const text = input.value.trim();
    if (!text) return;

    socket.emit("dmMessage", {
        to: state.currentDM,
        text
    });

    input.value = "";
}

// =====================
// LOAD DM HISTORY
// =====================
function loadHistory(user) {
    socket.emit("getHistory", { user });
}

socket.on("dmHistory", (messages) => {
    const box = document.getElementById("dmMessages");
    if (!box) return;

    box.innerHTML = "";

    messages.forEach(m => {
        const li = document.createElement("li");
        li.textContent = `${m.from}: ${m.text}`;
        box.appendChild(li);
    });
});

// =====================
// GLOBAL FUNCTIONS (IMPORTANT)
// =====================
window.openServer = openServer;
window.openDMPage = openDMPage;
window.openDM = openDM;
window.send = send;
window.sendDM = sendDM;

setInterval(() => {
    fetch("https://letstok-backend.onrender.com")
        .catch(() => {});
}, 60000); // every 60 seconds
