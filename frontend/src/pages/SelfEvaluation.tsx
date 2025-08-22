import { useState } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-Sidebar";
import Header from "@/components/Header";

import { form_data } from "@/data/full_form_data";

import {
    Card,
    CardContent,
    CardDescription,
    CardAction,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Form,
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
    FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
    SelfEvaluationSchema,
    type SelfEvaluationFields,
} from "@/form/formSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useForm,
    type SubmitHandler,
    FormProvider,
    useFormContext,
} from "react-hook-form";

const PaginationTemp = () => {
    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#" isActive>
                        2
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                    <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                    <PaginationNext href="#" />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

const MetaDataPage = ({ onNext }: { onNext: () => void }) => {
    return (
        <>
            <CardHeader>
                <CardTitle>Company Metadata</CardTitle>
                <CardDescription>
                    Input metadata description placeholder
                </CardDescription>
                <CardAction>
                    <PaginationTemp />
                </CardAction>
            </CardHeader>
            <CardContent>
                {
                    // Metadata form
                }
            </CardContent>
        </>
    );
};

const SPE1page = () => {
    return (
        <>
            <CardHeader>
                <CardTitle>SPE-1 Organizational Security Measures</CardTitle>
                <CardDescription>Placeholder for description</CardDescription>
                <CardAction className="flex gap-4">
                    <Button className="cursor-pointer">Previous</Button>
                    <Button className="cursor-pointer">Next SPE</Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <div className="overflow-y-auto">
                    {
                        // SPE 1 form input
                    }
                </div>
            </CardContent>
        </>
    );
};

const SelfEvaluation = () => {
    // State to manage the current page
    // 0 = Metadata, 1 = SPE-1, 2 = SPE-2, etc.
    const [currentPage, setCurrentPage] = useState(0);

    // The total number of pages is Metadata (1) + number of SPEs
    const totalPages = 1 + form_data.length;

    // Next page navigation logic
    const handleNext = async () => {
        let isValid = false;
        if (currentPage === 0) {
            // Validate metadata fields
            isValid = await methods.trigger("meta_data");
        } else {
            // Validate the fields for the current SPE page
            const speIndex = currentPage - 1;
            isValid = await methods.trigger(`spes.${speIndex}`);
        }
        if (isValid && currentPage < totalPages - 1) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const defaultValues = {
        spes: form_data.map((spe) => ({
            ...spe,
            sub_domains: spe.sub_domains.map((subDomain) => ({
                ...subDomain,
                controls: subDomain.controls.map((control) => ({
                    ...control,
                    // Add the fields for user input here
                    inPlace: "",
                    observedRating: "",
                    targetRating: "4 - Quantitatively Managed", // Example default
                })),
            })),
        })),
    };

    const form = useForm<SelfEvaluationFields>({
        resolver: zodResolver(SelfEvaluationSchema),
        defaultValues,
        mode: "onChange", // Optional: validate on change
    });

    const processForm: SubmitHandler<SelfEvaluationFields> = (data) => {
        // We'll fill this in next
        console.log("Form data (hierarchical):", data);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <SidebarProvider defaultOpen={false}>
                <AppSidebar />
                <div className="w-full flex flex-col h-screen">
                    <Header title="Self Evaluation Checklist" />
                    <main className="w-full flex flex-col h-full pt-20 px-20 space-y-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(processForm)}>
                                <Card className="min-w-3xl h-[90%] rounded-none">
                                    
                                </Card>
                            </form>
                        </Form>
                    </main>
                </div>
            </SidebarProvider>
        </div>
    );
};

export default SelfEvaluation;
