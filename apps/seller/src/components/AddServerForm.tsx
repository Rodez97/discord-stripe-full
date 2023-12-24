"use client";
import React, { useState } from "react";
import { FormikHelpers, useFormik } from "formik";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import Link from "next/link";
import * as yup from "yup";
import { controlledFetch } from "@stripe-discord/lib";
import Main from "@stripe-discord/ui/components/Main";
import CommonNavbar from "@stripe-discord/ui/components/CommonNavbar";
import Form from "@stripe-discord/ui/components/Form";
import LoadingBackdrop from "@stripe-discord/ui/components/LoadingBackdrop";
import SmartToyIcon from "@mui/icons-material/SmartToy";

type FormType = {
  id: string;
  name: string;
  icon: string;
  submit: string | null;
};

const validationSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  icon: yup.string(),
});

function AddServerForm({ availableServers }: { availableServers: any[] }) {
  const router = useRouter();
  const [confirmAddedBot, setConfirmAddedBot] = useState(false);

  const {
    values: { id },
    isSubmitting,
    errors,
    touched,
    handleBlur,
    handleSubmit,
    setValues,
  } = useFormik<FormType>({
    initialValues: {
      id: "",
      name: "",
      icon: "",
      submit: null,
    },
    validationSchema: validationSchema,
    onSubmit: async (
      values: FormType,
      formikHelpers: FormikHelpers<FormType>
    ) => {
      const { submit, ...data } = values;
      const { setErrors, setSubmitting, setStatus } = formikHelpers;

      try {
        await controlledFetch(`/add-server/api`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        setErrors({});
        setStatus({ success: true });
        setSubmitting(false);
        router.push(`/`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setErrors({ submit: errorMessage });
        setStatus({ success: false });
        setSubmitting(false);
      }
    },
  });

  const createDiscordUrl = () => {
    return `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&scope=bot&permissions=${process.env.NEXT_PUBLIC_DISCORD_PERMISSIONS}&guild_id=${id}&disable_guild_select=true`;
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const server = availableServers.find(
      (guild) => guild.id === e.target.value
    );

    if (server) {
      setValues({
        id: server.id,
        name: server.name,
        icon: server.icon || "",
        submit: null,
      });
    }
  };

  return (
    <Main>
      <CommonNavbar title="Add a new server" backHref="/" />

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
            <FormControl
              fullWidth
              disabled={isSubmitting}
              error={Boolean(errors.id && touched.id)}
            >
              <InputLabel shrink id="server-select">
                Select a Server
              </InputLabel>
              <Select
                labelId="server-select"
                id="server-select"
                label="Select a Server"
                value={id}
                onChange={handleSelectChange}
                onBlur={handleBlur}
              >
                {availableServers.map((guild) => (
                  <MenuItem value={guild.id} key={guild.id}>
                    {guild.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {id && (
              <>
                <Button
                  disabled={isSubmitting}
                  LinkComponent={Link}
                  color="success"
                  href={createDiscordUrl()}
                  target="_blank"
                  rel="noreferrer"
                  startIcon={<SmartToyIcon />}
                  fullWidth
                  variant="contained"
                >
                  Add the bot to your server
                </Button>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={confirmAddedBot}
                      onChange={(e) => setConfirmAddedBot(e.target.checked)}
                      inputProps={{ "aria-label": "controlled" }}
                    />
                  }
                  label="I have added the bot to my server"
                />

                <Button
                  disabled={isSubmitting || !confirmAddedBot}
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{
                    marginTop: "1rem",
                  }}
                >
                  Save
                </Button>
              </>
            )}

            {errors.submit && touched.submit && (
              <Alert severity="error">{errors.submit}</Alert>
            )}

            <LoadingBackdrop open={isSubmitting} />
          </Form>
        </Box>
      </Box>
    </Main>
  );
}

export default AddServerForm;
