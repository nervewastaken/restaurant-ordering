"use client";
import React, { useState, useEffect } from "react";
import {
  query,
  where,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [table1, setTable1] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [orderData, setOrderData] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUser(localStorage.getItem("user"));
      setTable1(localStorage.getItem("table"));
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

  const handleClearTable = async (tableId) => {
    try {
      const tablesRef = collection(db, `restaurants/${restaurant}/tables`);
      const tablesQuery = query(tablesRef, where("tid", "==", tableId));
      const tablesSnapshot = await getDocs(tablesQuery);

      if (!tablesSnapshot.empty) {
        const deletePromises = tablesSnapshot.docs.map(async (doc) => {
          await deleteDoc(doc.ref);
          console.log(`Table ${tableId} deleted successfully.`);
        });

        await Promise.all(deletePromises);
        setTableData((prev) => prev.filter((table) => table.tid !== tableId));
      } else {
        console.log(`No table found with ID ${tableId}.`);
      }
    } catch (error) {
      console.error("Error deleting table:", error);
    }
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
      <h2>Orders for Table {table1}</h2>
      <div>
        {orderData.map((order) => (
          <div
            key={order.oid}
            className="border p-4 rounded-lg shadow-lg bg-white"
          >
            <h3 className="font-bold text-lg">Order ID: {order.oid}</h3>
          </div>
        ))}
      </div>

      <Link href={`/orders/${restaurant}/dishes`}>add dishes</Link>

    </div>
  );
}
