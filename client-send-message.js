const fetch = require('node-fetch');
const { createHttpLink } = require('apollo-link-http');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { ApolloClient } = require('apollo-client');
const gql = require('graphql-tag');

const [chatId = 1] = process.argv.slice(2, 3).map(parseInt);

const WRITE_MESSAGE_TO_CHAT = gql`
  mutation WriteMessageToChat($chatId: Int!) {
    writeMessageToChat(chatId: $chatId, content: "123456789") {
      id
      chatId
      content
    }
  }
`;
const link = createHttpLink({
  uri: 'http://localhost:4000/',
  fetch: fetch,
});
const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

client
  .mutate({
    mutation: WRITE_MESSAGE_TO_CHAT,
    variables: {
      chatId,
    },
  })
  .then((result) => {
    console.log(
      new Date().toLocaleTimeString('de-DE'),
      'mutation:writeMessageToChat is completed',
      result,
    );
    client.stop();
  })
  .catch((err) => {
    console.log(err);
    client.stop();
  });
