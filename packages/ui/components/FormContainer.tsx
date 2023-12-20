"use client";
import { Card, styled } from "@mui/material";

const FormContainer = styled(Card)`
  width: 220px;
  backdrop-filter: blur(5px);
  background: rgba(255, 255, 255, 0.05);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export default FormContainer;
