import React from 'react';
import './App.css';
import gql from 'graphql-tag';
import { useSubscription, useQuery, useMutation, } from "@apollo/react-hooks"
import ToDoList from "./ToDoList"
import { Container, Input } from "@material-ui/core"

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
      onCompleted: (result) => setToDos(todos => result.getTodos)
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
      <h1>My shopping list</h1>

      <ToDoList
        ToDos={ToDos}

      />
      <form onSubmit={(e) => {
        e.preventDefault()
        addTodo({ variables: { title: newToDo } })
        setNewToDo("")
      }}>
        <label>
          New To Do <br />
          <Input type="text" value={newToDo} onChange={(e) => setNewToDo(e.target.value)} />
        </label>
        <Container>
          <Input type="submit" value="Submit" />
        </Container>
      </form>
    </Container >

  );
}

export default App;
