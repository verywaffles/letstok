
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
// SOCKET
// =====================
const socket = io("https://letstok-backend.onrender.com");

// =====================
// WAIT FOR DOM (IMPORTANT FIX)
// =====================
window.addEventListener("DOMContentLoaded", () => {

    const messages = document.getElementById("messages");
    const users = document.getElementById("users");
    const input = document.getElementById("input");
    const dmList = document.getElementById("dmList");

    // JOIN
    socket.emit("join", username);

    // SEND MESSAGE
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

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") send();
    });

    // RECEIVE MESSAGE
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

    // USERS
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

    // PAGE SWITCHING
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

    function openDM(user) {
        state.mode = "dm";
        state.currentDM = user;

        openDMPage();

        dmList.innerHTML = `
            <h3>Chat with ${user}</h3>
            <button onclick="openServer()">← Back</button>
            <hr>
            <p>DM ready</p>
        `;

        socket.emit("joinDM", user);
    }

    function startDM() {
        const user = document.getElementById("dmInput").value.trim();
        if (!user) return;
        openDM(user);
    }

    // EXPOSE GLOBAL FUNCTIONS
    window.openServer = openServer;
    window.openDMPage = openDMPage;
    window.openDM = openDM;
    window.startDM = startDM;
    window.send = send;
});
