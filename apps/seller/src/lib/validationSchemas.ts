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

export const stripeSettingsValidationSchema = yup.object({
  stripePublishableKey: yup.string().required(),
  stripeSecretKey: yup.string().required(),
  stripeWebhookSecret: yup.string().required(),
});

export const guildValidationSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  icon: yup.string(),
});
