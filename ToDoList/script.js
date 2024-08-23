var new_task = document.querySelector(".new-task");
const inputs = document.querySelectorAll('.input');
const textArea = document.querySelector('textarea');
const submit = document.getElementById('submit');
const todo = document.getElementById('todo');
const doing = document.getElementById('doing');
const completed = document.getElementById('completed');
const blocked = document.getElementById('blocked');
const items = document.getElementsByClassName("task-item");
new_task.addEventListener('click', () => {
    document.getElementById('box-title').textContent = 'Add new todo';
    document.querySelector(".edit-status").style.display = 'none';
    document.querySelector(".box").style.display = 'block';
})
// document.querySelector(".logout").addEventListener('click',()=>{
//     window.location.href='/TODO_APP/login/index.html';
// })
document.querySelector(".close").addEventListener('click', closeBox)
document.querySelector(".box").addEventListener('click', closeBox)
document.querySelector(".box-add").addEventListener('click', () => {
    event.stopPropagation();
})
var _id = -1;
function closeBox() {
    _id = -1;
    document.querySelector(".box").style.display = 'none';
    document.body.style.overflow = 'auto';
    inputs.forEach(input => {
        input.classList = [];
        input.value = '';
    });
    textArea.classList = [];
    textArea.value = '';
}
inputs.forEach((input) => {
    input.addEventListener('blur', () => {
        checkInput(input);
    })
})
textArea.addEventListener('blur', () => {
    checkInput(textArea)
})
submit.addEventListener('click', () => {
    if (checkSubmit()) {
        if (_id >= 0) {
            updateTask();
        } else {
            addTodo();
        }
        refresh();
        closeBox();
    } else {
        showToast({
            title: 'Error',
            message: 'Please fill in all the required fields!',
            type: 'error',
            duration: 3000
        });
    }
})
function checkSubmit() {
    let inputValid = true;
    inputs.forEach(input => {
        if (!checkInput(input)) {
            inputValid = false;
        }
    })
    let textAreaValid = checkInput(textArea);
    return inputValid && textAreaValid;
}
function checkInput(input) {
    const text = input.value;
    if (text == "") {
        input.classList.remove('valid');
        input.classList.add('invalid');
        return false;
    } else {
        input.classList.remove('invalid');
        input.classList.add('valid')
        return true;
    }
}

