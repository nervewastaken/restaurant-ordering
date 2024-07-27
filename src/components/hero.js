"use client";
import React, { useEffect } from "react";
import { db } from "@/firebase"; // Import Firestore
import { getDocs, collection, query, where } from "firebase/firestore";
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

  useEffect(() => {
    const checkAuth = async () => {
      if (user) {
        try {
          const restaurantQuery = query(
            collection(db, "restaccount"),
            where("restaurant", "==", user.displayName) // Assuming `displayName` holds the restaurant field
          );
          const restaurantSnapshot = await getDocs(restaurantQuery);
          let isAuthorized = false;

          restaurantSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.paid) {
              isAuthorized = true;
              localStorage.setItem("restaurant", data.restaurant);
              window.location.href = `/orders/${data.restaurant}/admin`;
            }
          });

          if (!isAuthorized) {
            await logOut();
            window.location.reload();
          }
        } catch (err) {
          console.log("Error checking auth:", err);
          await logOut();
          window.location.reload();
        }
      }
    };

    checkAuth();
  }, [user, logOut]);

  return (
    <main className="flex min-h-screen justify-center py-2">
      {user ? (
        <Button onClick={handleSignOut}>Sign Out</Button>
      ) : (
        <Button onClick={handleSignIn}>Sign In with Google</Button>
      )}
    </main>
  );
}
