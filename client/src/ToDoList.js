import React from 'react'
import { List } from "semantic-ui-react"

export default function ToDoList({ ToDos, }) {


    return (
        <List>
            {ToDos ? ToDos.map(todo => <List.Item key={todo.id}>{todo.title}</List.Item>) : <p>loading</p>}
        </List>
    )
}
