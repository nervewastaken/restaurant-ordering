"use client";
import React, { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase";

const Page = () => {
  const [user, setUser] = useState(null);
  const [table, setTable] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [dishes, setDishes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [dishNames, setDishNames] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUser(localStorage.getItem("user"));
      setTable(localStorage.getItem("table"));
      setRestaurant(localStorage.getItem("restaurant"));
    }
  }, []);

  useEffect(() => {
    const getTableData = async () => {
      if (restaurant && table) {
        try {
          const q = query(
            collection(db, "restaurants", restaurant, "users"),
            where("table", "==", table)
          );
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

  useEffect(() => {
    if (restaurant) {
      fetchDishes();
      fetchOrders();
    }
  }, [restaurant]);

  const fetchDishes = async () => {
    try {
      const dishesRef = collection(db, `restaurants/${restaurant}/dishes`);
      const q = query(dishesRef, orderBy("dishId", "asc"));
      const querySnapshot = await getDocs(q);
      const dishesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const names = {};
      dishesList.forEach((dish) => {
        names[dish.id] = dish.name;
      });
      setDishes(dishesList);
      setDishNames(names);
    } catch (error) {
      console.error("Error fetching dishes:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersRef = collection(db, `restaurants/${restaurant}/orders`);
      const q = query(ordersRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const ordersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersList);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleAddToOrder = async (dishId) => {
    if (!user) {
      window.alert("You need to join the room first!");
      return;
    }

    try {
      const ordersRef = collection(db, `restaurants/${restaurant}/orders`);
      await addDoc(ordersRef, {
        dishId,
        user,
        timestamp: new Date(),
        quantity: parseInt(quantities[dishId]) || 1,
        table: table,
      });
      fetchOrders();
    } catch (error) {
      console.error("Error adding to order:", error);
    }
  };

  const handleQuantityChange = (dishId, value) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [dishId]: value,
    }));
  };

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
      localStorage.setItem("user", formData.username);
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
          <h2>Friends</h2>
          {tableData.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((rowData, index) => (
                  <tr key={index}>
                    <td>{rowData.username}</td>
                    <td>{rowData.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-8">
            <h2>Orders</h2>
            <ul>
              {orders.map((order) => (
                <li key={order.id}>
                  {dishNames[order.dishId]} - {order.user} - {order.quantity}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h2>Dishes</h2>
            <ul>
              {dishes.map((dish) => (
                <li key={dish.id}>
                  {dish.name} - ${dish.price} - {dish.description}
                  <input
                    type="number"
                    min="1"
                    value={quantities[dish.id] || 1}
                    onChange={(e) =>
                      handleQuantityChange(dish.id, e.target.value)
                    }
                    className="ml-2 w-16"
                  />
                  <button
                    onClick={() => handleAddToOrder(dish.id)}
                    className="ml-2"
                  >
                    Add to Order
                  </button>
                </li>
              ))}
            </ul>
          </div>
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
