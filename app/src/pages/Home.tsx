// libraries
import { Component, Show, For, createResource, createSignal, createEffect } from "solid-js";
import { createClient } from "@urql/core";
import { gql } from "@solid-primitives/graphql";

// external components
import Button from "@suid/material/Button";
import CircularProgress from "@suid/material/CircularProgress";
import Alert from "@suid/material/Alert";

// internal components
import { CarCard, AddCar } from "../components.jsx";
import { Car } from "../interfaces.js";

// css 
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
                mutation Car ($carId: ID!) {
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
            setSuccessAlert({show: true, message: 'Successfully deleted vehicle!'});
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
            setSuccessAlert({show: true, message: 'Successfully added vehicle!'});
            return res;
        })
        .catch((error: object) => {return error});

        return {'error': 'Could not create car.'};
    }

    const [cars, { mutate, refetch }] = createResource(getCarsData);
    const [showAddCar, setShowAddCar] = createSignal(false);

    const [successAlert, setSuccessAlert] = createSignal({show: false, message: ''});

    createEffect(() => {
        if(successAlert().show) {
            setTimeout(() => {
                setSuccessAlert({show: false, message: ''});
            }, 3000)
        }
    });

    return(
        <>
            <main class="box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 text-white">
                <h4>All Vehicles</h4>
                <Button onClick={() => setShowAddCar(!showAddCar())}> { showAddCar() ? 'Hide' : 'Show' } </Button>

                <Show when={showAddCar()}>
                    <AddCar createCar={createCar}></AddCar>
                </Show>

                <Show when={cars()}>
                    <section>
                        <For each={cars().data.cars as Car[]}>
                            {(car: Car)=> (
                                <CarCard car={car} deleteCar={deleteCar} showDetailsLink={true}></CarCard>
                            )}
                        </For>
                    </section>
                </Show>

                <Show when={cars.loading}>
                    <CircularProgress size={20}></CircularProgress>
                </Show>
            </main>
            <Show when={successAlert().show}>
                <div style="position: absolute; bottom: 0; left: 0;">
                    <Alert severity="success" variant="filled">{successAlert().message}</Alert>
                </div>
            </Show>
        </>
    )
}

export default Home;