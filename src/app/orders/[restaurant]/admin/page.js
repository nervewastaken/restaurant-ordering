"use client";
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
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
  {
    text: "Let the developer cook with the load",
  },
  {
    text: "He's still cooking",
  },
  {
    text: "Honestly, I'm alone here, its going to take time",
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

export default function Admin() {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [orderData, setOrderData] = useState({ pending: {}, completed: {} });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUser(localStorage.getItem("user"));
      setRestaurant(localStorage.getItem("restaurant"));
    }
  }, []);

  useEffect(() => {
    const fetchTables = async () => {
      if (restaurant) {
        setLoading(true);
        try {
          const tablesRef = collection(db, `restaurants/${restaurant}/tables`);
          const tablesSnapshot = await getDocs(tablesRef);
          const tablesData = tablesSnapshot.docs.map((doc) => ({
            tid: doc.id,
            ...doc.data(),
          }));
          setTableData(tablesData);
        } catch (error) {
          console.error("Error fetching tables:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTables();
  }, [restaurant]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (restaurant) {
        setLoading(true);
        try {
          const ordersRef = collection(db, `restaurants/${restaurant}/orders`);
          const ordersSnapshot = await getDocs(ordersRef);
          const ordersData = ordersSnapshot.docs.map((doc) => ({
            oid: doc.id,
            ...doc.data(),
          }));

          const ordersGroupedByStatus = ordersData.reduce(
            (acc, order) => {
              const table = order.table;
              const status = order.done ? "completed" : "pending";

              if (!acc[status][table]) {
                acc[status][table] = [];
              }

              acc[status][table].push(order);
              return acc;
            },
            { pending: {}, completed: {} }
          );

          setOrderData(ordersGroupedByStatus);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [restaurant]);

  const handleMarkAsDone = async (orderId, table) => {
    try {
      const orderDocRef = doc(db, `restaurants/${restaurant}/orders`, orderId);
      await updateDoc(orderDocRef, { done: true });
      console.log(`Order ${orderId} marked as done successfully.`);
      await fetchOrders(); // Fetch orders again to update the state
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

      // Execute all delete operations
      await Promise.all([...deleteUserPromises, ...deleteOrderPromises]);

      console.log(
        `All data related to table ${tableId} has been deleted successfully.`
      );

      // Optionally, update the table data state if needed
      setTableData((prevTables) =>
        prevTables.filter((table) => table.tid !== tableId)
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
      </div>

      <h2>Active Tables</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        {tableData.map((table) => (
          <Card key={table.tid} sx={{ minWidth: 275 }}>
            <CardContent>
              <Typography variant="h5" component="div">
                Table ID: {table.tid}
              </Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                Status: {table.stat}
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
      <h2>Pending Orders</h2>
      <div className="px-4">
        {Object.keys(orderData.pending).map((table) => (
          <Card key={table} sx={{ minWidth: 275, mb: 2 }}>
            <CardContent>
              <Typography variant="h5" component="div" className="">
                Orders for Table {table}
              </Typography>
              {orderData.pending[table].map((order) => (
                <Box
                  key={order.oid}
                  sx={{
                    border: 1,
                    borderColor: "grey.300",
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2">
                    Dish ID: {order.dishId}
                  </Typography>
                  <Typography variant="body2">
                    Quantity: {order.quantity}
                  </Typography>
                  <Typography variant="body2">
                    Timestamp:{" "}
                    {new Date(
                      order.timestamp.seconds * 1000
                    ).toLocaleTimeString()}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleMarkAsDone(order.oid, table)}
                  >
                    Mark as Done
                  </Button>
                </Box>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <h2>Completed Orders</h2>
      <div>
        {Object.keys(orderData.completed).map((table) => (
          <Card key={table} sx={{ minWidth: 275, mb: 2 }}>
            <CardContent>
              <Typography variant="h5" component="div">
                Completed Orders for Table {table}
              </Typography>
              {orderData.completed[table].map((order) => (
                <Box
                  key={order.oid}
                  sx={{
                    border: 1,
                    borderColor: "grey.300",
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2">
                    Dish ID: {order.dishId}
                  </Typography>
                  <Typography variant="body2">
                    Quantity: {order.quantity}
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
