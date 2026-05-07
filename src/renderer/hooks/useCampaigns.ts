import { useState, useEffect } from 'react';
import { getDataService } from '../services';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getDataService().getCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };
    fetchCampaigns();
  }, []);

  const createCampaign = async (newCampaign: any) => {
    try {
      const id = await getDataService().createCampaign(newCampaign);
      const camp = { id, ...newCampaign };
      setCampaigns([...campaigns, camp]);
      return camp;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  };
  const deleteCampaign = async (id: number) => {
    try {
      await getDataService().deleteCampaign(id);
      const newCampaigns = campaigns.filter(c => c.id !== id);
      setCampaigns(newCampaigns);
      if (selectedCampaign?.id === id) {
        setSelectedCampaign(null);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  };

  return { 
    campaigns, 
    selectedCampaign, 
    setSelectedCampaign, 
    createCampaign,
    deleteCampaign
  };
};
