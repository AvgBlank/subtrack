"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { createSavingsGoalFormSchema } from "@subtrack/shared/schemas/savings";
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
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
} from "@/lib/api/savings";
import type { SavingsGoal } from "@/lib/api/savings";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

type AddEditSavingsGoalModalProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  goal?: SavingsGoal | null;
  onSuccessAction: () => void;
};

const formatDateForInput = (date: Date | string | undefined): string => {
  if (!date) {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    return futureDate.toISOString().split("T")[0];
  }
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
};

export function AddEditSavingsGoalModal({
  open,
  onOpenChangeAction,
  goal,
  onSuccessAction,
}: AddEditSavingsGoalModalProps) {
  const isEditing = !!goal;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const form = useForm({
    defaultValues: {
      name: goal?.name || "",
      targetAmount: goal?.targetAmount || 0,
      targetDate: formatDateForInput(goal?.targetDate),
      currentAmount: goal?.currentAmount || 0,
    },
    validators: {
      onChange: createSavingsGoalFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = {
          ...value,
          targetDate: new Date(value.targetDate),
        };

        if (isEditing && goal) {
          await updateSavingsGoal(goal.id, payload);
          toast.success("Goal updated");
        } else {
          await createSavingsGoal(payload);
          toast.success("Goal created");
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
      form.setFieldValue("name", goal?.name || "");
      form.setFieldValue("targetAmount", goal?.targetAmount || 0);
      form.setFieldValue("targetDate", formatDateForInput(goal?.targetDate));
      form.setFieldValue("currentAmount", goal?.currentAmount || 0);
      setShowDeleteConfirm(false);
    } else {
      form.reset();
    }
  }, [open, goal, form]);

  const handleDelete = async () => {
    if (!goal) return;
    setIsDeleting(true);

    try {
      await deleteSavingsGoal(goal.id);
      toast.success("Goal deleted");
      onSuccessAction();
      onOpenChangeAction(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Goal" : "Add Goal"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this savings goal."
              : "Create a new savings goal to track your progress."}
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
                  <Label htmlFor={field.name}>Goal Name</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Emergency Fund, Vacation, etc."
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="targetAmount">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="space-y-2">
                    <Label htmlFor={field.name}>Target Amount</Label>
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
                        placeholder="10000.00"
                      />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="currentAmount">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="space-y-2">
                    <Label htmlFor={field.name}>Current Amount</Label>
                    <div className="relative">
                      <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2">
                        $
                      </span>
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        min="0"
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
          </div>

          <form.Field name="targetDate">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid} className="space-y-2">
                  <Label htmlFor={field.name}>Target Date</Label>
                  <Input
                    id={field.name}
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const value = e.target.value || minDate;
                      field.handleChange(value);
                    }}
                    min={minDate}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

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
                  {isEditing ? "Update" : "Create"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
