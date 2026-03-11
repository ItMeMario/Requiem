import { contextBridge, ipcRenderer } from 'electron';

export const api = {
  // Campaigns
  getCampaigns: () => ipcRenderer.invoke('get-campaigns'),
  getCampaign: (id: number) => ipcRenderer.invoke('get-campaign', id),
  createCampaign: (data: any) => ipcRenderer.invoke('create-campaign', data),
  updateCampaign: (id: number, data: any) => ipcRenderer.invoke('update-campaign', id, data),
  deleteCampaign: (id: number) => ipcRenderer.invoke('delete-campaign', id),

  // Entries
  getEntries: (campaignId: number) => ipcRenderer.invoke('get-entries', campaignId),
  getEntry: (id: number) => ipcRenderer.invoke('get-entry', id),
  createEntry: (data: any) => ipcRenderer.invoke('create-entry', data),
  updateEntry: (id: number, data: any) => ipcRenderer.invoke('update-entry', id, data),
  deleteEntry: (id: number) => ipcRenderer.invoke('delete-entry', id),

  // Entities
  getEntities: (campaignId: number, type?: string) => ipcRenderer.invoke('get-entities', campaignId, type),
  getEntity: (id: number) => ipcRenderer.invoke('get-entity', id),
  createEntity: (data: any) => ipcRenderer.invoke('create-entity', data),
  updateEntity: (id: number, data: any) => ipcRenderer.invoke('update-entity', id, data),
  deleteEntity: (id: number) => ipcRenderer.invoke('delete-entity', id),
};

contextBridge.exposeInMainWorld('api', api);
