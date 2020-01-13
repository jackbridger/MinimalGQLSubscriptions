import { GraphQLServer, PubSub } from "graphql-yoga"
const pubsub = new PubSub();
const createRandomId = () => {
    const randID = Math.floor(Math.random() * 1000000);
    return `${randID}`;
}
const db = {
    todos:
        [{
            id: createRandomId(),
            title: "buy bread"
        },
        {
            id: createRandomId(),
            title: "buy milk"
        }]
};
const typeDefs = `
type Query {
    getTodos: [ToDo]!
}
type Mutation {
    createToDo(title: String): ToDo!
}
type Subscription {
    ToDo: ToDo!

}
type ToDo {
    id: ID!
    title: String!
}

`
const TODO = "TODO"

const resolvers = {
    Query: {
        getTodos: (_, __, { db }) => {
            return db.todos;
        }
    },
    Mutation: {
        createToDo: (_, { title }) => {
            const id = createRandomId();
            db.todos.push({ id, title });
            const ToDo = { id, title };
            pubsub.publish(TODO, { ToDo });
            return ToDo;
        }
    },
    Subscription: {
        ToDo: {
            subscribe(_, __, { pubsub }) {
                return pubsub.asyncIterator(TODO);
            }
        }
    }
}
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub, db } })

server.start(console.log("gql node server running on local host 4000"))