import { z } from "zod";

export const feeStructureSchema = z.object({
  academic_year_id: z.string().uuid("Invalid Academic Session"),
  class_id: z.string().uuid("Invalid Class selection"),
  tuition_fee: z.coerce.number().min(0, "Fee must be greater than or equal to 0"),
  admission_fee: z.coerce.number().min(0, "Fee must be greater than or equal to 0"),
  examination_fee: z.coerce.number().min(0, "Fee must be greater than or equal to 0"),
  library_fee: z.coerce.number().min(0, "Fee must be greater than or equal to 0"),
  laboratory_fee: z.coerce.number().min(0, "Fee must be greater than or equal to 0"),
  transport_fee: z.coerce.number().min(0, "Fee must be greater than or equal to 0"),
  miscellaneous_charges: z.coerce.number().min(0, "Fee must be greater than or equal to 0")
});

export type FeeStructureFormValues = z.infer<typeof feeStructureSchema>;

export const discountSchema = z.object({
  discount_type: z.enum(["percentage", "fixed", "none"]),
  discount_value: z.coerce.number().min(0, "Discount value must be positive"),
  discount_reason: z.enum(["scholarship", "sibling_discount", "merit", "need_based", "special_approval"]),
  discount_remarks: z.string().optional(),
  discount_approved_by: z.string().min(1, "Approved by name is required")
});

export type DiscountFormValues = z.infer<typeof discountSchema>;

export const paymentSchema = z.object({
  student_fee_account_id: z.string().uuid("Invalid Fee Account ID"),
  amount: z.coerce.number().positive("Payment amount must be greater than 0"),
  payment_method: z.enum(["cash", "bank_transfer", "cheque", "online_payment"]),
  transaction_number: z.string().optional(),
  reference_number: z.string().optional(),
  remarks: z.string().optional()
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const voidPaymentSchema = z.object({
  void_reason: z.string().min(4, "Void reason must be at least 4 characters long")
});

export type VoidPaymentValues = z.infer<typeof voidPaymentSchema>;
