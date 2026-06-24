const socket = io("http://20.83.59.110:3000");
const name = localStorage.getItem("name") || "Guest";

socket.emit("join", name);

const messages = document.getElementById("messages");
const users = document.getElementById("users");

function send() {
  const input = document.getElementById("input");
  socket.emit("message", input.value);
  input.value = "";
}

socket.on("message", (data) => {
  const li = document.createElement("li");
  li.textContent = `${data.user}: ${data.text}`;
  messages.appendChild(li);
});

socket.on("users", (list) => {
  users.innerHTML = "";
  list.forEach(u => {
    const li = document.createElement("li");
    li.textContent = u;
    users.appendChild(li);
  });
});
