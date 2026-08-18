const formShow = (editTodo = null) => {
    return new Promise((resolve) => {

        const parent = document.querySelector(".showFomdiv");

        const isEdit = editTodo !== null;

        const form = `
            <div class="form-container">

                <h2>${isEdit ? "Edit Todo" : "Create Task"}</h2>

                <div id="taskForm">

                    <label for="task">Task</label>
                    <input
                        type="text"
                        id="task"
                        value="${isEdit ? editTodo.task : ""}"
                        placeholder="Enter task"
                    >

                    <label for="category">Category</label>
                    <select id="category">
                        <option value="">Select category</option>
                        <option value="work" ${isEdit && editTodo.category === "work" ? "selected" : ""}>Work</option>
                        <option value="personal" ${isEdit && editTodo.category === "personal" ? "selected" : ""}>Personal</option>
                        <option value="study" ${isEdit && editTodo.category === "study" ? "selected" : ""}>Study</option>
                        <option value="shopping" ${isEdit && editTodo.category === "shopping" ? "selected" : ""}>Shopping</option>
                    </select>

                    <label for="dueDate">Due Date</label>
                    <input
                        type="date"
                        id="dueDate"
                        value="${isEdit ? editTodo.dueDate : ""}"
                    >

                    <button id="save" type="button">
                        ${isEdit ? "Update Task" : "Save Task"}
                    </button>

                </div>
            </div>
        `;

        parent.innerHTML = form;
        parent.style.display = "flex";

        const save = document.getElementById("save");

        save.addEventListener("click", () => {

            const task = document.getElementById("task").value.trim();
            const categories = document.getElementById("category").value;
            const dueDate = document.getElementById("dueDate").value;

            if (!task || !categories || !dueDate) {
                alert("Required field is missing");
                return;
            }

            const newObj = {
                task,
                categories,
                dueDate
            };

            parent.innerHTML = "";
            parent.style.display = "none";

            resolve(newObj);
        });
    });
};



export default formShow