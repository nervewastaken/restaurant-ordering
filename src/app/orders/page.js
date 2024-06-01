"use client";
import React, { useState, useEffect } from "react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

const Page = () => {
  const [user, setUser] = useState(null);
  const [table, setTable] = useState(null);

  const [formData, setFormData] = useState({ username: "", email: "" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUser(localStorage.getItem("user"));
      setTable(localStorage.getItem("table"));
    }
  
  }, []);

  console.log(table,user)

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const usersRef = collection(db, "users");
      await addDoc(usersRef, {
        username: formData.username,
        email: formData.email,
        table: table,
      });
      setUser(formData.username);
      seteuser(true);
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getTableData = async () => {
    try {
      const q = query(collection(db, "users"), where("table", "==", table));
      const querySnapshot = await getDocs(q);
      const tableData = [];
      querySnapshot.forEach((doc) => {
        tableData.push(doc.data());
      });
      return tableData;
    } catch (error) {
      console.error("Error getting table data:", error);
      return [];
    }
  };

  tableData = getTableData()

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user}!</h1>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            name="username"
            id="username"
            value={formData.username}
            onChange={handleInputChange}
          />
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default Page;
