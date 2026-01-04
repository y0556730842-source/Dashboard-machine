import { useState } from 'react';
import { Machine } from '../types/Machine';
import { MachineStatus } from '../enums/MachineStatus';

interface Props {
  machine: Machine;
  onSave: (machine: Machine) => void;
  onCancel: () => void;
}

const EditMachineForm = ({ machine, onSave, onCancel }: Props) => {
  const [name, setName] = useState(machine.name);
  const [status, setStatus] = useState(machine.status);
  const [error, setError] = useState('');

  const save = () => {
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    onSave({ ...machine, name, status, lastUpdated: new Date() });
  };

  return (
    <div className="space-y-2">
      <input
        className="border border-gray-300 p-2 w-full rounded"
        value={name}
        onChange={e => {
          setName(e.target.value);
          setError('');
        }}
      />
      <select
        className="border border-gray-300 p-2 w-full rounded"
        value={status}
        onChange={e => setStatus(e.target.value as MachineStatus)}
      >
        {Object.values(MachineStatus).map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button 
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded font-medium"
          onClick={save}
        >
          Save
        </button>
        <button 
          className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded font-medium"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditMachineForm;
