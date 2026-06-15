import { initKeyboard } from "./features/keyboard/keyboard";
import { initSidebarMenu } from "./features/text-packs/sidebar-menu";
import { TrainingManager } from "./features/shared/manager";

const root = document.getElementById("app");

if (!root) {
  throw new Error("Root element #app not found");
}

const layout = document.createElement("div");
layout.className = "layout";

const sidebarEl = document.createElement("aside");
sidebarEl.className = "sidebar";
sidebarEl.setAttribute("automation-id", "sidebar");

const sidebarHeader = document.createElement("div");
sidebarHeader.className = "sidebar-header";
sidebarHeader.textContent = "Текстовые паки";
sidebarEl.appendChild(sidebarHeader);

const addButton = document.createElement("button");
addButton.className = "sidebar-button";
addButton.textContent = "Добавить задание";
addButton.setAttribute("automation-id", "add-text-button");
sidebarEl.appendChild(addButton);

const packsList = document.createElement("div");
packsList.className = "packs-list";
packsList.setAttribute("data-role", "packs-list");
sidebarEl.appendChild(packsList);

const main = document.createElement("main");
main.className = "main";

const textContainerEl = document.createElement("div");
textContainerEl.className = "text-container";
textContainerEl.setAttribute("automation-id", "text-container");
main.appendChild(textContainerEl);

const progressBar = document.createElement("div");
progressBar.className = "progress-bar";
progressBar.setAttribute("automation-id", "progress-bar");
const progressInnerEl = document.createElement("div");
progressInnerEl.className = "progress-bar-inner";
progressBar.appendChild(progressInnerEl);
main.appendChild(progressBar);

const statsStrip = document.createElement("div");
statsStrip.className = "stats-strip";

const timerEl = document.createElement("span");
timerEl.setAttribute("automation-id", "timer-counter");
timerEl.textContent = "Таймер: 0:00";

const speedEl = document.createElement("span");
speedEl.setAttribute("automation-id", "speed-counter");
speedEl.textContent = "Скорость: 0 зн/мин";

const errorEl = document.createElement("span");
errorEl.setAttribute("automation-id", "error-counter");
errorEl.textContent = "Ошибки: 0";

statsStrip.appendChild(timerEl);
statsStrip.appendChild(speedEl);
statsStrip.appendChild(errorEl);
main.appendChild(statsStrip);

const keyboardContainerEl = document.createElement("div");
keyboardContainerEl.className = "keyboard-container";
keyboardContainerEl.setAttribute("automation-id", "keyboard-container");
main.appendChild(keyboardContainerEl);

layout.appendChild(sidebarEl);
layout.appendChild(main);
root.appendChild(layout);

const trainingManager = new TrainingManager();

const keyboardController = initKeyboard(keyboardContainerEl);
const packsController = initSidebarMenu(sidebarEl, trainingManager);

trainingManager.connectUI({
  textContainerEl,
  progressInnerEl,
  speedEl,
  errorEl,
  timerEl,
  keyboardController,
  packsController,
});

