import { MachineStatus } from '../enums/MachineStatus';

type StatusFilterValue = MachineStatus | 'ALL';

interface Props {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
}

const StatusFilter = ({ value, onChange }: Props) => (
  <select
    className="border border-gray-300 p-2 rounded bg-white"
    value={value}
    onChange={(e) => {
      const val = e.target.value;
      if (val === 'ALL') {
        onChange('ALL');
      } else {
        onChange(val as MachineStatus);
      }
    }}
  >
    <option value="ALL">All Status</option>
    {Object.values(MachineStatus).map(status => (
      <option key={status} value={status}>
        {status}
      </option>
    ))}
  </select>
);

export default StatusFilter;
