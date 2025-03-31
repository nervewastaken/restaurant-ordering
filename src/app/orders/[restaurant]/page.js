"use client";
import React, { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  onSnapshot,
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
  { text: "Let the developer cook with the load" },
  { text: "He's still cooking" },
  { text: "Honestly, I'm alone here, it's going to take time" },
  { text: "easter egg if the site never loads?" },
  { text: "I (developer) think you should refresh" },
  { text: "Start a fight" },
  { text: "I was not serious about the easter egg" },
  { text: "Do you feel good about yourself" },
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
  const [sortCategory, setSortCategory] = useState("All");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUser(localStorage.getItem("user"));
      setTable(localStorage.getItem("table"));
      setRestaurant(localStorage.getItem("restaurant"));
    }
  }, []);

  useEffect(() => {
    let unsubscribeTableData,
      unsubscribeDishes,
      unsubscribeOrders,
      unsubscribePin;

    if (restaurant && table) {
      // Table data
      unsubscribeTableData = onSnapshot(
        query(
          collection(db, "restaurants", restaurant, "users"),
          where("table", "==", table)
        ),
        async (snapshot) => {
          if (snapshot.empty) {
            // Auto-create a placeholder user if none exists
            await addDoc(collection(db, "restaurants", restaurant, "users"), {
              username: "default",
              email: "placeholder@example.com",
              table,
              restaurant,
            });
          } else {
            const data = snapshot.docs.map((doc) => doc.data());
            setTableData(data);
          }
        },
        (error) => {
          console.error("Error getting table data:", error);
          setTableData([]);
        }
      );

      // Dishes
      unsubscribeDishes = onSnapshot(
        query(
          collection(db, `restaurants/${restaurant}/dishes`),
          orderBy("dishId", "asc")
        ),
        async (snapshot) => {
          if (snapshot.empty) {
            // Add a sample dish if none exist
            await addDoc(collection(db, `restaurants/${restaurant}/dishes`), {
              name: "Sample Dish",
              dishId: 1,
              price: 99,
              category: "Sample",
              description: "This is a placeholder dish.",
              type: "Veg",
            });
          } else {
            const dishesList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            const names = dishesList.reduce((acc, dish) => {
              acc[dish.dishId] = dish.name;
              return acc;
            }, {});
            setDishes(dishesList);
            setDishNames(names);
          }
        },
        (error) => {
          console.error("Error fetching dishes:", error);
        }
      );

      // Orders
      unsubscribeOrders = onSnapshot(
        query(
          collection(db, `restaurants/${restaurant}/orders`),
          where("table", "==", table)
        ),
        (snapshot) => {
          const ordersList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Combine orders with the same dishId and user
          const combinedOrders = ordersList.reduce((acc, order) => {
            const existingOrder = acc.find(
              (o) => o.dishId === order.dishId && o.user === order.user
            );
            if (existingOrder) {
              existingOrder.quantity += order.quantity;
              if (order.timestamp > existingOrder.timestamp) {
                existingOrder.timestamp = order.timestamp;
              }
            } else {
              acc.push(order);
            }
            return acc;
          }, []);

          setOrders(combinedOrders);
        },
        (error) => {
          console.error("Error fetching orders:", error);
        }
      );

      // Pin
      unsubscribePin = onSnapshot(
        query(
          collection(db, "restaurants", restaurant, "tables"),
          where("tid", "==", table)
        ),
        async (snapshot) => {
          if (snapshot.empty) {
            // Auto-create table with a default pin
            await addDoc(collection(db, "restaurants", restaurant, "tables"), {
              tid: table,
              pin: Math.floor(1000 + Math.random() * 9000), // 4-digit random pin
              stat: "active",
            });
          } else {
            snapshot.forEach((doc) => {
              if (doc.exists()) {
                setPin(doc.data().pin);
              }
            });
          }
        },
        (error) => {
          console.error("Error fetching documents: ", error);
        }
      );
    }

    return () => {
      unsubscribeTableData && unsubscribeTableData();
      unsubscribeDishes && unsubscribeDishes();
      unsubscribeOrders && unsubscribeOrders();
      unsubscribePin && unsubscribePin();
    };
  }, [restaurant, table]);

  useEffect(() => {
    if (restaurant && table && dishes.length > 0 && pin !== null) {
      setLoading(false);
    }
  }, [restaurant, table, dishes, pin]);

  const handleAddToOrder = async (dishId) => {
    if (!user) {
      window.alert("You need to join the room first!");
      return;
    }

    try {
      const ordersRef = collection(db, `restaurants/${restaurant}/orders`);
      const q = query(
        ordersRef,
        where("dishId", "==", dishId),
        where("user", "==", user),
        where("table", "==", table)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Update existing order
        const existingOrder = querySnapshot.docs[0];
        const newQuantity =
          existingOrder.data().quantity + (parseInt(quantities[dishId]) || 1);
        await updateDoc(existingOrder.ref, {
          quantity: newQuantity,
          timestamp: new Date(),
        });
      } else {
        // Create new order
        await addDoc(ordersRef, {
          dishId,
          user,
          timestamp: new Date(),
          quantity: parseInt(quantities[dishId]) || 1,
          table,
          done: false,
        });
      }
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
        table,
        restaurant,
      });
      setUser(formData.username);
      localStorage.setItem("user", formData.username);
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const handleBilling = async () => {
    try {
      const q = query(
        collection(db, `restaurants/${restaurant}/tables`),
        where("tid", "==", table)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const tableDoc = querySnapshot.docs[0];
        const tableRef = tableDoc.ref;
        await updateDoc(tableRef, { stat: "requesting bill" });
        window.location.href = `/orders/${restaurant}/billing`;
      } else {
        console.error("No matching table document found.");
      }
    } catch (error) {
      console.error("Error updating table status:", error);
    }
  };

  const filteredDishes =
    sortCategory === "All"
      ? dishes
      : dishes.filter((dish) => dish.category === sortCategory);

  const Row = ({
    dish,
    quantities,
    handleQuantityChange,
    handleAddToOrder,
  }) => {
    const [open, setOpen] = useState(false);

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
              placeholder="enter a value"
              min="1"
              value={quantities[dish.dishId]}
              onChange={(e) =>
                handleQuantityChange(dish.dishId, e.target.value)
              }
            />
            <button
              onClick={() => handleAddToOrder(dish.dishId)}
              className="h-2"
            >
              Add to Order
            </button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box margin={1}>
                <Typography variant="body3">
                  Category : {dish.category}
                </Typography>
                <br />
                <Typography variant="body4">{dish.type}</Typography>
                <br />
                <Typography variant="body2">
                  Description: {dish.description}
                </Typography>
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
          <div className="p-4 md:p-10">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <span className="text-xl md:text-2xl lg:text-3xl text-gray-400 mb-4 md:mb-0">
                Welcome to {restaurant}!
              </span>
              <button
                onClick={handleBilling}
                className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
              >
                Request for bill
              </button>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-xl md:text-2xl lg:text-3xl">
                Hey {user}, your pin is
                <span className="font-semibold text-fuchsia-600"> {pin}</span>
              </h1>
            </div>

            <div className="mb-8">
              <h1 className="text-blue-900 text-lg md:text-xl lg:text-2xl mb-4">
                Here&apos;s what you can do now
              </h1>
              <List aria-labelledby="decorated-list-demo">
                <ListItem>
                  <ListItemDecorator>❤️</ListItemDecorator> Add your own on the
                  left! Scan the QR code and share your table pin for them to
                  join in and order together!
                </ListItem>
                <ListItem>
                  <ListItemDecorator>💵</ListItemDecorator> Issues with
                  splitting the bill all the time? Never again, our calculator
                  tracks your orders by the user so that everyone pays their
                  share fairly.
                </ListItem>
                <ListItem>
                  <ListItemDecorator>🥓</ListItemDecorator> Is your brain hungry
                  after reading all that text above? Scroll down to start
                  ordering right now!
                </ListItem>
              </List>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Friends</h2>
              {tableData.length > 0 && (
                <TableContainer component={Paper}>
                  <Table size="small" aria-label="friends table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Email</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData.map((rowData, index) => (
                        <TableRow key={index}>
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

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Current Orders:</h2>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Dish</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{dishNames[order.dishId]}</TableCell>
                        <TableCell>{order.user}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>{order.done ? "Done" : "Pending"}</TableCell>
                        <TableCell>{formatTime(order.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Menu:</h2>
              <div className="flex justify-end mb-4">
                <select
                  value={sortCategory}
                  onChange={(e) => setSortCategory(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="All">All Categories</option>
                  {Array.from(new Set(dishes.map((dish) => dish.category))).map(
                    (category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>Dish</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDishes.map((dish) => (
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
        ) : (
          <div className="flex flex-col justify-center items-center min-h-screen p-4">
            <h1 className="text-2xl mb-4">Join the Room</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-xs">
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
                className="w-full inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 mt-4"
              >
                Join the room
              </button>
            </form>
          </div>
        ))}
    </div>
  );
};

export default Page;
