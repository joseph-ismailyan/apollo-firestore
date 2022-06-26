// import { gql, createGraphQLClient } from "@solid-primitives/graphql";
import { createClient } from "@urql/core"
import { gql } from "@solid-primitives/graphql"
import { Component, Show, For, createSignal } from "solid-js";
import { AiOutlineDelete, AiOutlineLoading3Quarters } from 'solid-icons/ai'
import "./index.css";

const App: Component = () => {
    // const new_query = createGraphQLClient("http://localhost:4000/graphql");
    const client = createClient({
        url: 'http://localhost:4000',
        requestPolicy: 'cache-and-network'
    });
    interface Expense {
        expenseId: string;
        carId: string;
        description: string;
        value: number;
    }

    interface Car {
        carId: string;
        make: string;
        model: string;
        expenses: [Expense];
        loading: boolean;
    }

    interface Cars {
        cars: [Car]
    }

    const [carsData, setCarsData] = createSignal([]);


    const getCarsData = () => {
        client.query(
            gql`
                query Cars {
                    cars {
                        carId,
                        make, 
                        model, 
                        expenses {
                            value, 
                            description
                        }
                    }
                }
            `).toPromise().then(({ data }) => {
                    setCarsData(data.cars);
            })
    }

    const deleteCar = (carId: string) => {
        const deleteCarRes = client.mutation(
                gql`
                    mutation Car($carId: ID!) {
                        deleteCar(carId: $carId){
                            code,
                            success,
                            message
                        }
                    }
                `, { carId }
            ).toPromise().then(({ data }) => {
                console.log(data);
                getCarsData();
            });
    }

    getCarsData();
  
return (
    <>
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
        <h4>All Cars</h4>
        <Show when={carsData()} fallback={<h3>Loading...</h3>}>
            <div>
                <For each={carsData()}>
                    {(car: Car)=> (
                        <div class="car-card" style={{"margin-bottom": "10px"}}>
                            Make: {car?.make}<br></br>
                            Model: {car?.model}
                            <For each={car?.expenses} fallback={<span></span>}>
                                {(expense: Expense) => (
                                    <li style={{color: "lightblue"}}>
                                        {expense.description} - ${expense.value}
                                    </li>
                                )}
                            </For>
                            <button onClick={() => {car['loading'] = true; console.log(car); deleteCar(car?.carId)}} class="edit-icon btn-no-styles">
                                { !car?.loading && <AiOutlineDelete size={20} color="#FFF"/> }
                                { car?.loading && <AiOutlineLoading3Quarters size={20} color="#FFF"/> }
                            </button>
                        </div>
                    )}
                </For>
            </div>
        </Show>
    </div>
    </>
  );
};

export default App;