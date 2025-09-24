import Link from "next/link";
import React from "react";
import { ArrowRightIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold underline">Welcome to Dallnk!</h1>
      <Link href="/signin" className="mt-4 text-blue-500 underline">
        Sign In <ArrowRightIcon className="inline-block ml-1" />
      </Link>
    </div>
  );
}
