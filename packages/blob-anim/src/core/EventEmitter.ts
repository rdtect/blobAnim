import { BlobAnimEventType, BlobAnimEventData } from './types';

/**
 * Simple event emitter system for BlobAnim event handling
 */
export class EventEmitter {
  private eventListeners: Map<BlobAnimEventType, Array<(data?: any) => void>> = new Map();

  /**
   * Register an event listener
   * @param event Event type to listen for
   * @param callback Function to call when event is emitted
   * @returns Function to remove the listener
   */
  public on(event: BlobAnimEventType, callback: (data?: any) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);

    // Return a cleanup function
    return () => this.off(event, callback);
  }

  /**
   * Remove an event listener
   * @param event Event type
   * @param callback Function to remove
   */
  public off(event: BlobAnimEventType, callback: (data?: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event with optional data
   * @param event Event type to emit
   * @param data Data to pass to listeners
   */
  public emit(event: BlobAnimEventType, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error(`Error in event handler for ${event}:`, e);
        }
      });
    }
  }

  /**
   * Remove all event listeners
   */
  public removeAllListeners(): void {
    this.eventListeners.clear();
  }

  /**
   * Create DOM event compatible with CustomEvent API for Web Component integration
   * @param type Event type
   * @param data Event data
   * @returns CustomEvent object
   */
  public createDOMEvent(type: string, data?: any): CustomEvent {
    return new CustomEvent(`blob:${type}`, {
      bubbles: true,
      composed: true,
      detail: data
    });
  }
}
