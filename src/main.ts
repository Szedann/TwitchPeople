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

client.on("raw_message", (message) => {
  if (message.command != "353") return;
  (message.params[3] as string)
    .split(" ")
    .filter((e) => !/justinfan\w*/.test(e))
    .forEach((user: string) => createUser(user));
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

client.on("messagedeleted", (channel, username, message, userState) => {
  document.getElementById(userState["target-msg-id"]!)?.remove();
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
  element.style.translate = `${Math.random() * 5 - 2}px ${
    Math.random() * 5 - 5
  }px`;
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

  if (/piwo/.test(content)) element.classList.add("piwo");

  element.className = "message";

  const { x } = userElement.getBoundingClientRect();

  element.style.top = Math.random() * 15 - 7 + "px";

  // const easterEggElement = document.createElement("img");
  // easterEggElement.src = "src/piwo.png";
  // userElement.children.namedItem("icon")!.appendChild(easterEggElement);

  userElement!.appendChild(element);
  element.style.left =
    Math.min(window.innerWidth - element.clientWidth - x, -20) + "px";
  element.id = author.id!;
  setTimeout(() => {
    element?.remove();
  }, 5000);
};
