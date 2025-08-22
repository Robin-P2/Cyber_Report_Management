import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// FIX 1: Import all necessary types
import type { MainData, FinalCalculation, ControlRecord, SpeDomainSummary } from "@/types";


// Define the shape of the processed organization data
interface Organization {
  name: string;
  targetedScore: number;
  observedScore: number;
  maturityPercent: number;
  topDomain: string;
}

// FIX 2: Add a type guard for FinalCalculation
function isFinalCalcItem(item: ControlRecord | FinalCalculation): item is FinalCalculation {
    return 'final_calculation' in item;
}

// FIX 3: Correct the type for the 'summary' parameter
const getTopDomain = (summary: SpeDomainSummary): string => {
  return Object.entries(summary).reduce(
    (top, [domain, values]) => {
      return values.domain_average > top.maxScore
        ? { domainName: domain, maxScore: values.domain_average }
        : top;
    },
    { domainName: "N/A", maxScore: -Infinity }
  ).domainName;
};

// --- END: Definitions ---

// FIX 4: Correct the component's prop type to use MainData
export function TopOrganizationsTable({ data }: { data: MainData }) {
  const organizations: Organization[] = Object.keys(data).map(companyName => {
    const companyData = data[companyName];

    // Find the final calculation object using the type guard
    const finalCalcItem = companyData.find(isFinalCalcItem);
    const finalCalc = finalCalcItem?.final_calculation;

    return {
      name: companyName,
      // The 'sector' property has been removed as requested
      targetedScore: 5,
      observedScore: finalCalc?.overall_domain_score || 0,
      maturityPercent: finalCalc?.maturity_percent || 0,
      topDomain: finalCalc ? getTopDomain(finalCalc.spe_domain_summary) : "N/A",
    };
  });

  // Sort organizations by maturity and take the top 5
  const topOrganizations = organizations
    .sort((a, b) => b.maturityPercent - a.maturityPercent)
    .slice(0, 5);

  return (
    <Table>
      <TableCaption>Top Organizations by Maturity</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Targeted Score</TableHead>
          <TableHead>Observed Score</TableHead>
          <TableHead>Top Domain</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topOrganizations.map((org) => (
          <TableRow key={org.name}>
            <TableCell>{org.name}</TableCell>
            <TableCell>{org.targetedScore}</TableCell>
            <TableCell>{org.observedScore.toFixed(2)}</TableCell>
            <TableCell>{org.topDomain}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}