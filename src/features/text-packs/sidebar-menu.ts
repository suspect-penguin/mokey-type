import type { Language } from "../keyboard/keyboard";
import type { PacksController, TextPack } from "../shared/training-state";
import type { TrainingManager } from "../shared/manager";

interface PacksState {
  packs: TextPack[];
  currentPackId: string | null;
}

export function initSidebarMenu(
  sidebarEl: HTMLElement,
  trainingManager: TrainingManager,
): PacksController {
  const listEl = sidebarEl.querySelector<HTMLElement>('[data-role="packs-list"]');
  const addButton = sidebarEl.querySelector<HTMLButtonElement>(
    '[automation-id="add-text-button"]',
  );

  if (!listEl || !addButton) {
    throw new Error("Sidebar elements not found");
  }

  const state: PacksState = {
    packs: [
      {
        id: "ru-1",
        title: "Русский текст 1",
        text: "Пример текста на русском языке. Здесь много символов и предложений.",
        language: "ru",
        durationSeconds: 120,
      },
      {
        id: "en-1",
        title: "English text 1",
        text: "Sample text in English language. It also contains many words and sentences.",
        language: "en",
        durationSeconds: 120,
      },
    ],
    currentPackId: "ru-1",
  };

  function getCurrentPack(): TextPack | null {
    return state.packs.find((p) => p.id === state.currentPackId) ?? null;
  }

  function renderList(): void {
    listEl.innerHTML = "";
    state.packs.forEach((pack) => {
      const item = document.createElement("div");
      item.className = "pack-item";
      item.setAttribute("automation-id", "text-pack-item");
      item.dataset.id = pack.id;

      const left = document.createElement("div");
      left.className = "pack-left";

      const titleSpan = document.createElement("span");
      titleSpan.textContent = pack.title;

      const langIndicator = document.createElement("span");
      langIndicator.className = "language-indicator";
      langIndicator.textContent = pack.language === "ru" ? "RU" : "EN";
      langIndicator.setAttribute("automation-id", "language-indicator");

      left.appendChild(titleSpan);
      left.appendChild(langIndicator);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-pack-button";
      deleteBtn.textContent = "🗑";
      deleteBtn.setAttribute("automation-id", "delete-pack-button");

      item.appendChild(left);
      item.appendChild(deleteBtn);
      listEl.appendChild(item);

      item.addEventListener("click", (event) => {
        if (event.target === deleteBtn) {
          event.stopPropagation();
          openDeleteModal(pack.id);
          return;
        }
        state.currentPackId = pack.id;
        trainingManager.startTraining(pack);
      });
    });

    const initial = getCurrentPack();
    if (initial) {
      trainingManager.startTraining(initial);
    }
  }

  function openAddModal(): void {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "modal-window";
    modal.setAttribute("automation-id", "add-text-modal");

    const header = document.createElement("div");
    header.className = "modal-header";
    header.textContent = "Добавить задание";

    const closeBtn = document.createElement("button");
    closeBtn.className = "modal-close";
    closeBtn.textContent = "×";
    header.appendChild(closeBtn);

    const body = document.createElement("div");
    body.className = "modal-body";

    const titleRow = document.createElement("div");
    titleRow.className = "modal-row";
    const titleLabel = document.createElement("label");
    titleLabel.textContent = "Название";
    const titleInput = document.createElement("input");
    titleInput.className = "modal-input";
    titleInput.setAttribute("automation-id", "input-title");
    titleRow.appendChild(titleLabel);
    titleRow.appendChild(titleInput);

    const textRow = document.createElement("div");
    textRow.className = "modal-row";
    const textLabel = document.createElement("label");
    textLabel.textContent = "Текст";
    const textArea = document.createElement("textarea");
    textArea.className = "modal-textarea";
    textArea.setAttribute("automation-id", "input-text");
    textRow.appendChild(textLabel);
    textRow.appendChild(textArea);

    const langRow = document.createElement("div");
    langRow.className = "modal-row";
    const langLabel = document.createElement("label");
    langLabel.textContent = "Язык";
    const langSelect = document.createElement("select");
    langSelect.className = "modal-select";
    langSelect.setAttribute("automation-id", "input-language");
    const optionRu = document.createElement("option");
    optionRu.value = "ru";
    optionRu.textContent = "Русский";
    const optionEn = document.createElement("option");
    optionEn.value = "en";
    optionEn.textContent = "English";
    langSelect.appendChild(optionRu);
    langSelect.appendChild(optionEn);
    langRow.appendChild(langLabel);
    langRow.appendChild(langSelect);

    const errorP = document.createElement("div");
    errorP.className = "error-text";

    body.appendChild(titleRow);
    body.appendChild(textRow);
    body.appendChild(langRow);
    body.appendChild(errorP);

    const footer = document.createElement("div");
    footer.className = "modal-footer";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn secondary";
    cancelBtn.textContent = "Отмена";
    cancelBtn.setAttribute("automation-id", "cancel-button");

    const saveBtn = document.createElement("button");
    saveBtn.className = "btn primary";
    saveBtn.textContent = "Сохранить";
    saveBtn.setAttribute("automation-id", "save-button");

    footer.appendChild(cancelBtn);
    footer.appendChild(saveBtn);

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    backdrop.appendChild(modal);

    const closeModal = (): void => {
      document.body.style.overflow = "";
      backdrop.remove();
    };

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        closeModal();
      }
    });

    saveBtn.addEventListener("click", () => {
      const title = titleInput.value.trim();
      const text = textArea.value.trim();
      const language = (langSelect.value as Language) || "ru";

      if (!title || !text) {
        errorP.textContent = "Пожалуйста, заполните все поля";
        return;
      }

      const newPack: TextPack = {
        id: `${language}-${Date.now()}`,
        title,
        text,
        language,
        durationSeconds: 120,
      };

      state.packs.push(newPack);
      state.currentPackId = newPack.id;
      renderList();
      closeModal();
    });

    document.body.style.overflow = "hidden";
    document.body.appendChild(backdrop);
  }

  function openDeleteModal(id: string): void {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "modal-window";
    modal.setAttribute("automation-id", "delete-confirmation-modal");

    const header = document.createElement("div");
    header.className = "modal-header";

    const title = document.createElement("div");
    title.textContent = "Удалить пак?";
    header.appendChild(title);

    const closeBtn = document.createElement("button");
    closeBtn.className = "modal-close";
    closeBtn.textContent = "×";
    closeBtn.setAttribute("automation-id", "modal-close-button");
    header.appendChild(closeBtn);

    const body = document.createElement("div");
    body.className = "modal-body";
    body.textContent = "Вы уверены, что хотите удалить этот пак?";

    const errorP = document.createElement("div");
    errorP.className = "error-text";
    body.appendChild(errorP);

    const footer = document.createElement("div");
    footer.className = "modal-footer";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn secondary";
    cancelBtn.textContent = "Отмена";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn danger";
    deleteBtn.textContent = "Удалить";
    deleteBtn.setAttribute("automation-id", "modal-confirm-button");

    footer.appendChild(cancelBtn);
    footer.appendChild(deleteBtn);

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    backdrop.appendChild(modal);

    const closeModal = (): void => {
      document.body.style.overflow = "";
      backdrop.remove();
    };

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        closeModal();
      }
    });

    deleteBtn.addEventListener("click", () => {
      if (state.packs.length === 1) {
        errorP.textContent = "Нельзя удалить последний пак";
        return;
      }
      state.packs = state.packs.filter((p) => p.id !== id);
      if (state.currentPackId === id && state.packs.length > 0) {
        state.currentPackId = state.packs[0]?.id ?? null;
      }
      renderList();
      closeModal();
    });

    document.body.style.overflow = "hidden";
    document.body.appendChild(backdrop);
  }

  addButton.addEventListener("click", () => {
    openAddModal();
  });

  renderList();

  return {
    getCurrentPack,
  };
}

