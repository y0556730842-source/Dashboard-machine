import { MachineStatus } from '../enums/MachineStatus';

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  lastUpdated: Date;
}
