import type {
  PacksController,
  TrainingConnections,
  TrainingStats,
  TextPack,
} from "./training-state";

export class TrainingManager {
  private connections: TrainingConnections | null = null;
  private currentPack: TextPack | null = null;
  private symbols: string[] = [];
  private currentIndex = 0;
  private correctCount = 0;
  private errorCount = 0;
  private startedAt: number | null = null;
  private timerId: number | null = null;
  private isFinished = false;
  private totalDurationSeconds = 0;

  constructor() {
    document.addEventListener("keydown", (event) => this.handleKeyDown(event));
    document.addEventListener("keyup", (event) => this.handleKeyUp(event));
  }

  connectUI(connections: TrainingConnections): void {
    this.connections = connections;
  }

  startTraining(pack: TextPack): void {
    if (!this.connections) return;

    this.currentPack = pack;
    this.symbols = Array.from(pack.text);
    this.currentIndex = 0;
    this.correctCount = 0;
    this.errorCount = 0;
    this.isFinished = false;
    this.totalDurationSeconds = pack.durationSeconds;
    this.startedAt = null;

    this.renderText();
    this.updateProgress();
    this.updateStats(0);
    this.updateTimer(0);

    this.connections.keyboardController.setLayout(pack.language);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.connections || !this.currentPack || this.isFinished) {
      return;
    }

    if (!this.startedAt) {
      this.startedAt = Date.now();
      this.startTimer();
    }

    const { keyboardController } = this.connections;
    keyboardController.highlightKey(event.code, false);

    if (this.currentIndex >= this.symbols.length) {
      return;
    }

    const expectedChar = this.symbols[this.currentIndex];
    const actualChar = event.key;

    const isMatch = actualChar === expectedChar;

    if (isMatch) {
      this.correctCount += 1;
      this.markSymbol(this.currentIndex, "correct");
    } else {
      this.errorCount += 1;
      this.markSymbol(this.currentIndex, "error");
      keyboardController.highlightKey(event.code, true);
    }

    this.currentIndex += 1;
    if (this.currentIndex < this.symbols.length) {
      this.markSymbol(this.currentIndex, "current");
    }

    const elapsedSeconds = this.getElapsedSeconds();
    this.updateStats(elapsedSeconds);
    this.updateProgress();

    if (this.currentIndex >= this.symbols.length) {
      this.finishTraining();
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (!this.connections) return;
    this.connections.keyboardController.releaseKey(event.code);
  }

