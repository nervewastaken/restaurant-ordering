"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase";
import { UserAuth } from "@/app/authcontext/authcontext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Typography,
  ButtonGroup,
} from "@mui/material";

const loadingStates = [
  { text: "Let the developer cook with the load" },
  { text: "He's still cooking" },
  { text: "Honestly, I'm alone here, its going to take time" },
  { text: "easter egg if the site never loads?" },
  { text: "I (developer) think you should refresh" },
  { text: "Start a fight" },
  { text: "I was not serious about the easter egg" },
  { text: "Do you feel good about yourself" },
];

export default function Admin({ restaurantParam }) {
  const { user, googleSignIn, logOut } = UserAuth();
  const [tableData, setTableData] = useState([]);
  const [orderData, setOrderData] = useState({ pending: {}, completed: {} });
  const [loading, setLoading] = useState(false);
  const [dishDetails, setDishDetails] = useState(null);
  const [restaurant, setRestaurant] = useState(restaurantParam);

  const handleSignOut = async () => {
    try {
      await logOut();
      window.location.href = "/";
    } catch (err) {
      console.log(err);
    }
  };

  const fetchData = useCallback(async () => {
    if (!restaurant) return;

    let unsubscribeTables;
    let unsubscribeOrders;
    let unsubscribeDishes;

    try {
      setLoading(true);

      // Listen for table changes
      const tablesRef = collection(db, `restaurants/${restaurant}/tables`);
      unsubscribeTables = onSnapshot(
        tablesRef,
        (snapshot) => {
          const tablesData = snapshot.docs.map((doc) => ({
            tid: doc.id,
            ...doc.data(),
          }));
          console.log("Fetched tables:", tablesData);
          setTableData(tablesData);
        },
        (error) => {
          console.error("Error fetching tables:", error);
        }
      );

      // Listen for order changes
      const ordersRef = collection(db, `restaurants/${restaurant}/orders`);
      unsubscribeOrders = onSnapshot(
        ordersRef,
        (snapshot) => {
          const ordersData = snapshot.docs.map((doc) => ({
            oid: doc.id,
            ...doc.data(),
          }));

          console.log("Fetched orders:", ordersData);

          // Group orders by status and aggregate dish quantities
          const ordersGroupedByStatus = ordersData.reduce(
            (acc, order) => {
              const table = order.table;
              const status = order.done ? "completed" : "pending";
              const dishId = order.dishId;

              if (!acc[status][table]) {
                acc[status][table] = {};
              }

              if (!acc[status][table][dishId]) {
                acc[status][table][dishId] = {
                  dishId,
                  quantity: 0,
                  orders: [],
                };
              }

              acc[status][table][dishId].quantity += order.quantity;
              acc[status][table][dishId].orders.push(order);

              return acc;
            },
            { pending: {}, completed: {} }
          );

          setOrderData(ordersGroupedByStatus);
        },
        (error) => {
          console.error("Error fetching orders:", error);
        }
      );

      // Listen for dish changes
      const dishesRef = collection(db, `restaurants/${restaurant}/dishes`);
      unsubscribeDishes = onSnapshot(
        dishesRef,
        (snapshot) => {
          const fetchedDishDetails = {};
          snapshot.forEach((doc) => {
            const data = doc.data();
            fetchedDishDetails[data.dishId] = {
              name: data.name,
              price: Number(data.price) || 0,
            };
          });
          setDishDetails(fetchedDishDetails);
        },
        (error) => {
          console.error("Error fetching dishes:", error);
        }
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }

    // Return cleanup function
    return () => {
      if (unsubscribeTables) unsubscribeTables();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeDishes) unsubscribeDishes();
    };
  }, [restaurant]);

  useEffect(() => {
    const storedRestaurant = localStorage.getItem("restaurant");
    if (storedRestaurant !== restaurant) {
      setRestaurant(storedRestaurant);
    }
  }, [restaurant]);

  useEffect(() => {
    let cleanup;
    if (restaurant) {
      cleanup = fetchData();
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [fetchData]);

  const handleMarkAsDone = async (orderId, table) => {
    try {
      const orderDocRef = doc(db, `restaurants/${restaurant}/orders`, orderId);
      await updateDoc(orderDocRef, { done: true });
      console.log(`Order ${orderId} marked as done successfully.`);
    } catch (error) {
      console.error("Error marking order as done:", error);
    }
  };

  const handleClearTable = async (tableId) => {
    try {
      // Delete all users associated with the table
      const usersRef = collection(db, `restaurants/${restaurant}/users`);
      const usersQuery = query(usersRef, where("table", "==", tableId));
      const usersSnapshot = await getDocs(usersQuery);
      const deleteUserPromises = usersSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );

      // Delete all orders associated with the table
      const ordersRef = collection(db, `restaurants/${restaurant}/orders`);
      const ordersQuery = query(ordersRef, where("table", "==", tableId));
      const ordersSnapshot = await getDocs(ordersQuery);
      const deleteOrderPromises = ordersSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );

      // Delete the table
      const tableRef = collection(db, `restaurants/${restaurant}/tables`);
      const tableQuery = query(tableRef, where("tid", "==", tableId));
      const tablesSnapshot = await getDocs(tableQuery);
      const deleteTablePromises = tablesSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );

      // Execute all delete operations
      await Promise.all([
        ...deleteUserPromises,
        ...deleteOrderPromises,
        ...deleteTablePromises,
      ]);

      console.log(
        `All data related to table ${tableId} has been deleted successfully.`
      );
    } catch (error) {
      console.error("Error clearing table data:", error);
    }
  };

  return (
    <div className="justify-center items-center">
      <Loader loadingStates={loadingStates} loading={loading} duration={2000} />
      <div className="flex justify-between py-2 px-2">
        <h1 className="py-1">Admin</h1>
        <Button>
          <Link href={`/orders/${restaurant}/dishes`}>Add Dishes</Link>
        </Button>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>

      <h2 className="px-10 py-10 text-gray-500 font-semibold text-2xl">
        Active Tables
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        {tableData.map((table) => (
          <Card key={table.tid} sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography variant="h5" component="div">
                Table ID: {table.tid}
              </Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                Status: {table.stat}
              </Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                Pin: {table.pin}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleClearTable(table.tid)}
              >
                Delete Table
              </Button>
            </CardActions>
          </Card>
        ))}
      </div>

      <h2 className="px-10 py-10 text-gray-500 font-semibold text-2xl">
        Pending Orders
      </h2>
      <div className="px-4">
        {Object.keys(orderData.pending).map((table) => (
          <Card key={table} sx={{ minWidth: 275, mb: 2 }}>
            <CardContent>
              <Typography variant="h5" component="div">
                Orders for Table {table}
              </Typography>
              {Object.values(orderData.pending[table]).map((dish) => (
                <Box
                  key={dish.dishId}
                  sx={{
                    border: 1,
                    borderColor: "grey.300",
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2">
                    Dish ID: {dish.dishId}
                  </Typography>
                  <Typography variant="body2">
                    Dish Name: {dishDetails[dish.dishId]?.name}
                  </Typography>

                  <Typography variant="body2">
                    Quantity: {dish.quantity}
                  </Typography>
                  {dish.orders.map((order) => (
                    <Typography key={order.oid} variant="body2">
                      Timestamp:{" "}
                      {new Date(
                        order.timestamp.seconds * 1000
                      ).toLocaleTimeString()}
                    </Typography>
                  ))}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      dish.orders.forEach((order) =>
                        handleMarkAsDone(order.oid, table)
                      )
                    }
                  >
                    Mark as Done
                  </Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="px-10 py-10 text-gray-500 font-semibold text-2xl">
        Completed Orders
      </h2>
      <div>
        {Object.keys(orderData.completed).map((table) => (
          <Card key={table} sx={{ minWidth: 275, mb: 2 }}>
            <CardContent>
              <Typography variant="h5" component="div">
                Completed Orders for Table {table}
              </Typography>
              {Object.values(orderData.completed[table]).map((dish) => (
                <Box
                  key={dish.dishId}
                  sx={{
                    border: 1,
                    borderColor: "grey.300",
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2">
                    Dish ID: {dish.dishId}
                  </Typography>
                  <Typography variant="body2">
                    Dish Name: {dishDetails[dish.dishId]?.name}
                  </Typography>

                  <Typography variant="body2">
                    Quantity: {dish.quantity}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
