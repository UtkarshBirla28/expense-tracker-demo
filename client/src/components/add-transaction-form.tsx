import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, type FC } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const transactionSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.number().positive({ message: "Amount must be positive" }),
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().min(1, { message: "Description is required" }),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

export interface EditingTransaction {
  id: string
  values: TransactionFormValues
}

interface AddTransactionFormProps {
  onSubmit: (data: TransactionFormValues) => Promise<void>
  editing?: EditingTransaction | null
  onCancelEdit?: () => void
}

const AddTransactionForm: FC<AddTransactionFormProps> = ({ onSubmit, editing, onCancelEdit }) => {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      category: "",
      description: "",
    },
  })

  const type = form.watch("type")
  const isSubmitting = form.formState.isSubmitting
  const isEditing = Boolean(editing)

  useEffect(() => {
    if (editing) {
      form.reset(editing.values)
    } else {
      form.reset({ type: "expense", amount: 0, category: "", description: "" })
    }
  }, [editing, form])

  const handleSubmit = async (data: TransactionFormValues) => {
    try {
      await onSubmit(data)
      form.reset({
        type: data.type,
        amount: 0,
        category: "",
        description: "",
      })
    } catch (error) {
      console.error("Failed to submit transaction:", error)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        {/* Segmented type control */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div
                  role="tablist"
                  className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
                >
                  {(["expense", "income"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="tab"
                      aria-selected={field.value === value}
                      disabled={isEditing && field.value !== value}
                      onClick={() => field.onChange(value)}
                      className={cn(
                        "h-8 rounded-md text-sm font-medium capitalize transition-all",
                        field.value === value
                          ? value === "expense"
                            ? "bg-card text-negative shadow-sm"
                            : "bg-card text-positive shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-medium text-ink-secondary">
                Amount
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="h-10 pl-7 tabular-nums"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </div>
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
              <FormLabel className="text-[13px] font-medium text-ink-secondary">
                {type === "expense" ? "Category" : "Source"}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    type === "expense"
                      ? "e.g. groceries, rent, travel"
                      : "e.g. salary, freelance"
                  }
                  className="h-10"
                  {...field}
                />
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
              <FormLabel className="text-[13px] font-medium text-ink-secondary">
                Description
              </FormLabel>
              <FormControl>
                <Input placeholder="What was it for?" className="h-10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting
              ? "Saving…"
              : isEditing
                ? "Save changes"
                : type === "expense"
                  ? "Add expense"
                  : "Add income"}
          </button>
          {isEditing && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </Form>
  )
}

export default AddTransactionForm
