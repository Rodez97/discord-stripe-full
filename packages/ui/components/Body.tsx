"use client";
import { styled } from "@mui/material";

const Body = styled("body")`
  /* & ::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -2;
    height: 100vh;
    width: 100vw;
    background-color: #12121212;
    background: radial-gradient(
      ellipse 80% 80% at 50% -20%,
      rgba(255, 255, 255, 0.3),
      rgba(255, 255, 255, 0)
    );
  } */

  overflow: hidden;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export default Body;
