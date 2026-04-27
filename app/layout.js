import { Outfit } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import Shell from "./components/Shell";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Smart Wardrobe OOTD",
  description: "Created for CSC350 Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}