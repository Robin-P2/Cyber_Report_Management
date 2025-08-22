//@ts-nocheck
import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import SelectQuery from "@/components/SelectQuery";
import MaturityAreaChart from "@/components/charts/MaturityAreaChart";
import {
    ImplementationPieChart,
    SubdomainImplementationPieChart,
} from "@/components/charts/ImplementationPieChart";
import TopOrganizationsGauge from "@/components/charts/TopOrganizationsGauge";
import BottomDomainsBarChart from "@/components/charts/BottomDomainsBarChart";
import TargetObservedLineChart from "@/components/charts/TargetObservedLineChart";
import { TopOrganizationsTable } from "@/components/TopOrganizationsTable";
import { CompanyDetailsTable } from "@/components/CompanyDetails";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-Sidebar";
import { api } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";

interface SpeSummaryItem {
    domain_average: number;
    subdomain_averages: { [key: string]: number };
}

interface SpeDomainSummary {
    [key: string]: SpeSummaryItem;
}

interface FinalCalculation {
    final_calculation: {
        spe_domain_summary: SpeDomainSummary;
        overall_domain_score: number;
        maturity_percent: number;
        spe_domain_target_summary?: SpeDomainSummary;
        overall_domain_target_score?: number;
        target_maturity_percent?: number;
    };
}

interface ControlRecord {
    SPE: string;
    "Sub Domain": string;
    "Control ID": string;
    "Control Name": string;
    "Control Name.1": string | null;
    "In Place?": "Y" | "P" | "N" | string | null;
    "CMMI Tier Target Rating": string;
    "CMMI Tier Observed Rating": string;
}

type RawCompanyDataItem = ControlRecord | FinalCalculation;

interface MainData {
    [key: string]: RawCompanyDataItem[];
}

function isControl(item: RawCompanyDataItem): item is ControlRecord {
    return "Control ID" in item;
}

interface filterProps {
    isAdmin: boolean;
}

