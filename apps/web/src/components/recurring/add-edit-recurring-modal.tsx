"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { createRecurringSchema } from "@subtrack/shared/schemas/recurring";
import type {
  RecurringFrequency,
  RecurringType,
} from "@subtrack/shared/schemas/recurring";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createRecurring,
  updateRecurring,
  deleteRecurring,
} from "@/lib/api/recurring";
import type { RecurringTransaction } from "@/components/recurring/recurring-table";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

type AddEditRecurringModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: RecurringTransaction | null;
  onSuccess: () => void;
};

const categories = [
  "Housing",
  "Utilities",
  "Transportation",
  "Insurance",
  "Healthcare",
  "Entertainment",
  "Subscriptions",
  "Food & Dining",
  "Personal",
  "Education",
  "Fitness",
  "Other",
];

const formatDateForInput = (date: Date | string | undefined): string => {
  if (!date) return new Date().toISOString().split("T")[0];
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
};

export function AddEditRecurringModal({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: AddEditRecurringModalProps) {
  const isEditing = !!transaction;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const form = useForm({
    defaultValues: {
      name: transaction?.name || "",
      amount: transaction?.amount || 0,
      type: (transaction?.type || "SUBSCRIPTION") as RecurringType,
      category: transaction?.category || "",
      frequency: (transaction?.frequency || "MONTHLY") as RecurringFrequency,
      startDate: formatDateForInput(transaction?.startDate),
    },
    validators: {
      onChange: ({ value }) => {
        // Convert date string to Date before validating with the shared schema
        const result = createRecurringSchema.safeParse({
          ...value,
          startDate: new Date(value.startDate),
        });
        return result.success ? undefined : result.error;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = {
          ...value,
          startDate: new Date(value.startDate),
        };

        if (isEditing && transaction) {
          await updateRecurring(transaction.id, payload);
          toast.success("Recurring updated");
        } else {
          await createRecurring(payload);
          toast.success("Recurring added");
        }
        onSuccess();
        onOpenChange(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.reset();
      form.setFieldValue("name", transaction?.name || "");
      form.setFieldValue("amount", transaction?.amount || 0);
      form.setFieldValue(
        "type",
        (transaction?.type || "SUBSCRIPTION") as RecurringType,
      );
      form.setFieldValue("category", transaction?.category || "");
      form.setFieldValue(
        "frequency",
        (transaction?.frequency || "MONTHLY") as RecurringFrequency,
      );
      form.setFieldValue(
        "startDate",
        formatDateForInput(transaction?.startDate),
      );
      setShowDeleteConfirm(false);
    } else {
      form.reset();
    }
  }, [open, transaction, form]);

  const handleDelete = async () => {
    if (!transaction) return;
    setIsDeleting(true);

    try {
      await deleteRecurring(transaction.id);
      toast.success("Recurring deleted");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Recurring" : "Add Recurring"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this recurring expense."
              : "Add a new recurring bill or subscription."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="name">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid} className="space-y-2">
                  <Label htmlFor={field.name}>Name</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Netflix, Electricity, etc."
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="type">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="space-y-2">
                    <Label htmlFor={field.name}>Type</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value: RecurringType) =>
                        field.handleChange(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BILL">Bill</SelectItem>
                        <SelectItem value="SUBSCRIPTION">
                          Subscription
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="frequency">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="space-y-2">
                    <Label htmlFor={field.name}>Frequency</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value: RecurringFrequency) =>
                        field.handleChange(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <form.Field name="category">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid} className="space-y-2">
                  <Label htmlFor={field.name}>Category</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="amount">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="space-y-2">
                    <Label htmlFor={field.name}>Amount</Label>
                    <div className="relative">
                      <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2">
                        $
                      </span>
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={field.state.value || ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(parseFloat(e.target.value) || 0)
                        }
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="startDate">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="space-y-2">
                    <Label htmlFor={field.name}>Start Date</Label>
                    <Input
                      id={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        // Handle empty value by setting to today's date
                        const value =
                          e.target.value ||
                          new Date().toISOString().split("T")[0];
                        field.handleChange(value);
                      }}
                      max={new Date().toISOString().split("T")[0]}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {isEditing && !showDeleteConfirm && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="mr-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}

            {showDeleteConfirm && (
              <div className="mr-auto flex items-center gap-2">
                <span className="text-destructive text-sm">Are you sure?</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Yes, delete"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            )}

            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isEditing ? "Update" : "Add"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
