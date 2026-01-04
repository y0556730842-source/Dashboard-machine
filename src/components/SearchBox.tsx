interface Props {
  value: string;
  onChange: (value: string) => void;
}

const SearchBox = ({ value, onChange }: Props) => (
  <input
    type="text"
    placeholder="Search machines by name..."
    className="border border-gray-300 p-2 rounded w-full bg-white"
    value={value}
    onChange={e => onChange(e.target.value)}
  />
);

export default SearchBox;
