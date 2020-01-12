import React from 'react'
import { Card } from "@material-ui/core"
import ToDo from "./ToDo"
export default function ToDoList({ ToDos, }) {


    return (

        <ul divided={true} ordered={true}>
            {ToDos ? ToDos.map(todo => <li key={todo.id}><ToDo title={todo.title} /></li>) : <p>loading</p>}
        </ul>
    )
}