const Dashboard = () => {
    const { user } = useAuth();
    console.log(user)
    const [data, setData] = useState<MainData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for select inputs
    const [organization, setOrganization] = useState<string>("");
    const [domain, setDomain] = useState<string>("");
    const [subdomain, setSubdomain] = useState<string>("");

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get("report/companies/");
                setData(response.data);
                console.log(response.data)
            } catch (err) {
                setError("Failed to fetch report data.");
                console.error("Failed to fetch report data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Memoize options to prevent re-calculation on every render
    const organizationOptions = useMemo(() => {
        if (!data) return [];
        return Object.keys(data).sort();
    }, [data]);

    const getDomainOptions = (org: string): string[] => {
        if (!org || !data || !data[org]) return [];
        const controls = data[org].filter(isControl);
        const domains = controls.map((item) => item.SPE);
        const definedDomains = domains.filter((d): d is string => !!d);
        return [...new Set(definedDomains)];
    };

    const getSubdomainOptions = (org: string, dom: string): string[] => {
        if (!org || !dom || !data || !data[org]) return [];
        const controls = data[org]
            .filter(isControl)
            .filter((item) => item.SPE === dom);
        const subdomains = controls.map((item) => item["Sub Domain"]);
        const definedSubdomains = subdomains.filter((sd): sd is string => !!sd);
        return [...new Set(definedSubdomains)];
    };

    // Effect to set initial dropdown values once data is loaded
    useEffect(() => {
        if (organizationOptions.length > 0) {
            const initialOrg = organizationOptions[0];
            setOrganization(initialOrg);

            const initialDomains = getDomainOptions(initialOrg);
            if (initialDomains.length > 0) {
                const initialDomain = initialDomains[0];
                setDomain(initialDomain);

                const initialSubdomains = getSubdomainOptions(
                    initialOrg,
                    initialDomain
                );
                setSubdomain(initialSubdomains[0] || "");
            } else {
                setDomain("");
                setSubdomain("");
            }
        }
    }, [organizationOptions]); // This effect runs when organizationOptions are populated

    const domainOptions = useMemo(
        () => getDomainOptions(organization),
        [organization, data]
    );
    const subdomainOptions = useMemo(
        () => getSubdomainOptions(organization, domain),
        [organization, domain, data]
    );

    const handleOrganizationChange = (newOrg: string) => {
        setOrganization(newOrg);
        const newDomainOptions = getDomainOptions(newOrg);
        const newFirstDomain = newDomainOptions[0] || "";
        setDomain(newFirstDomain);
        const newSubdomainOptions = getSubdomainOptions(newOrg, newFirstDomain);
        setSubdomain(newSubdomainOptions[0] || "");
    };

    const handleDomainChange = (newDomain: string) => {
        setDomain(newDomain);
        const newSubdomainOptions = getSubdomainOptions(
            organization,
            newDomain
        );
        setSubdomain(newSubdomainOptions[0] || "");
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen w-screen bg-gray-100">
                <p className="text-lg text-gray-600">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-red-600">{error}</div>;
    }

    // Common Filters Component
    const Filters = ({ isAdmin }: filterProps) => (
        <div className="bg-neutral-200 p-1 mb-2">
            <div className="bg-white p-2 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    {isAdmin && (
                        <SelectQuery
                            label="Select Organization"
                            value={organization}
                            onValueChange={handleOrganizationChange}
                            options={organizationOptions}
                            placeholder="Select an organization"
                        />
                    )}
                    <SelectQuery
                        label="Select Domain"
                        value={domain}
                        onValueChange={handleDomainChange}
                        options={domainOptions}
                        placeholder="Select a domain"
                    />
                    <SelectQuery
                        label="Select Subdomain"
                        value={subdomain}
                        onValueChange={setSubdomain}
                        options={subdomainOptions}
                        placeholder="Select a subdomain"
                    />
                    {isAdmin && (
                        <div className="flex gap-2 items-center justify-self-start lg:justify-self-end">
                            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                                Organizations
                            </label>
                            <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-blue-500 text-lg font-bold text-blue-600">
                                {!data || Object.keys(data).length === 0
                                    ? "N/A"
                                    : Object.keys(data).length}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderEntityDashboard = () => (
        <>
            <Filters isAdmin={false} />
            <div className="p-1 bg-neutral-200">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1">
                    <div className="bg-white p-1 pl-2 shadow">
                        {data && (
                            <BottomDomainsBarChart
                                data={data}
                                selectedOrg={organization}
                                title="Bottom Domains of Organization"
                            />
                        )}
                    </div>
                    <div className="bg-white p-1 pl-2 shadow">
                        {data && (
                            <TargetObservedLineChart
                                data={data}
                                selectedOrg={organization}
                                title="Target vs Observed Rating"
                            />
                        )}
                    </div>
                    <div className="bg-white p-1 pl-2 shadow">
                        {data && (
                            <ImplementationPieChart
                                data={data}
                                selectedOrg={organization}
                                title="Maturity By Implementation (SOE)"
                            />
                        )}
                    </div>
                    <div className="bg-white p-1 pl-2 shadow">
                        {data && (
                            <SubdomainImplementationPieChart
                                data={data}
                                selectedOrg={organization}
                                selectedSubdomain={subdomain}
                                selectedDomain={domain}
                                title="Maturity By Implementation (Subdomain)"
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    const AdminDashboard = () => {
        return (
            <>
                <Filters isAdmin={true} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 p-1 bg-gray-200">
                    <div className="lg:col-span-2 bg-white p-1 pl-2 shadow pb-10">
                        {data && (
                            <MaturityAreaChart
                                data={data}
                                title="Maturity by SOE"
                            />
                        )}
                    </div>
                    <div className="bg-white p-1 pl-2 shadow">
                        {data && (
                            <ImplementationPieChart
                                data={data}
                                selectedOrg={organization}
                                title="Maturity By Implementation (SOE)"
                            />
                        )}
                    </div>
                    <div className="bg-white p-1 pl-2 shadow">
                        {data && (
                            <SubdomainImplementationPieChart
                                data={data}
                                selectedOrg={organization}
                                selectedSubdomain={subdomain}
                                selectedDomain={domain}
                                title="Maturity By Implementation (Subdomain)"
                            />
                        )}
                    </div>
                    <div className="lg:col-span-2 flex flex-col gap-1">
                        <div className="bg-white p-1 shadow h-full">
                            {data && <TopOrganizationsTable data={data} />}
                        </div>
                        <div className="bg-white shadow">
                            {data && (
                                <TopOrganizationsGauge
                                    data={data}
                                    title="Top Organizations by Maturity"
                                />
                            )}
                        </div>
                    </div>
                    <div className="bg-white p-1 pl-2 shadow">
                        {data && (
                            <BottomDomainsBarChart
                                data={data}
                                selectedOrg={organization}
                                title="Bottom Domains of Organization"
                            />
                        )}
                    </div>
                    <div className="bg-white flex-1 p-1 pb-4">
                        {data && (
                            <TargetObservedLineChart
                                data={data}
                                selectedOrg={organization}
                                title="Target vs Observed Rating"
                            />
                        )}
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <SidebarProvider defaultOpen={false}>
                <AppSidebar />
                <div className="w-full">
                    {/* Adjust for sidebar width */}
                    <Header title="Dashboard" />
                    <main className="p-4 sm:p-6 mt-8 lg:p-8">
                        {user && user.role.toLowerCase() === "entity"
                            ? renderEntityDashboard()
                            : AdminDashboard()}

                        <Separator className="my-8" />
                        {user && user.role.toLowerCase() !== "entity" && (
                            <div className="text-gray-700 font-semibold text-xl mb-4">
                                Detailed Control Assessment for {organization}
                            </div>
                        )}
                        {data ? (
                            <>
                                {user &&
                                user.role.toLowerCase() === "entity" ? (
                                    <CompanyDetailsTable
                                        data={data}
                                        selectedOrg={organization}
                                        isAdmin={false}
                                    />
                                ) : (
                                    <CompanyDetailsTable
                                        data={data}
                                        selectedOrg={organization}
                                        isAdmin={true}
                                    />
                                )}
                            </>
                        ) : (
                            <></>
                        )}
                    </main>
                </div>
            </SidebarProvider>
        </div>
    );
};

export default Dashboard;
