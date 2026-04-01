import React from 'react';

export function VampireBats() {
  return (
    <div className="bat-container">
      <div className="bat" style={{ left: '20%' }} />
      <div className="bat bat-delayed" style={{ left: '50%' }} />
      <div className="bat bat-delayed-2" style={{ left: '80%' }} />
    </div>
  );
}
