import { useState, useMemo } from "react";
import CountUp from "react-countup";
import { StatCard } from "./StatCard";
import type { MainData, ControlRecord, FinalCalculation } from "@/types";
// Shadcn UI component imports
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// --- TYPE GUARDS ---
function isControlRecord(
    item: ControlRecord | FinalCalculation
): item is ControlRecord {
    return "Control ID" in item;
}

function isFinalCalculationItem(
    item: ControlRecord | FinalCalculation
): item is FinalCalculation {
    return "final_calculation" in item;
}

interface CompanyDetailsTableProps {
    data: MainData;
    selectedOrg: string;
    isAdmin: boolean;
}

export function CompanyDetailsTable({
    data,
    selectedOrg,
    isAdmin,
}: CompanyDetailsTableProps) {
    // --- START: State and Data Logic ---
    const [speFilter, setSpeFilter] = useState<string>("all");
    const [subDomainFilter, setSubDomainFilter] = useState<string>("all");

    const controlItems = useMemo(() => {
        const companyData = data[selectedOrg as keyof typeof data] || [];
        return companyData.filter(isControlRecord);
    }, [data, selectedOrg]);

    const finalCalculationData = useMemo(() => {
        const companyData = data[selectedOrg as keyof typeof data] || [];
        return companyData.find(isFinalCalculationItem)?.final_calculation;
    }, [data, selectedOrg]);

    const scores = useMemo(() => {
        if (!finalCalculationData) {
            return { assessmentScore: 0, targetScore: 0 };
        }

        const isDomainFiltered = speFilter && speFilter !== "all";
        const isSubDomainFiltered =
            subDomainFilter && subDomainFilter !== "all";

        let assessmentScore = 0;
        let targetScore = 0;

        if (isDomainFiltered && isSubDomainFiltered) {
            assessmentScore =
                finalCalculationData.spe_domain_summary?.[speFilter]
                    ?.subdomain_averages?.[subDomainFilter] ?? 0;
            targetScore =
                finalCalculationData.spe_domain_target_summary?.[speFilter]
                    ?.subdomain_averages?.[subDomainFilter] ?? 0;
        } else if (isDomainFiltered) {
            assessmentScore =
                finalCalculationData.spe_domain_summary?.[speFilter]
                    ?.domain_average ?? 0;
            targetScore =
                finalCalculationData.spe_domain_target_summary?.[speFilter]
                    ?.domain_average ?? 0;
        } else {
            assessmentScore = finalCalculationData.overall_domain_score ?? 0;
            targetScore = finalCalculationData.overall_domain_target_score ?? 0;
        }

        return { assessmentScore, targetScore };
    }, [finalCalculationData, speFilter, subDomainFilter]);

    const uniqueSPEs = useMemo(
        () => [...new Set(controlItems.map((item) => item.SPE))],
        [controlItems]
    );
    const uniqueSubDomains = useMemo(
        () => [...new Set(controlItems.map((item) => item["Sub Domain"]))],
        [controlItems]
    );

    const filteredItems = useMemo(() => {
        return controlItems.filter((item) => {
            const speMatch =
                speFilter !== "all" ? item.SPE === speFilter : true;
            const subDomainMatch =
                subDomainFilter !== "all"
                    ? item["Sub Domain"] === subDomainFilter
                    : true;
            return speMatch && subDomainMatch;
        });
    }, [controlItems, speFilter, subDomainFilter]);

    // --- NEWLY ADDED: Calculate implementation stats based on filteredItems ---
    const stats = useMemo(() => {
        const counts = {
            implemented: 0,
            partial: 0,
            notImplemented: 0,
        };

        filteredItems.forEach((record) => {
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
            total: filteredItems.length,
            ...counts,
        };
    }, [filteredItems]);
    // --- END: State and Data Logic ---

    return (
        <div className="flex flex-col gap-1">
            {!isAdmin && (
                <div className="text-gray-600 text-center font-semibold text-lg">
                    Detailed control assessment for {selectedOrg}
                </div>
            )}
            {/* --- Main container for the assessment header --- */}
            <div className="bg-neutral-200 p-1">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 bg-white border-b">
                    {/* --- GROUP 1: FILTERS --- */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        {/* Domain Filter */}
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                                Select Domain
                            </label>
                            <Select
                                value={speFilter}
                                onValueChange={setSpeFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Domains
                                    </SelectItem>
                                    {uniqueSPEs.map((spe) => (
                                        <SelectItem key={spe} value={spe}>
                                            {spe}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Subdomain Filter */}
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                                Select Subdomain
                            </label>
                            <Select
                                value={subDomainFilter}
                                onValueChange={setSubDomainFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Subdomains
                                    </SelectItem>
                                    {uniqueSubDomains.map((subDomain) => (
                                        <SelectItem
                                            key={subDomain}
                                            value={subDomain}
                                        >
                                            {subDomain}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* --- GROUP 2: UNIFIED STATS & SCORES GRID --- */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center gap-x-6 gap-y-4">
                        {!isAdmin && (
                            <>
                                <StatCard
                                    label="Total Controls"
                                    value={stats.total}
                                />
                                <StatCard
                                    label="Implemented"
                                    value={stats.implemented}
                                />
                                <StatCard
                                    label="Partial"
                                    value={stats.partial}
                                />
                                <StatCard
                                    label="Not Implemented"
                                    value={stats.notImplemented}
                                />
                            </>
                        )}
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                                Observed score
                            </label>
                            <div className="rounded-full w-15 p-2 border-2 border-blue-500 text-blue-600 flex items-center justify-center font-semibold text-lg">
                                <CountUp
                                    end={scores.assessmentScore}
                                    duration={2}
                                    decimals={2}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                                Target score
                            </label>
                            <div className="rounded-full p-2 w-15 border-2 border-blue-500 text-blue-600 flex items-center justify-center font-semibold text-lg">
                                <CountUp
                                    end={scores.targetScore}
                                    duration={2}
                                    decimals={2}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-200 p-1">
                <Table className="border bg-white">
                    <TableHeader>
                        <TableRow>
                            <TableHead>SPE</TableHead>
                            <TableHead>Sub Domain</TableHead>
                            <TableHead>Control ID</TableHead>
                            <TableHead>Control Name</TableHead>
                            <TableHead>In Place?</TableHead>
                            <TableHead>Target Rating</TableHead>
                            <TableHead>Observed Rating</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map((item, index) => (
                            <TableRow key={`${item["Control ID"]}-${index}`}>
                                <TableCell>{item.SPE}</TableCell>
                                <TableCell>{item["Sub Domain"]}</TableCell>
                                <TableCell>{item["Control ID"]}</TableCell>
                                <TableCell>{item["Control Name"]}</TableCell>
                                {item["In Place?"]?.toUpperCase() === "Y" ? (
                                    <TableCell className="text-green-700">
                                        Implemented
                                    </TableCell>
                                ) : item["In Place?"]?.toUpperCase() === "N" ? (
                                    <TableCell className="text-red-600">
                                        Not Implemented
                                    </TableCell>
                                ) : item["In Place?"]?.toUpperCase() === "P" ? (
                                    <TableCell className="text-yellow-500">
                                        Partially Implemented
                                    </TableCell>
                                ) : (
                                    <TableCell className="">N/A</TableCell>
                                )}
                                <TableCell>
                                    {item["CMMI Tier Target Rating"]}
                                </TableCell>
                                <TableCell>
                                    {item["CMMI Tier Observed Rating"]}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
