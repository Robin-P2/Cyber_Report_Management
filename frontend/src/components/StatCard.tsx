import CountUp from "react-countup";

interface StatCardProps {
    label: string;
    value: number;
}

export const StatCard = ({ label, value }: StatCardProps) => (
    <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
            {label}
        </label>
        <div className="flex items-center justify-center rounded-full border-1 p-2 font-semibold text-lg">
            <CountUp end={value} duration={2} />
        </div>
    </div>
);