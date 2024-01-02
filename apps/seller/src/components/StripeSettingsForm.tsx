"use client";
import React from "react";
import { useFormik } from "formik";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import * as yup from "yup";
import { KeyedMutator } from "swr";
import Main from "@stripe-discord/ui/components/Main";
import CommonNavbar from "@stripe-discord/ui/components/CommonNavbar";
import Form from "@stripe-discord/ui/components/Form";
import { controlledFetch } from "@stripe-discord/lib";
import { StripeKeys, WithSubmit } from "@stripe-discord/types";
import useGlobalElements from "@stripe-discord/ui/hooks/useGlobalElements";
import { useSession } from "next-auth/react";

const validationSchema = yup.object({
  stripePublishableKey: yup.string().required(),
  stripeSecretKey: yup.string().required(),
  stripeWebhookSecret: yup.string().required(),
});

function StripeSettingsForm({
  settings,
  mutate,
}: {
  settings: StripeKeys;
  mutate: KeyedMutator<{
    settings: StripeKeys;
  }>;
}) {
  const { data: session } = useSession();
  const webhookUrl = `${window.location.origin}/api/webhooks/${session?.user?.id}`;
  const { openLoadingBackdrop, closeLoadingBackdrop, openSnackbar } =
    useGlobalElements();

  const {
    values,
    handleBlur,
    handleChange,
    isSubmitting,
    errors,
    touched,
    handleSubmit,
  } = useFormik<WithSubmit<StripeKeys>>({
    initialValues: {
      ...settings,
      submit: null,
    },
    validationSchema,
    onSubmit: async (
      { submit, ...values },
      { setStatus, setErrors, setSubmitting }
    ) => {
      try {
        openLoadingBackdrop();

        await controlledFetch(`/api/settings`, {
          method: "POST",
          body: JSON.stringify(values),
        });

        mutate((prev) => {
          if (!prev) {
            return prev;
          }
          return {
            settings: values,
          };
        });

        setStatus({ success: true });
        setErrors({});

        openSnackbar({
          message: "The settings have been saved.",
          severity: "success",
        });
      } catch (error) {
        console.error(error);
        setErrors({
          submit:
            error instanceof Error
              ? error.message
              : "There was an error saving the settings.",
        });
        setStatus({ success: false });
      } finally {
        setSubmitting(false);
        closeLoadingBackdrop();
      }
    },
  });

  const copyWebhookUrl = async () => {
    await navigator.clipboard.writeText(webhookUrl);

    openSnackbar({
      message: "The webhook URL has been copied to your clipboard.",
      severity: "success",
    });
  };

  return (
    <Main>
      <CommonNavbar title="Stripe Settings" backHref="/" />

      <Box
        sx={{
          position: "relative",
          height: "100%",
        }}
      >
        <Box
          sx={{
            overflow: "auto",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Form onSubmit={handleSubmit}>
            <TextField
              label="Stripe Publishable Key"
              name="stripePublishableKey"
              id="stripePublishableKey"
              value={values.stripePublishableKey}
              onBlur={handleBlur}
              onChange={handleChange}
              type="password"
              disabled={isSubmitting}
              error={Boolean(
                errors.stripePublishableKey && touched.stripePublishableKey
              )}
              helperText={
                touched.stripePublishableKey && errors.stripePublishableKey
              }
            />

            <TextField
              label="Stripe Secret Key"
              name="stripeSecretKey"
              id="stripeSecretKey"
              value={values.stripeSecretKey}
              onBlur={handleBlur}
              onChange={handleChange}
              type="password"
              disabled={isSubmitting}
              error={Boolean(errors.stripeSecretKey && touched.stripeSecretKey)}
              helperText={touched.stripeSecretKey && errors.stripeSecretKey}
            />

            <TextField
              label="Stripe Webhook Secret"
              name="stripeWebhookSecret"
              id="stripeWebhookSecret"
              value={values.stripeWebhookSecret}
              onBlur={handleBlur}
              onChange={handleChange}
              type="password"
              disabled={isSubmitting}
              error={Boolean(
                errors.stripeWebhookSecret && touched.stripeWebhookSecret
              )}
              helperText={
                touched.stripeWebhookSecret && errors.stripeWebhookSecret
              }
            />

            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : "Save"}
            </Button>

            {/* Show submit error if needed */}
            {errors.submit && touched.submit && (
              <Alert severity="error">{errors.submit}</Alert>
            )}

            <Paper
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                p: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Webhook URL
              </Typography>
              <Typography
                variant="caption"
                // Only one line of text
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {webhookUrl}
              </Typography>
              <Button
                variant="contained"
                onClick={copyWebhookUrl}
                disabled={isSubmitting}
                color="info"
              >
                Copy to Clipboard
              </Button>
            </Paper>
          </Form>
        </Box>
      </Box>
    </Main>
  );
}

export default StripeSettingsForm;
