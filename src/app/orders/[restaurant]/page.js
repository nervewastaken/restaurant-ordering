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
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemDecorator from "@mui/joy/ListItemDecorator";

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
    setLoading(true);
    try {
      const q = query(
        collection(db, "restaurants", restaurant, "tables"),
        where("tid", "==", table)
      );
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
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
      setLoading(false);
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
          setTableData(data);
        } catch (error) {
          console.error("Error getting table data:", error);
          setTableData([]);
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

  //timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Use false for 24-hour format
    });
  };

  const Row = ({
    dish,
    quantities,
    handleQuantityChange,
    handleAddToOrder,
  }) => {
    const [open, setOpen] = React.useState(false);

    return (
      <>
        <TableRow>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
          <TableCell>{dish.name}</TableCell>
          <TableCell>{dish.price}</TableCell>
          <TableCell>
            <input
              type="number"
              min="1"
              value={quantities[dish.dishId] || 1}
              onChange={(e) =>
                handleQuantityChange(dish.dishId, e.target.value)
              }
            />
            <button
              onClick={() => handleAddToOrder(dish.dishId)}
              className="ml-2"
            >
              Add to Order
            </button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box margin={1}>
                <Typography variant="body2">{dish.description}</Typography>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
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
            <div className=" flex justify-between px-24">
              <span className="sm:text-xl md:text-2xl lg:text-3xl text-gray-400">Welcome to {restaurant}!</span>
              <div className="px-24 pb-4">
                <button className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                  Request for bill
                </button>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center sm:text-xl md:text-2xl lg:text-3xl">
              <h1>
                Hey {user} your pin is
                <span className="font-semibold text-fuchsia-600"> {pin}</span>
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
                        <ListItemDecorator>🥓</ListItemDecorator> Is your brain
                        hungry after reading all that text above? Scroll down to
                        start ordering right now!
                      </ListItem>
                    </List>
                  </div>
                </h1>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div>
                <h2 className="font-semibold text-xl mb-2">Current Orders:</h2>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Dish</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{dishNames[order.dishId]}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>
                            {order.done ? "Done" : "Pending"}
                          </TableCell>
                          <TableCell>{formatTime(order.timestamp)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
              <div>
                <h2 className="font-semibold text-xl mb-2">Menu:</h2>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell>Dish</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dishes.map((dish) => (
                        <Row
                          key={dish.dishId}
                          dish={dish}
                          quantities={quantities}
                          handleQuantityChange={handleQuantityChange}
                          handleAddToOrder={handleAddToOrder}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center min-h-screen">
            <h1 className="text-2xl mb-4">Join the Room</h1>
            <form onSubmit={handleSubmit} className="w-64">
              <Label>Username</Label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <button
                type="submit"
                className="mt-4 w-full bg-blue-500 text-white p-2 rounded"
              >
                Join
              </button>
            </form>
          </div>
        ))}
    </div>
  );
};

export default Page;
