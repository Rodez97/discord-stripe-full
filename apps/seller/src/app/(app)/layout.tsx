"use client";
import MainNavbar from "../../components/MainNavbar";
import React, { Suspense } from "react";
import Loading from "../loading";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNavbar />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </>
  );
}
