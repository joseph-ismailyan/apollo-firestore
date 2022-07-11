import { Component, Show, For, createResource, createSignal } from "solid-js";

import { createClient } from "@urql/core"
import { gql } from "@solid-primitives/graphql"
import Button from "@suid/material/Button";
import CircularProgress from "@suid/material/CircularProgress";
import { CarCard, AddCar } from "../components.jsx";
import { Car } from "../interfaces.js";

import "../index.css";

const Home: Component = () => {

    const client = createClient({
        url: 'http://localhost:4000',
        requestPolicy: 'cache-and-network'
    });

    const getCarsData = (): Promise<any> => {
        return client.query(
            gql`
                query Cars {
                    cars {
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
            `
        ).toPromise()
    }

    const deleteCar = async (carId: string) => {
        await client.mutation(
            gql`
                mutation Car($carId: ID!) {
                    deleteCar(carId: $carId){
                        code,
                        success,
                        message
                    }
                }
            `, { carId }
        ).toPromise()
        .then((res: object) => {
            refetch();
            return res;
        })
        .catch((error: object) => {return error});

        return {'error': 'Could not delete car.'};
    }

    const createCar = async (year: string, make: string, model: string) => {
        await client.mutation(
            gql`
                mutation Car($year: String!, $make: String!, $model: String!) {
                    createCar(year: $year, make: $make, model: $model){
                        code,
                        success,
                        message
                    }
                }
            `, { year, make, model }
        ).toPromise()
        .then((res: object) => {
            refetch();
            return res;
        })
        .catch((error: object) => {return error});

        return {'error': 'Could not create car.'};
    }

    const [cars, { mutate, refetch }] = createResource(getCarsData);
    const [showAddCar, setShowAddCar] = createSignal(false);


    return(
        <main class="box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 text-white">
        <h4>All Cars</h4>
        <Button onClick={() => setShowAddCar(!showAddCar())}> { showAddCar() ? 'Hide' : 'Show' } </Button>

        <Show when={showAddCar()}>
            <AddCar createCar={createCar}></AddCar>
        </Show>

        <Show when={cars()}>
            <section>
                <For each={cars().data.cars as Car[]}>
                    {(car: Car)=> (
                        <CarCard car={car} deleteCar={deleteCar}></CarCard>
                    )}
                </For>
            </section>
        </Show>

        <Show when={cars.loading}>
            <CircularProgress size={20}></CircularProgress>
        </Show>
    </main>
    )
}

export default Home;