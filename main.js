let tasks = JSON.parse(localStorage.getItem('calendarTasks')) || [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;

const calendarDays = document.getElementById('calendarDays');
const monthDisplay = document.getElementById('monthDisplay');
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const selectedDateText = document.getElementById('selectedDateText');

function renderCalendar() {
    calendarDays.innerHTML = '';
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    monthDisplay.innerText = `${monthNames[currentMonth]} ${currentYear}`;

    for (let i = 0; i < firstDay; i++) { calendarDays.innerHTML += `<div></div>`; }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${currentMonth + 1}-${day}`;
        const hasTask = tasks.some(t => t.date === dateStr);
        const activeClass = selectedDate === dateStr ? 'active' : '';

        calendarDays.innerHTML += `
            <div class="day ${activeClass}" onclick="selectDate('${dateStr}')">
                <span>${day}</span>
                ${hasTask ? '<div class="dot"></div>' : ''}
            </div>`;
    }
}

// Requirement: Form visible only when date is clicked
window.selectDate = (date) => {
    selectedDate = date;
    const displayDate = new Date(date).toDateString();
    selectedDateText.innerText = `Tasks for: ${displayDate}`;

    // Show form
    taskForm.classList.remove('hidden');

    renderCalendar();
    renderTasks();
};

taskForm.onsubmit = (e) => {
    e.preventDefault();

    // Fix: Capturing all fields including Description
    const newTask = {
        id: Date.now(),
        date: selectedDate,
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDesc').value, // Description field
        priority: document.getElementById('taskPriority').value,
        time: document.getElementById('taskTime').value || "No time",
        status: 'pending'
    };

    tasks.push(newTask);
    save();
    e.target.reset();
};

function renderTasks(filter = 'all') {
    taskList.innerHTML = '';

    // Step 1: Pehle selected date ke tasks nikalna
    // Step 2: Phir filter check karna (all, pending, ya completed)
    const filtered = tasks.filter(t => {
        const isSameDate = t.date === selectedDate;
        if (filter === 'all') return isSameDate;
        return isSameDate && t.status === filter;
    });

    if (filtered.length === 0) {
        taskList.innerHTML = `<p class="empty-msg">No ${filter} tasks found.</p>`;
        return;
    }

    // Step 3: Tasks ko display karna
    filtered.forEach(t => {
        const isDone = t.status === 'completed';

        taskList.innerHTML += `
            <div class="task-item ${isDone ? 'completed-task' : ''}">
                <div class="task-info">
                    <h4>${t.title}</h4>
                    <p>${t.description}</p>
                    <small>⏰ ${t.time} | 🔥 ${t.priority}</small>
                </div>
                <div class="task-actions">
                    <button onclick="toggleStatus(${t.id})" class="btn-check">
                        ${isDone ? '🔄' : '✔️'} 
                    </button>
                    <button onclick="deleteTask(${t.id})" class="btn-delete">🗑️</button>
                </div>
            </div>`;
    });
}

// Filter buttons ke liye active class switch karna
window.filterTasks = (type) => {
    // Buttons ka color change karne ke liye
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Tasks ko filter karke dikhana
    renderTasks(type === 'completed' ? 'completed' : (type === 'pending' ? 'pending' : 'all'));
};
window.toggleStatus = (id) => {
    tasks = tasks.map(t => t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t);
    save();
};

window.deleteTask = (id) => {
    tasks = tasks.filter(t => t.id !== id);
    save();
};

window.filterTasks = (type) => {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderTasks(type);
};

function save() {
    localStorage.setItem('calendarTasks', JSON.stringify(tasks));
    renderCalendar();
    renderTasks();
}

// Nav buttons
document.getElementById('prevMonth').onclick = () => { currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } renderCalendar(); };

renderCalendar();