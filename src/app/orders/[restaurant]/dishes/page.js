"use client";
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase"; // Adjust this import to your Firebase configuration

const DishManager = () => {
  const [newDish, setNewDish] = useState({
    name: "",
    price: "",
    description: "",
  });

  const [dishes, setDishes] = useState([]);
  const [editingDishId, setEditingDishId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRestaurant(localStorage.getItem("restaurant"));
    }
  }, []);

  useEffect(() => {
    if (restaurant) {
      fetchDishes();
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
      console.log(dishesList);  
      setDishes(dishesList);
    } catch (error) {
      console.error("Error fetching dishes:", error);
    }
  };

  const handleAddDish = async () => {
    try {
      const dishesRef = collection(db, `restaurants/${restaurant}/dishes`);
      const q = query(dishesRef, orderBy("dishId", "desc"));
      const querySnapshot = await getDocs(q);
      let newDishId = 1;

      if (!querySnapshot.empty) {
        const highestDish = querySnapshot.docs[0];
        newDishId = highestDish.data().dishId + 1;
      }

      await addDoc(dishesRef, {
        dishId: newDishId,
        name: newDish.name,
        price: newDish.price,
        description: newDish.description,
      });

      setNewDish({ name: "", price: "", description: "" });
      fetchDishes();
    } catch (error) {
      console.error("Error adding dish:", error);
    }
  };

  const handleDeleteDish = async (id) => {
    try {
      await deleteDoc(doc(db, `restaurants/${restaurant}/dishes`, id));
      fetchDishes();
    } catch (error) {
      console.error("Error deleting dish:", error);
    }
  };

  const handleEditDish = (dish) => {
    setEditingDishId(dish.id);
    setNewDish({
      name: dish.name,
      price: dish.price,
      description: dish.description,
    });
  };

  const handleUpdateDish = async () => {
    try {
      const dishRef = doc(
        db,
        `restaurants/${restaurant}/dishes`,
        editingDishId
      );
      await updateDoc(dishRef, {
        name: newDish.name,
        price: newDish.price,
        description: newDish.description,
      });

      setNewDish({ name: "", price: "", description: "" });
      setEditingDishId(null);
      fetchDishes();
    } catch (error) {
      console.error("Error updating dish:", error);
    }
  };

  return (
    <div>
      <h1>Dish Manager</h1>
      <div className="flex flex-col justify-center items-center">
        <input
          type="text"
          placeholder="Dish Name"
          value={newDish.name}
          onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newDish.price}
          onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newDish.description}
          onChange={(e) =>
            setNewDish({ ...newDish, description: e.target.value })
          }
        />
        {editingDishId ? (
          <button onClick={handleUpdateDish}>Update Dish</button>
        ) : (
          <button onClick={handleAddDish}>Add Dish</button>
        )}
      </div>
      <ul>
        {dishes.map((dish) => (
          <li key={dish.id} className="">
            {dish.name} - ${dish.price} - {dish.description}
            <button className="p-4  " onClick={() => handleEditDish(dish)}>Edit</button>
            <button onClick={() => handleDeleteDish(dish.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DishManager;
