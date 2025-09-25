import React from "react";
import Nav from "./components/Nav";
import "@fontsource/orbitron/700.css";
import Banner from "./components/Banner";

const home = () => {
  return (
    <div>
      <Nav />
      <Banner />
      <div>{/* crete a an svg animation for the bannner */}</div>
    </div>
  );
};

export default home;
