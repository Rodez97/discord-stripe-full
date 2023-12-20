"use client";
import { styled } from "@mui/material";

const Body = styled("body")`
  overflow: hidden;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #12121212;
  background-image: url("/images/pattern_bg.png"),
    linear-gradient(180deg, #121212 0%, #202020 100%);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-blend-mode: darken;
`;

export default Body;
