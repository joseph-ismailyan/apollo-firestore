import { Component } from "solid-js";
import { Routes, Route, Link, useParams } from "solid-app-router"
import Home from "./pages/Home.jsx"
import VehicleDetails from "./pages/VehicleDetails.jsx"
import "./index.css";

const App: Component = () => {
    return (
        <>
        <nav id="navbar">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
        </nav>

        <Routes>
            <Route path="/" component={Home}></Route>
            <Route path="/vehicle/:id" component={VehicleDetails}></Route>
            <Route path="/about" element={<main><h1 class="flex flex-row" style="justify-content: center;">this is the about page</h1></main>}></Route>
        </Routes>
        </>
    );
};

export default App;