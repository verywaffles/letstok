const socket = io("http://20.83.59.110:3000")

const username = localStorage.getItem("name");

if (!username) {
    window.location.href = "index.html";
}

const messages = document.getElementById("messages");
const users = document.getElementById("users");
const input = document.getElementById("input");

// Tell server who we are
socket.emit("join", username);

// Send message
function send() {
    const text = input.value.trim();

    if (text === "") return;

    socket.emit("message", text);

    input.value = "";
}

// Press Enter to send
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        send();
    }
});

// Receive messages
socket.on("message", (data) => {
    const li = document.createElement("li");

    const time = new Date(data.time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    li.innerHTML = `
        <strong>${data.user}</strong>
        <small style="opacity:.6;margin-left:8px;">${time}</small>
        <br>
        ${data.text}
    `;

    messages.appendChild(li);

    messages.scrollTop = messages.scrollHeight;
});

// Update online users list
socket.on("users", (onlineUsers) => {
    users.innerHTML = "";

    onlineUsers.forEach((user) => {
        const li = document.createElement("li");

        li.innerHTML = `
            🟢 ${user}
        `;

        users.appendChild(li);
    });
});

// Connection status
socket.on("connect", () => {
    console.log("Connected to LetsTok");
});

socket.on("disconnect", () => {
    console.log("Disconnected from LetsTok");
});
