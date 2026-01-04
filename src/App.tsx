import { useState } from 'react';
import { useMachines } from './hooks/useMachines';
import { MachineStatus } from './enums/MachineStatus';
import AddMachineForm from './components/AddMachineForm';
import MachineCard from './components/MachineCard';
import StatusFilter from './components/StatusFilter';
import SearchBox from './components/SearchBox';
import './App.css';

type StatusFilterValue = MachineStatus | 'ALL';

function App() {
  const { machines, addMachine, updateMachine, deleteMachine, undoDelete, lastDeleted } = useMachines();
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and search machines
  const filteredMachines = machines.filter(machine => {
    const matchesStatus = statusFilter === 'ALL' || machine.status === statusFilter;
    const matchesSearch = machine.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Machine</h1>
          <p className="text-gray-600">Manage and monitor your factory machines</p>
        </div>

        {/* Add Machine Form */}
        <AddMachineForm onAdd={addMachine} />

        {/* Undo Delete Notification */}
        {lastDeleted && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6 flex justify-between items-center">
            <span className="text-blue-800">
              Machine "{lastDeleted.machine.name}" was deleted
            </span>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
              onClick={undoDelete}
            >
              Undo
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <StatusFilter value={statusFilter} onChange={setStatusFilter} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name</label>
              <SearchBox value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredMachines.length} of {machines.length} machines
        </div>

        {/* Machines Grid */}
        {filteredMachines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMachines.map(machine => (
              <MachineCard
                key={machine.id}
                machine={machine}
                onDelete={deleteMachine}
                onUpdate={updateMachine}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded shadow p-8 text-center">
            <p className="text-gray-500 text-lg">
              {machines.length === 0 ? 'No machines yet. Add one to get started!' : 'No machines match your filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
