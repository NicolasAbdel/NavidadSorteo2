import React, { useState } from 'react';
import Snowfall from './components/Snowfall';
import SetupPanel from './components/SetupPanel';
import RaffleGame from './components/RaffleGame';
import WinnerList from './components/WinnerList';
import { ParticipantList, Prize, Winner, AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [showHistory, setShowHistory] = useState(false); // Modal/View toggle within public view
  
  const [participantLists, setParticipantLists] = useState<ParticipantList[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);

  const handleGoToPublicView = () => {
    setAppState('public_view');
  };

  return (
    <div className="min-h-screen text-gray-800 font-sans selection:bg-holiday-red selection:text-white pb-12">
      <Snowfall />
      
      {/* Header */}
      <header className="pt-8 pb-4 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-christmas text-white drop-shadow-lg tracking-wide mb-2 cursor-pointer" onClick={() => setAppState('setup')}>
          Sorteo Navideño
        </h1>
        <p className="text-holiday-gold text-lg md:text-xl font-medium drop-shadow-md">
          🎄 ¡Donde la magia elige a los ganadores! 🎁
        </p>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 relative z-20 mt-8">
        {appState === 'setup' && (
          <SetupPanel 
            participantLists={participantLists}
            setParticipantLists={setParticipantLists}
            prizes={prizes}
            setPrizes={setPrizes}
            onStart={handleGoToPublicView}
          />
        )}

        {appState === 'public_view' && !showHistory && (
          <RaffleGame 
            participantLists={participantLists}
            prizes={prizes}
            setPrizes={setPrizes}
            winners={winners}
            setWinners={setWinners}
            onViewHistory={() => setShowHistory(true)}
          />
        )}

        {appState === 'public_view' && showHistory && (
          <WinnerList 
            winners={winners} 
            prizes={prizes}
            participantLists={participantLists}
            onBack={() => setShowHistory(false)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-4 w-full text-center text-white/60 text-sm z-0 pointer-events-none">
        <p>Creado con React, Tailwind y mucho espíritu navideño ✨</p>
      </footer>
    </div>
  );
};

export default App;