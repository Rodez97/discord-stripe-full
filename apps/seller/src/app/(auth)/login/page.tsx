import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import * as React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { signIn } from "../../../../auth";

export default async function Login() {
  const handleSignIn = async () => {
    "use server";
    await signIn("discord");
  };

  return (
    <>
      <Typography component="h1" variant="h5" textAlign="center">
        Start monetizing your Discord server with Stripe
      </Typography>
      <Box sx={{ mt: 1 }} action={handleSignIn} component="form">
        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3, mb: 2 }}
          startIcon={<FontAwesomeIcon icon={faDiscord} />}
          type="submit"
        >
          Sign In with Discord
        </Button>
      </Box>
    </>
  );
}
