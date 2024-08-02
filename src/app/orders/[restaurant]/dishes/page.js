"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
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

import { TextareaAutosize as BaseTextareaAutosize } from "@mui/base/TextareaAutosize";
import { Input as BaseInput } from "@mui/base/Input";
import { styled } from "@mui/system";

import Button from "@mui/material/Button";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const DishManager = () => {
  const [newDish, setNewDish] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
  });

  const [dishes, setDishes] = useState([]);
  const [editingDishId, setEditingDishId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortCategory, setSortCategory] = useState("All");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRestaurant(localStorage.getItem("restaurant"));
    }
  }, []);

  useEffect(() => {
    if (restaurant) {
      fetchDishes();
      fetchCategories();
    }
  }, [restaurant]);

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(
        db,
        `restaurants/${restaurant}/categories`
      );
      const q = query(categoriesRef, orderBy("catId", "asc"));
      const querySnapshot = await getDocs(q);
      const categoriesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        category: doc.data().category, // Ensure we're using the 'category' field
      }));
      setCategories(categoriesList);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddCategory = async () => {
    try {
      const categoriesRef = collection(
        db,
        `restaurants/${restaurant}/categories`
      );
      const q = query(categoriesRef, orderBy("catId", "desc"));
      const querySnapshot = await getDocs(q);
      let newCatId = 1;

      if (!querySnapshot.empty) {
        const highestCat = querySnapshot.docs[0];
        newCatId = highestCat.data().catId + 1;
      }

      await addDoc(categoriesRef, {
        catId: newCatId,
        category: newCategory,
      });

      setNewCategory("");
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, `restaurants/${restaurant}/categories`, id));
      fetchCategories(); // Refresh the list of categories after deletion
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

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
        category: newDish.category, // This should now be a string
      });

      setNewDish({ name: "", price: "", description: "", category: "" });
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
      category: dish.category || "", // Ensure it's a string or empty string
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
        category: newDish.category, // Add this line
      });
      setNewDish({ name: "", price: "", description: "", category: "" });
      setEditingDishId(null);
      fetchDishes();
    } catch (error) {
      console.error("Error updating dish:", error);
    }
  };

  const filteredDishes =
    sortCategory === "All"
      ? dishes
      : dishes.filter((dish) => dish.category === sortCategory);

  return (
    <div>
      <div className="flex px-2 justify-between h-[50px]">
        <h1 className="py-2">Dish Manager</h1>
        <Button type="outlined">
          <Link href={`/orders/${restaurant}/admin`}>Return</Link>
        </Button>
      </div>
      <div className="flex items-center justify-center gap-10">
        <div className="flex flex-col justify-center items-center gap-4">
          <StyledInput
            type="text"
            placeholder="Dish Name"
            value={newDish.name}
            onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
          />
          <StyledInput
            type="number"
            placeholder="Price"
            value={newDish.price}
            onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
          />
          <TextareaAutosize
            type="text"
            placeholder="Description"
            value={newDish.description}
            onChange={(e) =>
              setNewDish({ ...newDish, description: e.target.value })
            }
          />
          <select
            value={newDish.category ? newDish.category : ""}
            onChange={(e) =>
              setNewDish({ ...newDish, category: e.target.value })
            }
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.category}>
                {cat.category}
              </option>
            ))}
          </select>
          {editingDishId ? (
            <Button type="outlined" onClick={handleUpdateDish}>
              Update Dish
            </Button>
          ) : (
            <Button type="outlined" onClick={handleAddDish}>
              Add Dish
            </Button>
          )}
        </div>

        <div className="flex flex-col justify-center items-center gap-4">
          <input
            type="text"
            placeholder="New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          />
          <button
            onClick={handleAddCategory}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Category
          </button>
        </div>

        <div>
          <div className="flex flex-col justify-center items-center gap-4 mt-4">
            <TableContainer component={Paper} className="mt-4">
              <Table sx={{ minWidth: 250 }} aria-label="categories table">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell component="th" scope="row">
                        {cat.category}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          type="text"
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <select
          value={sortCategory}
          onChange={(e) => setSortCategory(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.category}>
              {cat.category}
            </option>
          ))}
        </select>
      </div>
      <TableContainer component={Paper} className="mt-4">
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Price (₹)</TableCell>
              <TableCell align="right">Description</TableCell>
              <TableCell align="right">Category</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDishes.map((dish) => (
              <TableRow key={dish.id}>
                <TableCell component="th" scope="row">
                  {dish.name}
                </TableCell>
                <TableCell align="right">{dish.price}</TableCell>
                <TableCell align="right">{dish.description}</TableCell>
                <TableCell align="right">{dish.category}</TableCell>
                <TableCell align="right">
                  <Button
                    type="text"
                    onClick={() => handleEditDish(dish)}
                    className="px-2 "
                  >
                    Edit
                  </Button>
                  <Button type="text" onClick={() => handleDeleteDish(dish.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

//styling

const blue = {
  100: "#DAECFF",
  200: "#b6daff",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  900: "#003A75",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const StyledInput = styled("input")(
  ({ theme }) => `
  box-sizing: border-box;
  width: 320px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
  box-shadow: 0px 2px 2px ${
    theme.palette.mode === "dark" ? grey[900] : grey[50]
  };

  &:hover {
    border-color: ${blue[400]};
  }

  &:focus {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${
      theme.palette.mode === "dark" ? blue[600] : blue[200]
    };
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`
);
const TextareaAutosize = styled(BaseTextareaAutosize)(
  ({ theme }) => `
  box-sizing: border-box;
  width: 320px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
  box-shadow: 0px 2px 2px ${
    theme.palette.mode === "dark" ? grey[900] : grey[50]
  };

  &:hover {
    border-color: ${blue[400]};
  }

  &:focus {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${
      theme.palette.mode === "dark" ? blue[600] : blue[200]
    };
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`
);

export default DishManager;
