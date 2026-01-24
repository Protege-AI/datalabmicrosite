'use client';

import { useState } from 'react';
import DataCollectionGame from './DataCollectionGame';
import { FEATURES } from '@/config/features';

export default function HomeClient() {
  const [showGame, setShowGame] = useState(false);

  return (
    <>
      {/* Game Button Trigger */}
      {FEATURES.DATA_COLLECTION_GAME && (
        <button
          onClick={() => setShowGame(true)}
          className="border border-[var(--orange)] bg-[var(--orange)] px-5 py-2.5 text-xs font-mono uppercase tracking-wide text-white hover:bg-[var(--purple)] hover:border-[var(--purple)] transition-colors"
          id="collect-data-button"
        >
          Collect Data
        </button>
      )}

      {/* Data Collection Game */}
      {showGame && <DataCollectionGame onClose={() => setShowGame(false)} />}
    </>
  );
}
