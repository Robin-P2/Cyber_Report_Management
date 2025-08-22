import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type loginFields, loginSchema } from "@/form/formSchema";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

import {
    Form,
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
    FormField,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const form = useForm<loginFields>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    async function onSubmit(data: loginFields) {
        console.log("onSubmit triggered. Preparing to call login function...");

        try {
            await login({ username: data.username, password: data.password });
            toast.success("Successfully logged in!");
            navigate("/");
        } catch (error) {
            console.log(error)
            toast.error("Invalid credentials.");
        }
    }

    return (
        <>
            <Toaster richColors/>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-300 px-4">
                <div className="flex flex-col md:flex-row w-full max-w-3xl h-auto md:h-[400px] rounded-sm overflow-hidden shadow-2xl shadow-indigo-300 bg-white">
                    <div className="md:w-[40%] w-full flex flex-col items-center justify-center">
                        <img
                            src={logo}
                            alt="Company Logo"
                            className="w-85 h-30 mt-8"
                        />
                        <h1 className="text-lg font-semibold text-white">
                            CyberRM
                        </h1>
                    </div>
                    <div className="md:w-[60%] w-full flex items-center justify-center p-5 border-l border-l-neutral-300">
                        <div className="w-full max-w-80">
                            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                                Login
                            </h2>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="John Doe"
                                                        {...field}
                                                        className="w-80"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

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
                                                        className="w-80 mb-2"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-center items-center gap-4">
                                        <Button
                                            type="submit"
                                            className="hover:bg-blue-300 hover:text-black h-10 bg-black text-white text-lg w-full hover:cursor-pointer"
                                        >
                                            Login
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
