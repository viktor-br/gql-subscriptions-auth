const { InMemoryCache } = require('apollo-cache-inmemory');
const { ApolloClient } = require('apollo-client');
const gql = require('graphql-tag');
const { WebSocketLink } = require('apollo-link-ws');
const ws = require('ws');

const [chatId = 1] = process.argv.slice(2, 3).map(parseInt);

const link = new WebSocketLink({
  uri: 'ws://localhost:4000/ws/',
  options: {
    reconnect: true,
  },
  webSocketImpl: ws,
});

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

const MESSAGE_SUBSCRIPTION = gql`
  subscription readMessageFromChat($chatId: Int!) {
    readMessageFromChat(chatId: $chatId) {
      id
      content
    }
  }
`;

const subscribe = (chatId) => {
  console.log(
    new Date().toLocaleTimeString('de-DE'),
    `subscription:readMessageFromChat chatId=${chatId} is running`,
  );
  client
    .subscribe({
      query: MESSAGE_SUBSCRIPTION,
      variables: {
        chatId,
      },
    })
    .subscribe({
      next: (data) =>
        console.log(
          new Date().toLocaleTimeString('de-DE'),
          `subscription:readMessageFromChat chatId=${chatId}`,
          data,
        ),
      error: (err) => console.error(`error subscription ${chatId}`, err),
    });
};

subscribe(chatId);
