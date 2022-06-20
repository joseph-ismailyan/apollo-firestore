import { ApolloServer, ApolloError, ValidationError, gql } from 'apollo-server';
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const serviceAccount = require('../service-account.json');

initializeApp({ credential: cert(serviceAccount) });
const firestore = getFirestore();
  
interface User {
	id: string;
	name: string;
	screenName: string;
	statusesCount: number;
}
  
interface Tweet {
	id: string;
	likes: number;
	text: string;
	userId: string;
}
  
const typeDefs = gql`
	type Query {
		users: [User]
		tweets: [Tweet]
		user(id: String!): User
		addUser(name: String!, userName: String!): String
		addTweet(userId: String!, text: String!): String
	}

	type User {
		id: ID!
		name: String!
		userName: String!
		statusesCount: Int!
		tweets: [Tweet]!
	}
	
	type Tweet {
		id: ID!
		text: String!
		userId: String!
		user: User!
		likes: Int
	}
`;
  
  const resolvers = {
	Query: {
		async addUser(_: null, { name, userName }: { name: string, userName: string }) {
			const id = await firestore
				.collection('users')
				.doc()
				.id;
			const created = FieldValue.serverTimestamp();

			const add = await firestore
				.collection('users')
				.doc(id)
				.set({
					id,
					name,
					userName,
					created
				});

			return id as String;
		},
		async addTweet(_: null, { userId, text }: { userId: string, text: string }) {
			const id = await firestore
				.collection('tweets')
				.doc()
				.id;
			const created = FieldValue.serverTimestamp();

			const add = await firestore
				.collection('tweets')
				.doc(id)
				.set({
					id,
					text,
					userId,
					created
				});

			return id as String;
		},
		async users() {
			const users = await firestore
				.collection('users')
				.get();
			return users.docs.map((user: any) => user.data()) as User[];
		},	
		async tweets() {
			const tweets = await firestore
				.collection('tweets')
				.get();

			return tweets.docs.map((tweet: any) => tweet.data()) as Tweet[];
	  },
		async user(_: null, { id }: { id: string }) {
			try {
				const userDoc = await firestore
					.doc(`users/${id}`)
					.get();
				const user = userDoc.data() as User | undefined;
				return user || new ValidationError('User ID not found');
			} 
			catch (error) {
				throw new ApolloError(error as string);
			}
		}
	},
	User: {
		async tweets(user: User) {
			try {
				const userTweets = await firestore
					.collection('tweets')
					.where('userId', '==', user.id)
					.get();
				return userTweets.docs.map((tweet: any) => tweet.data()) as Tweet[];
			}
			catch (error) {
				throw new ApolloError(error as string);
			}
		}
	},
	Tweet: {
		async user(tweet: Tweet) {
			try {
				const tweetAuthor = await firestore
					.doc(`users/${tweet.userId}`)
					.get();
				return tweetAuthor.data() as User;
			} 
			catch (error) {
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