import React from 'react'
import ToDo from "./ToDo"
export default function ToDoList({ ToDos, subscribeToNewToDos }) {
    // When the component is mounted, subscribe to new To Dos
    React.useEffect(() => subscribeToNewToDos(), []);

    return (

        <ul>
            {ToDos ? ToDos.map(todo => <li key={todo.id}><ToDo title={todo.title} /></li>) : <p>loading</p>}
        </ul>
    )
}
