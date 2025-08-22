import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-Sidebar";
import Header from "@/components/Header";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
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
    Select,
    SelectTrigger,
    SelectGroup,
    SelectLabel,
    SelectContent,
    SelectValue,
    SelectItem,
} from "@/components/ui/select";
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
import { MoreHorizontal } from "lucide-react";
import { Trash2, Pen } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/utils/api";
import type { OwnedCompany, ManagedUser } from "@/types";
import {
    type registerUserFields,
    registerUserSchema,
    editUserSchema,
    type editUserFields,
} from "@/form/formSchema";

// --- REGISTER USER DIALOG COMPONENT ---
const RegisterUserDialog = ({
    companies,
    onUserCreated,
}: {
    companies: OwnedCompany[];
    onUserCreated: () => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<registerUserFields>({
        resolver: zodResolver(registerUserSchema),
        defaultValues: {
            username: "",
            password: "",
            repeatPassword: "",
            role: "OA",
            email: "",
        },
    });

    const role = form.watch("role");

    async function registerOnSubmit(data: registerUserFields) {
        toast.info("Creating user...");
        try {
            await api.post("user/create/", data);
            toast.success("User created successfully!");
            onUserCreated(); // This triggers the data refresh in the parent
            setIsOpen(false); // This closes the dialog
            form.reset(); // Reset form fields for next time
        } catch (error) {
            toast.error("User creation failed!");
            console.error(error);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="hover:bg-blue-700 hover:cursor-pointer w-30">
                    Add User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] min-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Create a new OA or Entity user. They will be
                        automatically linked to your account.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(registerOnSubmit)}
                        className="space-y-4"
                    >
                        <div className="space-y-4 flex flex-col ml-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="user@example.com"
                                                {...field}
                                                className="w-[80%]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="john.doe"
                                                {...field}
                                                className="w-[80%]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-[80%]">
                                                    <SelectValue placeholder="Select Role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="OA">
                                                    OA
                                                </SelectItem>
                                                <SelectItem value="entity">
                                                    Entity
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {role === "entity" && (
                                <FormField
                                    control={form.control}
                                    name="company"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-[80%]">
                                                        <SelectValue placeholder="Select a company" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {companies &&
                                                        companies.map(
                                                            (company) => (
                                                                <SelectItem
                                                                    key={
                                                                        company.id
                                                                    }
                                                                    value={String(
                                                                        company.id
                                                                    )}
                                                                >
                                                                    {
                                                                        company.name
                                                                    }
                                                                </SelectItem>
                                                            )
                                                        )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                {...field}
                                                className="w-[80%]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="repeatPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Repeat Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                {...field}
                                                className="w-[80%]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit">Create User</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

const DeleteUserDialog = ({
    userId,
    onUserDeleted,
}: {
    userId: number;
    onUserDeleted: () => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async () => {
        toast.info("Deleting user...");
        try {
            await api.delete(`user/delete/${userId}/`);
            toast.success("User deleted successfully!");
            onUserDeleted();
            setIsOpen(false);
        } catch (error) {
            toast.error("Failed to delete user.");
            console.error(error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-start p-0 h-auto font-normal text-red-600 hover:text-red-600"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete user
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this user? This action
                        is permanent and cannot be undone.
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
                        Delete User
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// --- EDIT USER DIALOG COMPONENT ---
const EditUserDialog = ({
    user,
    companies,
    onUserEdited,
}: {
    user: ManagedUser;
    companies: OwnedCompany[];
    onUserEdited: () => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<editUserFields>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            username: user.username,
            email: user.email,
            role: user.role as "OA" | "entity",
            company:
                companies
                    .find((c) => c.name === user.company_name)
                    ?.id.toString() || undefined,
            password: "",
            repeatPassword: "",
        },
    });
    const {
        formState: { isSubmitting, dirtyFields },
    } = form;
    const role = form.watch("role");

    async function editOnSubmit(data: editUserFields) {
        toast.info("Updating user...");

        const payload: Partial<editUserFields> = {};

        // This is a common workaround for a TypeScript limitation where it can't
        // correctly infer types inside a dynamic key assignment loop.
        (Object.keys(dirtyFields) as Array<keyof editUserFields>).forEach(
            (key) => {
                (payload as any)[key] = data[key];
            }
        );

        if (!payload.password) {
            delete payload.password;
            delete payload.repeatPassword;
        }

        try {
            await api.patch(`user/edit/${user.id}/`, payload);
            toast.success("User updated successfully!");
            onUserEdited();
            setIsOpen(false);
        } catch (error) {
            toast.error("User update failed!");
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
                    Edit user
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] min-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit User: {user.username}</DialogTitle>
                    <DialogDescription>
                        Change the user's details below. Only modified fields
                        will be saved.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(editOnSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="w-[80%]"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="w-[80%]"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-[80%]">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="OA">
                                                OA
                                            </SelectItem>
                                            <SelectItem value="entity">
                                                Entity
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {role === "entity" && (
                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-[80%]">
                                                    <SelectValue placeholder="Select a company" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {companies &&
                                                    companies.map((company) => (
                                                        <SelectItem
                                                            key={company.id}
                                                            value={String(
                                                                company.id
                                                            )}
                                                        >
                                                            {company.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        New Password (optional)
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} className="w-[80%]"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="repeatPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Repeat New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} className="w-[80%]"/>
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
const Filters = ({
    ownedCompanies,
    onUserCreated,
    roleFilter,
    setRoleFilter,
    searchTerm,
    setSearchTerm,
}: {
    ownedCompanies: OwnedCompany[] | null;
    onUserCreated: () => void;
    roleFilter: string;
    setRoleFilter: (role: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}) => {
    return (
        <div className="w-full flex justify-center">
            <div className="flex justify-between items-center p-4 bg-white rounded-lg w-[95%] border">
                <div className="flex gap-4 items-center">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Roles</SelectLabel>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="OA">OA</SelectItem>
                                <SelectItem value="entity">Entity</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="search-input">Search:</Label>
                        <Input
                            id="search-input"
                            placeholder="username..."
                            className="w-[250px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <RegisterUserDialog
                    companies={ownedCompanies || []}
                    onUserCreated={onUserCreated}
                />
            </div>
        </div>
    );
};

// --- USERS TABLE COMPONENT ---
const UsersTable = ({
    users,
    onUsersDeleted,
    onUserEdited,
    companies,
}: {
    users: ManagedUser[];
    onUsersDeleted: () => void;
    onUserEdited: () => void;
    companies: OwnedCompany[];
}) => {
    return (
        <div className="border bg-white w-[95%]">
            <Table>
                <TableHeader>
                    <TableRow className="font-semibold tracking-tight">
                        <TableHead>User Info</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="font-medium">
                                            {user.username}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span
                                    className={`py-1 text-xs font-medium rounded-full ${
                                        user.role === "OA"
                                            ? "bg-blue-100 text-blue-800 px-4"
                                            : "bg-green-100 text-green-800 px-2"
                                    }`}
                                >
                                    {user.role === "OA" ? "OA" : "Entity"}
                                </span>
                            </TableCell>
                            <TableCell>
                                {user.role === "entity" ? (
                                    user.company_name || (
                                        <span className="text-muted-foreground italic">
                                            Not Assigned
                                        </span>
                                    )
                                ) : (
                                    <span className="text-muted-foreground">
                                        N/A
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            <EditUserDialog
                                                user={user}
                                                companies={companies}
                                                onUserEdited={onUserEdited}
                                            />
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            <DeleteUserDialog
                                                userId={user.id}
                                                onUserDeleted={onUsersDeleted}
                                            />
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
const ManageUsers = () => {
    const [managedUsers, setManagedUsers] = useState<ManagedUser[] | null>(
        null
    );
    const [ownedCompanies, setOwnedCompanies] = useState<OwnedCompany[] | null>(
        null
    );
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const fetchUserData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get("user/managed/");
            setManagedUsers(response.data.managed_users);
            setOwnedCompanies(response.data.owned_companies);
        } catch (error) {
            setError("Failed to fetch user data. You may not have permission.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const filteredUsers = useMemo(() => {
        if (!managedUsers) return [];
        return managedUsers.filter((user) => {
            const roleMatch = roleFilter === "all" || user.role === roleFilter;
            const searchTermMatch = user.username
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            return roleMatch && searchTermMatch;
        });
    }, [managedUsers, roleFilter, searchTerm]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <Toaster />
            <SidebarProvider defaultOpen={false}>
                <AppSidebar />
                <div className="w-full flex flex-col h-screen">
                    <Header title="Manage Users" />
                    <main className="w-full flex flex-col h-full p-8 space-y-4 pt-15">
                        <Filters
                            ownedCompanies={ownedCompanies}
                            onUserCreated={fetchUserData}
                            roleFilter={roleFilter}
                            setRoleFilter={setRoleFilter}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                        />
                        <div className="flex justify-center overflow-y-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <p>Loading...</p>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center h-full text-red-600">
                                    <p>{error}</p>
                                </div>
                            ) : filteredUsers.length > 0 ? (
                                <UsersTable
                                    users={filteredUsers}
                                    onUsersDeleted={fetchUserData}
                                    onUserEdited={fetchUserData}
                                    companies={ownedCompanies || []}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p>No users found.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        </div>
    );
};

export default ManageUsers;
