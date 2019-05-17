const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Quote {
    phrase: String!
    quotee: String
  }

  type Query {
    quotes: [Quote]
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
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`); // eslint-disable-line no-console
});
