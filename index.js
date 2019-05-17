require('dotenv').config();

const { ApolloServer, gql } = require('apollo-server');
const { getToken, getUserIdFromToken, getUser } = require('./auth');

const typeDefs = gql`
  type Quote {
    phrase: String!
    quotee: String
  }

  type Query {
    quotes: [Quote]
  }

  type Mutation {
    login(username: String!, password: String!): Authentication!
  }

  type Authentication {
    token: String!
  }
`;

const quotes = [
  {
    phrase: "I'm a leaf on the wind. Watch how I soar.",
    quotee: "Wash",
  },
  {
    phrase: "We're all stories in the end. Just make it a good one, eh?",
    quotee: "The Doctor",
  },
  {
    phrase: "Woah",
    quotee: "Neo",
  },
];

const resolvers = {
  Query: {
    quotes: () => quotes,
  },
  Mutation: {
    login: async (parent, { username, password }) => ({
      token: await getToken({ username, password }),
    }),
  },
};

const context = async ({ req }) => {
  const [, token] = (req.headers.authorization || '').split("Bearer ");

  return {
    user: await getUser(await getUserIdFromToken(token)),
  };
};

const server = new ApolloServer({ typeDefs, resolvers, context });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`); // eslint-disable-line no-console
});
