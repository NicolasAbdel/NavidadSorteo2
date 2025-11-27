import React from 'react';
import { Winner, Prize, ParticipantList } from '../types';
import { Trophy, ArrowLeft, Download, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface WinnerListProps {
  winners: Winner[];
  prizes: Prize[];
  participantLists: ParticipantList[]; // <-- nuevo prop
  onBack: () => void;
}

const WinnerList: React.FC<WinnerListProps> = ({ winners, prizes, participantLists, onBack }) => {
  const getPrizeName = (id: string) => prizes.find(p => p.id === id)?.name || 'Premio Misterioso';

  const getListName = (participantId: string) => {
    const list = participantLists.find(l => l.participants.some(p => p.id === participantId));
    return list?.name || '—';
  };

  const downloadCSV = () => {
    const headers = ['Nombre,Premio,Lista,Fecha'];
    const rows = winners.map(w => {
      const date = new Date(w.timestamp).toLocaleDateString() + ' ' + new Date(w.timestamp).toLocaleTimeString();
      return `"${w.participant.name}","${getPrizeName(w.prizeId)}","${getListName(w.participant.id)}","${date}"`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ganadores_navidad.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(22);
    doc.setTextColor(212, 36, 38); // Holiday Red
    doc.text("Ganadores del Sorteo Navideño", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Fecha del reporte: ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" });

    // Tabla (ahora incluye columna Lista)
    const tableData = winners.map(w => [
      w.participant.name,
      getPrizeName(w.prizeId),
      getListName(w.participant.id),
      new Date(w.timestamp).toLocaleTimeString()
    ]);

    autoTable(doc, {
      head: [['Participante', 'Premio Ganado', 'Lista', 'Hora']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [47, 82, 51] }, // Holiday Green
      styles: { fontSize: 12, cellPadding: 3 },
    });

    doc.save("ganadores_navidad.pdf");
  };

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl p-8 shadow-xl max-w-5xl mx-auto border-4 border-holiday-gold min-h-[60vh]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-4xl font-christmas text-holiday-red">Lista Oficial de Ganadores</h2>
        <div className="flex gap-2">
           <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow"
            title="Descargar CSV"
          >
            <FileSpreadsheet size={18} /> CSV
          </button>
           <button 
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow"
            title="Descargar PDF"
          >
            <FileText size={18} /> PDF
          </button>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-holiday-green transition-colors font-semibold ml-4 border px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
        </div>
      </div>

      {winners.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No hay ganadores todavía.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-holiday-gold text-holiday-green">
                <th className="p-4 font-bold text-lg">Ganador</th>
                <th className="p-4 font-bold text-lg">Premio</th>
                <th className="p-4 font-bold text-lg">Lista</th>
                <th className="p-4 font-bold text-lg">Hora</th>
              </tr>
            </thead>
            <tbody>
              {winners.map((winner, idx) => (
                <tr key={`${winner.participant.id}-${idx}`} className="border-b border-gray-100 hover:bg-red-50 transition-colors">
                  <td className="p-4 font-semibold text-gray-800 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-holiday-gold" />
                    {winner.participant.name}
                  </td>
                  <td className="p-4 text-holiday-red font-bold">
                    {getPrizeName(winner.prizeId)}
                  </td>
                  <td className="p-4 text-gray-700">
                    {getListName(winner.participant.id)}
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(winner.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WinnerList;