"use client";
import React, { useState, useEffect } from "react";

//firebase imports
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase";

//aceternity imports
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label"; // Adjust import as needed
import { Input } from "@/components/ui/input"; // Adjust import as needed

//mui imports
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import Typography from "@mui/joy/Typography";

const loadingStates = [
  {
    text: "Let the developer cook with the load",
  },
  {
    text: "He's still cooking",
  },
  {
    text: "Honestly, I'm alone here, it's going to take time",
  },
  {
    text: "easter egg if the site never loads?",
  },
  {
    text: "I (developer) think you should refresh",
  },
  {
    text: "Start a fight",
  },
  {
    text: "I was not serious about the easter egg",
  },
  {
    text: "Do you feel good about yourself",
  },
];

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
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState(null);

  const fetchPin = async () => {
    setLoading(true); // Start loading
    try {
      const q = query(
        collection(db, "restaurants", restaurant, "tables"),
        where("tid", "==", table)
      );
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        // Assuming there is only one document with the specified table ID
        if (doc.exists()) {
          const data = doc.data();
          setPin(data.pin);
        }
      });

      if (!querySnapshot.empty) {
        setPinExists(true);
      }
    } catch (error) {
      console.error("Error fetching documents: ", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

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
      fetchPin();
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
        names[dish.dishId] = dish.name;
      });
      setDishes(dishesList);
      setDishNames(names);
    } catch (error) {
      console.error("Error fetching dishes:", error);
    } finally {
      setLoading(false);
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
    } finally {
      setLoading(false);
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
        done: false,
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
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
          <Loader
            loadingStates={loadingStates}
            loading={loading}
            duration={2000}
          />
          <button
            className="absolute top-4 right-4 text-black dark:text-white z-50"
            onClick={() => setLoading(false)}
          >
            <IconSquareRoundedX className="h-10 w-10" />
          </button>
        </div>
      )}
      {!loading &&
        (user ? (
          <div className="p-10">
            <div className="sm:text-xl md:text-2xl lg:text-4xl">
              Welcome to {restaurant}!
            </div>
            <div className="flex flex-col justify-center items-center sm:text-xl md:text-2xl lg:text-3xl">
              <h1>
                <span className="font-semibold text-fuchsia-600">{user}!</span>{" "}
                We&apos;re Delighted to have you
              </h1>
              <h1>
                Your Pin is :{" "}
                <span className="font-semibold text-fuchsia-600">{pin}</span>
              </h1>
            </div>
            <div className="flex gap-4 pt-24">
              <div>
                <h2 className="mb-2">Friends</h2>
                {tableData.length > 0 && (
                  <TableContainer component={Paper}>
                    <Table
                      sx={{ minWidth: 650 }}
                      size="small"
                      aria-label="a dense table"
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>Username</TableCell>
                          <TableCell>Email</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tableData.length > 0 &&
                          tableData.map((rowData, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell component="th" scope="row">
                                {rowData.username}
                              </TableCell>
                              <TableCell>{rowData.email}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </div>
              <div>
                <h1 className="text-blue-900">
                  Here&apos;s what you can do now
                  <div>
                    
                    <List aria-labelledby="decorated-list-demo">
                      <ListItem>
                        <ListItemDecorator>❤️</ListItemDecorator> Add your own
                        on the left! scan the QR code and share your table pin
                        for them to join in and order together!
                      </ListItem>
                      <ListItem>
                        <ListItemDecorator>💵</ListItemDecorator> Issues with
                        splitting the bill all the time? never again, our
                        calculator tracks your orders by the user so that
                        everyone pays their share fairly
                      </ListItem>
                      <ListItem>
                        <ListItemDecorator>🥓</ListItemDecorator> Is your brain hungry after reading all that text above? Scroll down to start ordering right now!
                      </ListItem>
                    </List>
                  </div>
                
                </h1>
              </div>
            </div>

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
                  <li key={dish.dishId}>
                    {dish.name} - ${dish.price} - {dish.description}
                    <input
                      type="number"
                      min="1"
                      value={quantities[dish.dishId] || 1}
                      onChange={(e) =>
                        handleQuantityChange(dish.dishId, e.target.value)
                      }
                      className="ml-2 w-16"
                    />
                    <button
                      onClick={() => handleAddToOrder(dish.dishId)}
                      className="ml-2"
                    >
                      Add to Order
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <button>Generate Bill</button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Join Room</h1>
            <form onSubmit={handleSubmit}>
              <div className="">
                <LabelInputContainer className="mb-4">
                  <Label htmlFor="username">Username:</Label>
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                  <Label htmlFor="email">Email:</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </LabelInputContainer>
                <button
                  className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                  type="submit"
                >
                  Join in &rarr;
                  <BottomGradient />
                </button>
              </div>
            </form>
          </div>
        ))}
      <BottomGradient />
    </div>
  );
};

export default Page;

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
