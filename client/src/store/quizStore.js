import { create } from 'zustand';
export const useQuizStore = create((set) => ({
    answers: [],
    setAnswers: (answers) => set({ answers }),
    reset: () => set({ answers: [] }),
}));
