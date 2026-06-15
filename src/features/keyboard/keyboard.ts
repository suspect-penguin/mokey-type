export type Language = "ru" | "en";

export interface KeyboardController {
  setLayout(language: Language): void;
  highlightKey(code: string, isError: boolean): void;
  releaseKey(code: string): void;
  reset(): void;
}

interface KeyTemplate {
  code: string;
  label: string;
  wide?: boolean;
  space?: boolean;
}

type KeyboardLayout = KeyTemplate[][];

const ruLayout: KeyboardLayout = [
  [
    { code: "Escape", label: "Esc" },
    { code: "F1", label: "F1" },
    { code: "F2", label: "F2" },
    { code: "F3", label: "F3" },
    { code: "F4", label: "F4" },
    { code: "F5", label: "F5" },
    { code: "F6", label: "F6" },
    { code: "F7", label: "F7" },
    { code: "F8", label: "F8" },
    { code: "F9", label: "F9" },
    { code: "F10", label: "F10" },
    { code: "F11", label: "F11" },
    { code: "F12", label: "F12" },
  ],
  [
    { code: "Backquote", label: "Ё" },
    { code: "Digit1", label: "1" },
    { code: "Digit2", label: "2" },
    { code: "Digit3", label: "3" },
    { code: "Digit4", label: "4" },
    { code: "Digit5", label: "5" },
    { code: "Digit6", label: "6" },
    { code: "Digit7", label: "7" },
    { code: "Digit8", label: "8" },
    { code: "Digit9", label: "9" },
    { code: "Digit0", label: "0" },
    { code: "Minus", label: "-" },
    { code: "Equal", label: "=" },
    { code: "Backspace", label: "←", wide: true },
  ],
  [
    { code: "Tab", label: "→|" },
    { code: "KeyQ", label: "Й" },
    { code: "KeyW", label: "Ц" },
    { code: "KeyE", label: "У" },
    { code: "KeyR", label: "К" },
    { code: "KeyT", label: "Е" },
    { code: "KeyY", label: "Н" },
    { code: "KeyU", label: "Г" },
    { code: "KeyI", label: "Ш" },
    { code: "KeyO", label: "Щ" },
    { code: "KeyP", label: "З" },
    { code: "BracketLeft", label: "Х" },
    { code: "BracketRight", label: "Ъ" },
    { code: "Backslash", label: "\\" },
  ],
  [
    { code: "CapsLock", label: "CapsLock", wide: true },
    { code: "KeyA", label: "Ф" },
    { code: "KeyS", label: "Ы" },
    { code: "KeyD", label: "В" },
    { code: "KeyF", label: "А" },
    { code: "KeyG", label: "П" },
    { code: "KeyH", label: "Р" },
    { code: "KeyJ", label: "О" },
    { code: "KeyK", label: "Л" },
    { code: "KeyL", label: "Д" },
    { code: "Semicolon", label: "Ж" },
    { code: "Quote", label: "Э" },
    { code: "Enter", label: "Enter", wide: true },
  ],
  [
    { code: "ShiftLeft", label: "Shift", wide: true },
    { code: "KeyZ", label: "Я" },
    { code: "KeyX", label: "Ч" },
    { code: "KeyC", label: "С" },
    { code: "KeyV", label: "М" },
    { code: "KeyB", label: "И" },
    { code: "KeyN", label: "Т" },
    { code: "KeyM", label: "Ь" },
    { code: "Comma", label: "Б" },
    { code: "Period", label: "Ю" },
    { code: "Slash", label: "/" },
    { code: "ShiftRight", label: "Shift", wide: true },
  ],
  [
    { code: "ControlLeft", label: "Cntrl", wide: true },
    { code: "MetaLeft", label: "Meta", wide: true },
    { code: "AltLeft", label: "Alt", wide: true },
    { code: "Space", label: "Пробел", space: true },
    { code: "AltRight", label: "Alt", wide: true },
    { code: "ShiftRightExtra", label: "Shift", wide: true },
  ],
];

const enLayout: KeyboardLayout = ruLayout.map((row) =>
  row.map((key) => {
    const map: Record<string, string> = {
      Ё: "`",
      Й: "Q",
      Ц: "W",
      У: "E",
      К: "R",
      Е: "T",
      Н: "Y",
      Г: "U",
      Ш: "I",
      Щ: "O",
      З: "P",
      Х: "[",
      Ъ: "]",
      Ф: "A",
      Ы: "S",
      В: "D",
      А: "F",
      П: "G",
      Р: "H",
      О: "J",
      Л: "K",
      Д: "L",
      Ж: ";",
      Э: "'",
      Я: "Z",
      Ч: "X",
      С: "C",
      М: "V",
      И: "B",
      Т: "N",
      Ь: "M",
      Б: ",",
      Ю: ".",
    };
    const newLabel = map[key.label] ?? key.label;
    return { ...key, label: newLabel };
  }),
);

export function initKeyboard(container: HTMLElement): KeyboardController {
  let currentLanguage: Language = "ru";
  const keyElements: Map<string, HTMLElement> = new Map();

  function render(layout: KeyboardLayout): void {
    container.innerHTML = "";
    keyElements.clear();

    layout.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "keyboard-row";

      row.forEach((key) => {
        const keyEl = document.createElement("div");
        keyEl.className = "keyboard-key";
        if (key.wide) {
          keyEl.classList.add("wide");
        }
        if (key.space) {
          keyEl.classList.add("space");
        }
        keyEl.textContent = key.label;
        keyEl.dataset.code = key.code;
        keyEl.setAttribute("automation-id", "keyboard-key");
        keyEl.setAttribute("aria-label", `клавиша ${key.label}`);

        if (!keyElements.has(key.code)) {
          keyElements.set(key.code, keyEl);
        }

        rowEl.appendChild(keyEl);
      });

      container.appendChild(rowEl);
    });
  }

  function setLayout(language: Language): void {
    currentLanguage = language;
    render(currentLanguage === "ru" ? ruLayout : enLayout);
  }

  function highlightKey(code: string, isError: boolean): void {
    const el = keyElements.get(code);
    if (!el) return;
    el.classList.add("pressed");
    if (isError) {
      el.classList.add("error");
      window.setTimeout(() => {
        el.classList.remove("error");
      }, 200);
    }
  }

  function releaseKey(code: string): void {
    const el = keyElements.get(code);
    if (!el) return;
    el.classList.remove("pressed");
  }

  function reset(): void {
    keyElements.forEach((el) => {
      el.classList.remove("pressed");
      el.classList.remove("error");
    });
  }

  setLayout(currentLanguage);

  return {
    setLayout,
    highlightKey,
    releaseKey,
    reset,
  };
}

