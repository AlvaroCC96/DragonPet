import { Instinct } from "../Instinct";

/**
 * The little sequence that plays right after the dragon is released from a
 * drag: fall, bounce, settle, glance at the user, then back to Idle.
 * Probability 0 — only ever activated via CreatureBrain.triggerInstinct(),
 * by DragController.
 */
export class DropSequenceInstinct extends Instinct {
  constructor() {
    super({
      id: "DropSequence",
      priority: 1,
      probability: 0,
      minDuration: 1.4,
      maxDuration: 1.6,
    });
  }

  execute(): void {
    // No side effects here — DropSequenceAction supplies the whole pose sequence.
  }
}
