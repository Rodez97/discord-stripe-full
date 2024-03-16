"use client";
import React from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  TextField,
} from "@mui/material";
import BenefitsControl from "./BenefitsControl";
import { newTierValidationSchema } from "../lib/validationSchemas";
import Main from "@stripe-discord/ui/components/Main";
import CommonNavbar from "@stripe-discord/ui/components/CommonNavbar";
import Form from "@stripe-discord/ui/components/Form";
import useGlobalElements from "@stripe-discord/ui/hooks/useGlobalElements";
import { createTier } from "lib/tier/createTier";

type TierFormType = {
  nickname: string;
  description?: string;
  benefits?: string[];
  productId: string;
  monthlyPriceId: string;
  yearlyPriceId?: string;
  discordRoles: string[];
  submit: string | null;
};

function NewTierForm({
  serverId,
  roles,
}: {
  serverId: string;
  roles: {
    id: string;
    name: string;
  }[];
}) {
  const router = useRouter();
  const { openLoadingBackdrop, closeLoadingBackdrop } = useGlobalElements();

  const {
    values,
    setFieldValue,
    handleBlur,
    handleChange,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
  } = useFormik<TierFormType>({
    initialValues: {
      nickname: "",
      productId: "",
      monthlyPriceId: "",
      yearlyPriceId: "",
      discordRoles: [],
      benefits: [],
      submit: null,
    },
    validationSchema: newTierValidationSchema,
    onSubmit: async (
      { submit, ...data },
      { setErrors, setSubmitting, setStatus }
    ) => {
      try {
        openLoadingBackdrop();

        await createTier(serverId, data);

        setErrors({});
        setStatus({ success: true });
        router.push(`/${serverId}`);
      } catch (error) {
        console.error(error);
        let errorMessage = "Unknown error";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        setErrors({ submit: errorMessage });
        setStatus({ success: false });
      } finally {
        setSubmitting(false);
        closeLoadingBackdrop();
      }
    },
  });

  const handleRolesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newRoles: Set<string>;
    if (e.target.checked) {
      newRoles = new Set([...values.discordRoles, e.target.name]);
    } else {
      newRoles = new Set(
        values.discordRoles.filter((id) => id !== e.target.name)
      );
    }

    // Convert the Set to an array
    setFieldValue("discordRoles", Array.from(newRoles));
  };

  const handleBenefitsChange = (values: string[]) =>
    setFieldValue("benefits", values);

  return (
    <Main>
      <CommonNavbar title="Add a new tier" backHref={`/${serverId}`} />

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
              size="small"
              required
              label="Nickname"
              name="nickname"
              id="nickname"
              value={values.nickname}
              onBlur={handleBlur}
              onChange={handleChange}
              disabled={isSubmitting}
              error={Boolean(errors.nickname && touched.nickname)}
              helperText={touched.nickname && errors.nickname}
            />
            <TextField
              size="small"
              required
              label="Product ID"
              name="productId"
              id="productId"
              value={values.productId}
              onBlur={handleBlur}
              onChange={handleChange}
              disabled={isSubmitting}
              error={Boolean(errors.productId && touched.productId)}
              helperText={touched.productId && errors.productId}
            />
            <TextField
              size="small"
              required
              label="Monthly Price ID"
              name="monthlyPriceId"
              id="monthlyPriceId"
              value={values.monthlyPriceId}
              onBlur={handleBlur}
              onChange={handleChange}
              disabled={isSubmitting}
              error={Boolean(errors.monthlyPriceId && touched.monthlyPriceId)}
              helperText={touched.monthlyPriceId && errors.monthlyPriceId}
            />
            <TextField
              size="small"
              label="Yearly Price ID"
              name="yearlyPriceId"
              id="yearlyPriceId"
              value={values.yearlyPriceId}
              onBlur={handleBlur}
              onChange={handleChange}
              disabled={isSubmitting}
              error={Boolean(errors.yearlyPriceId && touched.yearlyPriceId)}
              helperText={touched.yearlyPriceId && errors.yearlyPriceId}
            />

            <FormControl
              size="small"
              required
              variant="standard"
              disabled={isSubmitting}
              error={Boolean(errors.discordRoles && touched.discordRoles)}
            >
              <FormLabel>Select the roles linked to this tier</FormLabel>
              <FormGroup>
                {roles.map((role) => (
                  <FormControlLabel
                    key={role.id}
                    control={
                      <Checkbox
                        checked={values.discordRoles?.includes(role.id)}
                        onChange={handleRolesChange}
                        name={role.id}
                      />
                    }
                    label={role.name}
                  />
                ))}
              </FormGroup>
            </FormControl>

            <TextField
              size="small"
              label="Description"
              name="description"
              id="description"
              value={values.description}
              onBlur={handleBlur}
              onChange={handleChange}
              disabled={isSubmitting}
              multiline
              rows={2}
              error={Boolean(errors.description && touched.description)}
              helperText={touched.description && errors.description}
            />

            <BenefitsControl
              onBlur={handleBlur}
              onChange={handleBenefitsChange}
              benefits={values.benefits}
              disabled={isSubmitting}
              error={Boolean(errors.benefits && touched.benefits)}
              helperText={touched.benefits && errors.benefits}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                marginBottom: 2,
              }}
            >
              Save
            </Button>

            {/* Show submit error if needed */}
            {errors.submit && touched.submit && (
              <Alert severity="error">{errors.submit}</Alert>
            )}

            <br />
          </Form>
        </Box>
      </Box>
    </Main>
  );
}

export default NewTierForm;
