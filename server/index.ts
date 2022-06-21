import { ApolloServer, ApolloError, ValidationError, gql } from 'apollo-server';
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const serviceAccount = require('../service-account.json');

initializeApp({ credential: cert(serviceAccount) });
const firestore = getFirestore();
  
interface Car {
	carId: string;
	model: string;
}
  
interface Expense {
	expenseId: string;
	carId: string;
	description: string;
	value: number;
}
  
const typeDefs = gql`
	interface MutationResponse {
		code: String!
		success: Boolean!
		message: String!
	}

	type CarMutationResponse implements MutationResponse {
		code: String!
		success: Boolean!
		message: String!
		car: Car
	}

	type ExpenseMutationResponse implements MutationResponse {
		code: String!
		success: Boolean!
		message: String!
		expense: Expense
	}

	type Query {
		car(carId: String!): Car
		cars: [Car]

		expense(expenseId: String!): Expense
		expenses: [Expense]

		totalExpenses(carId: String!): Float
	}

	type Mutation {
		createCar(model: String!): CarMutationResponse
		createExpense(carId: String!, value: Float!, description: String!): ExpenseMutationResponse
	}

	type Car {
		carId: ID!
		model: String!
		created: String!

		expenses: [Expense]!
		totalExpenses: Float!
	}
	
	type Expense {
		expenseId: ID!
		carId: ID!
		value: Float!
		description: String!

		car: Car!
		created: String!
	}
`;
  
  const resolvers = {
	Query: {
		async cars() {
			const cars = await firestore
				.collection('cars')
				.get();
			return cars.docs.map((car: any) => car.data()) as Car[];
		},	
		async expenses() {
			const expenses = await firestore
				.collection('expenses')
				.get();

			return expenses.docs.map((expense: any) => expense.data()) as Expense[];
		},
		async car(_: null, { carId }: { carId: string }) {
			try {
				const carDoc = await firestore
					.doc(`cars/${carId}`)
					.get();
				const car = carDoc.data() as Car | undefined;
				return car || new ValidationError('Car ID not found');
			} 
			catch(error) {
				throw new ApolloError(error as string);
			}
		},
		async expense(_: null, { expenseId }: { expenseId: string }) {
			try {
				const expenseDoc = await firestore
					.doc(`expenses/${expenseId}`)
					.get();
				const expense = expenseDoc.data() as Expense | undefined;
				return expense || new ValidationError('Expense ID not found');
			} 
			catch(error) {
				throw new ApolloError(error as string);
			}
		},
		async totalExpenses(_: null, { carId }: { carId: string }) {
			try {
				const carExpenses = await firestore
					.collection('expenses')
					.where('carId', '==', carId)
					.get();

				return carExpenses.docs.reduce((total: number, expense: any) => {
						return total + expense?.data().value
				}, 0) as number;
			}
			catch(error) {
				throw new ApolloError(error as string);
			}
		}
	},
	Mutation: {
		async createCar(_: null, { model }: { model: string }) {
			const carId = await firestore
				.collection('cars')
				.doc()
				.id;
			const created = FieldValue.serverTimestamp();

			const addToCars = await firestore
				.collection('cars')
				.doc(carId)
				.set({
					carId,
					model,
					created
				});
			
			const carDoc = await firestore
				.doc(`cars/${carId}`)
				.get();

			const car = carDoc.data() as Car;

			const code = 200;
			const success = true;
			const message = carId;

			return {code, success, message, car};
		},
		async createExpense(_: null, { carId, value }: { carId: string, value: number }) {
			const expenseId = await firestore
				.collection('expenses')
				.doc()
				.id;
				
			const created = FieldValue.serverTimestamp();

			const addToExpenses = await firestore
				.collection('expenses')
				.doc(expenseId)
				.set({
					expenseId,
					carId,
					value,
					created
				});
			const carRef = await firestore
				.collection('cars')
				.doc(carId)
		
			const addExpenseToCar = carRef
				.update({expenseIds: FieldValue.arrayUnion(expenseId)})

			const expenseDoc = await firestore
				.doc(`expenses/${expenseId}`)
				.get();

			const expense = expenseDoc.data() as Expense;
			const code = 200;
			const success = true;
			const message = expenseId;

			return {code, success, message, expense};	
		}
	

	},
	Car: {
		async expenses(car: Car) {
			try {
				const carExpenses = await firestore
					.collection('expenses')
					.where('carId', '==', car.carId)
					.get();
				return carExpenses.docs.map((expense: any) => expense.data()) as Expense[];
			}
			catch(error) {
				throw new ApolloError(error as string);
			}
		},
		async totalExpenses(car: Car) {
			try {
				const carExpenses = await firestore
					.collection('expenses')
					.where('carId', '==', car.carId)
					.get();

				return carExpenses.docs.reduce((total: number, expense: any) => {
						return total + expense?.data().value
				}, 0) as number;
			}
			catch(error) {
				throw new ApolloError(error as string);
			}
		}
	},
	Expense: {
		async car(expense: Expense) {
			try {
				const car = await firestore
					.doc(`cars/${expense.carId}`)
					.get();
				return car.data() as Car;
			} 
			catch(error) {
				throw new ApolloError(error as string);
			}
	  }
	}
  };
  
const server = new ApolloServer({
	typeDefs,
	resolvers,
	introspection: true
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
	console.log(`🚀  Server ready at ${url}`);
});