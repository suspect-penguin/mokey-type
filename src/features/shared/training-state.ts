import type { Language, KeyboardController } from "../keyboard/keyboard";

export interface TextPack {
  id: string;
  title: string;
  text: string;
  language: Language;
  durationSeconds: number;
}

export interface PacksController {
  getCurrentPack(): TextPack | null;
}

export interface TrainingUIRefs {
  textContainerEl: HTMLElement;
  progressInnerEl: HTMLElement;
  speedEl: HTMLElement;
  errorEl: HTMLElement;
  timerEl: HTMLElement;
}

export interface TrainingConnections extends TrainingUIRefs {
  keyboardController: KeyboardController;
  packsController: PacksController;
}

export interface TrainingStats {
  correct: number;
  errors: number;
  total: number;
  elapsedSeconds: number;
}

