import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectQueryProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

const SelectQuery = ({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
}: SelectQueryProps) => {
  return (
    <div className="flex space-x-2 items-center p-3">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectQuery;