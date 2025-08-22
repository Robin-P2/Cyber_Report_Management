import Header from "@/components/Header";
import { AppSidebar } from "@/components/app-Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";
import { api } from "@/utils/api";
import { useNavigate } from "react-router-dom";
import data from "@/data/data";
import { isAxiosError } from "axios";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Form,
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
    FormField,
} from "@/components/ui/form";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { fileUploadSchema, type fileUploadFields } from "@/form/formSchema";

const FileUpload = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [serverMessage, setServerMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const form = useForm<fileUploadFields>({
        resolver: zodResolver(fileUploadSchema),
        defaultValues: {
            company_name: " ",
            standard: "62443",
            region: "Dubai",
            sector: "Shipping",
        },
    });

    async function onSubmit(data: fileUploadFields) {
        setIsLoading(true);
        setServerMessage(null);

        const formData = new FormData();
        formData.append("company_name", data.company_name);
        formData.append("standard", data.standard);
        formData.append("sector", data.sector);
        formData.append("region", data.region);

        if (data.output_excel?.length > 0) {
            formData.append("file", data.output_excel[0]);
        }

        try {
            await api.post("report/companies/", formData);

            setServerMessage({
                type: "success",
                text: "Files uploaded successfully!",
            });
            form.reset();
            navigate("/");
        } catch (error) {
            // 2. Check if the error is an Axios error
            if (isAxiosError(error)) {
                if (error.response) {
                    // The server responded with a status code outside the 2xx range
                    const errorMessage =
                        error.response.data.detail ||
                        error.response.data.error ||
                        "An unknown server error occurred.";
                    setServerMessage({ type: "error", text: errorMessage });
                } else if (error.request) {
                    // The request was made but no response was received
                    setServerMessage({
                        type: "error",
                        text: "No response from server. Check your network connection.",
                    });
                } else {
                    // Something happened in setting up the request
                    setServerMessage({
                        type: "error",
                        text:
                            error.message ||
                            "An error occurred during the request setup.",
                    });
                }
            } else {
                // 3. Handle non-Axios errors
                setServerMessage({
                    type: "error",
                    text: "An unexpected error occurred.",
                });
                console.error("An unexpected error:", error);
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <SidebarProvider defaultOpen={false}>
                <AppSidebar />
                <div className="w-full flex flex-col h-screen">
                    <Header title="Add Organization" />
                    <main className="w-full flex flex-1 overflow-hidden">
                        <div className="w-[35%] flex justify-center items-center border-r border-r-gray-200 bg-neutral-100">
                            <Card className="min-w-md rounded-sm shadow-xl">
                                <CardHeader>
                                    <CardTitle>Upload Excel File</CardTitle>
                                    <CardDescription>
                                        Please make sure that the excel files
                                        uploaded: is less than 5 MB in size, and
                                        follows the standard chosen
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...form}>
                                        <form
                                            onSubmit={form.handleSubmit(
                                                onSubmit
                                            )}
                                            className="space-y-6"
                                        >
                                            <FormField
                                                control={form.control}
                                                name="company_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Organization Name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="X company"
                                                                {...field}
                                                                className="w-full"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="standard"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Standard
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            defaultValue={
                                                                field.value
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select an option" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="62443">
                                                                    62443
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="region"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Region
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                className="w-full"
                                                            />
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
                                                        <FormLabel>
                                                            Sector
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                className="w-full"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="output_excel"
                                                render={({
                                                    field: {
                                                        onChange,
                                                        onBlur,
                                                        name,
                                                        ref,
                                                    },
                                                }) => (
                                                    <FormItem className="mb-10">
                                                        <FormLabel>
                                                            Upload Excel File
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="file"
                                                                multiple
                                                                accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                                                onBlur={onBlur}
                                                                name={name}
                                                                ref={ref}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    // Pass the FileList object to react-hook-form
                                                                    onChange(
                                                                        e.target
                                                                            .files
                                                                    );
                                                                }}
                                                                className="w-full"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {serverMessage && (
                                                <div
                                                    className={`p-3 rounded-md text-sm ${
                                                        serverMessage.type ===
                                                        "success"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {serverMessage.text}
                                                </div>
                                            )}
                                            <Button
                                                type="submit"
                                                className="w-full hover:bg-blue-300 hover:text-black hover:cursor-pointer"
                                                disabled={isLoading}
                                            >
                                                {isLoading
                                                    ? "Uploading..."
                                                    : "Upload File"}
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="min-w-[65%] flex flex-col justify-start items-center bg-gradient-to-br from-blue-50 to-blue-300 pt-30">
                            <div className="flex flex-col mr-170 mb-4">
                                <h1 className="text-xl font-semibold">
                                    Ensure that the files uploaded
                                </h1>
                                <h1 className="text-3xl font-bold">
                                    follow the format below
                                </h1>
                            </div>
                            <div className="flex-1 shadow-xl shadow-blue-500">
                                {/*<div className="flex-1 w-full overflow-y-auto rounded-lg border border-gray-200"> */}
                                <Table className="border bg-white border-neutral-300">
                                    {/* ... table content remains the same ... */}
                                    <TableHeader>
                                        <TableRow className="bg-gray-300 hover:bg-gray-300 border-b-0">
                                            <TableHead>SPE</TableHead>
                                            <TableHead>Sub Domain</TableHead>
                                            <TableHead>Control ID</TableHead>
                                            <TableHead>Control Name</TableHead>
                                            <TableHead>In Place?</TableHead>
                                            <TableHead>Target Rating</TableHead>
                                            <TableHead>
                                                Observed Rating
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.defsecone.map((item, index) => (
                                            <TableRow
                                                key={`${item["Control ID"]}-${index}`}
                                            >
                                                <TableCell>
                                                    {item.SPE}
                                                </TableCell>
                                                <TableCell>
                                                    {item["Sub Domain"]}
                                                </TableCell>
                                                <TableCell>
                                                    {item["Control ID"]}
                                                </TableCell>
                                                <TableCell>
                                                    {item["Control Name"]}
                                                </TableCell>
                                                <TableCell>
                                                    {item["In Place?"]}
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        item[
                                                            "CMMI Tier Target Rating"
                                                        ]
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        item[
                                                            "CMMI Tier Observed Rating"
                                                        ]
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        </div>
    );
};

export default FileUpload;
