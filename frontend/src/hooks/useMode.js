import { useContext } from 'react';
import { ModeContext } from '../contexts/ModeContext';

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within ModeProvider');
  }
  return context;
};
