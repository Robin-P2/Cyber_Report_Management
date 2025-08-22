// This file is the single source of truth for your data shapes.

export interface SpeSummaryItem {
    domain_average: number;
    subdomain_averages: { [key: string]: number };
}

export interface SpeDomainSummary {
    [key: string]: SpeSummaryItem;
}

export interface FinalCalculation {
    final_calculation: {
        region: string;
        sector: string;
        spe_domain_summary: SpeDomainSummary;
        overall_domain_score: number;
        maturity_percent: number;
        spe_domain_target_summary?: SpeDomainSummary;
        overall_domain_target_score?: number;
        target_maturity_percent?: number;
    };
}

export interface ControlRecord {
    SPE: string;
    "Sub Domain": string;
    "Control ID": string;
    "Control Name": string;
    "Control Name.1": string | null;
    "In Place?": "Y" | "P" | "N" | string | null;
    "CMMI Tier Target Rating": string;
    "CMMI Tier Observed Rating": string;
}

export type RawCompanyData = Array<ControlRecord | FinalCalculation>;

export interface MainData {
    [key: string]: RawCompanyData;
}

export interface User {
    id: number;
    username: string;
    email: string;
    is_staff: boolean;
    role: string;
}

export interface ManagedUser {
    id: number;
    username: string;
    email: string;
    role: string;
    company_name: string;
}

export interface OwnedCompany {
    id: number;
    name: string;
}