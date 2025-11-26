import React, { useState } from 'react';
import { Participant, Prize, Winner, ParticipantList } from '../types';
import { Gift, Users, Trophy, Sparkles, X, UserX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateCongratulationMessage } from '../services/geminiService';

interface RaffleGameProps {
  participantLists: ParticipantList[];
  prizes: Prize[];
  winners: Winner[]; // Historial global
  setWinners: React.Dispatch<React.SetStateAction<Winner[]>>;
  setPrizes: React.Dispatch<React.SetStateAction<Prize[]>>;
  onViewHistory: () => void;
}

const RaffleGame: React.FC<RaffleGameProps> = ({
  participantLists,
  prizes,
  winners,
  setWinners,
  setPrizes,
  onViewHistory
}) => {
  // Lista seleccionada para mostrar premios y sortear
  const [selectedListId, setSelectedListId] = useState<string>(() => participantLists[0]?.id || 'all');

  const [selectedPrizeForDraw, setSelectedPrizeForDraw] = useState<Prize | null>(null);
  const [currentBatchWinners, setCurrentBatchWinners] = useState<Winner[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Calcular participantes disponibles (excluyendo ganadores prevos)
  const getAvailableParticipantsFor = (listId: string) => {
    const winnerIds = new Set(winners.map(w => w.participant.id));
    if (listId === 'all') {
      return participantLists.flatMap(list => list.participants).filter(p => !winnerIds.has(p.id));
    }
    const list = participantLists.find(l => l.id === listId);
    return list ? list.participants.filter(p => !winnerIds.has(p.id)) : [];
  }; 

  const handleDrawClick = (prize: Prize) => {
    if (prize.awarded) return;
    
    const available = getAvailableParticipantsFor(prize.listId ?? selectedListId ?? 'all');
    if (available.length < prize.quantity) {
      alert(`No hay suficientes participantes disponibles. Necesitas ${prize.quantity} pero solo hay ${available.length}.`);
      return;
    }

    setSelectedPrizeForDraw(prize);
    setIsAnimating(true);

    // Animación de "Buscando..."
    setTimeout(() => {
      performBatchDraw(prize, available);
    }, 3000); // 3 segundos de suspenso
  };

  const performBatchDraw = (prize: Prize, available: Participant[]) => {
    // Algoritmo de selección aleatoria múltiple
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const selectedParticipants = shuffled.slice(0, prize.quantity);
    
    const newWinners: Winner[] = selectedParticipants.map(p => ({
      participant: p,
      prizeId: prize.id,
      timestamp: Date.now(),
      // Aquí asignamos el mensaje predefinido inmediatamente
      aiMessage: generateCongratulationMessage(p.name, prize.name)
    }));

    // Actualizar estado
    setWinners(prev => [...prev, ...newWinners]);
    setPrizes(prev => prev.map(p => 
      p.id === prize.id ? { ...p, awarded: true } : p
    ));
    
    setCurrentBatchWinners(newWinners);
    setIsAnimating(false);
    triggerConfetti();
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#D42426', '#2F5233', '#F1D570']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#D42426', '#2F5233', '#F1D570']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const closeResultModal = () => {
    setSelectedPrizeForDraw(null);
    setCurrentBatchWinners([]);
  };

  // Modal de Animación / Resultados
  const renderModal = () => {
    if (!selectedPrizeForDraw) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-4 border-holiday-gold animate-bounce-in">
          
          {/* Header Modal */}
          <div className="bg-holiday-red p-6 text-center relative">
            <h3 className="text-white text-3xl font-christmas">
              {isAnimating ? 'Buscando Ganadores...' : '¡Felicidades!'}
            </h3>
            <p className="text-holiday-gold text-xl mt-2 font-bold">{selectedPrizeForDraw.name}</p>
            {!isAnimating && (
              <button onClick={closeResultModal} className="absolute top-4 right-4 text-white/80 hover:text-white">
                <X size={32} />
              </button>
            )}
          </div>

          {/* Body Modal */}
          <div className="p-8 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/snow.png')] bg-gray-50 flex-1">
            {isAnimating ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Sparkles className="w-24 h-24 text-holiday-gold animate-spin-slow mb-6" />
                <p className="text-2xl text-gray-600 font-christmas animate-pulse">Santa está revisando la lista...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentBatchWinners.map((w, idx) => (
                  <div key={idx} className="bg-white border-2 border-holiday-green/20 rounded-xl p-4 flex items-center gap-4 shadow-sm animate-slide-up" style={{animationDelay: `${idx * 100}ms`}}>
                    <div className="bg-holiday-green text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-xl text-gray-800">{w.participant.name}</p>
                      <p className="text-xs text-gray-500 italic mt-1 text-holiday-red">{w.aiMessage}</p>
                    </div>
                    <Trophy className="ml-auto text-holiday-gold w-6 h-6" />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer Modal */}
          {!isAnimating && (
             <div className="p-4 bg-gray-100 border-t flex justify-center">
                <button onClick={closeResultModal} className="bg-holiday-green text-white px-8 py-2 rounded-full font-bold hover:bg-green-800 transition">
                  Continuar
                </button>
             </div>
          )}
        </div>
      </div>
    );
  };

  const availableCount = getAvailableParticipantsFor(selectedListId ?? 'all').length;
  const filteredPrizes = prizes.filter(p => {
    // mostrar solo premios que aplican a la lista seleccionada (o a todas)
    if ((p.listId ?? 'all') === 'all') return selectedListId === 'all' || true; // show global if desired
    return p.listId === selectedListId;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      {renderModal()}
      
      <div className="flex justify-between items-end mb-4">
         <div>
           <label className="text-sm text-white mr-2">Lista a mostrar:</label>
           <select
             value={selectedListId}
             onChange={(e) => setSelectedListId(e.target.value)}
             className="rounded px-3 py-1"
           >
             <option value="all">Todas las listas</option>
             {participantLists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
           </select>
         </div>
         <div>
             <h2 className="text-4xl font-christmas text-white drop-shadow-md">Panel de Sorteo</h2>
            <p className="text-white/80">Participantes disponibles: <span className="font-bold text-holiday-gold">{getAvailableParticipantsFor(selectedListId ?? 'all').length}</span></p>
         </div>
         <button 
           onClick={onViewHistory}
           className="bg-white text-holiday-red px-6 py-2 rounded-full font-bold shadow-lg hover:bg-gray-100 transition flex items-center gap-2"
         >
           <Trophy size={20} /> Ver Historial Completo
         </button>
       </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Listas (Solo visualización) */}
        <div className="lg:col-span-1 bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl border-t-4 border-holiday-green h-[600px] flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
            <Users className="text-holiday-green" />
            <h3 className="text-xl font-bold text-gray-800">Participantes</h3>
          </div>
          <div className="overflow-y-auto flex-1 space-y-4 pr-2">
             {participantLists.map(list => (
               <div key={list.id} className="mb-4">
                 <h4 className="font-bold text-gray-600 text-sm uppercase tracking-wider mb-2">{list.name}</h4>
                 <ul className="space-y-1">
                   {list.participants.map(p => {
                     const isWinner = winners.some(w => w.participant.id === p.id);
                     return (
                        <li key={p.id} className={`text-sm p-2 rounded flex items-center justify-between ${isWinner ? 'bg-red-100 text-red-400 line-through' : 'bg-white shadow-sm border border-gray-100'}`}>
                          <span>{p.name}</span>
                          {isWinner && <UserX size={14} />}
                        </li>
                     );
                   })}
                 </ul>
               </div>
             ))}
          </div>
        </div>

        {/* Columna Derecha: Premios (Tarjetas de acción) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {filteredPrizes.map((prize) => (
              <div 
                key={prize.id} 
                className={`relative rounded-2xl p-6 shadow-xl transition-all duration-300 border-4 ${
                  prize.awarded 
                    ? 'bg-gray-200 border-gray-400 opacity-80 grayscale' 
                    : 'bg-white border-holiday-gold hover:scale-[1.02]'
                }`}
              >
                 {prize.awarded && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/10 rounded-xl">
                       <span className="bg-red-600 text-white px-4 py-1 rounded-full font-bold text-sm transform -rotate-12 border-2 border-white shadow-lg">AGOTADO</span>
                    </div>
                 )}

                <div className="flex justify-between items-start mb-4">
                  <div className="bg-holiday-red/10 p-3 rounded-full">
                    <Gift className="w-8 h-8 text-holiday-red" />
                  </div>
                  <span className="bg-holiday-green text-white text-xs font-bold px-3 py-1 rounded-full">
                    {prize.quantity} {prize.quantity === 1 ? 'Ganador' : 'Ganadores'}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{prize.name}</h3>
                <p className="text-gray-500 text-sm mb-6">
                  {prize.awarded ? 'Sorteo realizado' : 'Listo para sortear'}
                </p>

                <button
                  onClick={() => handleDrawClick(prize)}
                  disabled={prize.awarded}
                  className={`w-full py-3 rounded-xl font-bold text-lg shadow-md transition-colors ${
                    prize.awarded 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-gradient-to-r from-holiday-red to-red-700 text-white hover:shadow-lg active:translate-y-1'
                  }`}
                >
                  {prize.awarded ? 'Completado' : '¡SORTEAR AHORA!'}
                </button>
              </div>
            ))}
          </div>
          
          {prizes.length === 0 && (
             <div className="text-center text-white text-xl">No hay premios configurados.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RaffleGame;