export const form_data = [
    {
        "spe_name": "SPE-1 Organizational Security Measures",
        "sub_domains": [
            {
                "subdomain_id": "SubDomain-1",
                "controls": [
                    {
                        "control_id": "ORG 1.1",
                        "control_name": " Information security management system (ISMS)",
                        "maturity_levels": {
                            "0": "Documentation not in place",
                            "1": "Partial draft documentation ",
                            "2": "Controls partially implemented but no documents",
                            "3": "Documented and Implemented",
                            "4": "KPI defined and measured",
                            "5": "Regular audit conducted and continual improvement evident"
                        },
                        "target_rating": "3 - Defined"
                    },
                    {
                        "control_id": "ORG 1.2",
                        "control_name": " Background checks",
                        "maturity_levels": {
                            "0": "Background check not performed",
                            "1": "Background check performed but limited to roles",
                            "2": "Background check performed for all employees excluding contract employees",
                            "3": "Documented procedure exist and background check performed for all employees including contractor",
                            "4": "Effectiveness of background check measured",
                            "5": "Regular audit conducted on background check process and improvement suggested and implemented."
                        },
                        "target_rating": "3 - Defined"
                    },
                    {
                        "control_id": "ORG 1.3",
                        "control_name": " Security roles and responsibilities",
                        "maturity_levels": {
                            "0": "Roles and responsibilities not defined",
                            "1": "Employees to manage cybersecurity exist but no clear roles and responsibilities",
                            "2": "Not all cybersecurity resources have roles and responsibilities defined",
                            "3": "Defined roles and responsibilities exist and resource available",
                            "4": "Resource effectiveness measured by improvement on compliance",
                            "5": "Roles and responsibilities reviewed at regular interval to identify any conflict of interest or enhancement required and implemented"
                        },
                        "target_rating": "3 - Defined"
                    },
                    {
                        "control_id": "ORG 1.4",
                        "control_name": " Security awareness training",
                        "maturity_levels": {
                            "0": "No awareness training conducted",
                            "1": "Awareness training conducted adhoc",
                            "2": "Awareness training conducted during induction",
                            "3": "Training requirements are defined and documented and conducted as per requirement",
                            "4": "Training effectiveness measured",
                            "5": "Regular audit conducted on training process and improvement suggested and implemented."
                        },
                        "target_rating": "3 - Defined"
                    },
                    {
                        "control_id": "ORG 1.5",
                        "control_name": " Security responsibilities training",
                        "maturity_levels": {
                            "0": "No role based training planned or conducted",
                            "1": "Role based training are done by individual employee and not planned by organization",
                            "2": "Role based training performed but adhoc",
                            "3": "KPI defined for each cybersecurity resource and training plan developed and implemented",
                            "4": "KPI measured for effectiveness",
                            "5": "Regular audit conducted on training calendar and effectiveness of training planned and conducted."
                        },
                        "target_rating": "3 - Defined"
                    },
                    {
                        "control_id": "ORG 1.6",
                        "control_name": " Supply chain security",
                        "maturity_levels": {
                            "0": "No third party security",
                            "1": "security clauses such as confidentiality clause, right to audit included as part of contract but not evident for all vendor contract",
                            "2": "Third party risk assessment conducted adhoc and security clauses such as confidentiality clause, right to audit included as part of contract but not evident for all vendor contract",
                            "3": "Documented supplier chain security established and third party risk assessment was evident for all contractors",
                            "4": "Effectiveness of third party security measured",
                            "5": "Regular audit conducted on third party security process and improvement suggested and implemented."
                        },
                        "target_rating": "3 - Defined"
                    }
                ]
            },
            {
                "subdomain_id": "SubDomain-2",
                "controls": [
                    {
                        "control_id": "ORG 2.1",
                        "control_name": " Security risk mitigation",
                        "maturity_levels": {
                            "0": "No risk assessment conducted",
                            "1": "Risk assessment conducted adhoc",
                            "2": "Risk management methodology document established and but risk assessment conducted is not aligned with methodology",
                            "3": "Risk management methodology document established and risk assessment conducted as per critieria defined on risk management methodology",
                            "4": "Risk treatment effectiveness is measured",
                            "5": "Regular audit conducted on risk management process and improvement suggested and implemented."
                        },
                        "target_rating": "3 - Defined"
                    },
                    {
                        "control_id": "ORG 2.2",
                        "control_name": " Processes for discovery of security anomalies",
                        "maturity_levels": {
                            "0": "No process for discovery of anomalies",
                            "1": "The network adhoc probed or examined to discover unauthorized components and network accessible services",
                            "2": "The network regularly probed or examined to discover unauthorized components and network accessible services",
                            "3": "The network continuously probed or examined to discover unauthorized components and network accessible services",
                            "4": "Effectiveness of anomolies detection mechanism measured",
                            "5": "Regular security architecture and configuration review conducted on anomoly detection mechanism and improvement suggested and implemented."
                        },
                        "target_rating": "3 - Defined"
                    },
                    {
                        "control_id": "ORG 2.3",
                        "control_name": " Secure development and support",
                        "maturity_levels": {
                            "0": "No process for secure system development and support",
                            "1": "Security development ensured by individual and not documented.",
                            "2": "Documented SDLC covering the cybersecurity exist but not adhered on all projects.",
                            "3": "Documented SDLC covering the cybersecurity exist and established.",
                            "4": "Effectiveness of SDLC is measured and security acceptance testing conducted for all system development",
                            "5": "Effectiveness of SAT and SDLC is reviewed at regular interval and improvement suggested and implemented"
                        },
                        "target_rating": "3 - Defined"
                    },
                    {
                        "control_id": "ORG 2.4",
                        "control_name": " SP reviews",
                        "maturity_levels": {
                            "0": "No audit conducted",
                            "1": "Audit conducted adhoc",
                            "2": "Audit manual/procedure exist but not conduct at regular interval or no audit calendar",
                            "3": "Audit conducted as per audit manual and audit calendar",
                            "4": "Audit effectiveness measured",
                            "5": "Review of audit reports, corrective action taken is performed and improvement suggested and implemented."
                        },
                        "target_rating": "3 - Defined"
                    }
                ]
            },
            {
                "subdomain_id": "SubDomain-3",
                "controls": [
                    {
                        "control_id": "ORG 3.1",
                        "control_name": " Physical access control",
                        "maturity_levels": {
                            "0": "Control room or information processing facilities are not protected",
                            "1": "Control room or information processing facilities protected and sharing of access performed.",
                            "2": "Documented physical access control exist but no review conducted",
                            "3": "Documented physical access control exist and individual user have unique access card. Accountability ensured and audited.",
                            "4": "KPI defined on physical access control and measured.",
                            "5": "Regular audit conducted on physical access control and improvement suggested and implemented."
                        },
                        "target_rating": "3 - Defined"
                    }
                ]
            }
        ]
    }
]