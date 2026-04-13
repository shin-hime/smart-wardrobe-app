import "bootstrap/dist/css/bootstrap.min.css"; 
import "./globals.css";

export const metadata = {
  title: "Smart Wardrobe OOTD",
  description: "Created for CSC350 Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-light"> 
        {/* bg-light is a Bootstrap class to give a nice soft grey background */}
        {children}
      </body>
    </html>
  );
}