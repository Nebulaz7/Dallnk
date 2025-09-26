import React from "react";
import Nav from "./components/Nav";
import Listings from "./components/Listings";
import Footer from "../components/Footer";
import "@fontsource/orbitron/700.css";
import Banner from "./components/Banner";

const home = () => {
  return (
    <div>
      <Nav />
      <Banner />
      {/* Search and Filter Section */}
      <Listings />
      <Footer />
    </div>
  );
};

export default home;
