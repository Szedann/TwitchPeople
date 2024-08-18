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
      createUser(user);
    });
  }
  if (message.command != "353") return;
  message.params[3].split(" ").forEach((user: string) => users.add(user));
});

client.on("chat", (_, userState, message) => {
  let element =
    document.getElementById(`user-${userState["display-name"]}`) ??
    createUser(userState["display-name"]!, userState.color);
  if (userState.color)
    (element.children.namedItem("icon")! as HTMLElement).style.backgroundColor =
      userState.color;
  createMessage(element, userState, message);
});

client.on("join", (_, username) => {
  document.getElementById(`user-${username}`) ?? createUser(username);
});

client.on("part", (_, username) => {
  document.getElementById(`user-${username}`)?.remove();
});

const createUser = (username: string, color?: string) => {
  const element = document.createElement("div");
  // element.innerText = "O";
  element.className = "user";
  element.id = `user-${username}`;
  const iconElement = document.createElement("div");
  if (color) iconElement.style.backgroundColor = color;
  iconElement.className = "icon";
  iconElement.setAttribute("name", "icon");
  element.appendChild(iconElement);
  document.getElementById("users")?.appendChild(element);
  return element;
};

const createMessage = (
  userElement: HTMLElement,
  author: tmi.ChatUserstate,
  content: string
) => {
  const element = document.createElement("div");

  const usernameElement = document.createElement("b");
  usernameElement.innerText = author["display-name"]!;
  usernameElement.style.color = author.color!;
  element.appendChild(usernameElement);

  const contentElement = document.createElement("p");
  contentElement.innerText = content;
  element.appendChild(contentElement);

  element.className = "message";

  // const { x, y, right } = userElement.getBoundingClientRect();
  // if (x < right) element.style.left = x + "px";
  // else element.style.right = right + "px";
  // element.style.top = y + "px";

  element.style.top = Math.random() * 15 - 7 + "px";

  userElement!.appendChild(element);
  userElement.classList.add("talking");
  element.id = author.id!;
  setTimeout(() => {
    element.remove();
    userElement.classList.remove("talking");
  }, 5000);
};
