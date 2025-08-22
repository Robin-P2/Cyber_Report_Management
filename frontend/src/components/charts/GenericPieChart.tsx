import { VictoryPie, VictoryLabel } from 'victory';

// This component is now more flexible
interface PieChartDataItem {
  x: string;
  y: number;
  percentage: number;
}

interface GenericPieChartProps {
  title: string;
  chartData: PieChartDataItem[];
  colorScale: string[]; // 1. Accept a color array as a prop
}

export const GenericPieChart = ({ title, chartData, colorScale }: GenericPieChartProps) => {
  if (chartData.length === 0) {
    return (
      <div className="inline-block p-1">
        <h3 className="mb-6">{title}</h3>
        <div className="flex items-center justify-center text-center w-[350px] h-[250px]">
          <p className="text-gray-500">No data available for this selection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1">
      <h3 className="mb-6">{title}</h3>
      {/* --- THIS IS THE LINE THAT WAS CHANGED --- */}
      {/* This container now stacks vertically by default and switches to a row on medium screens */}
      <div className="flex flex-col md:flex-row items-center w-full gap-4 md:gap-x-8">
        <div className="w-[250px] h-[250px]">
          <VictoryPie
            innerRadius={80}
            labelRadius={105}
            labels={({ datum }) => `${datum.percentage}%`}
            labelComponent={<VictoryLabel style={{ fill: 'white', fontSize: 22, fontWeight: "bold" }} />}
            data={chartData}
            padding={10}
            colorScale={colorScale}
          />
        </div>
        <div className="flex flex-col gap-2.5">
          {chartData.map((item, index) => (
            <div key={item.x} className="flex items-center text-sm">
              <div
                className="w-3 h-3 rounded-full mr-2 shrink-0"
                style={{ backgroundColor: colorScale[index % colorScale.length] }}
              ></div>
              <span>{item.x}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};