import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-Sidebar";
import Header from "@/components/Header";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { MoreHorizontal, Pen, Trash2, ArrowDownToLine, PlusCircle } from "lucide-react";

import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/utils/api";
import type { ControlRecord } from "@/types";

// --- FORM SCHEMA and TYPE DEFINITIONS ---
const editCompanySchema = z.object({
    company_name: z
        .string()
        .min(1, { message: "Company Name is required." })
        .optional(),
    sector: z.string().min(1, { message: "Sector is required." }).optional(),
    region: z.string().min(1, { message: "Region is required." }).optional(),
});

type EditCompanyFields = z.infer<typeof editCompanySchema>;

// This interface represents the transformed data shape for use in the UI
interface Company {
    id: number;
    company_name: string;
    sector: string;
    region: string;
    records: ControlRecord[];
}

// --- DIALOG COMPONENTS ---

const EditCompanyDialog = ({
    company,
    onCompanyEdited,
}: {
    company: Company;
    onCompanyEdited: () => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<EditCompanyFields>({
        resolver: zodResolver(editCompanySchema),
        defaultValues: {
            company_name: company.company_name,
            sector: company.sector,
            region: company.region,
        },
    });
    const {
        formState: { isSubmitting, dirtyFields },
    } = form;

    async function onSubmit(data: EditCompanyFields) {
        toast.info("Updating company...");
        const payload: Partial<EditCompanyFields> = {};

        // Only include fields that have been changed by the user
        (Object.keys(dirtyFields) as Array<keyof EditCompanyFields>).forEach(
            (key) => {
                payload[key] = data[key];
            }
        );

        if (Object.keys(payload).length === 0) {
            toast.info("No changes to save.");
            setIsOpen(false);
            return;
        }

        try {
            await api.patch(`report/companies/${company.id}/`, payload);
            toast.success("Company updated successfully!");
            onCompanyEdited();
            setIsOpen(false);
        } catch (error) {
            toast.error("Failed to update company.");
            console.error(error);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-start p-0 h-auto font-normal"
                >
                    <Pen className="mr-2 h-4 w-4 text-blue-500" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-md"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <DialogHeader>
                    <DialogTitle>Edit {company.company_name}</DialogTitle>
                    <DialogDescription>
                        Only fields with new values will be updated.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="company_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sector"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sector</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="region"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Region</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

const DeleteCompanyDialog = ({
    company,
    onCompanyDeleted,
}: {
    company: Company;
    onCompanyDeleted: () => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleDelete = async () => {
        toast.info("Deleting company...");
        try {
            await api.delete(`report/companies/${company.id}/`);
            toast.success("Company deleted successfully!");
            onCompanyDeleted();
            setIsOpen(false);
        } catch (error) {
            toast.error("Failed to delete company.");
            console.error(error);
        }
    };
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-start p-0 h-auto font-normal"
                >
                    <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-md"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <DialogHeader>
                    <DialogTitle>Delete {company.company_name}</DialogTitle>
                    <DialogDescription>
                        Are you sure? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-end gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// --- FILTERS COMPONENT ---
const Filters = ({
    searchTerm,
    setSearchTerm,
}: {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}) => {
    return (
        <div className="flex justify-between items-center p-3 rounded-md border bg-white">
            <div className="flex items-center gap-2">
                <Label htmlFor="search-input">Search:</Label>
                <Input
                    id="search-input"
                    placeholder="company name..."
                    className="w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
    );
};

// --- COMPANY DATA TABLE (for inside accordion) ---
const CompanyDataTable = ({ company, onCompanyEdited }: { company: Company, onCompanyEdited: () => void }) => {
    const [editableRecords, setEditableRecords] = useState<ControlRecord[]>(company.records);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [dirtyCells, setDirtyCells] = useState<Record<string, boolean>>({});

    const handleRecordChange = (
        index: number,
        field: keyof ControlRecord,
        value: string
    ) => {
        const updatedRecords = [...editableRecords];
        updatedRecords[index] = { ...updatedRecords[index], [field]: value };
        setEditableRecords(updatedRecords);
        setIsDirty(true);
        setDirtyCells(prev => ({ ...prev, [`${index}-${field}`]: true }));
    };

    const handleAddRow = (index: number) => {
        const newRow: ControlRecord = {
            "SPE": "",
            "Sub Domain": "",
            "Control ID": "",
            "Control Name": "",
            "Control Name.1": null,
            "In Place?": null,
            "CMMI Tier Target Rating": "",
            "CMMI Tier Observed Rating": "",
        };
        const updatedRecords = [...editableRecords];
        updatedRecords.splice(index + 1, 0, newRow); // Insert new row after current one
        setEditableRecords(updatedRecords);
        setIsDirty(true);
    };

    const handleDeleteRow = (index: number) => {
        const updatedRecords = editableRecords.filter((_, i) => i !== index);
        setEditableRecords(updatedRecords);
        setIsDirty(true);
    };

    const handleCancel = () => {
        setEditableRecords(company.records);
        setIsDirty(false);
        setDirtyCells({});
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        toast.info("Saving changes...");

        const payload = {
            company_data: [
                ...editableRecords,
            ],
        };

        try {
            await api.patch(`report/companies/${company.id}/`, payload);
            toast.success("Changes saved successfully!");
            setIsDirty(false);
            setDirtyCells({});
            onCompanyEdited(); 
        } catch (error) {
            toast.error("Failed to save changes.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 border bg-white">
            {isDirty && (
                <div className="flex justify-start gap-2 mb-4">
                    <Button onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                        Cancel
                    </Button>
                </div>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>SPE</TableHead>
                        <TableHead>Subdomain</TableHead>
                        <TableHead>Control ID</TableHead>
                        <TableHead>Control Name</TableHead>
                        <TableHead>In Place?</TableHead>
                        <TableHead>Target Rating</TableHead>
                        <TableHead>Observed Rating</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {editableRecords.map((record, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Input value={record["SPE"]} onChange={(e) => handleRecordChange(index, "SPE", e.target.value)} className={`border-none ${dirtyCells[`${index}-SPE`] ? 'bg-blue-50' : ''}`} />
                            </TableCell>
                            <TableCell>
                                <Input value={record["Sub Domain"]} onChange={(e) => handleRecordChange(index, "Sub Domain", e.target.value)} className={`border-none ${dirtyCells[`${index}-Sub Domain`] ? 'bg-blue-50' : ''}`} />
                            </TableCell>
                            <TableCell>
                                <Input value={record["Control ID"]} onChange={(e) => handleRecordChange(index, "Control ID", e.target.value)} className={`border-none ${dirtyCells[`${index}-Control ID`] ? 'bg-blue-50' : ''}`} />
                            </TableCell>
                            <TableCell>
                                <Input value={record["Control Name"]} onChange={(e) => handleRecordChange(index, "Control Name", e.target.value)} className={`border-none ${dirtyCells[`${index}-Control Name`] ? 'bg-blue-50' : ''}`} />
                            </TableCell>
                            <TableCell>
                                <Input value={record["In Place?"] || ""} onChange={(e) => handleRecordChange(index, "In Place?", e.target.value)} className={`border-none ${dirtyCells[`${index}-In Place?`] ? 'bg-blue-50' : ''}`} />
                            </TableCell>
                            <TableCell>
                                <Input value={record["CMMI Tier Target Rating"]} onChange={(e) => handleRecordChange(index, "CMMI Tier Target Rating", e.target.value)} className={`border-none ${dirtyCells[`${index}-CMMI Tier Target Rating`] ? 'bg-blue-50' : ''}`} />
                            </TableCell>
                            <TableCell>
                                <Input value={record["CMMI Tier Observed Rating"]} onChange={(e) => handleRecordChange(index, "CMMI Tier Observed Rating", e.target.value)} className={`border-none ${dirtyCells[`${index}-CMMI Tier Observed Rating`] ? 'bg-blue-50' : ''}`} />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleAddRow(index)}>
                                        <PlusCircle className="h-4 w-4 text-green-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRow(index)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
const ManageCompanies = () => {
    const [companies, setCompanies] = useState<Company[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchCompanies = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get("report/companies/");
            const data = response.data;

            // Transform the dictionary response into an array of company objects
            const transformedCompanies = Object.entries(data)
                .map(([companyName, companyData]: [string, any[]]) => {
                    const calculationItem = companyData.find(
                        (item) => item.final_calculation
                    );
                    const calculationData = calculationItem?.final_calculation;

                    return {
                        id: calculationData?.id,
                        company_name: companyName,
                        sector: calculationData?.sector || "",
                        region: calculationData?.region || "",
                        records: companyData.filter(
                            (item): item is ControlRecord =>
                                !("final_calculation" in item)
                        ),
                    };
                })
                .filter((company) => company.id != null);

            setCompanies(transformedCompanies);
        } catch (error) {
            setError("Failed to fetch companies. You may not have permission.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const downloadExcel = async (companyId: number, companyName: string) => {
        toast.info("Preparing download...");
        try {
            const response = await api.get(
                `report/companies/${companyId}/download-excel/`,
                {
                    responseType: "blob", // This is crucial for handling file downloads
                }
            );

            // Create a URL for the blob data
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Create a temporary link element to trigger the download
            const link = document.createElement("a");
            link.href = url;

            // Set the filename for the download
            link.setAttribute("download", `${companyName}_report.xlsx`);

            // Append to the document, click, and then remove
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Download started successfully!");
        } catch (error) {
            toast.error("Failed to download the file.");
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const filteredCompanies = useMemo(() => {
        if (!companies) return [];
        return companies.filter((company) =>
            company.company_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
    }, [companies, searchTerm]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <SidebarProvider defaultOpen={false}>
                <AppSidebar />
                <div className="w-full flex flex-col h-screen">
                    <Header title="Manage Companies" />
                    <main className="w-full flex flex-col h-full p-8 pt-15 space-y-4">
                        <Filters
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                        />
                        <div className="overflow-y-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <p>Loading...</p>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center h-full text-red-600">
                                    <p>{error}</p>
                                </div>
                            ) : filteredCompanies.length > 0 ? (
                                <Accordion
                                    type="single"
                                    collapsible
                                    className="w-full"
                                >
                                    {filteredCompanies.map((company) => (
                                        <AccordionItem
                                            value={String(company.id)}
                                            key={company.id}
                                        >
                                            <AccordionTrigger className="hover:no-underline bg-white border px-4 rounded-none">
                                                <div className="flex justify-between items-center w-full">
                                                    <div className="flex flex-col items-start">
                                                        <span className="font-bold text-lg">
                                                            {
                                                                company.company_name
                                                            }
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {company.sector} -{" "}
                                                            {company.region}
                                                        </span>
                                                    </div>
                                                    <div className="mr-4">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onSelect={(
                                                                        e
                                                                    ) =>
                                                                        e.preventDefault()
                                                                    }
                                                                >
                                                                    <EditCompanyDialog
                                                                        company={
                                                                            company
                                                                        }
                                                                        onCompanyEdited={
                                                                            fetchCompanies
                                                                        }
                                                                    />
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onSelect={(
                                                                        e
                                                                    ) =>
                                                                        e.preventDefault()
                                                                    }
                                                                >
                                                                    <DeleteCompanyDialog
                                                                        company={
                                                                            company
                                                                        }
                                                                        onCompanyDeleted={
                                                                            fetchCompanies
                                                                        }
                                                                    />
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="w-full justify-start p-0 h-auto font-normal"
                                                                        onClick={() => {
                                                                            downloadExcel(
                                                                                company.id,
                                                                                company.company_name
                                                                            );
                                                                        }}
                                                                    >
                                                                        <ArrowDownToLine className="mr-2 h-4 w-4 text-green-500" />
                                                                        Download
                                                                    </Button>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <CompanyDataTable
                                                    company={company}
                                                    onCompanyEdited={
                                                        fetchCompanies
                                                    }
                                                />
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p>No companies found.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        </div>
    );
};

export default ManageCompanies;
