import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import useSignIn from "@/hooks/use-sign-in";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import * as z from "zod";

const signinSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type SigninFormValues = z.infer<typeof signinSchema>;

export default function SigninPage() {
  const navigate = useNavigate();
  const form = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { signIn, loading, error, onSuccess } = useSignIn();

  useEffect(() => {
    if (onSuccess) {
      navigate("/");
    }
  }, [navigate, onSuccess]);

  const onSubmit = async (data: SigninFormValues) => {
    console.log(data);
    await signIn(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Expense Tracker</h1>
          <h2 className="text-2xl font-bold text-gray-700">Sign In</h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
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
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" variant={"outline"}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              {onSuccess && (
                <p className="text-green-500 mt-2">SignIn Successful!</p>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
