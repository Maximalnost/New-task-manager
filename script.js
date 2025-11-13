const app = document.querySelector("#app");
const taskData = JSON.parse(localStorage.getItem("taskData")) || {};
const priorityColors = {
  low: "text-[#4FB286]",
  medium: "text-[#eca72c]",
  important: "text-[#C1666B]",
};
let currentUser;

const authMarkup = `
      <div class="flex items-center flex-col w-full max-w-[475px] max-h-[260px] w-[100%] h-[100%]
      m-auto mt-25 p-[25px] rounded-xl border border-solid font-['Geist'] text-[#292929] bg-white shadow-xl" id="auth-form">
          <h1 class="text-center font-semibold text-2xl md:text-4xl lg:text-5xl">Task Manager</h1>
          <p class="text-lg mt-5">Get started</p>
          <input type="text" placeholder="Your name" class="border rounded-xl w-full max-w-[235px] h-9 pl-3 mt-5" id="username-input">
          <button class="mt-3 bg-[#6883ba] hover:bg-[#5a76b0] rounded-xl w-20 h-9 cursor-pointer text-white" id="login-btn">Login</button>
      </div>
  `;

const appMarkup = (currentUser) => `
      <div class="flex place-self-center rounded-xl w-full max-w-[475px] max-h-[260px] mt-25 border flex-col bg-white font-['Geist'] text-[#292929] p-[25px] shadow-xl" id="app-form">
          <div class="flex" id="task-header">
          <h2 class="font-semibold text-2xl" id="welcome-text">Hello, <span class="text-2xl text-[#6883ba]">${currentUser}</span></h2>
          <button class="bg-[#C2C2C2] hover:bg-[#B8B8B8] ml-auto rounded-xl w-20 h-9 " id="logout-btn">Logout</button>
          </div>
      <form class="flex place-content-between mt-5 flex-wrap gap-2 sm:gap-0" id="task-form">
          <input class="border rounded-xl pl-3" id='task-input' type="text" placeholder="Enter your task...">
          <select class="border rounded-xl" id="task-priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="important">Important</option>
          </select>
          <button class="bg-[#6883ba] hover:bg-[#5a76b0] rounded-xl w-20 h-9 cursor-pointer text-white" id="add-btn" type="submit">Add task</button>
      </form>
      </div>
      <div class="flex place-self-center rounded-xl w-full max-w-[475px] mt-5 mb-5 border flex-col bg-white font-['Geist'] text-[#292929] p-[25px] shadow-xl" id="tasks-wrapper">
          <ul class="" id="task-list"></ul>
      </div>
  `;
//  ОБРАБОТЧИКИ
app.addEventListener("click", (e) => {
  if (e.target.matches("#login-btn")) login();
  if (e.target.matches("#logout-btn")) logout();
  if (e.target.closest(".delete-btn"));
  if (e.target.closest("#task-list")) taskControls(e.target);
});

app.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.matches("#task-form")) {
    addTask(e);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    getCurrentUser(savedUser);
    render(appMarkup(currentUser));
    tasksRender(currentUser);
  } else {
    render(authMarkup);
  }
});

//  РЕНДЕР ИНТЕРФЕЙСОВ
const render = (markup) => {
  app.innerHTML = "";
  app.insertAdjacentHTML("afterbegin", markup);
};

//  АВТОРИЗАЦИЯ
const login = () => {
  const usernameInput = document.querySelector("#username-input");
  getCurrentUser(usernameInput.value.trim());
  if (!currentUser) {
    inputError(usernameInput);
  } else {
    localStorage.setItem("currentUser", currentUser);
    if (currentUser in taskData) {
      render(appMarkup(currentUser));
      tasksRender(currentUser);
    } else {
      taskData[currentUser] = [];
      localStorage.setItem("taskData", JSON.stringify(taskData));
      render(appMarkup(currentUser));
      tasksRender(currentUser);
    }
  }
};

// ВЫХОД
const logout = () => {
  localStorage.removeItem("currentUser");
  render(authMarkup);
};

