import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import { Amplify } from 'aws-amplify'
import type { Schema } from '../amplify/data/resource'
import outputs from '../amplify_outputs.json'

Amplify.configure(outputs)

const client = generateClient<Schema>()

function App() {
  const [todos, setTodos] = useState<Schema['Todo']['type'][]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: ({ items }) => setTodos([...items]),
    })
    return () => sub.unsubscribe()
  }, [])

  async function addTodo() {
    if (!input.trim()) return
    await client.models.Todo.create({ content: input, isDone: false })
    setInput('')
  }

  async function toggleTodo(id: string, isDone: boolean) {
    await client.models.Todo.update({ id, isDone: !isDone })
  }

  async function deleteTodo(id: string) {
    await client.models.Todo.delete({ id })
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Todo App</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a todo..."
          style={{ flex: 1, padding: '8px 12px', fontSize: 16 }}
        />
        <button onClick={addTodo} style={{ padding: '8px 16px', fontSize: 16 }}>
          Add
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}
          >
            <input
              type="checkbox"
              checked={!!todo.isDone}
              onChange={() => toggleTodo(todo.id, !!todo.isDone)}
            />
            <span style={{ flex: 1, textDecoration: todo.isDone ? 'line-through' : 'none' }}>
              {todo.content}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
