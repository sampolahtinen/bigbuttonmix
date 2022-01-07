import { apiUrl } from '../../src/api/index';
import { ApolloClient, InMemoryCache } from '@apollo/client';

export const apolloClient = new ApolloClient({
  uri: __DEV__ ? 'http://localhost:4000/graphql' : apiUrl,
  cache: new InMemoryCache()
});
