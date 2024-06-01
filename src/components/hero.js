"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserAuth } from "@/app/authcontext/authcontext";
import { auth } from "@/firebase"; // Import auth

export default function Hero() {
  const { user, googleSignIn, logOut } = UserAuth();

  const handleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (err) {
      console.log(err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  console.log(user);

  useEffect(() => {
    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    };
    checkAuth();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {user ? (
        <Button onClick={handleSignOut}>Sign Out</Button>
      ) : (
        <Button onClick={handleSignIn}>Sign In with Google</Button>
      )}
    </main>
  );
}
