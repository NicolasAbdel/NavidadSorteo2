// Este servicio ahora genera mensajes estáticos sin usar IA
export const generateCongratulationMessage = (winnerName: string, prizeName: string): string => {
  const mensajes = [
    `¡Felicidades ${winnerName}! ¡Que disfrutes tu ${prizeName} estas fiestas! 🎄✨`,
    `¡Enhorabuena ${winnerName}! ¡${prizeName} es todo tuyo! 🎁🎅`,
    `¡Bravo ${winnerName}! La suerte navideña te ha traído: ${prizeName} ❄️⭐`
  ];
  
  // Selecciona un mensaje aleatorio para variar un poco
  return mensajes[Math.floor(Math.random() * mensajes.length)];
};