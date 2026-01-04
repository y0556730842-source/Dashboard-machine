import { useState } from 'react';
import { Machine } from '../types/Machine';
import { useLocalStorage } from './useLocalStorage';
import { seedMachines } from '../data/seedMachines';

export const useMachines = () => {
  const [machines, setMachines] = useLocalStorage<Machine[]>(
    'machines',
    [],
    seedMachines
  );

  const [lastDeleted, setLastDeleted] = useState<{
    machine: Machine;
    index: number;
  } | null>(null);

  const addMachine = (machine: Machine) =>
    setMachines([...machines, machine]);

  const updateMachine = (updated: Machine) =>
    setMachines(
      machines.map(m =>
        m.id === updated.id ? updated : m
      )
    );

  const deleteMachine = (id: string) => {
    setMachines(prev => {
      const index = prev.findIndex(m => m.id === id);
      if (index === -1) return prev;

      setLastDeleted({
        machine: prev[index],
        index,
      });

      return prev.filter(m => m.id !== id);
    });
  };

  const undoDelete = () => {
    if (!lastDeleted) return;

    setMachines(prev => {
      const next = [...prev];
      next.splice(lastDeleted.index, 0, lastDeleted.machine);
      return next;
    });

    setLastDeleted(null);
  };

  return {
    machines,
    addMachine,
    updateMachine,
    deleteMachine,
    undoDelete,
    lastDeleted,
  };
};
