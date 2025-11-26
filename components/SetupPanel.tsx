import React, { useState, useRef, useEffect } from 'react';
import { Upload, Plus, Trash2, Gift, Users, FileText } from 'lucide-react';
import { Participant, Prize, ParticipantList } from '../types';

interface SetupPanelProps {
  participantLists: ParticipantList[];
  setParticipantLists: React.Dispatch<React.SetStateAction<ParticipantList[]>>;
  prizes: Prize[];
  setPrizes: React.Dispatch<React.SetStateAction<Prize[]>>;
  onStart: () => void;
}

const SetupPanel: React.FC<SetupPanelProps> = ({
  participantLists,
  setParticipantLists,
  prizes,
  setPrizes,
  onStart
}) => {
  // Estados para listas de participantes
  const [listName, setListName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para premios
  const [newPrizeName, setNewPrizeName] = useState('');
  const [newPrizeQty, setNewPrizeQty] = useState(1);
  const [newPrizeListId, setNewPrizeListId] = useState<string>('');

  useEffect(() => {
    // si hay listas y no hay selección, escoger la primera por defecto
    if (participantLists.length > 0 && !newPrizeListId) {
      setNewPrizeListId(participantLists[0].id);
    }
  }, [participantLists, newPrizeListId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!listName.trim()) {
      alert("Por favor, ingresa un nombre para la lista antes de subir el archivo.");
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      const newParticipants: Participant[] = lines.map((line, index) => ({
        id: `csv-${Date.now()}-${index}`,
        name: line.replace(/,/g, ' ').trim()
      }));

      const newList: ParticipantList = {
        id: `list-${Date.now()}`,
        name: listName,
        participants: newParticipants
      };

      setParticipantLists([...participantLists, newList]);
      setListName(''); // Limpiar nombre
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    };
    reader.readAsText(file);
  };

  const removeList = (id: string) => {
    setParticipantLists(participantLists.filter(l => l.id !== id));
  };

  const addPrize = () => {
    if (!newPrizeName.trim() || newPrizeQty < 1) return;
    if (participantLists.length > 0 && !newPrizeListId) {
      alert('Selecciona a qué lista aplica el premio.');
      return;
    }
    const prize: Prize = {
      id: `prize-${Date.now()}`,
      name: newPrizeName,
      quantity: newPrizeQty,
      awarded: false,
      listId: participantLists.length === 0 ? 'all' : newPrizeListId
    };
    setPrizes([...prizes, prize]);
    setNewPrizeName('');
    setNewPrizeQty(1);
    // mantener la selección
  };

  const removePrize = (id: string) => {
    setPrizes(prizes.filter(p => p.id !== id));
  };

  const totalParticipants = participantLists.reduce((acc, list) => acc + list.participants.length, 0);
  const canStart = totalParticipants > 0 && prizes.length > 0;

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl p-8 shadow-xl max-w-5xl mx-auto border-4 border-holiday-gold">
      <h2 className="text-3xl font-christmas text-holiday-red mb-6 text-center">Configuración del Sorteo</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Sección de Participantes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-holiday-green" />
            <h3 className="text-xl font-bold text-gray-800">1. Listas de Participantes</h3>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la nueva lista</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Ej: Departamento Ventas"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-holiday-green outline-none"
              />
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-white transition-colors cursor-pointer" onClick={() => !listName.trim() ? alert("Ingresa un nombre para la lista primero") : fileInputRef.current?.click()}>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Upload className="w-6 h-6 mx-auto mb-1 text-holiday-red" />
              <span className="text-sm font-semibold text-gray-600">Subir CSV</span>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 h-64 overflow-y-auto">
            <h4 className="font-semibold text-sm text-gray-600 mb-2 flex justify-between">
              <span>Listas Cargadas</span>
              <span className="text-holiday-green">{totalParticipants} personas total</span>
            </h4>
            {participantLists.length === 0 ? (
              <p className="text-gray-400 text-sm italic text-center mt-8">No hay listas cargadas.</p>
            ) : (
              <ul className="space-y-2">
                {participantLists.map((list) => (
                  <li key={list.id} className="bg-white p-3 rounded shadow-sm flex justify-between items-center border-l-4 border-blue-400">
                    <div>
                      <div className="font-bold text-gray-800 flex items-center gap-2">
                        <FileText size={14} /> {list.name}
                      </div>
                      <div className="text-xs text-gray-500">{list.participants.length} participantes</div>
                    </div>
                    <button onClick={() => removeList(list.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sección de Premios */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="text-holiday-red" />
            <h3 className="text-xl font-bold text-gray-800">2. Premios</h3>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
             <label className="block text-sm font-medium text-gray-700 mb-2">Agregar Nuevo Premio</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre del premio"
                value={newPrizeName}
                onChange={(e) => setNewPrizeName(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-holiday-green outline-none"
              />
              <input
                type="number"
                min="1"
                placeholder="Cant."
                value={newPrizeQty}
                onChange={(e) => setNewPrizeQty(parseInt(e.target.value) || 1)}
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-holiday-green outline-none"
              />
                {/* Selector de lista a la que aplica el premio */}
                {participantLists.length > 0 && (
                  <select
                    value={newPrizeListId}
                    onChange={(e) => setNewPrizeListId(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    title="Seleccionar lista a la que aplica el premio"
                  >
                    {participantLists.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                )}
                 <button
                   onClick={addPrize}
                   className="bg-holiday-green text-white p-2 rounded-lg hover:bg-green-800 transition-colors"
                 >
                   <Plus className="w-5 h-5" />
                 </button>
               </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 h-64 overflow-y-auto">
             <h4 className="font-semibold text-sm text-gray-600 mb-2">
              Lista de Premios
            </h4>
            {prizes.length === 0 ? (
              <p className="text-gray-400 text-sm italic text-center mt-8">Añade premios para comenzar...</p>
            ) : (
              <ul className="space-y-2">
                {prizes.map((prize) => {
                  const listName = prize.listId === 'all' ? 'Todas' : participantLists.find(l => l.id === prize.listId)?.name || '—';
                  return (
                    <li key={prize.id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm border-l-4 border-holiday-gold">
                      <div>
                        <span className="font-bold text-gray-800">{prize.name}</span>
                        <span className="text-xs text-gray-500 ml-2 bg-yellow-100 px-2 py-0.5 rounded-full">
                          {prize.quantity} ganadores
                        </span>
                        <div className="text-xs text-gray-400 mt-1">Lista: {listName}</div>
                      </div>
                      <button
                        onClick={() => removePrize(prize.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  );
                })}
               </ul>
             )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={onStart}
          disabled={!canStart}
          className={`
            px-12 py-4 rounded-full text-xl font-bold shadow-lg transform transition-all
            ${canStart 
              ? 'bg-gradient-to-r from-holiday-red to-red-700 text-white hover:scale-105 hover:shadow-xl' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
          `}
        >
          ¡Ir a la Vista Pública! 🎅
        </button>
      </div>
    </div>
  );
};

export default SetupPanel;