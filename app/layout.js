import "bootstrap/dist/css/bootstrap.min.css";
import Shell from "./components/Shell";
import "./globals.css";

export const metadata = {
  title: "Smart Wardrobe OOTD",
  description: "Created for CSC350 Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}