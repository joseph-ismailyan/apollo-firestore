import { Component, Show, For, createResource, createSignal } from "solid-js";
// import { createClient } from "@urql/core"
// import { gql } from "@solid-primitives/graphql"
// import Button from "@suid/material/Button";
// import CircularProgress from "@suid/material/CircularProgress";
// import { CarCard, AddCar } from "../components.jsx";
// import { Car } from "../interfaces.js";
import { useParams } from "solid-app-router"
import "../index.css";

const VehicleDetails: Component = () => {
    
    return (
        <>
        <main>
            <h1>{useParams().id}</h1>
        </main>
        </>
    );
};

export default VehicleDetails;