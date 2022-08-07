import { Show, For, createSignal } from "solid-js";
import { Link } from "solid-app-router"
import Button from "@suid/material/Button";
import TextField from "@suid/material/TextField";
import CircularProgress from "@suid/material/CircularProgress";
import IconButton from "@suid/material/IconButton";
import DeleteIcon from '@suid/icons-material/Delete';
import AddIcon from '@suid/icons-material/Add';
import AddCircleOutlineIcon from '@suid/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@suid/icons-material/RemoveCircleOutline';
import Divider from "@suid/material/Divider"
import { Expense } from './interfaces.js';
import "./index.css";

const CarCard = (props: any) => {
    const [loading, setLoading] = createSignal(false);
    const [showExpenses, setShowExpenses] = createSignal(props.showExpenses);

    return(
        <div class="car-card" style={{"margin-bottom": "10px"}}>
            <span> {props.car.year} {props.car.make} {props.car.model}</span>

            <Show when={props.car.totalExpenses}>
                <span>Expenses: ${props.car.totalExpenses}</span>
                <div class="flex align-v" onClick={() => {setShowExpenses(!showExpenses())}} style="cursor: pointer; margin-top: 16px; margin-bottom: 4px; font-size: 10pt; color: var(--primary-text-color); justify-content: space-between">
                    <span>
                        <Show when={props.showDetailsLink === true}>
                            <Link href={`/vehicle/${props.car.carId}`}>
                                View Details
                            </Link>
                        </Show>
                    </span>
                    <span class="flex align-v">
                        { 
                            !showExpenses() ? 
                            <><AddCircleOutlineIcon sx={{fontSize: 14}}></AddCircleOutlineIcon>&nbsp;View Expenses</>: 
                            <><RemoveCircleOutlineIcon sx={{fontSize: 14}}></RemoveCircleOutlineIcon>&nbsp;Hide Expenses</> 
                        }
                    </span>
                </div>
            </Show>

            <Show when={showExpenses()}>
                    <For each={props.car?.expenses} fallback={<span></span>}>
                        {(expense: Expense) => (
                            <>
                                <div class="expense-row">
                                    <div class="expense-item expense-item-left">{expense.description}</div>
                                    <div class="expense-item expense-item-right">${expense.value}</div>
                                </div>
                                <Divider></Divider>
                            </>
                        )}
                    </For>
            </Show>
            <Show when={props.deleteCar}>
                <div class="edit-icon">
                    <IconButton onClick={() => {setLoading(!loading()); props.deleteCar(props.car.carId);}}>
                        { 
                            loading() ?
                            <CircularProgress size={20}></CircularProgress> :
                            <DeleteIcon sx={{ fontSize: 20 }}></DeleteIcon>
                        }
                    </IconButton>
                </div>
            </Show>
        </div>
    );
}

const AddExpense = (props: any) => {
    const [loading, setLoading] = createSignal(false);
    const [value, setValue] = createSignal(0);
    const [description, setDescription] = createSignal('');

    const handleClick = () => {
        setLoading(true);
        const success = props.createExpense(description(), value());
        if(success?.error) console.log(success);
        setLoading(false);
        setValue(0);
        setDescription('');
    }

    return (
        <div class="car-card" style="margin-bottom: 10px;">
            <TextField
                required
                type="number"
                label="Value"
                variant="standard"
                value={value()}
                onChange={(event) => setValue(parseFloat(event.target.value))}
            ></TextField>
            <TextField
                required
                type="text"
                label="Description"
                variant="standard"
                value={description()}
                onChange={(event) => setDescription(event.target.value)}
            ></TextField>
            
            <section style="margin-top: 10px;">
                <Button style="width: 100%;" variant="outlined" disabled={!(value() && description())} onClick={() => handleClick()}>
                    { 
                        loading() ?
                        <CircularProgress size={20}></CircularProgress> :
                        <><AddIcon sx={{ fontSize: 20 }}></AddIcon>Add Expense</>
                    }
                </Button>
            </section>
        </div>
    );


}

const AddCar = (props: any) => {
    const [loading, setLoading] = createSignal(false);
    const [year, setYear] = createSignal('');
    const [make, setMake] = createSignal('');
    const [model, setModel] = createSignal('');

    const handleClick = () => {
        setLoading(true);
        const success = props.createCar(year(), make(), model());
        if(success?.error) console.log(success);
        setLoading(false);
        setYear('');
        setMake('');
        setModel('');
    }

    return (
        <div class="car-card" style="margin-bottom: 10px;">
            <TextField
                required
                label="Year"
                variant="standard"
                value={year()}
                onChange={(event) => setYear((event.target.value))}
            ></TextField>
            <TextField
                required
                type="text"
                label="Make"
                variant="standard"
                value={make()}
                onChange={(event) => setMake(event.target.value)}
            ></TextField>
            <TextField
                required
                type="text"
                label="Model"
                variant="standard"
                value={model()}
                onChange={(event) => setModel(event.target.value)}
            ></TextField>
            
            <section style="margin-top: 10px;">
                <Button style="width: 100%;" variant="outlined" disabled={!(make() && model())} onClick={() => handleClick()}>
                    { 
                        loading() ?
                        <CircularProgress size={20}></CircularProgress> :
                        <><AddIcon sx={{ fontSize: 20 }}></AddIcon>Add Car</>
                    }
                </Button>
            </section>
        </div>
    );
}

export { CarCard, AddCar, AddExpense };