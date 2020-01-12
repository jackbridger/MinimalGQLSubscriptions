import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from "@apollo/react-hooks"
import { ApolloLink, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';

import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
// import { InMemoryCache } from "@apollo/react-hooks"

// import { OperationDefinitionNode } from 'graphql';

const httpLink = new HttpLink({
    uri: 'http://localhost:4000/'
});


const wsLink = new WebSocketLink({
    uri: 'ws://localhost:4000/',
    options: {
        reconnect: true
    }
});



const terminatingLink = split(
    ({ query: { definitions } }) =>
        definitions.some(node => {
            const { kind, operation } = node;
            return kind === 'OperationDefinition' && operation === 'subscription';
        }),
    wsLink,
    httpLink
);

const link = ApolloLink.from([terminatingLink]);

const defaultApolloOptions = {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  }

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link,
    defaultOptions:defaultApolloOptions
});

ReactDOM.render(<ApolloProvider client={client}>
    <App />
</ApolloProvider>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
