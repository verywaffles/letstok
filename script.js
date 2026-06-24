const socket = io("https://letstok-backend.onrender.com");

const username = localStorage.getItem("name");

if (!username) {
    window.location.href = "index.html";
}

const messages = document.getElementById("messages");
const users = document.getElementById("users");
const input = document.getElementById("input");

let mode = "global"; // global | dm | group
let targetUser = null;
let groupName = null;

// join global
socket.emit("join", username);

// SEND MESSAGE
function send() {
    const text = input.value.trim();
    if (!text) return;

    if (mode === "global") {
        socket.emit("message", text);
    }

    else if (mode === "dm") {
        socket.emit("dmMessage", {
            to: targetUser,
            text
        });
    }

    else if (mode === "group") {
        socket.emit("groupMessage", {
            group: groupName,
            text
        });
    }

    input.value = "";
}

// ENTER SEND
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
        <small style="opacity:0.5;margin-left:8px;">${time}</small>
        <br>
        ${data.text}
    `;

    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
});

// USERS LIST
socket.on("users", (list) => {
    users.innerHTML = "";

    list.forEach(u => {
        const li = document.createElement("li");
        li.textContent = "🟢 " + u;

        li.onclick = () => startDM(u);

        users.appendChild(li);
    });
});

// MODE SWITCHERS
function openGlobal() {
    mode = "global";
    targetUser = null;
    groupName = null;
}

function startDM(user) {
    mode = "dm";
    targetUser = user;

    socket.emit("joinDM", user);
}

function createGroup() {
    const name = prompt("Group name?");
    if (!name) return;

    mode = "group";
    groupName = name;

    socket.emit("joinGroup", name);
}
