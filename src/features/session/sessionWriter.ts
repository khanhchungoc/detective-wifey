import type { ActiveSessionState, GameStateRepository } from './types';

/** Serializes async repositories; resets invalidate queued saves from the previous case. */
export class SessionWriter {
  private queue: Promise<void> = Promise.resolve();
  private generation = 0;

  constructor(private repository: GameStateRepository, private gameId: string) {}

  save(snapshot: ActiveSessionState): Promise<void> {
    const generation = this.generation;
    return this.enqueue(() => generation === this.generation
      ? this.repository.saveActiveSession(snapshot) : Promise.resolve());
  }

  clear(caseId?: string): Promise<void> {
    this.generation++;
    return this.enqueue(() => this.repository.clearActiveSession(this.gameId, caseId));
  }

  private enqueue(operation: () => Promise<void>): Promise<void> {
    const result = this.queue.then(operation);
    this.queue = result.catch(() => {});
    return result;
  }
}
