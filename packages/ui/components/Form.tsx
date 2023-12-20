"use client";
import { styled } from "@mui/material";

const Form = styled("form")`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
  margin: auto;
  margin-bottom: 1rem;
  padding: 1rem;
  backdrop-filter: blur(5px);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

export default Form;
