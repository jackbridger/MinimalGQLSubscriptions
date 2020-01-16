import React from 'react';
import './App.css';
import gql from 'graphql-tag';
import { useQuery, useMutation, } from "@apollo/react-hooks"
import ToDoList from "./ToDoList"
import { Container, Input } from "@material-ui/core"


const TODO_QUERY = gql`
query{
	toDos{
    id
    title
  }
}`;

const TODO_MUTATION = gql`
  mutation CreateToDo($title:String) {
    createToDo(title:$title) {
      title
      id
    }
}`;

const TODO_SUBSCRIPTION = gql`
subscription{
  ToDoChanged{
    id
    title
  }
}`;

function App() {
  const [toDos, setToDos] = React.useState([]);
  const [inputValue, setInputValue] = React.useState("")
  const [addToDoMutation] = useMutation(TODO_MUTATION);
  const {
    subscribeToMore,
    data,
    loading,
    error
  } = useQuery(TODO_QUERY)

  React.useEffect(() => {
    if (error) {
      console.error(error)
    }
    if (data) {
      setToDos(data.toDos)
    }
  }, [loading])

  const subscribeToNewToDos = () =>
    subscribeToMore({
      document: TODO_SUBSCRIPTION,
      updateQuery: (currentToDos, { subscriptionData }) => {
        if (!subscriptionData.data) return currentToDos;
        const newToDo = subscriptionData.data.ToDoChanged;
        const updatedToDos = currentToDos.toDos.concat(newToDo)
        setToDos(updatedToDos)
        return { toDos: updatedToDos }
      }
    })

  return (
    <Container className="App">
      <h1>My To Dos</h1>
      {loading
        ?
        <p>Loading...</p>
        :
        <ToDoList
          ToDos={toDos}
          subscribeToNewToDos={subscribeToNewToDos}
        />
      }

      <form onSubmit={async (e) => {
        e.preventDefault();
        await addToDoMutation({ variables: { title: inputValue } });
        setInputValue("");
      }}>
        <label>
          New To Do <br />
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