  private renderText(): void {
    if (!this.connections) return;
    const { textContainerEl } = this.connections;
    textContainerEl.innerHTML = "";

    if (this.symbols.length === 0) {
      return;
    }

    this.symbols.forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.className = "text-symbol default";
      span.setAttribute("automation-id", "text-symbol");
      span.dataset.index = String(index);
      textContainerEl.appendChild(span);
    });

    this.markSymbol(0, "current");
  }

  private markSymbol(index: number, state: "default" | "current" | "correct" | "error"): void {
    if (!this.connections) return;
    const { textContainerEl } = this.connections;
    const span = textContainerEl.querySelector<HTMLSpanElement>(
      `span[data-index="${index}"]`,
    );
    if (!span) return;

    span.classList.remove("default", "current", "correct", "error");
    span.classList.add(state);

    if (state === "current") {
      span.setAttribute("automation-id", "current-symbol");
    } else if (state === "correct") {
      span.setAttribute("automation-id", "correct-symbol");
    } else if (state === "error") {
      span.setAttribute("automation-id", "error-symbol");
    } else {
      span.setAttribute("automation-id", "text-symbol");
    }
  }

  private updateProgress(): void {
    if (!this.connections || this.symbols.length === 0) return;
    const percent = (this.currentIndex / this.symbols.length) * 100;
    this.connections.progressInnerEl.style.width = `${percent}%`;
  }

  private updateStats(elapsedSeconds: number): void {
    if (!this.connections) return;
    const minutes = elapsedSeconds / 60;
    const speed =
      minutes > 0 ? Math.round(this.correctCount / minutes) : 0;

    this.connections.speedEl.textContent = `Скорость: ${speed} зн/мин`;
    this.connections.errorEl.textContent = `Ошибки: ${this.errorCount}`;
  }

  private updateTimer(elapsedSeconds: number): void {
    if (!this.connections) return;
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const secondsStr = seconds < 10 ? `0${seconds}` : String(seconds);
    this.connections.timerEl.textContent = `Таймер: ${minutes}:${secondsStr}`;
  }

  private startTimer(): void {
    if (this.timerId !== null) return;
    this.timerId = window.setInterval(() => {
      const elapsed = this.getElapsedSeconds();
      this.updateTimer(elapsed);

      if (
        this.totalDurationSeconds > 0 &&
        elapsed >= this.totalDurationSeconds
      ) {
        this.finishTraining();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private getElapsedSeconds(): number {
    if (!this.startedAt) return 0;
    const now = Date.now();
    return Math.floor((now - this.startedAt) / 1000);
  }

  private finishTraining(): void {
    if (this.isFinished) return;
    this.isFinished = true;
    this.clearTimer();

    const stats: TrainingStats = {
      correct: this.correctCount,
      errors: this.errorCount,
      total: this.symbols.length,
      elapsedSeconds: this.getElapsedSeconds(),
    };

    this.openStatsModal(stats);
  }

  private openStatsModal(stats: TrainingStats): void {
    if (!this.connections || !this.currentPack) return;

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "modal-window";
    modal.setAttribute("automation-id", "stats-modal");

    const header = document.createElement("div");
    header.className = "modal-header";
    const title = document.createElement("div");
    title.textContent = "Тренировка завершена!";
    title.setAttribute("automation-id", "stats-modal-title");
    const closeBtn = document.createElement("button");
    closeBtn.className = "modal-close";
    closeBtn.textContent = "×";
    header.appendChild(title);
    header.appendChild(closeBtn);

    const body = document.createElement("div");
    body.className = "modal-body";

    const nameRow = document.createElement("div");
    nameRow.textContent = `Задание: ${this.currentPack.title}`;
    nameRow.setAttribute("automation-id", "stats-field-name");

    const speedRow = document.createElement("div");
    const minutes = stats.elapsedSeconds / 60;
    const speed =
      minutes > 0 ? Math.round(stats.correct / minutes) : 0;
    speedRow.textContent = `Скорость: ${speed} зн/мин`;
    speedRow.setAttribute("automation-id", "stats-field-speed");

    const errorsRow = document.createElement("div");
    errorsRow.textContent = `Ошибки: ${stats.errors}`;
    errorsRow.setAttribute("automation-id", "stats-field-errors");

    const accuracy = stats.total
      ? Math.round((stats.correct / stats.total) * 100)
      : 0;
    const accuracyRow = document.createElement("div");
    accuracyRow.textContent = `Точность: ${accuracy}%`;
    accuracyRow.setAttribute("automation-id", "stats-field-accuracy");

    const ratingRow = document.createElement("div");
    const rating =
      accuracy < 70
        ? "Плохо"
        : accuracy < 85
        ? "Удовлетворительно"
        : accuracy < 95
        ? "Хорошо"
        : "Отлично";
    ratingRow.textContent = `Оценка: ${rating}`;
    ratingRow.setAttribute("automation-id", "stats-field-rating");

    body.appendChild(nameRow);
    body.appendChild(speedRow);
    body.appendChild(errorsRow);
    body.appendChild(accuracyRow);
    body.appendChild(ratingRow);

    const footer = document.createElement("div");
    footer.className = "modal-footer";

    const repeatBtn = document.createElement("button");
    repeatBtn.className = "btn primary";
    repeatBtn.textContent = "Повторить";
    repeatBtn.setAttribute("automation-id", "repeat-button");

    const chooseBtn = document.createElement("button");
    chooseBtn.className = "btn secondary";
    chooseBtn.textContent = "Выбрать другое задание";
    chooseBtn.setAttribute("automation-id", "choose-another-button");

    footer.appendChild(repeatBtn);
    footer.appendChild(chooseBtn);

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    backdrop.appendChild(modal);

    const closeModal = (): void => {
      document.body.style.overflow = "";
      backdrop.remove();
    };

    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        closeModal();
      }
    });

    repeatBtn.addEventListener("click", () => {
      closeModal();
      if (this.currentPack) {
        this.startTraining(this.currentPack);
      }
    });

    chooseBtn.addEventListener("click", () => {
      closeModal();
    });

    document.body.style.overflow = "hidden";
    document.body.appendChild(backdrop);
  }
}

