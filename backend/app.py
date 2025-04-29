from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)


tasks = []

def generate_task_id():
    return len(tasks) + 1

def calculate_score(priority, motivation, days_left):
    reversed_p = 6 - priority
    reversed_m = 6 - motivation

    dl = max(0, days_left)

    raw = 0.35 * reversed_p + 0.30 * reversed_m + 0.45 * dl
    return round(raw / 3, 2)

@app.route("/add_task", methods=["POST"])
def add_task():
    data = request.json

    priority = int(data.get("priority", 1))
    motivation = int(data.get("motivation", 1))
    date_due_str = data.get("date_due", "")
    try:
        due_date = datetime.strptime(date_due_str, "%Y-%m-%d").date()
        today = datetime.utcnow().date()
        days_left = max(0, (due_date - today).days)
    except:
        days_left = 0

    new_task = {
        "id": generate_task_id(),
        "title": data["title"],
        "priority": priority,
        "motivation": motivation,
        "date_due": date_due_str,
        "days_left": days_left,
        "group": data.get("group", ""),
        "sub_tasks": data.get("sub_tasks", []),
        "status": "Incomplete",
        "score": calculate_score(priority, motivation, days_left)
    }

    tasks.append(new_task)
    return jsonify(new_task), 201

@app.route("/delete_task/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    global tasks
    tasks = [task for task in tasks if task["id"] != task_id]
    return jsonify({"message": "Task deleted"}), 200

@app.route("/toggle_status/<int:task_id>", methods=["PATCH"])
def toggle_status(task_id):
    for task in tasks:
        if task["id"] == task_id:
            task["status"] = (
                "Archived" if task["status"] != "Archived" else "Incomplete"
            )
            return jsonify(task), 200
    return jsonify({"error": "Task not found"}), 404

@app.route("/tasks", methods=["GET"])
def get_tasks():
    return jsonify(tasks)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)
