import BootstrapClient from "./BootstrapClient";
import Navbar from "./Navbar";

export default function Shell({ children }) {
  return (
    <>
      <BootstrapClient />
      <Navbar />
      {children}
    </>
  );
}
