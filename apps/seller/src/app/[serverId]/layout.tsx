"use client";
import React, { Suspense } from "react";
import Loading from "../loading";
import Navbar from "../../components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </>
  );
}
