import { ApolloClient, InMemoryCache } from '@apollo/client';

export const graphqlEndpoint =
  process.env.NODE_ENV === 'production'
    ? 'https://big-button-api.herokuapp.com/graphql'
    : 'http://localhost:5000/api';

export const apolloClient = new ApolloClient({
  uri: __DEV__ ? 'http://localhost:4000/graphql' : graphqlEndpoint,
  cache: new InMemoryCache()
});
