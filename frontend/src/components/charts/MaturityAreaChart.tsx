import {
    VictoryArea,
    VictoryGroup,
    VictoryChart,
    VictoryAxis,
    VictoryTheme,
    VictoryLine
} from "victory";
import { useState } from "react";
import type { MainData, RawCompanyData } from "@/types";

// --- TypeScript Interfaces ---
interface ChartProps {
    data: MainData;
    title: string;
}

// --- Helper function (assuming it's defined) ---
const formatDataForAreaChart = (
    companyData: RawCompanyData
): { x: string; y: number }[] => {
    const calculations = companyData.find(
        (item) => "final_calculation" in item
    )?.final_calculation;
    if (!calculations || !calculations.spe_domain_summary) return [];

    return Object.keys(calculations.spe_domain_summary).map((speKey) => ({
        x: speKey.replace("SPE-Domain-", "SPE"),
        y: calculations.spe_domain_summary[speKey].domain_average,
    }));
};


// --- React Component ---
const MaturityAreaChart = ({ data, title }: ChartProps) => {
    const [hoveredLegend, setHoveredLegend] = useState<string | null>(null);

    const companies = Object.keys(data).filter((key) => key !== "default");

    // No change here
    const chartData = companies.map((key) => ({
        name: key.toUpperCase(),
        data: formatDataForAreaChart(data[key]),
    }));
    
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const colorScale = VictoryTheme.material.palette?.cool!;

    return (
        <div className="w-full h-[300px] pb-5">
            <h3>{title}</h3>
            <VictoryChart
                theme={VictoryTheme.material}
                width={800}
                height={350}
                padding={{ top: 30, bottom: 70, left: 50, right: 30 }}
                domainPadding={{ x: 25 }}
            >
                <VictoryAxis
                    dependentAxis
                    domain={[0, 5]}
                    style={{
                        tickLabels: {
                            fontSize: 16,
                        },
                    }}
                />
                <VictoryAxis />

                <VictoryGroup colorScale={colorScale}>
                    {chartData.map((company) => (
                        <VictoryArea
                            key={company.name}
                            data={company.data}
                            style={{
                                data: {
                                    fillOpacity:
                                        hoveredLegend &&
                                        hoveredLegend !== company.name
                                            ? 0.1 // Use a slight opacity instead of 0
                                            : 0.6,
                                    strokeOpacity:
                                        hoveredLegend &&
                                        hoveredLegend !== company.name
                                            ? 0.1 // Use a slight opacity instead of 0
                                            : 0.8,
                                },
                            }}
                            animate={{
                                duration: 500,
                            }}
                        />
                    ))}
                    {chartData.map((company) => (
                        <VictoryLine
                            key={`${company.name}-line`}
                            data={company.data}
                            style={{
                                data: {
                                    strokeWidth: 2.5,
                                    opacity: (hoveredLegend && hoveredLegend !== company.name) ? 0.1 : 1,
                                },
                            }}
                            animate={{
                                duration: 500,
                            }}
                        />
                    ))}
                </VictoryGroup>
            </VictoryChart>

            {/* Legend Section */}
            <div className="pt-0">
                <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center flex-1">
                    {chartData.map((company, index) => (
                        <div
                            key={company.name}
                            className="flex items-center text-xs cursor-pointer"
                            onMouseOver={() => setHoveredLegend(company.name)}
                            onMouseOut={() => setHoveredLegend(null)}
                        >
                            <div
                                className="w-3 h-3 rounded-full mr-2 shrink-0"
                                // Use the index to get the color from our defined scale
                                style={{ backgroundColor: colorScale[index % colorScale.length] }}
                            ></div>
                            <span>{company.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MaturityAreaChart;