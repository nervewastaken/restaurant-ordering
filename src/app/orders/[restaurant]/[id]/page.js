"use client";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import db from "@/firebase";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const Page = ({ params }) => {
  const { restaurant, id } = params;
  const [value, setValue] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pinExists, setPinExists] = useState(false);


  const generateRandomNumber = () => {
    const randomNumber = Math.floor(Math.random() * 10000);
    const fourDigitNumber = randomNumber.toString().padStart(4, "0");
    return fourDigitNumber;
  };

  const handlePinCreation = async () => {
    const PIN = generateRandomNumber();
    console.log(PIN);

    try {
      const docRef = await addDoc(collection(db, "restaurants", restaurant, "tables"), {
        tid: id,
        pin: PIN,
      });
      console.log("Document written with ID: ", docRef.id);
      setPinExists(true);

      localStorage.setItem('table', id);
      localStorage.setItem('restaurant',restaurant);
      window.alert(`your pin is ${PIN} redirecting`);

      setTimeout(() => {
        window.location.href = "/orders";
      }, 3000);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const fetchData = async () => {
    try {
      const q = query(
        collection(db, "restaurants", restaurant, "tables"),
        where("tid", "==", id),
        where("pin", "!=", null)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setPinExists(true);
      }
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const q = query(
        collection(db, "restaurants", restaurant, "tables"),
        where("tid", "==", id),
        where("pin", "==", value)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef2 = await addDoc(collection(db, "restaurants", restaurant, "users"), {
          username: name,
          email: email,
          table: id,
          restaurant: restaurant,
        });
        localStorage.setItem('user', name);
        localStorage.setItem('table', id);
        localStorage.setItem('restaurant',restaurant);

        window.alert("redirecting");
        setTimeout(() => {
          window.location.href = "/orders";
        }, 3000);
      } else {
        window.alert("Invalid Pin");
        setValue("");
      }
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="flex justify-center">
      {id}
      {pinExists ? (
        <form onSubmit={handleSubmit} className="max-w-lg w-full">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="mt-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="mt-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Pin"
            className="mt-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <Button type="submit" className="mt-4">
            Join Room
          </Button>
        </form>
      ) : (
        <div className="max-w-lg w-full">
          <Button onClick={handlePinCreation} className="mt-4">
            Generate Pin
          </Button>
        </div>
      )}
    </div>
  );
};

export default Page;
