"use client";
import React from "react";
import { useFormik } from "formik";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  TextField,
} from "@mui/material";
import { useRouter } from "next/navigation";
import BenefitsControl from "./BenefitsControl";
import { editTierValidationSchema } from "../validation-schemas/tier";
import Main from "@stripe-discord/ui/components/Main";
import CommonNavbar from "@stripe-discord/ui/components/CommonNavbar";
import Form from "@stripe-discord/ui/components/Form";
import { controlledFetch } from "@stripe-discord/lib";
import { DiscordTier } from "@stripe-discord/types";
import useGlobalElements from "@stripe-discord/ui/hooks/useGlobalElements";

type FormType = {
  nickname: string;
  description?: string;
  benefits?: string[];
  discordRoles: string[];
  submit: string | null;
};

function EditTierForm({
  roles,
  tier: {
    nickname,
    description,
    discordRoles,
    benefits,
    id,
    productId,
    monthlyPriceId,
    yearlyPriceId,
  },
  serverId,
}: {
  roles: {
    id: string;
    name: string;
  }[];
  tier: DiscordTier;
  serverId: string;
}) {
  const router = useRouter();
  const { openLoadingBackdrop, closeLoadingBackdrop } = useGlobalElements();

  const {
    values,
    isSubmitting,
    errors,
    touched,
    handleBlur,
    handleSubmit,
    setFieldValue,
    handleChange,
  } = useFormik<FormType>({
    initialValues: {
      nickname,
      description,
      discordRoles,
      benefits,
      submit: null,
    },
    validationSchema: editTierValidationSchema,
    onSubmit: async (
      { submit, ...data },
      { setErrors, setSubmitting, setStatus }
    ) => {
      try {
        openLoadingBackdrop();

        await controlledFetch(`/api/tier/update-tier`, {
          method: "PATCH",
          body: JSON.stringify({
            tierId: id,
            ...data,
          }),
        });

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
      <CommonNavbar title="Edit Tier" backHref={`/${serverId}`} />

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
            {/**
             * Read-only fields are disabled by default (Product ID, Yearly Price ID, Monthly Price ID)
             */}
            <TextField
              size="small"
              label="Product ID"
              id="productId"
              disabled
              value={productId}
            />
            <TextField
              size="small"
              label="Monthly Price ID"
              id="monthlyPriceId"
              disabled
              value={monthlyPriceId}
            />
            <TextField
              size="small"
              label="Yearly Price ID"
              id="yearlyPriceId"
              disabled
              value={yearlyPriceId}
            />

            <Divider />

            <TextField
              size="small"
              label="Nickname"
              name="nickname"
              id="nickname"
              onBlur={handleBlur}
              onChange={handleChange}
              disabled={isSubmitting}
              value={values.nickname}
              error={Boolean(errors.nickname && touched.nickname)}
              helperText={touched.nickname && errors.nickname}
            />

            <FormControl
              variant="standard"
              disabled={isSubmitting}
              size="small"
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
              onBlur={handleBlur}
              onChange={handleChange}
              disabled={isSubmitting}
              multiline
              rows={2}
              value={values.description}
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

            <Button type="submit" variant="contained" disabled={isSubmitting}>
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

export default EditTierForm;
