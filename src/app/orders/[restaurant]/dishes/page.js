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
      <div className="flex px-2 justify-between h-[50px]">
        <h1 className="py-2">Dish Manager</h1>
        <Button type="outlined"><Link href={`/orders/${restaurant}/admin`}>Return</Link></Button>
      </div>

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
      <TableContainer component={Paper} className="mt-4">
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Price (₹)</TableCell>
              <TableCell align="right">Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dishes.map((dish) => (
              <TableRow key={dish.id}>
                <TableCell component="th" scope="row">
                  {dish.name}
                </TableCell>
                <TableCell align="right">{dish.price}</TableCell>
                <TableCell align="right">{dish.description}</TableCell>
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
