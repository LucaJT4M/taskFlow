import TaskCard from './TaskCard'

const COLUMNS = [
  { status: 'todo', title: 'To Do' },
  { status: 'in_progress', title: 'In Arbeit' },
  { status: 'done', title: 'Erledigt' },
]

// Testdaten – später kommen die Aufgaben vom Backend
const DEMO_TASKS = [
  { id: 1, title: 'DB-Schema erstellen', description: 'Tabelle tasks', status: 'done' },
  { id: 2, title: 'Endpunkte bauen', description: 'CRUD für Aufgaben', status: 'in_progress' },
  { id: 3, title: 'Kanban-UI', description: 'Board mit API verbinden', status: 'todo' },
]

function KanbanBoard() {
  return (
    <div className="board">
      {COLUMNS.map((col) => (
        <div key={col.status} className="column">
          <h3>{col.title}</h3>
          {DEMO_TASKS
            .filter((task) => task.status === col.status)
            .map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
        </div>
      ))}
    </div>
  )
}

export default KanbanBoard