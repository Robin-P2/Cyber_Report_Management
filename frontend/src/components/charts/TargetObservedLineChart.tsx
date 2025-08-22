import {
    VictoryChart,
    VictoryLine,
    VictoryAxis,
    VictoryTheme,
    VictoryLegend,
} from "victory";
import type { MainData, ControlRecord, FinalCalculation, RawCompanyData } from "@/types";

interface ChartProps {
    data: MainData;
    selectedOrg: string;
    title: string;
}

// --- Helper Functions ---
const parseRating = (ratingStr: string): number | null => {
    if (typeof ratingStr !== "string" || ratingStr === "Not Applicable") {
        return null;
    }
    const match = ratingStr.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : null;
};

function isControlRecord(item: ControlRecord | FinalCalculation): item is ControlRecord {
    return 'Control ID' in item;
}


// --- React Component ---
const TargetObservedLineChart = ({ data, selectedOrg, title }: ChartProps) => {
    const processDataForLineChart = (companyData: RawCompanyData) => {
        const domainRatings: {
            [key: string]: { targets: number[]; observeds: number[] };
        } = {};

        const controlRecords = companyData.filter(isControlRecord)
        // Group ratings by SPE Domain
        controlRecords.forEach((record) => {
            if (record["Control ID"] && record.SPE) {
                if (!domainRatings[record.SPE]) {
                    domainRatings[record.SPE] = { targets: [], observeds: [] };
                }
                const target = parseRating(record["CMMI Tier Target Rating"]);
                const observed = parseRating(
                    record["CMMI Tier Observed Rating"]
                );

                if (target !== null)
                    domainRatings[record.SPE].targets.push(target);
                if (observed !== null)
                    domainRatings[record.SPE].observeds.push(observed);
            }
        });

        const targetData: { x: string; y: number }[] = [];
        const observedData: { x: string; y: number }[] = [];

        // Calculate averages for each domain
        for (const domain in domainRatings) {
            const { targets, observeds } = domainRatings[domain];
            const avgTarget = targets.length
                ? targets.reduce((a, b) => a + b, 0) / targets.length
                : 0;
            const avgObserved = observeds.length
                ? observeds.reduce((a, b) => a + b, 0) / observeds.length
                : 0;

            const label = domain.replace("SPE-Domain-", "SPE");
            targetData.push({ x: label, y: parseFloat(avgTarget.toFixed(2)) });
            observedData.push({
                x: label,
                y: parseFloat(avgObserved.toFixed(2)),
            });
        }

        return { targetData, observedData };
    };

    const companyData = data[selectedOrg as keyof typeof data] || [];
    const { targetData, observedData } = processDataForLineChart(companyData);

    const targetColor = "#1864aa"; // Dark Blue
    const observedColor = "#039be5"; // Blue

    return (
        // Removed the flexbox layout from the main container
        <div className="w-full h-full">
            <h3 className="mb-2">{title}</h3>
            <VictoryChart
                theme={VictoryTheme.material}
                // Set a compact, fixed size
                width={400}
                height={250}
                domainPadding={{ x: 25 }}
                padding={{ top: 20, bottom: 60, left: 50, right: 30 }}
            >
                <VictoryAxis dependentAxis domain={[0, 5]} />
                <VictoryAxis />
                <VictoryLine
                    data={targetData}
                    style={{ data: { stroke: targetColor, strokeWidth: 3 } }}
                    animate={{
                        duration: 1000,
                        onLoad: { duration: 1500 },
                    }}
                />
                <VictoryLine
                    data={observedData}
                    style={{ data: { stroke: observedColor, strokeWidth: 3 } }}
                    animate={{
                        duration: 1000,
                        onLoad: { duration: 1500 },
                    }}
                />
                <VictoryLegend
                    x={100}
                    y={220} // Adjusted Y position for the new height
                    orientation="horizontal"
                    gutter={20}
                    data={[
                        { name: "Target", symbol: { fill: targetColor } },
                        { name: "Observed", symbol: { fill: observedColor } },
                    ]}
                />
            </VictoryChart>
        </div>
    );
};

export default TargetObservedLineChart;
