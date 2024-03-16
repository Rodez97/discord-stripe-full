"use client";
import { Card, styled } from "@mui/material";

const MainCard = styled(Card)`
  width: 220px;
  background: rgba(255, 255, 255, 0.01);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export default MainCard;
