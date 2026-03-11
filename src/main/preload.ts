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

  // Characters
  getCharacters: (campaignId: number) => ipcRenderer.invoke('get-characters', campaignId),
  getCharacter: (id: number) => ipcRenderer.invoke('get-character', id),
  createCharacter: (data: any) => ipcRenderer.invoke('create-character', data),
  updateCharacter: (id: number, data: any) => ipcRenderer.invoke('update-character', id, data),
  deleteCharacter: (id: number) => ipcRenderer.invoke('delete-character', id),

  // Locations
  getLocations: (campaignId: number) => ipcRenderer.invoke('get-locations', campaignId),
  getLocation: (id: number) => ipcRenderer.invoke('get-location', id),
  createLocation: (data: any) => ipcRenderer.invoke('create-location', data),
  updateLocation: (id: number, data: any) => ipcRenderer.invoke('update-location', id, data),
  deleteLocation: (id: number) => ipcRenderer.invoke('delete-location', id),
};

contextBridge.exposeInMainWorld('api', api);
