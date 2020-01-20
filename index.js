import { GraphQLServer, PubSub } from "graphql-yoga"
// PubSub, is based on an event emitter. Provides us with publish and asyncIterator functions
import { Prisma } from "prisma-binding";
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
    toDos:
        [{
            id: createRandomId(),
            title: "buy bread"
        },
        {
            id: createRandomId(),
            title: "buy milk"
        }]
};

const prisma = new Prisma({ typeDefs: "./prisma-to-do/generated/prisma.graphql", endpoint: "http://localhost:4466/" })


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

function newToDoSubscribe(parent, args, { prisma }, info) {
    return prisma.subscribe.toDo({}).node()
}

// How we handle graphQL operations from the front end
const resolvers = {
    Query: {
        // Return all To Dos
        toDos: (parent, args, { prisma }, info) => {
            return prisma.query.toDoes({}, info)
        }
    },
    Mutation: {
        createToDo: (parent, { title }, { prisma }, info) => {
            return prisma.mutation.createToDo({
                data: {
                    title
                }
            })
        }
    },
    Subscription: {
        // Note: "Subscriptions resolvers are not a function, 
        // but an object with subscribe method, that returns AsyncIterable." 
        ToDoChanged: {
            subscribe: async (parent, args, { prisma }, info) => {
                // console.log("came into to do subscribe")
                // console.log("info is ", info.operation.selectionSet.selections[0].selectionSet)
                console.log("waiting for pris sub")

                const prismaSub = await prisma.subscription.toDo({}, info)
                console.log("prisma sub is ", prismaSub)
                return prismaSub
            },
            resolve: payload => {
                // console.log("payload is... !", payload)
                // console.log("payload is... !", payload.ToDoChanged.toString())
                return {
                    ToDo: {
                        id: "12312312312",
                        title: "test"
                    }
                }
                return payload
            }
        }
        // ToDoChanged: {
        //     subscribe: newToDoSubscribe,
        //     resolve: payload => {
        //         console.log("payload is... !", payload)
        //         console.log("payload is... !")
        //         const parsed = JSON.parse(JSON.stringify(payload))
        //         console.log("parsed", parsed.ToDoChanged)
        // return {
        //     id: "12312312312",
        //     title: "test"
        // }
        //     }
        // },


    }
}
// Creating neew GQL server running on port 4000, we pass in our schema, resolvers and our 
// pub sub and database so that our resolvers can access them. 

const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub, db, prisma } })

server.start(console.log("gql node server running on local host 4000"))