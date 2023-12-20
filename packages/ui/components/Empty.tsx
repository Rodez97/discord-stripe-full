"use client";
import { Typography, styled } from "@mui/material";

const Empty = styled(Typography)`
  color: gray;
  text-align: center;
  margin-top: 3rem;
  width: 100%;
  font-size: 2rem;
  font-weight: 300;
  flex-grow: 1;

  @media (max-width: 600px) {
    font-size: 1.5rem;
  }

  @media (max-width: 400px) {
    font-size: 1.2rem;
  }

  @media (max-width: 300px) {
    font-size: 1rem;
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

export default Empty;
