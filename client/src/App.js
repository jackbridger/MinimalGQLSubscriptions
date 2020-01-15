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
  const [toDos, setToDos] = React.useState([]);
  const [inputValue, setInputValue] = React.useState("")
  const [addToDoMutation] = useMutation(TODO_MUTATION);
  const {
    subscribeToMore,
    data: toDoQuery,
    loading: loadingQuery,
    error: errorQuery
  } = useQuery(TODO_QUERY)


  React.useEffect(() => {
    if (errorQuery) {
      console.error(errorQuery)
    }
    if (toDoQuery) {
      setToDos(toDoQuery.toDos)
    }
  }, [loadingQuery])


  return (
    <Container className="App">
      <h1>My To Dos</h1>
      {loadingQuery || errorQuery ? <p>Loading...</p> :
        <ToDoList
          ToDos={toDos}
          subscribeToNewToDos={() =>
            subscribeToMore({
              document: TODO_SUBSCRIPTION,
              updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) return prev;
                const newToDo = subscriptionData.data.ToDoChanged;
                const updatedToDoList = prev.toDos.concat(newToDo)
                setToDos(updatedToDoList)
                return { toDos: updatedToDoList }
              }
            })
          }
        />
      }

      <form onSubmit={async (e) => {
        e.preventDefault()
        await addToDoMutation({ variables: { title: inputValue } })
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
