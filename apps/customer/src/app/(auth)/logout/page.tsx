import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { signOut } from "../../../../auth";
import { faSignOut } from "@fortawesome/free-solid-svg-icons";

export default async function Logout() {
  const handleSignOut = async () => {
    "use server";
    await signOut();
  };

  return (
    <>
      <Typography component="h1" variant="h5" textAlign="center">
        Are you sure you want to sign out?
      </Typography>
      <Box sx={{ mt: 1 }} action={handleSignOut} component="form">
        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3, mb: 2 }}
          startIcon={<FontAwesomeIcon icon={faSignOut} />}
          type="submit"
        >
          Yes, sign out
        </Button>
      </Box>
    </>
  );
}
