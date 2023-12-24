"use client";
import React, { Suspense } from "react";
import Loading from "../loading";
import Navbar from "@stripe-discord/ui/components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </>
  );
}
