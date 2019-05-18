require('dotenv').config();

const { ApolloServer, AuthenticationError, gql } = require('apollo-server');
const uuid = require('uuid/v4');

const { getToken, getUserIdFromToken, getUser } = require('./auth');

const typeDefs = gql`
  type Quote {
    id: ID!
    phrase: String!
    quotee: String
  }

  type Query {
    quotes: [Quote]
  }

  type Mutation {
    login(username: String!, password: String!): Authentication
    addQuote(phrase: String!, quotee: String): Quote
    editQuote(id: ID!, phrase: String, quotee: String): Quote
    deleteQuote(id: ID!): DeleteResponse
  }

  type Authentication {
    token: String!
  }

  type DeleteResponse {
    ok: Boolean!
  }
`;

const quotes = {};
const addQuote = quote => {
  const id = uuid();
  return quotes[id] = { ...quote, id };
};

addQuote({ phrase: "I'm a leaf on the wind. Watch how I soar.", quotee: "Wash" });
addQuote({ phrase: "We're all stories in the end.", quotee: "The Doctor" });
addQuote({ phrase: "Woah!", quotee: "Neo" });

const resolvers = {
  Query: {
    quotes: () => Object.values(quotes),
  },
  Mutation: {
    login: async (parent, { username, password }) => ({
      token: await getToken({ username, password }),
    }),
    addQuote: async (parent, quote, context) => {
      if (!context.user) throw new AuthenticationError("You must be logged in to perform this action");

      return addQuote(quote);
    },
    editQuote: async (parent, { id, ...quote }, context) => {
      if (!context.user) throw new AuthenticationError("You must be logged in to perform this action");

      if (!quotes[id]) {
        throw new Error("Quote doesn't exist");
      }

      quotes[id] = {
        ...quotes[id],
        ...quote,
      };

      return quotes[id];
    },
    deleteQuote: async (parent, { id }, context) => {
      if (!context.user) throw new AuthenticationError("You must be logged in to perform this action");

      const ok = Boolean(quotes[id]);
      delete quotes[id];

      return { ok };
    },
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
