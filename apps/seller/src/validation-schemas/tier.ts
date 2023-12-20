import * as yup from "yup";

export const newTierValidationSchema = yup.object({
  nickname: yup
    .string()
    .required("Nickname is required")
    .max(100, "Max 100 characters"),
  productId: yup.string().required("Product ID is required"),
  monthlyPriceId: yup.string().required("Monthly Price ID is required"),
  yearlyPriceId: yup.string(),
  description: yup.string().max(500, "Max 500 characters"),
  benefits: yup.array().of(yup.string()).max(20),
  discordRoles: yup
    .array()
    .of(yup.string())
    .required("At least one role is required"),
});

export const editTierValidationSchema = yup.object({
  nickname: yup
    .string()
    .required("Nickname is required")
    .max(100, "Max 100 characters"),
  description: yup.string().max(500, "Max 500 characters"),
  discordRoles: yup
    .array()
    .of(yup.string())
    .required("At least one role is required"),
});
