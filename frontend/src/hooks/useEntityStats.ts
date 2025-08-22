import { useMemo } from "react";
import type { MainData, ControlRecord, FinalCalculation } from "@/types";

interface UseEntityStatsProps {
    data: MainData;
    selectedDomain: string;
    selectedSubdomain: string;
}

function isControlRecord(item: ControlRecord | FinalCalculation): item is ControlRecord {
    return 'Control ID' in item;
}

export const useEntityStats = ({ data, selectedDomain, selectedSubdomain }: UseEntityStatsProps) => {
    const stats = useMemo(() => {
        const companyRecords = data && Object.keys(data).length > 0
            ? data[Object.keys(data)[0]]
            : [];

        let filteredData = Array.isArray(companyRecords)
            ? companyRecords.filter(isControlRecord)
            : [];

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

        return {
            total: filteredData.length,
            ...counts,
        };
    }, [data, selectedDomain, selectedSubdomain]);

    return stats;
};