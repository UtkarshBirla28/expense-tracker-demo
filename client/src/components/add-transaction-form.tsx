import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import type { FC } from 'react'
import { useForm } from "react-hook-form"
import { z } from "zod"

const transactionSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.number().positive({ message: "Amount must be positive" }),
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().min(1, { message: "Description is required" }),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

interface AddTransactionFormProps {
  onSubmit: (data: TransactionFormValues) => Promise<void>
}

const AddTransactionForm: FC<AddTransactionFormProps> = ({ onSubmit }) => {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      category: "",
      description: "",
    },
  })

  const handleSubmit = async (data: TransactionFormValues) => {
    try {
      await onSubmit(data)
      
      // Reset form after successful submission
      form.reset({
        type: "expense",
        amount: 0,
        category: "",
        description: "",
      })
    } catch (error) {
      console.error('Failed to submit transaction:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 bg-white shadow rounded-lg p-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter amount" 
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{form.watch("type") === "expense" ? "Category" : "Source"}</FormLabel>
              <FormControl>
                <Input placeholder={`Enter ${form.watch("type") === "expense" ? "category" : "source"}`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Add Transaction
        </Button>
      </form>
    </Form>
  )
}

export default AddTransactionForm
