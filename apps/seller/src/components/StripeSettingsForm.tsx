"use client";
import React from "react";
import { useFormik } from "formik";
import { Alert, Box, Button, CircularProgress, TextField } from "@mui/material";
import * as yup from "yup";
import Main from "@stripe-discord/ui/components/Main";
import CommonNavbar from "@stripe-discord/ui/components/CommonNavbar";
import Form from "@stripe-discord/ui/components/Form";
import { StripeKeys, WithSubmit } from "@stripe-discord/types";
import useGlobalElements from "@stripe-discord/ui/hooks/useGlobalElements";
import { updateSettings } from "lib/settings/updateSettings";

const validationSchema = yup.object({
  stripePublishableKey: yup.string().required(),
  stripeSecretKey: yup.string().required(),
});

function StripeSettingsForm({ settings }: { settings: StripeKeys }) {
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

        await updateSettings(values);

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

            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} /> : "Save"}
            </Button>

            {/* Show submit error if needed */}
            {errors.submit && touched.submit && (
              <Alert severity="error">{errors.submit}</Alert>
            )}
          </Form>
        </Box>
      </Box>
    </Main>
  );
}

export default StripeSettingsForm;
