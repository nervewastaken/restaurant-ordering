import { Inter } from "next/font/google";
import AuthContextProvider from "./authcontext/authcontext";
import "./globals.css";
require("dotenv").config();

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Order with Friends",
  // description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContextProvider>{children}</AuthContextProvider>
      </body>
    </html>
  );
}
