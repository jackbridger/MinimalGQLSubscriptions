import React from 'react';
import './App.css';
import gql from 'graphql-tag';
import { useSubscription, useQuery, useMutation, } from "@apollo/react-hooks"
import ToDoList from "./ToDoList"
import { Container, Input } from "@material-ui/core"


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
const TODO_SUBSCRIPTION = gql`
subscription{
  ToDoChanged{
    id
    title
  }
}
`;

function App() {
  const [ToDos, setToDos] = React.useState([]);
  const [addToDoMutation] = useMutation(TODO_MUTATION);
  const [inputValue, setInputValue] = React.useState("")

  const { subscribeToMore, onCompleted } = useQuery(
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
      setToDos(todos => todos.concat(subscriptionData.data.ToDoChanged))
    }
  })

  return (
    <Container className="App">
      <h1>My To Dos</h1>
      <ToDoList
        ToDos={ToDos}
      />
      <form onSubmit={(e) => {
        e.preventDefault()
        addToDoMutation({ variables: { title: inputValue } })
        setInputValue("")
      }}>
        <label>
          New ToDo <br />
          <Input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        </label>
        <Container>
          <Input type="submit" value="Submit" />
        </Container>
      </form>
    </Container >

  );
}

export default App;
