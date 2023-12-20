"use client";
import { Box, styled } from "@mui/material";

const CardsContainer = styled(Box)`
  height: 100%;
  gap: 1rem;
  display: flex;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding: 1rem;
  align-content: flex-start;
  justify-content: center;

  @media (max-width: 600px) {
    padding: 0.5rem;
  }

  @media (max-width: 400px) {
    padding: 0.2rem;
  }

  @media (max-width: 300px) {
    padding: 0.1rem;
  }

  animation: fadein 0.5s;

  @keyframes fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export default CardsContainer;
