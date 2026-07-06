import { useState, useEffect } from 'react';
import { getDataService } from '../services';

export const useCampaigns = (user?: any) => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);

  useEffect(() => {
    const service = getDataService();
    if (service.subscribeCampaigns) {
      const unsubscribe = service.subscribeCampaigns(
        (data) => {
          setCampaigns(data);
        },
        (error) => {
          console.error('Error in campaigns subscription:', error);
        }
      );
      return () => unsubscribe();
    } else {
      let active = true;
      const fetchCampaigns = async () => {
        try {
          const data = await service.getCampaigns();
          if (active) setCampaigns(data);
        } catch (error) {
          console.error('Error fetching campaigns:', error);
        }
      };
      fetchCampaigns();
      return () => {
        active = false;
      };
    }
  }, [user]);

  useEffect(() => {
    if (selectedCampaign && campaigns.length > 0) {
      const current = campaigns.find(c => c.id === selectedCampaign.id);
      if (!current) {
        setSelectedCampaign(null);
      } else if (JSON.stringify(current) !== JSON.stringify(selectedCampaign)) {
        setSelectedCampaign(current);
      }
    }
  }, [campaigns, selectedCampaign]);

  const createCampaign = async (newCampaign: any) => {
    try {
      const id = await getDataService().createCampaign(newCampaign);
      return { id, ...newCampaign };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  };
  const deleteCampaign = async (id: number) => {
    try {
      await getDataService().deleteCampaign(id);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  };

  const updateCampaign = async (id: number, updatedData: any) => {
    try {
      await getDataService().updateCampaign(id, updatedData);
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  };

  return { 
    campaigns, 
    selectedCampaign, 
    setSelectedCampaign, 
    createCampaign,
    updateCampaign,
    deleteCampaign
  };
};
