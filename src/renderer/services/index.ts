import { IDataService } from '../../shared/dataService';
import { ElectronDataService } from './electronDataService';
import { WebDataService } from './webDataService';
import { FirebaseDataService } from './firebaseDataService';
import { auth } from '../utils/auth';

let localInstance: IDataService | null = null;
let firebaseInstance: IDataService | null = null;

export function getDataService(): IDataService {
  // If Firebase is initialized and a user is signed in, route to Firestore
  if (auth && auth.currentUser) {
    if (!firebaseInstance) {
      firebaseInstance = new FirebaseDataService();
    }
    return firebaseInstance;
  }

  // Otherwise, fallback to the local offline database instances
  if (localInstance) {
    return localInstance;
  }

  // Se (window as any).api existe, estamos no Electron
  if (typeof window !== 'undefined' && (window as any).api) {
    localInstance = new ElectronDataService();
  } else {
    // Caso contrário, web/PWA
    localInstance = new WebDataService();
  }

  return localInstance;
}

