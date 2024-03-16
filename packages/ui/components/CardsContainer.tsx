"use client";
import { Box, styled } from "@mui/material";

const CardsContainer = styled(Box)`
  height: 100%;
  gap: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  align-content: start;
  justify-items: center;
  margin-top: 1rem;
  padding: 1rem;
  overflow-y: auto;

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
