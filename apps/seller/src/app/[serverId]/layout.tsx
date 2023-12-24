"use client";
import React, { Suspense } from "react";
import Loading from "../loading";
import MainNavbar from "../../components/MainNavbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNavbar />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </>
  );
}
