"use client";
import React, { useState, useEffect } from "react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import db from "@/firebase"

const Page = () => {
  const [user, setUser] = useState(null);
  const [table, setTable] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState({ username: "", email: "" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUser(localStorage.getItem('user'));
      setTable(localStorage.getItem('table'));
      setRestaurant(localStorage.getItem('restaurant'))
    }
  }, []);

  useEffect(() => {
    const getTableData = async () => {
      if (restaurant && table) {
        try {
          const q = query(collection(db, "restaurants", restaurant, "users"), where("table", "==", table));
          const querySnapshot = await getDocs(q);
          const data = [];
          querySnapshot.forEach((doc) => {
            data.push(doc.data());
          });
          setTableData(data); // Update table data state
        } catch (error) {
          console.error("Error getting table data:", error);
          setTableData([]); // Set empty table data on error
        }
      }
    };

    getTableData();
  }, [restaurant, table]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const usersRef = collection(db, "restaurants", restaurant, "users");
      await addDoc(usersRef, {
        username: formData.username,
        email: formData.email,
        table: table,
        restaurant: restaurant,
      });
      setUser(formData.username);
      localStorage.setItem('user', formData.username);
      window.location.reload();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user}!</h1>
          {/* Render your markdown content here */}
          <h2>Friends</h2>
          {tableData.length > 0 && ( // Check for valid table data before rendering
            <table>
              <thead>
                <tr>
                  {/* Add table headers based on your table data structure */}
                  <th>Username</th>
                  <th>Email</th>
                  {/* Add more headers as needed */}
                </tr>
              </thead>
              <tbody>
                {tableData.map((rowData, index) => (
                  <tr key={index}> {/* Use a unique key */}
                    <td>{rowData.username}</td>
                    <td>{rowData.email}</td>
                    {/* Add more table cells as needed */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
