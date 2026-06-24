const socket = io("https://letstok-backend.onrender.com")

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
    console.log("RECEIVED:", data);

    const li = document.createElement("li");

    li.style.color = "red";
    li.style.fontSize = "24px";

    li.textContent = "TEST MESSAGE";

    messages.appendChild(li);
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
