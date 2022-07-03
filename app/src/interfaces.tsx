interface Expense {
    expenseId: string;
    carId: string;
    description: string;
    value: number;
}

interface Car {
    carId: string;
    year: string,
    make: string;
    model: string;
    totalExpenses: number;
    expenses: [Expense];
}

export { Expense, Car};