import { GraphQLServer, PubSub } from "graphql-yoga"
const pubsub = new PubSub();
const TODOS_CHANGED = "TODOS_CHANGED"
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
    toDos: [ToDo]!
}
type Mutation {
    createToDo(title: String): ToDo!
}
type Subscription {
    ToDoChanged: ToDo!

}
type ToDo {
    id: ID!
    title: String!
}

`

const resolvers = {
    Query: {
        toDos: (_, __, { db }) => {
            return db.todos;
        }
    },
    Mutation: {
        createToDo: (_, { title }) => {
            const id = createRandomId();
            const newToDo = { id, title };
            db.todos.push(newToDo);
            pubsub.publish(TODOS_CHANGED, { ToDoChanged: newToDo });
            return newToDo;
        }
    },
    Subscription: {
        ToDoChanged: {
            subscribe(_, __, { pubsub }) {
                return pubsub.asyncIterator(TODOS_CHANGED);
            }
        }
    }
}
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub, db } })

server.start(console.log("gql node server running on local host 4000"))