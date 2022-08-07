// libraries
import { Component, Show, createEffect, createSignal, onMount } from "solid-js";
import { createClient } from "@urql/core"
import { gql } from "@solid-primitives/graphql"

// external components
// import Button from "@suid/material/Button";
import CircularProgress from "@suid/material/CircularProgress";
import Alert from "@suid/material/Alert";

// internal components
import { CarCard, AddExpense } from "../components.jsx";
import { useParams } from "solid-app-router"

// css
import "../index.css";


const VehicleDetails: Component = () => {
    const vehicleId = useParams().id;
    const [vehicle, setVehicle] = createSignal({});
    const [loading, setLoading] = createSignal(true);

    const [successAlert, setSuccessAlert] = createSignal({show: false, message: ''});

    const client = createClient({
        url: 'http://localhost:4000',
        requestPolicy: 'cache-and-network'
    });

    const createExpense = async (description: string, value: number) => {
        await client.mutation(
            gql`
                mutation Expense($carId: ID!, $description: String!, $value: Float!) {
                    createExpense(carId: $carId, value: $value, description: $description){
                        code,
                        success,
                        message
                    }
                }
            `, { carId: vehicleId, description, value }
        ).toPromise()
        .then((res: object) => {
            getVehicle(vehicleId);
            setSuccessAlert({show: true, message: 'Successfully added expense!'});
            return res;
        })
        .catch((error: object) => {return error});
    
        return {'error': 'Could not create expense.'};
    }

    const getVehicle = (vehicleId: string): void | object => {
        client.query(
            gql`
                query Car ($carId: ID!) {
                    car(carId: $carId){
                        carId,
                        year,
                        make, 
                        model,
                        totalExpenses,
                        expenses {
                            value, 
                            description
                        }
                    }
                }
            `, { carId: vehicleId }
        ).toPromise()
        .then(({ data }) => {
            console.log(data);
            setVehicle(data.car);
            setLoading(false);
            return;
        })
        .catch((error: object) => {return error});
    }

    createEffect(() => {
        if(successAlert().show) {
            setTimeout(() => {
                setSuccessAlert({show: false, message: ''});
            }, 3000)
        }
    });

    onMount(() => getVehicle(vehicleId))
        
    return (
        <>
        <main class="flex-col items-center justify-center">
            <AddExpense createExpense={createExpense} vehicleId={vehicleId}></AddExpense>

            <Show when={vehicle()}>
                <CarCard car={vehicle()} showExpenses={true} showDetailsLink={false}></CarCard>
            </Show>

            <Show when={loading()}>
                <CircularProgress size={20}></CircularProgress>
            </Show>

            <Show when={successAlert().show}>
                <div style="position: absolute; bottom: 0; left: 0;">
                    <Alert severity="success" variant="filled">{successAlert().message}</Alert>
                </div>
            </Show>

            <h1>Vehicle ID: {vehicleId}</h1>            
        </main>
        </>
    );
};

export default VehicleDetails;