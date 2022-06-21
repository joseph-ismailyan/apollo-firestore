import { gql, createGraphQLClient } from "@solid-primitives/graphql";
import { Component, createSignal, Show, For } from "solid-js";
import "./index.css";

const App: Component = () => {
    const [code, setCode] = createSignal("AM");

    const query = createGraphQLClient("https://countries.trevorblades.com/");
    const [countriesData] = query<{ countries: { name: string; code: string }[] }>(
        gql`
            query {
                countries {
                    name
                    code
                }
            }
        `
    );
    const [countryData] = query<{ country: { name: string } }>(
        gql`
            query data($code: ID!) {
                country(code: $code) {
                    name
                }
            }
        `,
        () => ({
            code: code()
        })
    );

    const new_query = createGraphQLClient("http://localhost:4000/graphql");
    const [expensesData] = new_query<{ expenses: { expenseId: string, description: string, value: number, }[] }>(
        gql`
            query Expense {
                expenses {
                    expenseId,
                    value,
                    description
                }
            }
        `
    );
  
return (
    <>
    <Show when={expensesData()}>
        <ul>
            <For each={expensesData()?.expenses}>
                {expense => (
                    <li>{expense.expenseId} - {expense.value}</li>
                )}
            </For>
        </ul>
    </Show>

    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
        <h4>All Expenses</h4>
        <Show when={expensesData()}>
            <ul>
                <For each={expensesData()?.expenses}>
                    {expense => (
                        <li>
                            {expense.expenseId} - {expense.description} - ${expense.value}
                        </li>
                    )}
                </For>
            </ul>
        </Show>


        <h3>Get country by code</h3>
        <input value={code()} oninput={e => setCode(e.currentTarget.value.toUpperCase())}></input>        
        <Show when={countryData()}>
            {({ country }) => <h4>{country ? country.name : "not found"}</h4>}
        </Show>
        <h3>Countries:</h3>
        <Show when={countriesData()}>
            <ul>
                <For each={countriesData()?.countries}>
                    {country => (
                        <li>
                        {country.code} - {country.name}
                        </li>
                    )}
                </For>
            </ul>
        </Show>
    </div>
    </>
  );
};

export default App;