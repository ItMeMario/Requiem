import { setupCampaignHandlersIpc } from './campaignHandlersIpc';
import { setupEntryHandlersIpc } from './entryHandlersIpc';
import { setupCharacterHandlersIpc } from './characterHandlersIpc';
import { setupLocationHandlersIpc } from './locationHandlersIpc';
import { setupBackupHandlersIpc } from './backupHandlersIpc';
import { setupAuthHandlersIpc } from './authHandlersIpc';

export function setupIpc() {
  setupCampaignHandlersIpc();
  setupEntryHandlersIpc();
  setupCharacterHandlersIpc();
  setupLocationHandlersIpc();
  setupBackupHandlersIpc();
  setupAuthHandlersIpc();
}
