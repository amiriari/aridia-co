const API_URL = process.env.REACT_APP_API_URL || "";
import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/tasks`)
      .then((res) => res.json())
      .then(setTasks);
  }, []);

  return (
    <div className="container">
      <h1>Aridia To-Do List</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.target);
          const payload = {
            title: data.get("title"),
            priority: data.get("priority"),
            motivation: data.get("motivation"),
            days_left: data.get("days_left"),
            group: data.get("group"),
            sub_tasks: data.get("sub_tasks")
              .split(",")
              .map((s) => s.trim())
          };

          fetch(`${API_URL}/add_task`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          })
            .then((r) => r.json())
            .then((newTask) => {
              setTasks((t) => [...t, newTask]);
              e.target.reset();
            });
        }}
      >
        {[
          { name: "title", label: "Task Title", type: "text", placeholder: "Enter task…" },
          { name: "priority", label: "Priority (1-5)", type: "number", defaultValue: 1 },
          { name: "motivation", label: "Motivation (1-5)", type: "number", defaultValue: 1 },
          { name: "days_left", label: "Days Left", type: "number", defaultValue: 1 },
          { name: "group", label: "Group", type: "text", placeholder: "e.g. Work, School" },
          { name: "sub_tasks", label: "Subtasks (comma-separated)", type: "text" }
        ].map(({ name, label, type, defaultValue, placeholder }) => (
          <div className="form-group" key={name}>
            <label htmlFor={name}>{label}</label>
            <input
              id={name}
              name={name}
              type={type}
              defaultValue={defaultValue}
              placeholder={placeholder}
            />
          </div>
        ))}

        <button type="submit">Add Task</button>
      </form>

      <ul className="task-list">
        {tasks.length === 0 ? (
          <p>No tasks added yet.</p>
        ) : (
          tasks.map((t) => (
            <li className="task-card" key={t.id}>
              <p><strong>{t.title}</strong></p>
              <p>Score: {t.score} | Status: {t.status}</p>
              <p>Priority: {t.priority}, Motivation: {t.motivation}, Days Left: {t.days_left}</p>
              {t.group && <p>Group: {t.group}</p>}
              {t.sub_tasks.length > 0 && <p>Subtasks: {t.sub_tasks.join(", ")}</p>}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;


