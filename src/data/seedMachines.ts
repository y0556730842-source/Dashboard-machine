import { Machine } from '../types/Machine';
import { MachineStatus } from '../enums/MachineStatus';

const now = new Date();

export const seedMachines: Machine[] = [
  {
    id: crypto.randomUUID(),
    name: 'Cutter A',
    status: MachineStatus.Running,
    lastUpdated: now,
  },
  {
    id: crypto.randomUUID(),
    name: 'Press B',
    status: MachineStatus.Idle,
    lastUpdated: now,
  },
  {
    id: crypto.randomUUID(),
    name: 'Welder C',
    status: MachineStatus.Offline,
    lastUpdated: now,
  },
  {
    id: crypto.randomUUID(),
    name: 'Lathe D',
    status: MachineStatus.Running,
    lastUpdated: now,
  },
  {
    id: crypto.randomUUID(),
    name: 'Drill E',
    status: MachineStatus.Idle,
    lastUpdated: now,
  },
  {
    id: crypto.randomUUID(),
    name: 'Robot F',
    status: MachineStatus.Running,
    lastUpdated: now,
  },
];
