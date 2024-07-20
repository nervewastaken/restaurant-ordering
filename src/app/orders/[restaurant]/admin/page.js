"use client";
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [orderData, setOrderData] = useState({ pending: {}, completed: {} });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUser(localStorage.getItem("user"));
      setRestaurant(localStorage.getItem("restaurant"));
    }
  }, []);

  useEffect(() => {
    const fetchTables = async () => {
      if (restaurant) {
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
        }
      }
    };

    fetchTables();
  }, [restaurant]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (restaurant) {
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

      // Fetch orders again to reflect the latest state
      const fetchOrders = async () => {
        if (restaurant) {
          try {
            const ordersRef = collection(
              db,
              `restaurants/${restaurant}/orders`
            );
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
          }
        }
      };

      await fetchOrders(); // Fetch orders again to update the state
    } catch (error) {
      console.error("Error marking order as done:", error);
    }
  };

  const handleClearTable = async (tableId) => {
    // Implement table deletion logic here if needed
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Admin</h1>
      <h2>Active Tables</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tableData.map((table) => (
          <div
            key={table.tid}
            className="border p-4 rounded-lg shadow-lg bg-white"
          >
            <h3 className="font-bold text-lg">Table ID: {table.tid}</h3>
            <p>Status: {table.status}</p>
            <Button
              variant="primary"
              onClick={() => handleClearTable(table.tid)}
            >
              Delete Table
            </Button>
          </div>
        ))}
      </div>
      <h2>Pending Orders</h2>
      <div>
        {Object.keys(orderData.pending).map((table) => (
          <div key={table} className="mt-4">
            <h3 className="font-bold text-lg">Orders for Table {table}</h3>
            {orderData.pending[table].map((order) => (
              <div
                key={order.oid}
                className="border p-4 rounded-lg shadow-lg bg-white mb-2"
              >
                <p>Dish ID: {order.dishId}</p>
                <p>Quantity: {order.quantity}</p>
                <p>
                  Timestamp:{" "}
                  {new Date(
                    order.timestamp.seconds * 1000
                  ).toLocaleTimeString()}
                </p>
                <Button
                  variant="primary"
                  onClick={() => handleMarkAsDone(order.oid, table)}
                >
                  Mark as Done
                </Button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <h2>Completed Orders</h2>
      <div>
        {Object.keys(orderData.completed).map((table) => (
          <div key={table} className="mt-4">
            <h3 className="font-bold text-lg">
              Completed Orders for Table {table}
            </h3>
            {orderData.completed[table].map((order) => (
              <div
                key={order.oid}
                className="border p-4 rounded-lg shadow-lg bg-white mb-2"
              >
                <p>Dish ID: {order.dishId}</p>
                <p>Quantity: {order.quantity}</p>
                <p>{/* Timestamp is not shown for completed orders */}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
      <Link href={`/orders/${restaurant}/dishes`}>Add Dishes</Link>
    </div>
  );
}
