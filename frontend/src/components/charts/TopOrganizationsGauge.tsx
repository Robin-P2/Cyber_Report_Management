import { VictoryPie, VictoryLabel } from "victory";
import { interpolateBlues } from "d3-scale-chromatic";
import type { MainData, FinalCalculation } from "@/types";

// --- Props for the individual Gauge ---
interface GaugeProps {
    name: string;
    value: number;
    color: string;
}

// --- Reusable Gauge Component ---
const Gauge = ({ name, value, color }: GaugeProps) => {
    return (
        <div className="flex flex-col items-center gap-2">
            <span className="font-medium text-sm">{name}</span>
            <svg width={100} height={100} viewBox="0 0 200 200">
                <VictoryPie
                    standalone={false}
                    width={200}
                    height={200}
                    // The data is the percentage value and the remainder to 100
                    data={[
                        { x: 1, y: value },
                        { x: 2, y: 100 - value },
                    ]}
                    // Creates an open arc instead of a full circle
                    startAngle={-135}
                    endAngle={135}
                    // Creates the donut chart effect
                    innerRadius={80}
                    // Hide the default labels
                    labels={() => null}
                    style={{
                        data: {
                            // The first color is for the value, the second for the gray background
                            fill: ({ datum }) =>
                                datum.x === 1 ? color : "#e0e0e0",
                        },
                    }}
                    animate={{ duration: 1000 }}
                />
                <VictoryLabel
                    textAnchor="middle"
                    verticalAnchor="middle"
                    x={100}
                    y={100}
                    text={`${Math.round(value)}`}
                    style={{ fontSize: 32, fill: "black", fontWeight: "bold" }}
                />
            </svg>
        </div>
    );
};

// --- Main Container Component ---

interface TopOrganizationsGaugeProps {
    data: MainData;
    title: string;
}

const TopOrganizationsGauge = ({ data, title }: TopOrganizationsGaugeProps) => {
    // Process the data to find the top 5 organizations
    const top5Data = Object.keys(data)
        .map((key) => {
            const companyData = data[key];
            const calc = (
                companyData.find((item) => "final_calculation" in item) as
                    | FinalCalculation
                    | undefined
            )?.final_calculation;
            return {
                name: key.toUpperCase(),
                maturity: calc?.maturity_percent || 0,
            };
        })
        .sort((a, b) => b.maturity - a.maturity) // Sort descending
        .slice(0, 5); // Take the top 5

    const generateColorScale = (numColors: number) => {
        if (numColors === 1) return ["#1976d2"];
        const colorPoints = Array.from(
            { length: numColors },
            (_, i) => i / (numColors - 1)
        );
        return colorPoints.map((t) => interpolateBlues(0.9 - t * 0.6));
    };

    const blueColorScale = generateColorScale(top5Data.length);

    return (
        <div className="p-2 rounded-lg">
            <h3 className="mb-4">{title}</h3>
            <div className="flex justify-around">
                {top5Data.map((org, index) => (
                    <Gauge
                        key={org.name}
                        name={org.name}
                        value={org.maturity}
                        color={blueColorScale[index]}
                    />
                ))}
            </div>
        </div>
    );
};

export default TopOrganizationsGauge;
