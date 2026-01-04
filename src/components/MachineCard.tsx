import { useState } from 'react';
import { Machine } from '../types/Machine';
import { MachineStatus } from '../enums/MachineStatus';
import EditMachineForm from './EditMachineForm';

interface Props {
  machine: Machine;
  onDelete: (id: string) => void;
  onUpdate: (machine: Machine) => void;
}

const getStatusColor = (status: MachineStatus) => {
  switch (status) {
    case MachineStatus.Running:
      return 'bg-green-100 text-green-800 border border-green-300';
    case MachineStatus.Idle:
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case MachineStatus.Offline:
      return 'bg-red-100 text-red-800 border border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-300';
  }
};

const MachineCard = ({ machine, onDelete, onUpdate }: Props) => {
  const [editing, setEditing] = useState(false);

  return (
    <div className="border border-gray-300 p-4 rounded shadow hover:shadow-lg transition bg-white">
      {editing ? (
        <EditMachineForm
          machine={machine}
          onSave={m => { onUpdate(m); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <h2 className="font-bold text-lg mb-2 text-gray-800">{machine.name}</h2>
          <div className="mb-3">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(machine.status)}`}>
              {machine.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Last updated: {new Date(machine.lastUpdated).toLocaleString()}
          </p>
          <div className="flex gap-2">
            <button 
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded font-medium text-sm"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button 
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded font-medium text-sm"
              onClick={() => onDelete(machine.id)}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MachineCard;
