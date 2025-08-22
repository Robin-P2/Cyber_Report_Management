import {
    VictoryBar,
    VictoryChart,
    VictoryAxis,
    VictoryTheme,
    VictoryLabel,
} from "victory";
import type { MainData, RawCompanyData, FinalCalculation } from "@/types";

interface BarChartProps {
    data: MainData;
    selectedOrg: string;
    title: string;
}

// --- React Component ---

const BottomDomainsBarChart = ({ data, title, selectedOrg }: BarChartProps) => {
    const companyData = data[selectedOrg as keyof typeof data] || [];

    const processDataForBarChart = (data: RawCompanyData) => {
        const calculations = (
            data.find((item) => "final_calculation" in item) as
                | FinalCalculation
                | undefined
        )?.final_calculation;
        if (!calculations) return [];

        const { spe_domain_summary } = calculations;

        return Object.keys(spe_domain_summary)
            .map((speKey) => ({
                x: speKey.replace("SPE-Domain-", "SPE"),
                y: spe_domain_summary[speKey].domain_average,
            }))
            .sort((a, b) => a.y - b.y)
            .slice(0, 5);
    };

    const chartData = processDataForBarChart(companyData);

    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const bluePalette = VictoryTheme.material.palette?.cool!

    return (
        <div className="max-w-lg">
            <h3 className="mb-10">{title}</h3>
            <VictoryChart
                domainPadding={{ x: 30 }}
                height={250}
                width={400}
                
            >
                <VictoryAxis />
                <VictoryBar
                    data={chartData}
                    barWidth={25}
                    labels={({ datum }) => datum.y.toFixed(2)}
                    labelComponent={<VictoryLabel dy={-10} style={{fill: "black"}}/>}
                    style={{
                        data: {
                            fill: ({index}) => bluePalette[index as number % bluePalette.length]
                        },
                        labels: {
                            fill: "black",
                        },
                    }}
                    animate={{
                        duration: 1500,
                        onLoad: { duration: 1000 },
                    }}
                />
            </VictoryChart>
        </div>
    );
};

export default BottomDomainsBarChart;
