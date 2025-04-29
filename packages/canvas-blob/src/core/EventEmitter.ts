export type EventCallback = (data?: any) => void;

export class EventEmitter {
  private events: { [key: string]: EventCallback[] } = {};

  /**
   * Subscribe to an event
   * @param event Event name to listen for
   * @param callback Function to call when the event is emitted
   * @returns Function to unsubscribe from the event
   */
  public on(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param event Event name to unsubscribe from
   * @param callback Function to remove from the event listeners
   */
  public off(event: string, callback: EventCallback): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
      if (this.events[event].length === 0) {
        delete this.events[event];
      }
    }
  }

  /**
   * Emit an event, calling all subscribed callbacks
   * @param event Event name to emit
   * @param data Optional data to pass to the callbacks
   */
  public emit(event: string, data?: any): void {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(data));
    }
  }

  /**
   * Clear all event listeners
   */
  public clear(): void {
    this.events = {};
  }
}
