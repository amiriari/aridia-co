// src/App.js
const API_URL = process.env.REACT_APP_API_URL || "";

import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState("Active");

  // Load tasks
  useEffect(() => {
    fetch(`${API_URL}/tasks`)
      .then((res) => res.json())
      .then((data) => {
        // sort lowest score → highest
        data.sort((a, b) => a.score - b.score);
        setTasks(data);
      });
  }, []);

  // Helpers
  const deleteTask = (id) => {
    fetch(`${API_URL}/delete_task/${id}`, { method: "DELETE" }).then(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });
  };

  const toggleStatus = (id) => {
    fetch(`${API_URL}/toggle_status/${id}`, { method: "PATCH" })
      .then((res) => res.json())
      .then((updated) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      });
  };

  // Filter based on tab
  const filtered = tasks.filter((t) =>
    tab === "Active" ? t.status !== "Archived" : t.status === "Archived"
  );

  return (
    <div className="container">
      <h1>Aridia To-Do List</h1>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.target);
          const payload = {
            title: data.get("title"),
            priority: data.get("priority"),
            motivation: data.get("motivation"),
            date_due: data.get("date_due"),
            group: data.get("group") || "",
            sub_tasks: data
              .get("sub_tasks")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          };
          fetch(`${API_URL}/add_task`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
            .then((r) => r.json())
            .then((newTask) => {
              // insert and resort
              setTasks((prev) => {
                const updated = [...prev, newTask];
                updated.sort((a, b) => a.score - b.score);
                return updated;
              });
              e.target.reset();
            });
        }}
      >
        {[
          {
            name: "title",
            label: "Task Title",
            type: "text",
            placeholder: "Enter task…",
          },
          {
            name: "priority",
            label: "Priority (1-5)",
            type: "number",
            defaultValue: 1,
          },
          {
            name: "motivation",
            label: "Motivation (1-5)",
            type: "number",
            defaultValue: 1,
          },
          { name: "date_due", label: "Due Date", type: "date" },
          {
            name: "group",
            label: "Group",
            type: "text",
            placeholder: "e.g. Work, School",
          },
          {
            name: "sub_tasks",
            label: "Subtasks (comma-separated)",
            type: "text",
          },
        ].map(({ name, label, type, defaultValue, placeholder }) => (
          <div className="form-group" key={name}>
            <label htmlFor={name}>{label}</label>
            <input
              id={name}
              name={name}
              type={type}
              defaultValue={defaultValue}
              placeholder={placeholder}
              required={name === "title" || name === "date_due"}
            />
          </div>
        ))}
        <button type="submit">Add Task</button>
      </form>

      {/* Tabs */}
      <div className="tabs">
        {["Active", "Archived"].map((name) => (
          <button
            key={name}
            className={`tab ${tab === name ? "active" : ""}`}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Task List */}
      <ul className="task-list">
        {filtered.length === 0 ? (
          <p>
            {tab === "Active" ? "No active tasks." : "No archived tasks."}
          </p>
        ) : (
          filtered.map((t) => (
            <li className="task-card" key={t.id}>
              <p>
                <strong>{t.title}</strong>
              </p>
              <p>
                Score: {t.score.toFixed(2)} | Status: {t.status}
              </p>
              <p>
                Priority: {t.priority}, Motivation: {t.motivation},{" "}
                Due: {t.date_due} ({t.days_left} days left)
              </p>
              {t.group && <p>Group: {t.group}</p>}
              {t.sub_tasks.length > 0 && (
                <p>Subtasks: {t.sub_tasks.join(", ")}</p>
              )}

              <div className="task-actions">
                <button
                  className="complete-btn"
                  onClick={() => toggleStatus(t.id)}
                  aria-label={
                    t.status !== "Archived" ? "Archive task" : "Unarchive task"
                  }
                >
                  {t.status !== "Archived" ? "✓" : "↺"}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteTask(t.id)}
                  aria-label="Delete task"
                >
                  🗑
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;



