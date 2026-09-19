import { create } from 'zustand';

/**
 * Deljeno UI stanje AI asistenta (Alano widget), da bi drugi floating
 * elementi na sajtu (npr. HelpButton) mogli da se sklone dok je chat otvoren.
 */
export const useAssistantUiStore = create((set) => ({
  isOpen: false,
  setAssistantOpen: (isOpen) => set({ isOpen }),
}));
