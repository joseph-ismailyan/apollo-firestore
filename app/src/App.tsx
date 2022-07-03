// import { gql, createGraphQLClient } from "@solid-primitives/graphql";
import { createClient } from "@urql/core"
import { gql } from "@solid-primitives/graphql"
import { Component, Show, For, createSignal, onMount } from "solid-js";
import { CarCard, AddCar } from "./components.jsx";
import { Car } from './interfaces.js';
import "./index.css";

const App: Component = () => {
    const client = createClient({
        url: 'http://localhost:4000',
        requestPolicy: 'cache-and-network'
    });

    const [carsData, setCarsData] = createSignal<Car[]>([]);

    const getCarsData = (): void => {
        client.query(
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
        .then(({ data }) => {
            setCarsData(data.cars);
        });
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
            getCarsData();
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
            getCarsData();
            return res;
        })
        .catch((error: object) => {return error});

        return {'error': 'Could not create car.'};
    }

    onMount(() => {
        getCarsData();
    });
  
return (
    <>
    <main class="box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 text-white">
        <h4>All Cars</h4>
        <AddCar createCar={createCar}></AddCar>
        <Show when={carsData()} fallback={<div>Loading...</div>}>
            <section>
                <For each={carsData() as Car[]}>
                    {(car: Car)=> (
                        <CarCard car={car} deleteCar={deleteCar}></CarCard>
                    )}
                </For>
            </section>
        </Show>
    </main>
    </>
  );
};

export default App;