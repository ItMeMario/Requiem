import { useState, useEffect } from 'react';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);

  useEffect(() => {
    if ((window as any).api) {
      const fetchCampaigns = async () => {
        try {
          const data = await (window as any).api.getCampaigns();
          setCampaigns(data);
        } catch (error) {
          console.error('Error fetching campaigns:', error);
        }
      };
      fetchCampaigns();
    }
  }, []);

  const createCampaign = async (newCampaign: any) => {
    try {
      if ((window as any).api) {
        const id = await (window as any).api.createCampaign(newCampaign);
        const camp = { id, ...newCampaign };
        setCampaigns([...campaigns, camp]);
        return camp;
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  };

  return { 
    campaigns, 
    selectedCampaign, 
    setSelectedCampaign, 
    createCampaign 
  };
};
