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
    <div className="max-w-xl mx-auto flex flex-col justify-center h-screen">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
          </Button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {success && <p className="text-green-500 mt-2">Signup Successful!</p>}
        </form>
      </Form>
      <p className="text-center mt-4 text-gray-600">
        Already have an account?{" "}
        <Link to="/signin" className="text-blue-600 hover:text-blue-800 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
