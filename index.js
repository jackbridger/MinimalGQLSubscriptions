import { GraphQLServer, PubSub } from "graphql-yoga"
// PubSub, is based on an event emitter. Provides us with publish and asyncIterator functions
const pubsub = new PubSub();
// constant used to connect publish with asyncIterator
const TODOS_CHANGED = "TODOS_CHANGED"
// Generate a random id for our ToDos
const createRandomId = () => {
    const randID = Math.floor(Math.random() * 1000000);
    return `${randID}`;
}
// Very simple database substitute containing our To Dos.
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
// The schema for our graphQL operations and our custom types
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
// How we handle graphQL operations from the front end
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
// Creating neew GQL server running on port 4000, we pass in our schema, resolvers and our 
// pub sub and database so that our resolvers can access them. 
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub, db } })

server.start(console.log("gql node server running on local host 4000"))