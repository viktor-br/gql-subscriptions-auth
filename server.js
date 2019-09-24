const { ApolloServer, gql, PubSub, withFilter } = require('apollo-server');

const typeDefs = gql`
  type Message {
    id: Int!
    chatId: Int!
    content: String!
  }

  type Query {
    readMessageById(id: Int!): Message!
  }

  type Mutation {
    writeMessageToChat(chatId: Int!, content: String!): Message
  }

  type Subscription {
    readMessageFromChat(chatId: Int!): Message!
  }
`;

const resolvers = {
  Mutation: {
    writeMessageToChat: (root, args, context) => {
      const { chatId, content } = args;
      const { pubsub } = context;

      const message = { id: 12345, chatId, content };
      console.log(
        new Date().toLocaleTimeString('de-DE'),
        'mutation:writeMessageToChat:resolve()',
      );
      pubsub.publish('message', { message });

      return message;
    },
  },
  Query: {
    readMessageById: (root, args, context) => ({
      id: 12345,
      chatId: 1,
      content: 'message content',
    }),
  },
  Subscription: {
    readMessageFromChat: {
      resolve: (root, args, context) => {
        const { message } = root;
        const { chatId: subscribedChatId } = args;

        console.log(
          new Date().toLocaleTimeString('de-DE'),
          `subscription:readMessageFromChatResolver:resolve() ${subscribedChatId}`,
        );

        return message;
      },
      subscribe: withFilter(
        (root, args, context) => {
          const { pubsub } = context;
          console.log(
            new Date().toLocaleTimeString('de-DE'),
            'subscription:readMessageFromChatResolver:subscribe() asyncIterator',
          );

          return pubsub.asyncIterator('message');
        },
        (root, args, context) => {
          const {
            message: { chatId },
          } = root;
          const { chatId: subscribedChatId } = args;

          console.log(
            new Date().toLocaleTimeString('de-DE'),
            'subscription:readMessageFromChatResolver:subscribe() filter',
            subscribedChatId,
            chatId,
          );

          return subscribedChatId === chatId;
        },
      ),
    },
  },
};

const pubsub = new PubSub();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {
    if (connection) {
      return { ...connection.context, pubsub };
    } else {
      return { pubsub };
    }
  },
  subscriptions: {
    path: '/ws/',
    onConnect: (connectionParams, webSocket, context) => {
      console.log(
        new Date().toLocaleTimeString('de-DE'),
        'subscriptions:onConnect',
      );
    },
    onDisconnect: (webSocket, context) => {
      console.log(
        new Date().toLocaleTimeString('de-DE'),
        'subscriptions:onDisconnect',
      );
    },
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
