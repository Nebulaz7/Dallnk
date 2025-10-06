import React from "react";
import ProfilePage from "./Profile";
import Navbar from "../home/components/Nav";
import "@fontsource/orbitron/700.css";
import Footer from "../components/Footer";

const page = () => {
  return (
    <div>
      <Navbar />
      <ProfilePage />
      <Footer />
    </div>
  );
};

export default page;
