import React from 'react';
import { CampaignCard } from './CampaignCard';

interface DefaultViewProps {
  campaigns: any[];
  theme: string;
  handleSelectCampaign: (camp: any) => void;
  handleDeleteCampaign: (id: number, name: string) => void;
  handleEditCampaign: (e: React.MouseEvent, camp: any) => void;
  setShowCreateModal: (show: boolean) => void;
  setNewCampaign: (camp: any) => void;
}

export function DefaultView({
  campaigns,
  theme,
  handleSelectCampaign,
  handleDeleteCampaign,
  handleEditCampaign,
  setShowCreateModal,
  setNewCampaign
}: DefaultViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-24 md:gap-y-12">
      <CampaignCard
        theme={theme}
        item={{ type: 'create' }}
        handleSelectCampaign={handleSelectCampaign}
        handleDeleteCampaign={handleDeleteCampaign}
        handleEditCampaign={handleEditCampaign}
        setShowCreateModal={setShowCreateModal}
        setNewCampaign={setNewCampaign}
      />

      {campaigns.map(camp => (
        <CampaignCard
          key={camp.id}
          theme={theme}
          item={{ type: 'campaign', data: camp }}
          handleSelectCampaign={handleSelectCampaign}
          handleDeleteCampaign={handleDeleteCampaign}
          handleEditCampaign={handleEditCampaign}
          setShowCreateModal={setShowCreateModal}
          setNewCampaign={setNewCampaign}
        />
      ))}
    </div>
  );
}
