import { BlobAnimConfig, BlobAnimState, BlobPoint } from '../core/types';

export abstract class BlobPattern {
  // Optional pre-calculation properties that patterns might use
  protected frequencies: number[] = [];
  protected phases: number[] = [];
  protected radii: number[] = [];
  protected velocities: Array<{x: number, y: number}> = [];
  protected initialized: boolean = false;

  /**
   * Initialize pattern with config
   * This is called when the pattern is first created or when key properties change
   * @param config Animation configuration
   */
  public initialize(config: BlobAnimConfig): void {
    this.initialized = true;
  }

  /**
   * Update pattern state without generating points
   * This is useful for patterns that need to update internal state before generating points
   * @param config Animation configuration
   * @param state Current animation state
   */
  public update(config: BlobAnimConfig, state: BlobAnimState): void {
    // Optional method to update internal state
  }

  /**
   * Create points for current animation frame
   * @param config Animation configuration
   * @param state Current animation state
   * @returns Array of points with x,y coordinates
   */
  public abstract generatePoints(config: BlobAnimConfig, state: BlobAnimState): BlobPoint[];

  /**
   * Clean up pattern resources
   */
  public dispose(): void {
    // Optional cleanup code
    this.frequencies = [];
    this.phases = [];
    this.radii = [];
    this.velocities = [];
    this.initialized = false;
  }
}
