import { GraphQLServer, PubSub } from "graphql-yoga"

const pubsub = new PubSub();
const db = { todos: [{ id: "1", title: "buy bread" }, { id: "2", title: "buy milk" }] }

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
const resolvers = {
    Query: {
        getTodos: (_, __, { db, pubsub }) => {
            console.log("came into the query", db.todos)
            return db.todos;
        }
    },
    Mutation: {
        createToDo: (_, { title }) => {
            const randID = Math.floor(Math.random() * 1000000)
            const id = `${randID}`
            db.todos.push({ id, title })
            const ToDo = { id, title }
            pubsub.publish("ToDo", { ToDo })
            return ToDo
        }
    },
    Subscription: {
        ToDo: {
            subscribe(parent, { }, { db, pubsub }, info) {
                return pubsub.asyncIterator("ToDo")
            }
        }
    }
}
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub, db } })

server.start(console.log("gql node server running on local host 4000"))