import { CognitiveState, TransitionMatrix, Node } from './types';
import { StateBase } from './stateBase';
import { ChaosStateManager } from './chaosState';
import { OrganizingStateManager } from './organizingState';
import { StructuredStateManager } from './structuredState';

/**
 * StateTransitionManager
 * 
 * Handles transitions between different cognitive states by:
 * - Managing alpha (energy) adjustment
 * - Defining transition durations and easing functions
 * - Orchestrating the smooth changeover between force configurations
 */
export class StateTransitionManager {
  private transitionMatrix: TransitionMatrix;
  private nodes: Node[];
  private width: number;
  private height: number;
  private currentState: CognitiveState;
  private stateManager: StateBase;
  
  constructor(nodes: Node[], width: number, height: number, initialState: CognitiveState = CognitiveState.CHAOS) {
    this.nodes = nodes;
    this.width = width;
    this.height = height;
    this.currentState = initialState;
    
    // Initialize the state manager based on initial state
    this.stateManager = this.createStateManager(initialState);
    
    // Define the transition matrix with durations and easing functions
    this.transitionMatrix = {
      [CognitiveState.CHAOS]: {
        [CognitiveState.ORGANIZING]: { duration: 1000, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        [CognitiveState.STRUCTURED]: { duration: 2000, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
      },
      [CognitiveState.ORGANIZING]: {
        [CognitiveState.CHAOS]: { duration: 500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        [CognitiveState.STRUCTURED]: { duration: 1000, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
      },
      [CognitiveState.STRUCTURED]: {
        [CognitiveState.CHAOS]: { duration: 1500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        [CognitiveState.ORGANIZING]: { duration: 800, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
      }
    };
  }
  
  /**
   * Transition to a new cognitive state
   * @returns The transition configuration with duration and easing
   */
  transitionTo(newState: CognitiveState): { duration: number; easing: string } {
    // If already in this state, return a minimal transition config
    if (newState === this.currentState) {
      return { duration: 0, easing: 'linear' };
    }
    
    // Get transition parameters
    const config = this.transitionMatrix[this.currentState][newState];
    const alphaValue = this.calculateAlpha(newState);
    
    // Stop the current simulation - REMOVED (No longer needed as simulation runs continuously)
    // this.stateManager.stop(); 
    
    // Create the new state manager
    this.stateManager = this.createStateManager(newState);
    
    // Start the new simulation with appropriate alpha - MODIFIED
    // Set the initial alpha of the new simulation directly
    this.stateManager.getSimulation().alpha(alphaValue).restart(); 
    
    // Update current state
    this.currentState = newState;
    
    // Return transition details for animation purposes
    return {
      duration: config.duration,
      easing: config.easing
    };
  }
  
  /**
   * Calculate the appropriate alpha value for each state
   */
  private calculateAlpha(state: CognitiveState): number {
    const alphaValues = {
      [CognitiveState.CHAOS]: 1.0,      // High energy for chaotic movement
      [CognitiveState.ORGANIZING]: 0.8,  // Moderate energy for organizing
      [CognitiveState.STRUCTURED]: 0.4   // Lower energy for structured positioning
    };
    
    return alphaValues[state];
  }
  
  /**
   * Create a state manager instance based on the cognitive state
   */
  private createStateManager(state: CognitiveState): StateBase {
    switch (state) {
      case CognitiveState.CHAOS:
        return new ChaosStateManager(this.nodes, this.width, this.height);
      case CognitiveState.ORGANIZING:
        return new OrganizingStateManager(this.nodes, this.width, this.height);
      case CognitiveState.STRUCTURED:
        return new StructuredStateManager(this.nodes, this.width, this.height);
      default:
        throw new Error(`Unknown state: ${state}`);
    }
  }
  
  /**
   * Get the current state manager
   */
  getStateManager(): StateBase {
    return this.stateManager;
  }
  
  /**
   * Get the current cognitive state
   */
  getCurrentState(): CognitiveState {
    return this.currentState;
  }
  
  /**
   * Update dimensions if container size changes
   */
  updateDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.stateManager.updateDimensions(width, height);
  }
}
