import "./style.css";
import tmi from "tmi.js";

if (!new URLSearchParams(window.location.search).has("user")) {
  document.getElementById("app")!.innerHTML =
    "twitch user not provided.<br> add <code>?user=username</code> to the url";
  throw "twitch user not provided";
}

const client = tmi.Client({
  channels: [new URLSearchParams(window.location.search).get("user")!],
});

client.connect();

let users = new Set<string>();
client.on("raw_message", (message) => {
  if (message.command == "366") {
    console.log(users);
    users.forEach((user) => {
      createElement(user);
    });
  }
  if (message.command != "353") return;
  message.params[3].split(" ").forEach((user: string) => users.add(user));
});

client.on("chat", (_, userState, message) => {
  let element =
    document.getElementById(`user-${userState["display-name"]}`) ??
    createElement(userState["display-name"]!, userState.color);
  if (userState.color) element.style.backgroundColor = userState.color;
  createMessage(element, userState["display-name"]!, message);
});

const createElement = (username: string, color?: string) => {
  const element = document.createElement("div");
  // element.innerText = "O";
  element.className = "user";
  element.id = `user-${username}`;
  if (color) element.style.backgroundColor = color;
  document.getElementById("users")?.appendChild(element);
  return element;
};

const createMessage = (
  userElement: HTMLElement,
  author: string,
  content: string
) => {
  const element = document.createElement("div");

  const usernameElement = document.createElement("b");
  usernameElement.innerText = author;
  usernameElement.style.color = userElement.style.backgroundColor;
  element.appendChild(usernameElement);

  const contentElement = document.createElement("p");
  contentElement.innerText = content;
  element.appendChild(contentElement);

  element.className = "message";
  let { x, y } = userElement.getBoundingClientRect();
  element.style.left = x + "px";
  element.style.top = y + "px";
  userElement.parentElement?.appendChild(element);
  userElement.classList.add("talking");
  setTimeout(() => {
    element.remove();
    userElement.classList.remove("talking");
  }, 5000);
};
