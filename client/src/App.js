import React from 'react';
import './App.css';
import gql from 'graphql-tag';
import { useSubscription, useQuery, useMutation, } from "@apollo/react-hooks"
import ToDoList from "./ToDoList"
import { Container, Header, Button, Form, Input } from "semantic-ui-react"

const TODO_SUBSCRIPTION = gql`
subscription{
  ToDo{
    id
    title
  }
}
`;

const TODO_QUERY = gql`
query{
	getTodos{
    id
    title
  }
}
`;

const TODO_MUTATION = gql`
  mutation CreateToDo($title:String) {
    createToDo(title:$title) {
      title
      id
    }
}
`


function App() {
  const [ToDos, setToDos] = React.useState([]);
  const [addTodo, { }] = useMutation(TODO_MUTATION);

  const { subscribeToMore, onCompleted, ...result } = useQuery(
    TODO_QUERY,
    {
      shouldResubscribe: true,
      onCompleted: (result) => setToDos(result.getTodos)
    }
  )
  const {
    data,
    loading,
  } = useSubscription(TODO_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      setToDos(todos => todos.concat(subscriptionData.data.ToDo))
    }
  })
  const [newToDo, setNewToDo] = React.useState("")

  return (
    <Container className="App">
      <Header as="h1">My shopping list</Header>

      <ToDoList
        ToDos={ToDos}

      />
      <Form onSubmit={(e) => {
        e.preventDefault()
        addTodo({ variables: { title: newToDo } })
      }}>
        <Input type="text" />
        <Input type="submit" value={newToDo} onChange={(e) => setNewToDo(e.target.value)} />
      </Form>
    </Container >

  );
}

export default App;
