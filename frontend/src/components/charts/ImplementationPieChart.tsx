import { useMemo } from 'react';
import { VictoryTheme } from 'victory';
import { GenericPieChart } from './GenericPieChart';
import type { MainData, ControlRecord, FinalCalculation, RawCompanyData } from '@/types';


interface PieChartProps {
  data: MainData; // Expects the full data object
  selectedOrg: string; // The currently selected organization
  title: string;
}

interface SubdomainPieChartProps {
  data: MainData;
  selectedOrg: string;
  selectedDomain: string;
  selectedSubdomain: string;
  title: string;
}
// --- React Component (No other changes needed) ---

// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
const bluePalette = VictoryTheme.material.palette?.cool!;

function isControlRecord(item: ControlRecord | FinalCalculation): item is ControlRecord {
    return 'Control ID' in item;
}

export const ImplementationPieChart = ({ data, title, selectedOrg }: PieChartProps) => {
  const companyData = data[selectedOrg as keyof typeof data] || [];
  
  // --- Process Data ---
  const processDataForPieChart = (data: RawCompanyData) => {
    const counts = {
      Implemented: 0,
      Partial: 0,
      "Not Implemented": 0,
    };

    const controlRecords = data.filter(isControlRecord)

    controlRecords.forEach(record => {
      if ("Control ID" in record) {
        switch (record["In Place?"]?.toUpperCase()) {
          case "Y":
            counts.Implemented++;
            break;
          case "P":
            counts.Partial++;
            break;
          case "N":
            counts["Not Implemented"]++;
            break;
          default:
            break;
        }
      }
    });
    
    const total = counts.Implemented + counts.Partial + counts["Not Implemented"];
    if (total === 0) return [];

    return [
      { x: "Implemented", y: counts.Implemented, percentage: Math.round((counts.Implemented / total) * 100) },
      { x: "Partial", y: counts.Partial, percentage: Math.round((counts.Partial / total) * 100) },
      { x: "Not Implemented", y: counts["Not Implemented"], percentage: Math.round((counts["Not Implemented"] / total) * 100) },
    ].filter(item => item.y > 0);
  };

  const processedChartData = processDataForPieChart(companyData);

  return <GenericPieChart title={title} chartData={processedChartData} colorScale={bluePalette} />;
};

export const SubdomainImplementationPieChart = ({ data, title, selectedOrg, selectedDomain, selectedSubdomain }: SubdomainPieChartProps) => {

  // --- Process Data ---
  const processedChartData = useMemo(() => {
    const companyData = data[selectedOrg as keyof typeof data] || [];

    const counts = {
      Implemented: 0,
      Partial: 0,
      "Not Implemented": 0,
    };

    // Filter for the specific domain and subdomain
    const controlRecords = companyData.filter(isControlRecord)

    const filteredData = controlRecords.filter(record => 
        record["Control ID"] && 
        record.SPE === selectedDomain && 
        record["Sub Domain"] === selectedSubdomain
    );

    filteredData.forEach(record => {
        switch (record["In Place?"]) {
          case "Y":
            counts.Implemented++;
            break;
          case "P":
            counts.Partial++;
            break;
          case "N":
            counts["Not Implemented"]++;
            break;
        }
    });
    
    const total = counts.Implemented + counts.Partial + counts["Not Implemented"];
    if (total === 0) return [];

    return [
      { x: "Implemented", y: counts.Implemented, percentage: Math.round((counts.Implemented / total) * 100) },
      { x: "Partial", y: counts.Partial, percentage: Math.round((counts.Partial / total) * 100) },
      { x: "Not Implemented", y: counts["Not Implemented"], percentage: Math.round((counts["Not Implemented"] / total) * 100) },
    ].filter(item => item.y > 0);
  }, [selectedDomain, selectedSubdomain, data, selectedOrg]); // Re-run when selections change

  if (processedChartData.length === 0) {
    return (
        <div className="inline-block p-1">
            <h3 className="mb-6">{title}</h3>
            <div className="flex items-center justify-center w-[250px] h-[250px]">
                <p className="text-gray-500">No data for this subdomain</p>
            </div>
        </div>
    );
  }

  return <GenericPieChart title={title} chartData={processedChartData} colorScale={bluePalette} />;
};

