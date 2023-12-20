"use client";
import Navbar from "../../components/Navbar";
import React, { Suspense } from "react";
import Loading from "../loading";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </>
  );
}
