"use client";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { db } from "@/firebase";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

const loadingStates = [
  { text: "Let the developer cook with the load" },
  { text: "He's still cooking" },
  { text: "Honestly, I'm alone here, it's going to take time" },
  { text: "Easter egg if the site never loads?" },
  { text: "I (developer) think you should refresh" },
  { text: "Start a fight" },
  { text: "I was not serious about the easter egg" },
  { text: "Do you feel good about yourself?" },
];

const Page = ({ params }) => {
  const { restaurant, id } = params;
  const [value, setValue] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pinExists, setPinExists] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    localStorage.removeItem("table");
    localStorage.removeItem("restaurant");
    localStorage.removeItem("user");
  }, []);

  const generateRandomNumber = () => {
    const randomNumber = Math.floor(Math.random() * 10000);
    const fourDigitNumber = randomNumber.toString().padStart(4, "0");
    return fourDigitNumber;
  };

  const handlePinCreation = async () => {
    setLoading(true); // Start loading
    const PIN = generateRandomNumber();
    console.log(PIN);

    try {
      await addDoc(collection(db, "restaurants", restaurant, "tables"), {
        tid: id,
        pin: PIN,
        stat: "active", // Ensure "active" is defined correctly
      });
      console.log("Document written with ID: ", id);
      setPinExists(true);

      localStorage.setItem("table", id);
      localStorage.setItem("restaurant", restaurant);

      // Show loader before redirect
      setRedirecting(true);

      setTimeout(() => {
        window.location.href = `/orders/${restaurant}`;
      }, 3000); // Adjust time as needed
    } catch (e) {
      console.error("Error adding document: ", e);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const fetchData = async () => {
    setLoading(true); // Start loading
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
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const q = query(
        collection(db, "restaurants", restaurant, "tables"),
        where("tid", "==", id),
        where("pin", "==", value)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        await addDoc(collection(db, "restaurants", restaurant, "users"), {
          username: name,
          email: email,
          table: id,
          restaurant: restaurant,
        });
        localStorage.setItem("user", name);
        localStorage.setItem("table", id);
        localStorage.setItem("restaurant", restaurant);

        setTimeout(() => {
          setLoading(false); // Stop loading
          window.location.href = `/orders/${restaurant}`;
        }, 3000);
      } else {
        window.alert("Invalid Pin");
        setValue("");
      }
    } catch (error) {
      console.error("Error fetching documents: ", error);
    } finally {
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || redirecting) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader
          loadingStates={loadingStates}
          loading={loading}
          duration={3000}
        />
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      {id}
      {pinExists ? (
        <form
          onSubmit={handleSubmit}
          className="max-w-lg w-full"
        >
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
          <button
            type="submit"
            className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
          >
            Join Room
          </button>
        </form>
      ) : (
        <div className="max-w-lg w-full">
          <button
            onClick={handlePinCreation}
            className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
          >
            Generate a pin
          </button>
        </div>
      )}
    </div>
  );
};

export default Page;
