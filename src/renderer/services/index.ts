import { IDataService } from '../../shared/dataService';
import { ElectronDataService } from './electronDataService';
import { WebDataService } from './webDataService';

let instance: IDataService | null = null;

export function getDataService(): IDataService {
  if (instance) {
    return instance;
  }

  // Se (window as any).api existe, estamos no Electron
  if (typeof window !== 'undefined' && (window as any).api) {
    instance = new ElectronDataService();
  } else {
    // Caso contrário, web/PWA
    instance = new WebDataService();
  }

  return instance;
}
