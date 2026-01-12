"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { createOneTimeFormSchema } from "@subtrack/shared/schemas/one-time";
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
  createOneTime,
  updateOneTime,
  deleteOneTime,
} from "@/lib/api/one-time";
import type { OneTimeTransaction } from "@/components/one-time/one-time-table";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

type AddEditOneTimeModalProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  transaction?: OneTimeTransaction | null;
  onSuccessAction: () => void;
};

const categories = [
  "Food & Dining",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Travel",
  "Gifts",
  "Home & Garden",
  "Personal",
  "Education",
  "Other",
];

const formatDateForInput = (date: Date | string | undefined): string => {
  if (!date) return new Date().toISOString().split("T")[0];
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
};

export function AddEditOneTimeModal({
  open,
  onOpenChangeAction,
  transaction,
  onSuccessAction,
}: AddEditOneTimeModalProps) {
  const isEditing = !!transaction;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const form = useForm({
    defaultValues: {
      name: transaction?.name || "",
      amount: transaction?.amount || 0,
      category: transaction?.category || "",
      date: formatDateForInput(transaction?.date),
    },
    validators: {
      onChange: createOneTimeFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = {
          ...value,
          date: new Date(value.date),
        };

        if (isEditing && transaction) {
          await updateOneTime(transaction.id, payload);
          toast.success("Expense updated");
        } else {
          await createOneTime(payload);
          toast.success("Expense added");
        }
        onSuccessAction();
        onOpenChangeAction(false);
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
      form.setFieldValue("category", transaction?.category || "");
      form.setFieldValue("date", formatDateForInput(transaction?.date));
      setShowDeleteConfirm(false);
    } else {
      form.reset();
    }
  }, [open, transaction, form]);

  const handleDelete = async () => {
    if (!transaction) return;
    setIsDeleting(true);

    try {
      await deleteOneTime(transaction.id);
      toast.success("Expense deleted");
      onSuccessAction();
      onOpenChangeAction(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Expense" : "Add Expense"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this expense."
              : "Add a new one-time expense."}
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
                    placeholder="Groceries, Coffee, etc."
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

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
                        ₹
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

            <form.Field name="date">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="space-y-2">
                    <Label htmlFor={field.name}>Date</Label>
                    <Input
                      id={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const value =
                          e.target.value ||
                          new Date().toISOString().split("T")[0];
                        field.handleChange(value);
                      }}
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
