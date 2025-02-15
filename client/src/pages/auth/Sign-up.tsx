import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import useSignUp from "@/hooks/use-sign-up"
import { useNavigate, Link } from "react-router-dom"
import { useEffect } from "react"

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

export type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {

  const navigate = useNavigate();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { signUp, loading, error, success } = useSignUp(); 
 
   useEffect(()=>{
    if (success) {
      navigate("/signin");
    }
   },[navigate,success])
   

  const onSubmit = async (data: SignupFormValues) => {
    console.log(data);
 await signUp(data);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Expense Tracker</h1>
          <h2 className="text-2xl font-bold text-gray-700">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
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
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading} variant={"outline"}>
              {loading ? "Signing Up..." : "Sign Up"}
              </Button>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              {success && <p className="text-green-500 mt-2">Signup Successful!</p>}
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
