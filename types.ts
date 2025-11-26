export interface Participant {
  id: string;
  name: string;
}

export interface ParticipantList {
  id: string;
  name: string;
  participants: Participant[];
}

export interface Prize {
  id: string;
  name: string;
  quantity: number; // Total a sortear
  awarded: boolean;  // Si ya fue sorteado completamente
  winners?: Winner[]; // Guardamos los ganadores específicos de este premio aquí también para referencia rápida
  // Lista a la que aplica este premio. Si falta o es 'all' aplica a todas.
  listId?: string;
}

export interface Winner {
  participant: Participant;
  prizeId: string;
  timestamp: number;
  aiMessage?: string;
}

export type AppState = 'setup' | 'public_view';