"use client";
import { faArrowLeft, faRedo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "4rem",
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        sx={{
          mb: 2, // You can adjust the spacing value as needed
        }}
        color="orangered"
      >
        Error
      </Typography>
      <Typography variant="h5" color="gray">
        Oops! Something went wrong.
      </Typography>
      {error && (
        <Typography
          sx={{
            marginTop: "1rem", // You can adjust the spacing value as needed
          }}
          color="orangered"
        >
          {error.message}
        </Typography>
      )}

      {reset && (
        <Button
          variant="contained"
          sx={{
            marginTop: "1rem", // You can adjust the spacing value as needed
          }}
          onClick={() => reset()}
          color="error"
          startIcon={<FontAwesomeIcon icon={faRedo} />}
        >
          Try again
        </Button>
      )}

      <Button
        variant="contained"
        sx={{
          marginTop: "1rem", // You can adjust the spacing value as needed
        }}
        onClick={() => router.back()}
        startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
      >
        Go back
      </Button>
    </Box>
  );
}

export default ErrorPage;