function getListTasks() {
    if (localStorage.getItem("tasks")) {
        return JSON.parse(localStorage.getItem("tasks"));
    } else {
        return [];
    }
}
function saveTask(todoList) {
    localStorage.setItem('tasks', JSON.stringify(todoList))
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

const statusTask = {
    Todo: "Todo",
    Doing: "Doing",
    Completed: "Completed",
    Blocked: "Blocked"
};
function Task(idTask, category, title, content, datetime, taskStatus, reminderTime, lastReminderTime, reminderTriggered) {
    this.idTask = idTask;
    this.category = category;
    this.title = title;
    this.content = content;
    this.datetime = formatDate(datetime);
    this.taskStatus = taskStatus;
    this.reminderTime = reminderTime; // Thời gian nhắc nhở ban đầu
    this.lastReminderTime = lastReminderTime; // Thời gian nhắc nhở cuối cùng
    this.reminderTriggered = reminderTriggered; // Đánh dấu nhắc nhở đã được kích hoạt
}


function showToast({
    title = '',
    message = '',
    type = 'info',
    duration = 3000
}) {
    const main = document.getElementById('toast');
    const icons = {
        success: 'fas fa-circle-check',
        error: 'fas fa-triangle-exclamation',
        update: 'fa-regular fa-pen-to-square',
        cancel: 'fa-solid fa-ban',
        reminder: 'fa-solid fa-bell'
    }
    const icon = icons[type];
    const delay = (duration / 1000).toFixed(2);
    if (main) {
        const toast = document.createElement('div');

        // auto remove
        setTimeout(function () {
            main.removeChild(toast);
        }, duration + 1000);

        // remove when clicked
        toast.onclick = function (e) {
            if (e.target.closest('.toast__close')) {
                main.removeChild(toast);
            }
        };

        toast.classList.add('toast', `toast--${type}`);
        toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`;
        toast.innerHTML = `
            <div class="toast__icon">
                <i class="${icon}"></i>
            </div>
    
            <div class="toast__body">
                <div class="toast__title">${title}</div>
                <div class="toast__message">${message}</div>
            </div>
            <div class="toast__close">
                <i class="fas fa-times"></i>
            </div>
        `;
        main.appendChild(toast);
    }
}

function addTodo() {
    const todoList = getListTasks();
    const category = document.getElementById('category').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const reminderTime = new Date(document.getElementById('reminder').value).getTime();
    const task = new Task(todoList.length, category, title, content, Date.now(), statusTask.Todo, reminderTime, reminderTime, false);
    todoList.push(task);
    saveTask(todoList);

    showToast({
        title: 'Success',
        message: 'Successfully created a new to-do item!',
        type: 'success',
        duration: 3000
    });
}



var itemTemplate = (data) => {
    return `<div class="task-item" draggable="true">
        <span style="display: none;" id="idTask">${data.idTask}</span>
        <div class="task-title">
            <div>
                <span class="task-category">${data.category}</span>
                <h3>${data.title}</h3>
            </div>
            <div class="task-action">
                <img src="./assets/img/update.png" alt="update" onclick=displayEdit(${data.idTask})>
                <img src="./assets/img/delete.png" alt="delete" id="delete" onclick=deltask(${data.idTask})>
            </div>
        </div>
        <div class="task-des">
            <p>${data.content}</p>
            <span class="time"><img src="./assets/img/clock.png" alt="clock">${data.datetime}</span></br>
            <span class="reminder-time"><img src="./assets/img/alarm.png" alt="alarm" width = "24" height = "24">${formatDate(data.reminderTime)}</span></br>
        </div>
    </div>`;
}

function refresh() {
    var txt_todo = "";
    let countTodo = 0;
    var txt_doing = "";
    let countDoing = 0;
    var txt_completed = "";
    let countCompleted = 0;
    var txt_blocked = "";
    let countBlocked = 0;
    const task = getListTasks();
    task.forEach((t) => {
        switch (t.taskStatus) {
            case "Todo":
                countTodo++;
                txt_todo += itemTemplate(t);
                break;
            case "Doing":
                countDoing++;
                txt_doing += itemTemplate(t);
                break;
            case "Completed":
                countCompleted++;
                txt_completed += itemTemplate(t);
                break;
            case "Blocked":
                countBlocked++;
                txt_blocked += itemTemplate(t);
                break;
        }
    })
    todo.innerHTML = txt_todo;
    doing.innerHTML = txt_doing;
    completed.innerHTML = txt_completed;
    blocked.innerHTML = txt_blocked;
    document.getElementById('countTodo').textContent = countTodo;
    document.getElementById('countDoing').textContent = countDoing;
    document.getElementById('countCompleted').textContent = countCompleted;
    document.getElementById('countBlocked').textContent = countBlocked;
}
refresh();

function createConfirmModal() {
    const modal = document.createElement('div');
    modal.id = 'confirm-modal';
    modal.className = 'confirm-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'confirm-modal-content';

    const message = document.createElement('p');
    message.textContent = 'Are you sure you want to delete this item?';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'confirm-button-container';

    const okButton = document.createElement('button');
    okButton.id = 'confirm-ok';
    okButton.className = 'confirm-button confirm-button-ok';
    okButton.textContent = 'OK';

    const cancelButton = document.createElement('button');
    cancelButton.id = 'confirm-cancel';
    cancelButton.className = 'confirm-button confirm-button-cancel';
    cancelButton.textContent = 'Cancel';

    buttonContainer.appendChild(okButton);
    buttonContainer.appendChild(cancelButton);

    modalContent.appendChild(message);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);

    return {
        modal,
        okButton,
        cancelButton
    };
}

function showConfirmModal(callback) {
    const { modal, okButton, cancelButton } = createConfirmModal();

    modal.style.display = 'flex';

    okButton.onclick = function () {
        modal.style.display = 'none';
        callback(true);
        document.body.removeChild(modal);
    };

    cancelButton.onclick = function () {
        modal.style.display = 'none';
        callback(false);
        document.body.removeChild(modal);
    };
}

let taskIdToDelete = null;

function deltask(id) {
    taskIdToDelete = id;
    showConfirmModal(function (confirmed) {
        if (confirmed) {
            let task = getListTasks();
            task = task.filter((value) => value.idTask != taskIdToDelete);
            saveTask(task);
            refresh();

            showToast({
                title: 'Success',
                message: 'Item has been successfully deleted!',
                type: 'success',
                duration: 3000
            });
        } else {
            showToast({
                title: 'Cancelled',
                message: 'Deletion of the item was canceled.',
                type: 'cancel',
                duration: 3000
            });
        }
    });
}

function displayEdit(id) {
    _id = id;
    document.getElementById('box-title').textContent = 'Edit to do';
    document.querySelector(".edit-status").style.display = 'flex';
    document.querySelector(".box").style.display = 'block';
    let tasks = getListTasks();
    let task = tasks.find(task => task.idTask == id);
    if (task) {
        document.getElementById('category').value = task.category;
        document.getElementById('title').value = task.title;
        document.getElementById('content').value = task.content;
        document.querySelectorAll("input[name=status]").forEach((radio) => {
            if (radio.value == task.taskStatus) {
                radio.checked = true;
            }
        });
    }
}
function updateTask() {
    let tasks = getListTasks();
    let task = tasks.find(task => task.idTask == _id);
    task.category = document.getElementById('category').value;
    task.title = document.getElementById('title').value;
    task.content = document.getElementById('content').value;
    task.taskStatus = document.querySelector('input[name=status]:checked').value;
    task.reminderTime = new Date(document.getElementById('reminder').value).getTime(); // Cập nhật thời gian nhắc nhở
    task.lastReminderTime = task.reminderTime; // Cập nhật thời gian nhắc nhở cuối cùng
    task.reminderTriggered = false; // Đánh dấu nhắc nhở chưa được kích hoạt

    const index = tasks.findIndex(task => task.idTask == _id);
    tasks[index] = task;
    saveTask(tasks);

    showToast({
        title: 'Update',
        message: 'Successfully updated the to-do item!',
        type: 'update',
        duration: 3000
    });
}

let selected = null;

for (const item of items) {
    item.addEventListener("dragstart", e => {
        selected = e.target;
    });
}
todo.addEventListener("dragover", e => {
    e.preventDefault();
});
todo.addEventListener("drop", e => {
    if (selected != null) {
        todo.appendChild(selected);
        updateStatus(getIdTask(selected), statusTask.Todo);
        selected = null;
    }
});
doing.addEventListener("dragover", e => {
    e.preventDefault();
});
doing.addEventListener("drop", e => {
    if (selected != null) {
        doing.appendChild(selected);
        console.log(selected);
        updateStatus(getIdTask(selected), statusTask.Doing);
        selected = null;
    }
});
completed.addEventListener("dragover", e => {
    e.preventDefault();
});
completed.addEventListener("drop", e => {
    if (selected != null) {
        completed.appendChild(selected);
        updateStatus(getIdTask(selected), statusTask.Completed);
        selected = null;
    }
});
blocked.addEventListener("dragover", e => {
    e.preventDefault();
});
blocked.addEventListener("drop", e => {
    if (selected != null) {
        blocked.appendChild(selected);
        console.log(selected);
        updateStatus(getIdTask(selected), statusTask.Blocked);
        selected = null;
    }
});
function getIdTask(selectedItem) {
    return selectedItem.querySelector('#idTask').textContent;
}
function updateStatus(__idItem, __status) {
    let __tasks = getListTasks();
    let __task = __tasks.find(ta => ta.idTask == __idItem);
    const __idnex = __tasks.findIndex(task => task.idTask == _id);
    __task.taskStatus = __status;
    __tasks[__idnex] = __task;
    saveTask(__tasks);
    window.location.reload();
}

function checkReminders() {
    const now = Date.now();
    const tasks = getListTasks();

    tasks.forEach(task => {
        // Chỉ kiểm tra các nhiệm vụ trong trạng thái "Todo"
        if (task.taskStatus === statusTask.Todo) {
            // Kiểm tra thời gian nhắc nhở
            if (now >= new Date(task.reminderTime).getTime() && !task.reminderTriggered) {
                showToast({
                    title: 'Reminder',
                    message: `Reminder for task: ${task.title}`,
                    type: 'reminder',
                    duration: 3000
                });

                task.reminderTriggered = true; // Đánh dấu nhắc nhở đã được kích hoạt
                saveTask(tasks);
            }

            // Kiểm tra thời gian nhắc nhở lại
            const lastReminderTime = new Date(task.lastReminderTime).getTime();
            const reminderInterval = 5 * 60 * 1000; // 5 phút

            if (task.reminderTriggered && (now - lastReminderTime >= reminderInterval)) {
                showToast({
                    title: 'Reminder',
                    message: `Reminder for task: ${task.title}`,
                    type: 'reminder',
                    duration: 3000
                });

                // Cập nhật thời gian nhắc nhở cuối cùng
                task.lastReminderTime = now;
                saveTask(tasks);
            }
        }
    });
}


setInterval(checkReminders, 60000);
