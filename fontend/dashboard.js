import baseUrl from "./url.js";
import formShow from "./formModel/form.js";


/* =========================================
   DOM ELEMENTS
========================================= */

const dashboardNav =
    document.querySelector(".activeState");

const taskPendingNav =
    document.querySelector(".mytask");

const cards =
    document.querySelector(".cards");

const parent =
    document.getElementById("parent");

const total =
    document.getElementById("total");

const pending =
    document.getElementById("pending");

const completed =
    document.getElementById("completed");

const buttonAdd =
    document.getElementById("buttonadd");

const search =
    document.getElementById("inputsearch");

const categorySelect =
    document.getElementById("categorySelect");

const helloUser =
    document.getElementById("helloUser");

const dashboardTitle =
    document.getElementById("dashboard");

const emptyState =
    document.getElementById("emptyState");

const mobileMenu =
    document.getElementById("mobileMenu");

const sidebar =
    document.querySelector(".sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


/* =========================================
   GLOBAL STATE
========================================= */

let allTodo = [];

let isLoading = false;


/*
    Current page/filter.

    all       = Dashboard
    pending   = Pending Tasks
    category  = Category
    report    = Reports
*/

let currentView = "all";

let currentCategory = "";

let currentSearch = "";


/* =========================================
   AUTH
========================================= */

const getToken = () => {

    const token =
        localStorage.getItem("token");


    if (!token) {
        return null;
    }


    try {

        return JSON.parse(token);

    } catch {

        return token;
    }
};


const getBearerToken = () => {

    const token =
        getToken();


    if (!token) {
        return null;
    }


    return `Bearer ${token}`;
};


/* =========================================
   JWT USER DATA
========================================= */

const getUserFromToken = () => {

    const token =
        getToken();


    if (!token) {
        return null;
    }


    try {

        const parts =
            token.split(".");


        if (parts.length !== 3) {
            return null;
        }


        return JSON.parse(
            atob(parts[1])
        );


    } catch (error) {

        console.error(
            "❌ Token decode error:",
            error
        );

        return null;
    }
};


/* =========================================
   AUTH CHECK
========================================= */

const authChack = async () => {

    const token =
        getToken();


    if (!token) {

        console.warn(
            "⚠️ Token not found"
        );

        redirectToLogin();

        return false;
    }


    const userData =
        getUserFromToken();


    if (!userData?.id) {

        console.error(
            "❌ Invalid user token"
        );

        clearAuth();

        redirectToLogin();

        return false;
    }


    try {

        console.log(
            "🔐 Checking authentication..."
        );


        const response =
            await fetch(
                `${baseUrl}/singleUser/${userData.id}`,
                {
                    method: "GET"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Authentication failed: ${response.status}`
            );
        }


        const user =
            await response.json();


        if (!user.status) {

            clearAuth();

            redirectToLogin();

            return false;
        }


        localStorage.setItem(
            "userdata",
            JSON.stringify(user)
        );


        const fullName =
            userData.fullName ||
            user.data?.fullName ||
            user.user?.fullName ||
            "User";


        if (helloUser) {

            helloUser.innerText =
                `Welcome ${fullName.toUpperCase()} 👋`;
        }


        if (dashboardTitle) {

            dashboardTitle.innerText =
                "Dashboard";
        }


        console.log(
            "✅ Authentication successful"
        );


        return true;


    } catch (error) {

        console.error(
            "❌ Authentication error:",
            error
        );

        clearAuth();

        redirectToLogin();

        return false;
    }
};


/* =========================================
   AUTH HELPERS
========================================= */

const clearAuth = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("userdata");
};


const redirectToLogin = () => {

    if (
        !window.location.pathname.includes(
            "index.html"
        )
    ) {

        window.location.replace(
            "./index.html"
        );
    }
};


/* =========================================
   UI STATE
========================================= */

const showDashboardUI = () => {

    dashboardNav?.classList.add(
        "activeState"
    );

    dashboardNav?.classList.remove(
        "normalState"
    );


    taskPendingNav?.classList.remove(
        "activeState"
    );

    taskPendingNav?.classList.add(
        "normalState"
    );


    cards?.classList.remove(
        "hideState"
    );


    buttonAdd?.classList.remove(
        "hideState"
    );


    search?.classList.remove(
        "hideState"
    );


    closeMobileSidebar();
};


const showTaskUI = () => {

    dashboardNav?.classList.remove(
        "activeState"
    );

    dashboardNav?.classList.add(
        "normalState"
    );


    taskPendingNav?.classList.add(
        "activeState"
    );

    taskPendingNav?.classList.remove(
        "normalState"
    );


    cards?.classList.add(
        "hideState"
    );


    buttonAdd?.classList.add(
        "hideState"
    );


    search?.classList.remove(
        "hideState"
    );


    closeMobileSidebar();
};


const showReportUI = () => {

    dashboardNav?.classList.remove(
        "activeState"
    );

    dashboardNav?.classList.add(
        "normalState"
    );


    taskPendingNav?.classList.remove(
        "activeState"
    );

    taskPendingNav?.classList.add(
        "normalState"
    );


    cards?.classList.add(
        "hideState"
    );


    buttonAdd?.classList.add(
        "hideState"
    );


    search?.classList.add(
        "hideState"
    );


    closeMobileSidebar();
};


/* =========================================
   LOADING
========================================= */

const showLoading = (
    text = "Loading tasks..."
) => {

    if (!parent) {
        return;
    }


    parent.innerHTML = `
        <tr>
            <td colspan="5">
                <div class="table-loading">
                    <div class="spinner"></div>
                    <span>${escapeHtml(text)}</span>
                </div>
            </td>
        </tr>
    `;


    hideEmptyState();
};


const hideEmptyState = () => {

    if (emptyState) {

        emptyState.style.display =
            "none";
    }
};


const showEmptyState = () => {

    if (emptyState) {

        emptyState.style.display =
            "block";
    }
};


/* =========================================
   UPDATE STATISTICS
========================================= */

const updateStats = (
    todos = []
) => {

    const totalTasks =
        todos.length;


    const completedTasks =
        todos.filter(
            todo =>
                String(todo.status)
                    .toLowerCase()
                    .trim() ===
                "completed"
        ).length;


    const pendingTasks =
        todos.filter(
            todo =>
                String(todo.status)
                    .toLowerCase()
                    .trim() ===
                "pending"
        ).length;


    if (total) {

        total.innerText =
            totalTasks;
    }


    if (completed) {

        completed.innerText =
            completedTasks;
    }


    if (pending) {

        pending.innerText =
            pendingTasks;
    }
};


/* =========================================
   STATUS BADGE
========================================= */

const getStatusBadge = (
    status
) => {

    const normalized =
        String(
            status || "pending"
        )
            .toLowerCase()
            .trim();


    if (
        normalized ===
        "completed"
    ) {

        return `
            <span class="status-badge status-completed">
                <i class="fa-solid fa-circle-check"></i>
                Completed
            </span>
        `;
    }


    return `
        <span class="status-badge status-pending">
            <i class="fa-solid fa-clock"></i>
            Pending
        </span>
    `;
};


/* =========================================
   RENDER TODO
========================================= */

const randerUi = (
    arr = []
) => {

    if (!parent) {
        return;
    }


    parent.innerHTML = "";

    hideEmptyState();


    if (!arr.length) {

        showEmptyState();

        return;
    }


    arr.forEach(
        (todo, index) => {

            const row =
                document.createElement(
                    "tr"
                );


            row.id =
                todo._id || "";


            /* ID */

            const idCell =
                document.createElement(
                    "td"
                );

            idCell.innerText =
                index + 1;


            /* TASK */

            const taskCell =
                document.createElement(
                    "td"
                );

            taskCell.className =
                "task-name";

            taskCell.innerText =
                todo.task ||
                "Untitled Task";


            /* DATE */

            const dateCell =
                document.createElement(
                    "td"
                );

            dateCell.innerText =
                formatDate(
                    todo.dueDate
                );


            /* STATUS */

            const statusCell =
                document.createElement(
                    "td"
                );

            statusCell.innerHTML =
                getStatusBadge(
                    todo.status
                    
                );


            /* ACTION */

            const actionCell =
                document.createElement(
                    "td"
                );

            actionCell.className =
                "action-cell";


            const editButton =
                document.createElement(
                    "button"
                );

            editButton.className =
                "edit";


            editButton.innerHTML = `
                <i class="fa-solid fa-pen"></i>
                Edit
            `;

            


            editButton.dataset.task =
                todo.task || "";


            editButton.dataset.dueDate =
                todo.dueDate || "";


            editButton.dataset.categories =
                todo.categories || "";


            editButton.dataset.id =
                todo._id || "";


            editButton.addEventListener(
                "click",
                () =>
                    updateTodo(
                        editButton
                    )
            );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.className =
                "delete";


            deleteButton.innerHTML = `
                <i class="fa-solid fa-trash"></i>
                Delete
            `;


            deleteButton.dataset.id =
                todo._id || "";


            deleteButton.addEventListener(
                "click",
                () =>
                    deletTodo(
                        deleteButton
                    )
            );


            /* COMPLETED */
            const completeCell =
                document.createElement(
                    "td"
                );
                completeCell.className =
                "action-cell";
                

const completedButton =
    document.createElement(
        "button"
    );

completedButton.className =
    "completed";

completedButton.innerHTML = `
    <i class="fa-solid fa-check"></i>
    Completed
`;

completedButton.dataset.id =
    todo._id || "";

completedButton.addEventListener(
    "click",
    () =>
        completeTodo(
            completedButton
        )
);
 if (todo.status === "completed") {
        completedButton.disabled = true;
    }
completeCell.append(completedButton)





            actionCell.append(
                editButton,
                deleteButton
            );


            row.append(
                idCell,
                taskCell,
                dateCell,
                statusCell,
                actionCell,
                completeCell
            );


            parent.appendChild(row);
        }
    );
};


/* =========================================
   FORMAT DATE
========================================= */

const formatDate = (
    date
) => {

    if (!date) {
        return "No date";
    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return date;
    }


    return parsedDate.toLocaleDateString(
        "en-US",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
};


/* =========================================
   GET CURRENT VIEW DATA
========================================= */

const getCurrentViewData = () => {

    let data = [];


    /* Dashboard */

    if (
        currentView ===
        "all"
    ) {

        data =
            [...allTodo];
    }


    /* Pending */

    else if (
        currentView ===
        "pending"
    ) {

        data =
            allTodo.filter(
                todo =>
                    String(
                        todo.status
                    )
                        .toLowerCase()
                        .trim() ===
                    "pending"
            );
    }


    /* Category */

    else if (
        currentView ===
        "category"
    ) {

        data =
            allTodo.filter(
                todo =>
                    String(
                        todo.categories
                    )
                        .toLowerCase()
                        .trim() ===
                    currentCategory
            );
    }


    return data;
};


/* =========================================
   APPLY SEARCH
========================================= */

const applySearch = () => {

    const value =
        currentSearch
            .toLowerCase()
            .trim();


    /*
        IMPORTANT:

        Search ALL todos par nahi chalega.

        Pehle current page ka data
        niklega.
    */

    const sourceData =
        getCurrentViewData();


    /* Empty search */

    if (!value) {

        randerUi(
            sourceData
        );

        return;
    }


    /* Search current view only */

    const filtered =
        sourceData.filter(
            todo => {

                const taskName =
                    String(
                        todo.task || ""
                    )
                        .toLowerCase();


                const categoryName =
                    String(
                        todo.categories || ""
                    )
                        .toLowerCase();


                const status =
                    String(
                        todo.status || ""
                    )
                        .toLowerCase();


                return (
                    taskName.includes(
                        value
                    ) ||

                    categoryName.includes(
                        value
                    ) ||

                    status.includes(
                        value
                    )
                );
            }
        );


    randerUi(
        filtered
    );
};


/* =========================================
   GET ALL TODOS
========================================= */

const get_All = async () => {

    if (isLoading) {
        return;
    }


    try {

        isLoading = true;


        currentView =
            "all";


        currentCategory =
            "";


        currentSearch =
            "";


        if (search) {

            search.value =
                "";
        }


        showDashboardUI();

        showLoading();


        const token =
            getBearerToken();


        if (!token) {

            redirectToLogin();

            return;
        }


        // console.log(
        //     "📥 Fetching all tasks..."
        // );


        const response =
            await fetch(
                `${baseUrl}/todo`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            token
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                `Failed to load tasks (${response.status})`
            );
        }


        const todo =
            await response.json();


        if (!todo.status) {

            allTodo = [];


            updateStats(
                []
            );


            randerUi(
                []
            );


            showToast(
                todo.message ||
                "Unable to load tasks.",
                "error"
            );


            return;
        }


        allTodo =
            Array.isArray(
                todo.todoData
            )
                ? todo.todoData
                : [];


        updateStats(
            allTodo
        );


        randerUi(
            allTodo
        );


        // console.log(
        //     `✅ ${allTodo.length} tasks loaded`
        // );


    } catch (error) {

        console.error(
            "❌ Get todos error:",
            error
        );


        allTodo = [];


        updateStats(
            []
        );


        if (parent) {

            parent.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="table-error">
                            <i class="fa-solid fa-triangle-exclamation"></i>

                            <span>
                                Unable to load tasks.
                            </span>

                            <button onclick="get_All()">
                                Try Again
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }


    } finally {

        isLoading =
            false;
    }
};


/* =========================================
   CREATE TODO
========================================= */

const createTodo = async () => {

    try {

        const values =
            await formShow();


        if (!values) {
            return;
        }


        if (
            !values.task ||
            !values.dueDate ||
            !values.categories
        ) {

            showToast(
                "Please fill all required fields.",
                "error"
            );

            return;
        }


        const token =
            getBearerToken();


        if (!token) {

            redirectToLogin();

            return;
        }


        setButtonLoading(
            buttonAdd,
            true,
            "Adding..."
        );


        const response =
            await fetch(
                `${baseUrl}/todo`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            token
                    },

                    body:
                        JSON.stringify(
                            values
                        )
                }
            );


        const todo =
            await response.json();


        if (
            !response.ok ||
            !todo.status
        ) {

            throw new Error(
                todo.message ||
                "Unable to create task."
            );
        }


        showToast(
            todo.message ||
            "Task created successfully.",
            "success"
        );


        await get_All();


    } catch (error) {

        console.error(
            "❌ Create todo error:",
            error
        );


        showToast(
            error.message ||
            "Something went wrong.",
            "error"
        );


    } finally {

        setButtonLoading(
            buttonAdd,
            false
        );
    }
};


/* =========================================
   UPDATE TODO
========================================= */

const updateTodo = async (
    element
) => {

    try {

        const id =
            element.dataset.id ||
            element.id;


        if (!id) {

            showToast(
                "Task ID not found.",
                "error"
            );

            return;
        }


        const oldTodo = {

            task:
                element.dataset.task ||
                "",

            dueDate:
                element.dataset.dueDate ||
                "",

            categories:
                element.dataset.categories ||
                ""
        };


        const values =
            await formShow(
                oldTodo
            );


        if (!values) {
            return;
        }


        if (
            !values.task ||
            !values.dueDate ||
            !values.categories
        ) {

            showToast(
                "Please fill all required fields.",
                "error"
            );

            return;
        }


        const token =
            getBearerToken();


        if (!token) {

            redirectToLogin();

            return;
        }


        const response =
            await fetch(
                `${baseUrl}/todo/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            token
                    },

                    body:
                        JSON.stringify(
                            values
                        )
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.status
        ) {

            throw new Error(
                result.message ||
                "Unable to update task."
            );
        }


        showToast(
            result.message ||
            "Task updated successfully.",
            "success"
        );


        /*
            Reload data but preserve
            current filter.
        */

        await refreshCurrentView();


    } catch (error) {

        console.error(
            "❌ Update todo error:",
            error
        );


        showToast(
            error.message ||
            "Something went wrong.",
            "error"
        );
    }
};
/* =========================================
   completed TODO
========================================= */

const completeTodo=async (element)=>{

    try {
        console.log("completed")
         const id =
            element.dataset.id ||
            element.id;


        if (!id) {

           console.log("id not found")
            

            return;
        }
        const token =
            getBearerToken();


        if (!token) {

            redirectToLogin();

            return;
        }


        const response =
            await fetch(
                `${baseUrl}/complet/${id}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            token
                    }


                }
            );


        const result =
            await response.json();


            if (!result.status) {
                
                throw new Error(
                    result.message ||
                    "Unable to update task."
                );
            }
        if(result.status){
           
            // element.disabled= true
            get_All()
        }  else{
            alert(result.message)
        }          
            




       
    } catch (error) {
        
    }
}

/* =========================================
   DELETE TODO
========================================= */

const deletTodo = async (
    element
) => {

    try {

        const id =
            element.dataset.id ||
            element.id;


        if (!id) {

            showToast(
                "Task ID not found.",
                "error"
            );

            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to delete this task?"
            );


        if (!confirmed) {
            return;
        }


        const token =
            getBearerToken();


        if (!token) {

            redirectToLogin();

            return;
        }


        element.disabled =
            true;


        element.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
        `;


        const response =
            await fetch(
                `${baseUrl}/todo/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            token
                    }
                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.status
        ) {

            throw new Error(
                result.message ||
                "Unable to delete task."
            );
        }


        allTodo =
            allTodo.filter(
                todo =>
                    todo._id !== id
            );


        updateStats(
            allTodo
        );


        showToast(
            result.message ||
            "Task deleted successfully.",
            "success"
        );


        /*
            Current filter/search preserve
        */

        applySearch();


    } catch (error) {

        console.error(
            "❌ Delete todo error:",
            error
        );


        showToast(
            error.message ||
            "Something went wrong.",
            "error"
        );


        element.disabled =
            false;


        element.innerHTML = `
            <i class="fa-solid fa-trash"></i>
            Delete
        `;
    }
};


/* =========================================
   PENDING TASKS
========================================= */

const task = async () => {

    try {

        currentView =
            "pending";


        currentCategory =
            "";


        currentSearch =
            "";


        if (search) {

            search.value =
                "";
        }


        showTaskUI();


        const pendingTasks =
            allTodo.filter(
                todo =>
                    String(
                        todo.status
                    )
                        .toLowerCase()
                        .trim() ===
                    "pending"
            );


        randerUi(
            pendingTasks
        );


        console.log(
            `📌 Pending tasks: ${pendingTasks.length}`
        );


    } catch (error) {

        console.error(
            "❌ Pending tasks error:",
            error
        );


        showToast(
            "Unable to load pending tasks.",
            "error"
        );
    }
};


/* =========================================
   CATEGORY
========================================= */

const category = async () => {

    try {

        const selectedCategory =
            categorySelect?.value
                ?.toLowerCase()
                .trim();


        /*
            Categories selected again
        */

        if (!selectedCategory) {

            currentView =
                "all";

            currentCategory =
                "";

            currentSearch =
                "";


            if (search) {
                search.value = "";
            }


            await get_All();

            return;
        }


        currentView =
            "category";


        currentCategory =
            selectedCategory;


        currentSearch =
            "";


        if (search) {
            search.value = "";
        }


        showTaskUI();


        const filteredTasks =
            allTodo.filter(
                todo =>
                    String(
                        todo.categories
                    )
                        .toLowerCase()
                        .trim() ===
                    selectedCategory
            );


        randerUi(
            filteredTasks
        );


        console.log(
            `📂 Category: ${selectedCategory}`
        );


        console.log(
            `📊 Category tasks: ${filteredTasks.length}`
        );


        if (!filteredTasks.length) {

            showToast(
                `No tasks found in ${selectedCategory}.`,
                "info"
            );
        }


    } catch (error) {

        console.error(
            "❌ Category filter error:",
            error
        );


        showToast(
            "Unable to filter tasks.",
            "error"
        );
    }
};


/* =========================================
   SEARCH
========================================= */

if (search) {

    search.addEventListener(
        "input",
        event => {

            currentSearch =
                event.target.value;


            /*
                IMPORTANT:

                Search current view ke
                data mein hi hoga.
            */

            applySearch();
        }
    );
}


/* =========================================
   REPORTS
========================================= */

const getReportData = () => {

    const totalTasks =
        allTodo.length;


    const completedTasks =
        allTodo.filter(
            todo =>
                String(
                    todo.status
                )
                    .toLowerCase()
                    .trim() ===
                "completed"
        );


    const pendingTasks =
        allTodo.filter(
            todo =>
                String(
                    todo.status
                )
                    .toLowerCase()
                    .trim() ===
                "pending"
        );


    const completionRate =
        totalTasks > 0
            ? Math.round(
                (
                    completedTasks.length /
                    totalTasks
                ) * 100
            )
            : 0;


    /*
        Category statistics
    */

    const categoryStats = {};


    allTodo.forEach(
        todo => {

            const categoryName =
                String(
                    todo.categories ||
                    "uncategorized"
                )
                    .toLowerCase()
                    .trim();


            if (
                !categoryStats[
                    categoryName
                ]
            ) {

                categoryStats[
                    categoryName
                ] = {
                    total: 0,
                    completed: 0,
                    pending: 0
                };
            }


            categoryStats[
                categoryName
            ].total++;


            if (
                String(todo.status)
                    .toLowerCase()
                    .trim() ===
                "completed"
            ) {

                categoryStats[
                    categoryName
                ].completed++;

            } else {

                categoryStats[
                    categoryName
                ].pending++;
            }
        }
    );


    /*
        Overdue tasks
    */

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const overdueTasks =
        allTodo.filter(
            todo => {

                if (
                    String(
                        todo.status
                    )
                        .toLowerCase()
                        .trim() ===
                    "completed"
                ) {

                    return false;
                }


                if (!todo.dueDate) {
                    return false;
                }


                const dueDate =
                    new Date(
                        todo.dueDate
                    );


                dueDate.setHours(
                    0,
                    0,
                    0,
                    0
                );


                return dueDate < today;
            }
        );


    return {

        totalTasks,

        completedTasks,

        pendingTasks,

        completionRate,

        categoryStats,

        overdueTasks
    };
};


/* =========================================
   REPORT UI
========================================= */

const renderReports = () => {

    showReportUI();


    if (!parent) {
        return;
    }


    const report =
        getReportData();


    /*
        Table header
    */

    const table =
        document.getElementById(
            "table"
        );


    if (table) {

        table.querySelector(
            "thead"
        ).innerHTML = `
            <tr>
                <th colspan="5">
                    Task Reports
                </th>
            </tr>
        `;
    }


    /*
        Report HTML
    */

    parent.innerHTML = "";


    const reportRow =
        document.createElement(
            "tr"
        );


    const reportCell =
        document.createElement(
            "td"
        );


    reportCell.colSpan =
        5;


    reportCell.innerHTML = `

        <div class="report-container">

            <div class="report-header">

                <div>
                    <span class="report-label">
                        Analytics
                    </span>

                    <h2>
                        Task Report
                    </h2>

                    <p>
                        Your complete task performance overview.
                    </p>
                </div>

                <button
                    class="report-refresh"
                    id="refreshReport"
                >
                    <i class="fa-solid fa-rotate"></i>
                    Refresh
                </button>

            </div>


            <!-- SUMMARY -->

            <div class="report-cards">

                <div class="report-card report-total">

                    <div class="report-icon">
                        <i class="fa-solid fa-list-check"></i>
                    </div>

                    <div>
                        <span>Total Tasks</span>
                        <strong>
                            ${report.totalTasks}
                        </strong>
                    </div>

                </div>


                <div class="report-card report-completed">

                    <div class="report-icon">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>

                    <div>
                        <span>Completed</span>
                        <strong>
                            ${report.completedTasks.length}
                        </strong>
                    </div>

                </div>


                <div class="report-card report-pending">

                    <div class="report-icon">
                        <i class="fa-solid fa-clock"></i>
                    </div>

                    <div>
                        <span>Pending</span>
                        <strong>
                            ${report.pendingTasks.length}
                        </strong>
                    </div>

                </div>


                <div class="report-card report-overdue">

                    <div class="report-icon">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>

                    <div>
                        <span>Overdue</span>
                        <strong>
                            ${report.overdueTasks.length}
                        </strong>
                    </div>

                </div>

            </div>


            <!-- PROGRESS -->

            <div class="report-progress-card">

                <div class="report-progress-heading">

                    <div>
                        <h3>
                            Completion Rate
                        </h3>

                        <p>
                            ${report.completedTasks.length}
                            of
                            ${report.totalTasks}
                            tasks completed
                        </p>
                    </div>

                    <strong>
                        ${report.completionRate}%
                    </strong>

                </div>


                <div class="progress-track">

                    <div
                        class="progress-bar"
                        style="
                            width:${report.completionRate}%
                        "
                    ></div>

                </div>

            </div>


            <!-- CATEGORY -->

            <div class="report-category-card">

                <div class="report-section-title">

                    <div>
                        <h3>
                            Category Performance
                        </h3>

                        <p>
                            Tasks grouped by category
                        </p>
                    </div>

                </div>


                <div class="category-report-list">

                    ${
                        renderCategoryReport(
                            report.categoryStats
                        )
                    }

                </div>

            </div>


            <!-- OVERDUE -->

            <div class="report-overdue-section">

                <div class="report-section-title">

                    <div>
                        <h3>
                            Overdue Tasks
                        </h3>

                        <p>
                            Pending tasks whose due date has passed
                        </p>
                    </div>

                </div>


                ${
                    renderOverdueTasks(
                        report.overdueTasks
                    )
                }

            </div>

        </div>
    `;


    reportRow.appendChild(
        reportCell
    );


    parent.appendChild(
        reportRow
    );


    /*
        Refresh button
    */

    const refreshButton =
        document.getElementById(
            "refreshReport"
        );


    refreshButton?.addEventListener(
        "click",
        async () => {

            await get_All();

            renderReports();
        }
    );
};


/* =========================================
   CATEGORY REPORT
========================================= */

const renderCategoryReport = (
    stats
) => {

    const entries =
        Object.entries(
            stats
        );


    if (!entries.length) {

        return `
            <div class="report-empty">
                No category data available.
            </div>
        `;
    }


    return entries
        .map(
            ([
                categoryName,
                data
            ]) => {

                const percentage =
                    data.total > 0
                        ? Math.round(
                            (
                                data.completed /
                                data.total
                            ) * 100
                        )
                        : 0;


                const prettyName =
                    categoryName
                        .charAt(0)
                        .toUpperCase() +
                    categoryName.slice(1);


                return `

                    <div class="category-report-item">

                        <div class="category-report-top">

                            <div>

                                <span class="category-name">
                                    ${escapeHtml(
                                        prettyName
                                    )}
                                </span>

                                <small>
                                    ${data.total}
                                    task${data.total !== 1 ? "s" : ""}
                                </small>

                            </div>

                            <strong>
                                ${percentage}%
                            </strong>

                        </div>


                        <div class="category-progress">

                            <div
                                style="
                                    width:${percentage}%
                                "
                            ></div>

                        </div>


                        <div class="category-report-bottom">

                            <span class="category-completed">
                                <i class="fa-solid fa-circle-check"></i>
                                ${data.completed} completed
                            </span>

                            <span class="category-pending">
                                <i class="fa-solid fa-clock"></i>
                                ${data.pending} pending
                            </span>

                        </div>

                    </div>

                `;
            }
        )
        .join("");
};


/* =========================================
   OVERDUE REPORT
========================================= */

const renderOverdueTasks = (
    tasks
) => {

    if (!tasks.length) {

        return `
            <div class="report-success">

                <i class="fa-solid fa-circle-check"></i>

                <div>
                    <strong>
                        Great job!
                    </strong>

                    <span>
                        You don't have any overdue tasks.
                    </span>
                </div>

            </div>
        `;
    }


    return `

        <div class="overdue-list">

            ${
                tasks
                    .slice(0, 10)
                    .map(
                        todo => `

                            <div class="overdue-item">

                                <div class="overdue-icon">
                                    <i class="fa-solid fa-clock"></i>
                                </div>

                                <div class="overdue-info">

                                    <strong>
                                        ${escapeHtml(
                                            todo.task ||
                                            "Untitled Task"
                                        )}
                                    </strong>

                                    <span>
                                        Due:
                                        ${formatDate(
                                            todo.dueDate
                                        )}
                                    </span>

                                </div>

                            </div>

                        `
                    )
                    .join("")
            }

        </div>

        ${
            tasks.length > 10
                ? `
                    <p class="report-more">
                        + ${tasks.length - 10}
                        more overdue tasks
                    </p>
                `
                : ""
        }
    `;
};


/* =========================================
   REPORT NAVIGATION
========================================= */

const setupReportNavigation = () => {

    const sidebarItems =
        document.querySelectorAll(
            ".sidebar li"
        );


    sidebarItems.forEach(
        item => {

            const text =
                item.innerText
                    .toLowerCase()
                    .trim();


            if (
                text.includes(
                    "reports"
                )
            ) {

                item.classList.add(
                    "report-nav"
                );


                item.addEventListener(
                    "click",
                    () => {

                        currentView =
                            "report";


                        currentSearch =
                            "";


                        if (search) {
                            search.value =
                                "";
                        }


                        renderReports();
                    }
                );
            }
        }
    );
};


/* =========================================
   REFRESH CURRENT VIEW
========================================= */

const refreshCurrentView = async () => {

    try {

        const previousView =
            currentView;


        const previousCategory =
            currentCategory;


        const previousSearch =
            currentSearch;


        /*
            Direct API request
            instead of changing view.
        */

        const token =
            getBearerToken();


        if (!token) {

            redirectToLogin();

            return;
        }


        const response =
            await fetch(
                `${baseUrl}/todo`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            token
                    }
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.status
        ) {

            throw new Error(
                data.message ||
                "Unable to refresh tasks."
            );
        }


        allTodo =
            Array.isArray(
                data.todoData
            )
                ? data.todoData
                : [];


        updateStats(
            allTodo
        );


        currentView =
            previousView;


        currentCategory =
            previousCategory;


        currentSearch =
            previousSearch;


        if (search) {

            search.value =
                previousSearch;
        }


        /*
            If report was open
        */

        if (
            previousView ===
            "report"
        ) {

            renderReports();

            return;
        }


        /*
            Otherwise apply current
            filter + search
        */

        applySearch();


    } catch (error) {

        console.error(
            "❌ Refresh error:",
            error
        );


        showToast(
            error.message ||
            "Unable to refresh.",
            "error"
        );
    }
};


/* =========================================
   LOGOUT
========================================= */

const logout = () => {

    console.log(
        "🚪 Logging out..."
    );


    clearAuth();


    window.location.replace(
        "./login.html"
    );
};


/* =========================================
   TOAST
========================================= */

const showToast = (
    message,
    type = "info"
) => {

    let container =
        document.querySelector(
            ".toast-container"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );


        container.className =
            "toast-container";


        document.body.appendChild(
            container
        );
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast toast-${type}`;


    const icon =
        type === "success"
            ? "fa-circle-check"
            : type === "error"
                ? "fa-circle-exclamation"
                : "fa-circle-info";


    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>

        <span>
            ${escapeHtml(message)}
        </span>

        <button type="button">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;


    const closeButton =
        toast.querySelector(
            "button"
        );


    closeButton.addEventListener(
        "click",
        () =>
            removeToast(toast)
    );


    container.appendChild(
        toast
    );


    setTimeout(
        () =>
            removeToast(toast),
        3500
    );
};


const removeToast = (
    toast
) => {

    if (!toast) {
        return;
    }


    toast.classList.add(
        "toast-hide"
    );


    setTimeout(
        () =>
            toast.remove(),
        250
    );
};


/* =========================================
   ESCAPE HTML
========================================= */

const escapeHtml = (
    value
) => {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;
};


/* =========================================
   BUTTON LOADING
========================================= */

const setButtonLoading = (
    button,
    loading,
    text = "Loading..."
) => {

    if (!button) {
        return;
    }


    if (loading) {

        button.dataset.originalText =
            button.innerHTML;


        button.disabled =
            true;


        button.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            ${text}
        `;


    } else {

        button.disabled =
            false;


        button.innerHTML =
            button.dataset.originalText ||
            `
                <i class="fa-solid fa-plus"></i>
                Add Task
            `;
    }
};


/* =========================================
   MOBILE SIDEBAR
========================================= */

const openMobileSidebar = () => {

    sidebar?.classList.add(
        "open"
    );


    sidebarOverlay?.classList.add(
        "show"
    );
};


const closeMobileSidebar = () => {

    sidebar?.classList.remove(
        "open"
    );


    sidebarOverlay?.classList.remove(
        "show"
    );
};


if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        openMobileSidebar
    );
}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeMobileSidebar
    );
}


/* =========================================
   INITIALIZE
========================================= */

const initializeDashboard =
    async () => {

        console.log(
            "🚀 Dashboard initializing..."
        );


        const authenticated =
            await authChack();


        if (!authenticated) {
            return;
        }


        setupReportNavigation();


        await get_All();


        console.log(
            "✅ Dashboard initialized"
        );
    };


/* =========================================
   WINDOW FUNCTIONS
========================================= */

window.category =
    category;

window.authChack =
    authChack;

window.task =
    task;

window.logout =
    logout;

window.updateTodo =
    updateTodo;

window.deletTodo =
    deletTodo;

window.get_All =
    get_All;

window.createTodo =
    createTodo;

window.renderReports =
    renderReports;

window.initializeDashboard = initializeDashboard;
/* =========================================
   START
========================================= */

// initializeDashboard();