// ДОБАВЛЕНИЕ ТАСКИ
const addTask = (e) => {
  e.preventDefault();
  const taskInput = document.querySelector("#task-input");
  prioritySelect = document.querySelector("#task-priority");
  taskName = taskInput.value.trim();
  taskPriority = prioritySelect.value;

  if (taskName) {
    const taskId = Date.now();
    const task = {
      id: taskId,
      title: taskName,
      priority: taskPriority,
      taskStatus: false,
    };

    taskData[currentUser].unshift(task);
    localStorage.setItem("taskData", JSON.stringify(taskData));
    taskInput.value = "";
    tasksRender(currentUser);
  } else {
    inputError(taskInput);
  }
};

//  УПРАВЛЕНИЕ ТАСКАМИ
const taskControls = (el) => {
  const li = el.closest("li");
  if (!li) return;
  const taskId = Number(li.dataset.id);
  const task = taskData[currentUser].find((task) => task.id === taskId);

  if (el.closest(".delete-btn")) {
    taskData[currentUser] = taskData[currentUser].filter(
      (task) => task.id !== taskId
    );
  }

  if (el.matches(".status-toggle")) {
    if (task) {
      task.taskStatus = !task.taskStatus;
    }
  }

  if (el.closest(".rename-btn")) {
    const newTitle = prompt("Измените текст задачи:");
    if (newTitle.trim()) {
      task.title = newTitle;
    } 
  }

  localStorage.setItem("taskData", JSON.stringify(taskData));
  tasksRender(currentUser);
};

//  АНИМАЦИЯ ОШИБКИ ВВОДА
const inputError = (el) => {
  el.classList.add("animate-shake", "border-[#ea2b1f]");
  setTimeout(() => {
    el.classList.remove("animate-shake", "border-[#ea2b1f]");
  }, 500);
};

//  ПОЛУЧЕНИЕ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
const getCurrentUser = (user) => {
  if (user !== undefined) {
    currentUser = user;
    if (user) {
      localStorage.setItem("currentUser", user);
    } else {
      localStorage.removeItem("currentUser");
    }
  }
  return currentUser;
};

//  РЕНДЕР ТАСКОВ
const tasksRender = (currentUser) => {
  let tasks = [...taskData[currentUser]];
  const taskList = document.querySelector("#task-list");
  taskList.innerHTML = "";
  console.log(tasks.length);
  if (tasks.length === 0) {
    const noTasksEl = document.createElement("p");
    noTasksEl.className = "text-center font-semibold text-xl animate-bounce";
    noTasksEl.textContent = "No tasks yet";
    taskList.append(noTasksEl);
    setTimeout(() => {
      noTasksEl.classList.remove("animate-bounce");
    }, 1500);
  } else {
    tasks.forEach((el) => {
      taskList.insertAdjacentHTML(
        "beforeend",
        `
      <li data-id="${
        el.id
      }" class="flex p-3 items-center hover:bg-[#EBEBEB] hover:rounded-xl">
          <span class="task-title text-ellipsis max-w-2/3 overflow-hidden ${
            el.taskStatus
              ? "line-through text-[#A3A3A3]"
              : priorityColors[el.priority]
          }"">${el.title}</span>
          <div class="ml-auto flex items-center gap-1">   
            <input type="checkbox" class="status-toggle w-[20px] h-[20px] accent-[#6883ba]" ${
              el.taskStatus ? "checked" : ""
            }>
            <button class="rename-btn">
              <svg class="fill-[#292929] hover:fill-[#525252]" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path d="M5 19h1.425L16.2 9.225L14.775 7.8L5 17.575zm-1 2q-.425 0-.712-.288T3 20v-2.425q0-.4.15-.763t.425-.637L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.437.65T21 6.4q0 .4-.138.763t-.437.662l-12.6 12.6q-.275.275-.638.425t-.762.15zM19 6.4L17.6 5zm-3.525 2.125l-.7-.725L16.2 9.225z"/></svg>
            </button>
            <button class="delete-btn">
              <svg class="fill-[#292929] hover:fill-[#525252]" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path d="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM7 6v13zm5 7.9l1.9 1.9q.275.275.7.275t.7-.275t.275-.7t-.275-.7l-1.9-1.9l1.9-1.9q.275-.275.275-.7t-.275-.7t-.7-.275t-.7.275L12 11.1l-1.9-1.9q-.275-.275-.7-.275t-.7.275t-.275.7t.275.7l1.9 1.9l-1.9 1.9q-.275.275-.275.7t.275.7t.7.275t.7-.275z"/></svg>
            </button>
          </div>
      </li>
    `
      );
    });
  }
};
