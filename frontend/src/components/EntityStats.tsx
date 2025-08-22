import { useMemo } from "react";
import CountUp from "react-countup";
import type { MainData, ControlRecord, FinalCalculation } from "@/types";

interface EntityStatsProps {
    data: MainData;
    selectedDomain: string;
    selectedSubdomain: string;
}

interface StatCardProps {
    label: string;
    value: number;
}

// --- Main Component: EntityStats ---

function isControlRecord(item: ControlRecord | FinalCalculation): item is ControlRecord {
    return 'Control ID' in item;
}

const EntityStats = ({
    data,
    selectedDomain,
    selectedSubdomain,
}: EntityStatsProps) => {
    console.log(selectedDomain, selectedSubdomain);
    // useMemo will re-calculate stats only when its dependencies change
    const stats = useMemo(() => {
    const companyRecords =
        data && Object.keys(data).length > 0
            ? data[Object.keys(data)[0]]
            : [];

    // First, filter the array to include ONLY ControlRecord objects
    let filteredData = Array.isArray(companyRecords)
        ? companyRecords.filter(isControlRecord)
        : [];

    // Now, all subsequent access is safe because 'filteredData' is of type 'ControlRecord[]'
    if (selectedDomain !== "all") {
        filteredData = filteredData.filter(
            (record) => record.SPE === selectedDomain
        );
    }

    if (selectedSubdomain !== "all") {
        filteredData = filteredData.filter(
            (record) => record["Sub Domain"] === selectedSubdomain
        );
    }

    const counts = {
        implemented: 0,
        partial: 0,
        notImplemented: 0,
    };

    filteredData.forEach((record) => {
        // This access is now safe
        switch (record["In Place?"]) {
            case "Y":
                counts.implemented++;
                break;
            case "P":
                counts.partial++;
                break;
            case "N":
                counts.notImplemented++;
                break;
            default:
                break;
        }
    });

    // The total is now the length of the *filtered* control records
    return {
        total: filteredData.length,
        ...counts,
    };
}, [data, selectedDomain, selectedSubdomain]);

    // A reusable card component for consistent styling
    const StatCard = ({ label, value }: StatCardProps) => (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                {label}
            </label>
            <div className="rounded-full p-2 w-15 border-1 flex items-center justify-center font-semibold text-lg">
                <CountUp end={value} duration={2}/>
            </div>
        </div>
    );

    return (
        <div className="w-full">
            <div className="flex gap-4">
                <StatCard label="Total Controls" value={stats.total} />
                <StatCard label="Implemented" value={stats.implemented} />
                <StatCard label="Partial" value={stats.partial} />
                <StatCard
                    label="Not Implemented"
                    value={stats.notImplemented}
                />
            </div>
        </div>
    );
};

export default EntityStats;
