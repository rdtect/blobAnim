import { BlobAnimConfig, BlobPoint } from "../core/types";

/**
 * Base class for blob animation patterns
 */
export abstract class BlobPattern {
  protected points: BlobPoint[] = [];

  /**
   * Initialize the pattern with a configuration
   * @param config Animation configuration
   */
  public abstract initialize(config: BlobAnimConfig): void;

  /**
   * Get the points for the current animation state
   * @param time Current time in seconds
   * @param config Animation configuration
   * @returns Array of points to render
   */
  public abstract getPoints(time: number, config: BlobAnimConfig): BlobPoint[];

  /**
   * Clean up resources
   */
  public abstract dispose(): void;
}
