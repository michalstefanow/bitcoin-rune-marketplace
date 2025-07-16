import { IInscriptionConfig } from '../types';
import { RuneError } from '../utils/errors';

/**
 * Service for managing Bitcoin Ordinals
 */
export class OrdinalService {
  /**
   * Creates a new inscription
   */
  async createInscription(config: IInscriptionConfig): Promise<string> {
    // TODO: Implement inscription creation logic
    throw new RuneError('Inscription creation not yet implemented');
  }

  /**
   * Creates a child inscription
   */
  async createChildInscription(parentId: string, config: IInscriptionConfig): Promise<string> {
    // TODO: Implement child inscription logic
    throw new RuneError('Child inscription not yet implemented');
  }

  /**
   * Reinscribes an ordinal
   */
  async reinscribe(ordinalId: string, config: IInscriptionConfig): Promise<string> {
    // TODO: Implement reinscription logic
    throw new RuneError('Reinscription not yet implemented');
  }
}

// Export singleton instance
export const ordinalService = new OrdinalService(); 