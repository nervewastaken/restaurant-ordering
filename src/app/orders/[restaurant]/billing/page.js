"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { db } from "@/firebase";
import {
  query,
  collection,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useReactToPrint } from "react-to-print";

const Page = () => {
  const [user, setUser] = useState(null);
  const [table, setTable] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [dishDetails, setDishDetails] = useState({});
  const [userTotals, setUserTotals] = useState({});
  const [overallTotalPrice, setOverallTotalPrice] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [serviceChargeRate, setServiceChargeRate] = useState(0);
  const [showSplit, setShowSplit] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // Use useCallback to memoize the function
  const fetchOrdersAndPrices = useCallback(async () => {
    if (!restaurant || !table || dishes.length > 0) return;

    console.log("Fetching orders and prices:", { restaurant, table });

    try {
      setIsLoading(true);

      // Fetch restaurant info
      const restaurantDoc = await getDoc(doc(db, `restaurants`, restaurant));
      const restaurantData = restaurantDoc.data();
      const newTaxRate = (Number(restaurantData.tax) || 0) / 100;
      const newServiceChargeRate = (Number(restaurantData.svch) || 0) / 100;

      // Fetch orders
      const ordersQuery = query(
        collection(db, `restaurants/${restaurant}/orders`),
        where("table", "==", table)
      );
      const ordersSnapshot = await getDocs(ordersQuery);

      const fetchedDishes = [];
      const dishIds = new Set();
      ordersSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedDishes.push(data);
        dishIds.add(data.dishId);
      });

      // Combine orders
      const combinedOrders = fetchedDishes.reduce((acc, order) => {
        const existingOrder = acc.find((o) => o.dishId === order.dishId);
        if (existingOrder) {
          existingOrder.quantity += order.quantity;
          if (order.timestamp > existingOrder.timestamp) {
            existingOrder.timestamp = order.timestamp;
          }
        } else {
          acc.push({ ...order });
        }
        return acc;
      }, []);

      // Fetch dish details
      const dishesCollection = collection(
        db,
        `restaurants/${restaurant}/dishes`
      );
      const dishesSnapshot = await getDocs(dishesCollection);

      const fetchedDishDetails = {};
      dishesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (dishIds.has(data.dishId)) {
          fetchedDishDetails[data.dishId] = {
            name: data.name,
            price: Number(data.price) || 0,
          };
        }
      });

      // Calculate total prices
      const userMap = {};
      let overallSubtotal = 0;
      combinedOrders.forEach((dish) => {
        const dishDetail = fetchedDishDetails[dish.dishId];
        const price = dishDetail ? dishDetail.price : 0;
        const itemTotal = price * dish.quantity;
        overallSubtotal += itemTotal;
        if (userMap[dish.user]) {
          userMap[dish.user].push({
            ...dish,
            name: dishDetail ? dishDetail.name : "Unknown Dish",
            price,
            totalPrice: itemTotal,
          });
        } else {
          userMap[dish.user] = [
            {
              ...dish,
              name: dishDetail ? dishDetail.name : "Unknown Dish",
              price,
              totalPrice: itemTotal,
            },
          ];
        }
      });

      const overallTaxAmount = overallSubtotal * newTaxRate;
      const overallServiceChargeAmount = overallSubtotal * newServiceChargeRate;
      const newOverallTotalPrice =
        overallSubtotal + overallTaxAmount + overallServiceChargeAmount;

      // Save bill to Firestore
      const billId = generateBillId();
      const billData = {
        billId,
        timestamp: serverTimestamp(),
        orderValueBeforeTax: overallSubtotal,
        orderValueAfterTax: newOverallTotalPrice,
        names: Object.keys(userMap),
        dishes: combinedOrders.map((dish) => ({
          name: fetchedDishDetails[dish.dishId].name,
          quantity: dish.quantity,
          price: fetchedDishDetails[dish.dishId].price,
        })),
      };

      await addDoc(collection(db, `restaurants/${restaurant}/bills`), billData);

      // Set all states at once to avoid multiple re-renders
      setRestaurantName(restaurantData.name || "");
      setTaxRate(newTaxRate);
      setServiceChargeRate(newServiceChargeRate);
      setDishes(combinedOrders);
      setDishDetails(fetchedDishDetails);
      setUserTotals(userMap);
      setOverallTotalPrice(newOverallTotalPrice);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [restaurant, table, dishes.length]);

  useEffect(() => {
    console.log("Effect running:", {
      restaurant,
      table,
      isLoading,
      dishesLength: dishes.length,
    });

    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      const storedTable = localStorage.getItem("table");
      const storedRestaurant = localStorage.getItem("restaurant");

      if (storedUser !== user) setUser(storedUser);
      if (storedTable !== table) setTable(storedTable);
      if (storedRestaurant !== restaurant) setRestaurant(storedRestaurant);
    }

    fetchOrdersAndPrices();
  }, [fetchOrdersAndPrices, user, table, restaurant]);

  const generateBillId = () => {
    return Math.random().toString(36).substring(2, 14);
  };

  console.log(isLoading);

  const renderBillCard = (
    title,
    items,
    subtotal,
    taxAmount,
    serviceChargeAmount,
    total,
    ref = null
  ) => {
    return (
      <div className="flex justify-center items-center">
        <Card style={{ marginBottom: "20px" }} ref={ref} className="w-[500px]">
          <CardContent>
            <Typography variant="h5" align="center">
              {restaurantName}
            </Typography>
            <Typography
              variant="subtitle2"
              align="center"
              style={{ fontFamily: "Courier New", marginBottom: "10px" }}
            >
              Tax Invoice - {title}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Dish Name</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Total Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((dish, index) => (
                    <TableRow
                      key={index}
                      style={{
                        borderBottom: "1px dotted rgba(224, 224, 224, 1)",
                      }}
                    >
                      <TableCell>{dish.name}</TableCell>
                      <TableCell align="right">
                        {dish.price.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">{dish.quantity}</TableCell>
                      <TableCell align="right">
                        {dish.totalPrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography
              variant="body1"
              align="right"
              style={{ marginTop: "20px" }}
            >
              Subtotal: {subtotal.toFixed(2)}
            </Typography>
            <Typography variant="body1" align="right">
              Tax ({(taxRate * 100).toFixed(2)}%): {taxAmount.toFixed(2)}
            </Typography>
            <Typography variant="body1" align="right">
              Service Charge ({(serviceChargeRate * 100).toFixed(2)}%):{" "}
              {serviceChargeAmount.toFixed(2)}
            </Typography>
            <Typography
              variant="h6"
              align="right"
              style={{ marginTop: "10px" }}
            >
              Grand Total: {total.toFixed(2)}
            </Typography>
            <Typography
              variant="body2"
              align="center"
              style={{ marginTop: "20px" }}
            >
              Thank you, visit again!
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderUnifiedBill = () => {
    const allDishes = Object.values(userTotals).flat();
    const subtotal = allDishes.reduce((acc, dish) => acc + dish.totalPrice, 0);
    const taxAmount = subtotal * taxRate;
    const serviceChargeAmount = subtotal * serviceChargeRate;

    return (
      <div className="flex justify-center items-center">
        {renderBillCard(
          "Unified Bill",
          allDishes,
          subtotal,
          taxAmount,
          serviceChargeAmount,
          overallTotalPrice,
          componentRef
        )}
      </div>
    );
  };

  const renderSplitBill = () => {
    return (
      <Grid container spacing={3}>
        {Object.entries(userTotals).map(([user, items], index) => {
          const subtotal = items.reduce(
            (acc, dish) => acc + dish.totalPrice,
            0
          );
          const taxAmount = subtotal * taxRate;
          const serviceChargeAmount = subtotal * serviceChargeRate;
          const total = subtotal + taxAmount + serviceChargeAmount;

          return (
            <Grid item xs={12} md={6} key={index}>
              {renderBillCard(
                `${user}'s Bill`,
                items,
                subtotal,
                taxAmount,
                serviceChargeAmount,
                total
              )}
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderLoading = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh",
      }}
    >
      <CircularProgress />
    </div>
  );

  const renderContent = () => (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowSplit(!showSplit)}
        style={{ marginBottom: "20px" }}
      >
        {showSplit ? "Show Unified Bill" : "Show Split Bill"}
      </Button>
      {showSplit ? renderSplitBill() : renderUnifiedBill()}

      <Button
        variant="contained"
        color="secondary"
        onClick={handlePrint}
        style={{ marginTop: "20px" }}
      >
        Print/Download Bill
      </Button>
    </>
  );

  return (
    <div style={{ padding: "20px" }}>
      {isLoading ? renderLoading() : renderContent()}
    </div>
  );
};

export default Page;
