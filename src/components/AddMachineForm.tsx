import { useState } from 'react';
import { Machine } from '../types/Machine';
import { MachineStatus } from '../enums/MachineStatus';

interface Props {
  onAdd: (machine: Machine) => void;
}

const AddMachineForm = ({ onAdd }: Props) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<MachineStatus>(MachineStatus.Idle);
  const [error, setError] = useState('');

  const submit = () => {
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    onAdd({
      id: crypto.randomUUID(),
      name,
      status,
      lastUpdated: new Date(),
    });

    setName('');
    setStatus(MachineStatus.Idle);
    setError('');
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-lg font-bold mb-4 text-gray-700">Add New Machine</h2>
      <div className="flex gap-2 flex-wrap">
        <input
          className="border border-gray-300 p-2 flex-1 min-w-[200px] rounded"
          placeholder="Machine name"
          value={name}
          onChange={e => {
            setName(e.target.value);
            setError('');
          }}
        />
        <select
          className="border border-gray-300 p-2 rounded"
          value={status}
          onChange={e => setStatus(e.target.value as MachineStatus)}
        >
          {Object.values(MachineStatus).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
          onClick={submit}
        >
          Add Machine
        </button>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default AddMachineForm;
