// =====================
// CONFIG
// =====================

const BACKEND_URL = "https://letstok-backendv2.onrender.com";

// =====================
// FIX: prevent duplicate socket connections on reload
// =====================

if (!window.__socket) {
    window.__socket = io(BACKEND_URL);
}

const socket = window.__socket;

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
// DOM
// =====================

const messages = document.getElementById("messages");
const users = document.getElementById("users");
const input = document.getElementById("input");
const dmList = document.getElementById("dmList");

// =====================
// CONNECTION
// =====================

socket.on("connect", () => {

    console.log("CONNECTED");
    console.log("Socket ID:", socket.id);

    socket.emit("join", username);

});

socket.on("disconnect", () => {
    console.log("DISCONNECTED");
});

socket.on("connect_error", (err) => {
    console.log("CONNECT ERROR:");
    console.log(err);
    console.log(err.message);
});

// =====================
// FIX: prevent duplicate event listeners on reload
// =====================

if (!window.__listenersAttached) {
    window.__listenersAttached = true;

    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                send();
            }
        });
    }

    socket.on("message", (data) => {

        console.log("MESSAGE:", data);

        if (state.mode === "dm" && state.currentDM) {

            const dmBox = document.getElementById("dmMessages");

            if (
                dmBox &&
                data.room &&
                data.room.includes(state.currentDM)
            ) {

                const li = document.createElement("li");

                li.innerHTML =
                    `<strong>${data.user}</strong>: ${data.text}`;

                dmBox.appendChild(li);

                dmBox.scrollTop = dmBox.scrollHeight;

                return;
            }
        }

        const li = document.createElement("li");

        const time = new Date(
            data.time || Date.now()
        ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        li.innerHTML = `
            <strong>${data.user}</strong>
            <small style="opacity:.5;margin-left:8px;">
                ${time}
            </small>
            <br>
            ${data.text}
        `;

        messages.appendChild(li);
        messages.scrollTop = messages.scrollHeight;
    });

    socket.on("history", (history) => {

        messages.innerHTML = "";

        history.forEach((msg) => {

            const li = document.createElement("li");

            li.innerHTML = `
                <strong>${msg.user}</strong>
                <br>
                ${msg.text}
            `;

            messages.appendChild(li);

        });

    });

    socket.on("users", (list) => {

        console.log("ONLINE USERS:", list);

        users.innerHTML = "";

        list.forEach((user) => {

            if (user === username) return;

            const li = document.createElement("li");

            li.textContent = "🟢 " + user;

            li.style.cursor = "pointer";

            li.onclick = () => {
                openDM(user);
            };

            users.appendChild(li);

        });

    });

    socket.on("dmHistory", (history) => {

        const dmBox =
            document.getElementById("dmMessages");

        if (!dmBox) return;

        dmBox.innerHTML = "";

        history.forEach((msg) => {

            const li = document.createElement("li");

            li.innerHTML =
                `<strong>${msg.from}</strong>: ${msg.text}`;

            dmBox.appendChild(li);

        });

    });
}

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
// SEND GLOBAL MESSAGE
// =====================

function send() {

    const text = input.value.trim();

    if (!text) return;

    socket.emit("message", text);

    input.value = "";

}

// =====================
// OPEN DM
// =====================

function openDM(user) {

    state.mode = "dm";
    state.currentDM = user;

    openDMPage();

    dmList.innerHTML = `
        <div id="dmHeader">
            <h3>💬 ${user}</h3>

            <button onclick="openServer()">
                ← Back
            </button>
        </div>

        <ul id="dmMessages"></ul>

        <div id="dmInputArea">

            <input
                id="dmInputBox"
                placeholder="Type message..."
            >

            <button onclick="sendDM()">
                Send
            </button>

        </div>
    `;

    socket.emit("joinDM", user);

    socket.emit("getHistory", {
        user
    });

}

// =====================
// SEND DM
// =====================

function sendDM() {

    const box =
        document.getElementById("dmInputBox");

    if (!box) return;

    const text = box.value.trim();

    if (!text) return;

    socket.emit("dmMessage", {
        to: state.currentDM,
        text
    });

    box.value = "";

}

// =====================
// START NEW DM
// =====================

function startDM() {

    const box =
        document.getElementById("dmInput");

    if (!box) return;

    const user = box.value.trim();

    if (!user) return;

    openDM(user);

}

// =====================
// KEEP RENDER AWAKE
// =====================

setInterval(() => {

    fetch(BACKEND_URL)
        .catch(() => {});

}, 60000);

// =====================
// GLOBAL FUNCTIONS
// =====================

window.send = send;
window.sendDM = sendDM;
window.openDM = openDM;
window.openServer = openServer;
window.openDMPage = openDMPage;
window.startDM = startDM;
