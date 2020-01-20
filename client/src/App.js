import React from 'react';
import './App.css';
import gql from 'graphql-tag';
import { useQuery, useMutation, } from "@apollo/react-hooks"
import ToDoList from "./ToDoList"
import { Container, Input } from "@material-ui/core"

// Get all To Dos
const TODO_QUERY = gql`
query{
	toDos{
    id
    title
  }
}`;

// Create a To do
const TODO_MUTATION = gql`
  mutation CreateToDo($title:String) {
    createToDo(title:$title) {
      title
      id
    }
}`;

// Subscribe to modified (created) To Dos 
const TODO_SUBSCRIPTION = gql`
subscription{
  ToDoChanged{
    id
    title
  }
}`;

function App() {
  // The To Dos on the page
  const [toDos, setToDos] = React.useState([]);
  // Managing form input - the title of our To Do (controlled component)
  const [inputValue, setInputValue] = React.useState("")
  // returns a function that we can use to create a to do
  const [addToDoMutation] = useMutation(TODO_MUTATION);

  const {
    subscribeToMore, // subscribe to new to dos
    data, // To do data
    loading, // true or false if the data is currently loading
    error // null or error object if failed to fetch
  } = useQuery(TODO_QUERY)

  // When loading (of To Dos query) changes from true -> false 
  // We set to dos or we throw an error (or )
  // If loading changes from false -> true
  // We pass through
  React.useEffect(() => {
    if (error) {
      console.error(error)
    }
    if (data) {
      setToDos(data.toDos)
    }
  }, [loading])

  // Function expression that calls subscribeToMore (the function returned by ToDos query)
  const subscribeToNewToDos = () =>
    subscribeToMore({
      document: TODO_SUBSCRIPTION, // the gql subscription operation
      // How do we update our ToDos data when subscription data comes through.
      updateQuery: (currentToDos, { subscriptionData }) => {
        console.log("received a to do", subscriptionData)
        if (!subscriptionData.data) return currentToDos;
        const newToDo = subscriptionData.data.ToDoChanged;
        const updatedToDos = currentToDos.toDos.concat(newToDo)
        setToDos(updatedToDos) // Update the state of todos with new to do
        return { toDos: updatedToDos } // return the todos in the format expected
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
          //pass in the subscription into component so it can be called 
          subscribeToNewToDos={subscribeToNewToDos}
        />
      }

      <form onSubmit={async (e) => {
        e.preventDefault();
        // When form is submitted, create a new To do and reset form
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
