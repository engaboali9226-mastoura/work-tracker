let activeTasks = [];
let completedTasks = [];
let timeMode = "now";

// ضبط تاريخ اليوم في الهيدر عند تشغيل الصفحة
document.getElementById("tasksDate").innerText = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric"
});

// دالة الإرسال المركزية إلى n8n Webhook
function sendToN8N(payload) {
  const n8nUrl = "https://n8n-mq4x.onrender.com/webhook/Task Manager API";
  
  fetch(n8nUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (response.ok) {
      console.log(`[n8n] تم إرسال الأكشن (${payload.action}) بنجاح!`);
    } else {
      console.error("[n8n] السيرفر واجه مشكلة في استقبال البيانات");
    }
  })
  .catch(error => console.error("[n8n] خطأ في الاتصال بالشبكة:", error));
}

function saveTasks(){
  localStorage.setItem("activeTasks", JSON.stringify(activeTasks));
  localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
}

function loadTasks(){
  activeTasks = JSON.parse(localStorage.getItem("activeTasks")) || [];
  completedTasks = JSON.parse(localStorage.getItem("completedTasks")) || [];
  renderActiveTasks(activeTasks);
  renderCompletedTasks(completedTasks);
}

function updateRiyadhClock() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Riyadh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  document.getElementById("riyadhClock").innerText = time;
}

updateRiyadhClock();
setInterval(updateRiyadhClock, 1000);

document.addEventListener("DOMContentLoaded", () => {
  const hourWheel = document.getElementById("hourWheel");
  const minuteWheel = document.getElementById("minuteWheel");
  const periodWheel = document.getElementById("periodWheel");
  const now = new Date();

  let hour = now.toLocaleString("en-US", { timeZone:"Asia/Riyadh", hour:"numeric", hour12:true });
  hour = parseInt(hour);

  const minute = now.toLocaleString("en-US", { timeZone:"Asia/Riyadh", minute:"2-digit" });

  const period = now.toLocaleString("en-US", { timeZone:"Asia/Riyadh", hour:"numeric", hour12:true }).includes("PM") ? "PM" : "AM";

  // بناء عناصر الساعات
  for(let i = 1; i <= 12; i++){
    const item = document.createElement("div");
    item.className = "wheel-item";
    item.innerText = i.toString().padStart(2,"0");
    hourWheel.appendChild(item);
  }

  // بناء عناصر الدقائق
  for(let i = 0; i < 60; i++){
    const item = document.createElement("div");
    item.className = "wheel-item";
    item.innerText = i.toString().padStart(2,"0");
    minuteWheel.appendChild(item);
  }

  setTimeout(() => {
    hourWheel.scrollTop = (hour - 1) * 36;
    minuteWheel.scrollTop = parseInt(minute) * 36;
    periodWheel.scrollTop = period === "PM" ? 36 : 0;

    highlightActiveItem(hourWheel);
    highlightActiveItem(minuteWheel);
    highlightActiveItem(periodWheel);
  }, 100);

  const wheels = [hourWheel, minuteWheel, periodWheel];
  wheels.forEach(wheel => {
    wheel.addEventListener("scroll", () => highlightActiveItem(wheel));
    wheel.addEventListener("wheel", (e) => {
      e.preventDefault();
      const itemHeight = 36;
      const direction = e.deltaY > 0 ? 1 : -1;
      wheel.scrollTop += direction * itemHeight;
    }, { passive:false });
    setTimeout(() => highlightActiveItem(wheel), 100);
  });

  loadTasks();
});

function highlightActiveItem(wheel){
  const items = wheel.querySelectorAll(".wheel-item");
  const wheelRect = wheel.getBoundingClientRect();
  const wheelCenter = wheelRect.top + (wheelRect.height / 2);

  items.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const itemCenter = itemRect.top + (itemRect.height / 2);
    if(Math.abs(wheelCenter - itemCenter) < 22){
      item.style.opacity = "1";
      item.style.transform = "scale(1.1)";
    } else {
      item.style.opacity = ".25";
      item.style.transform = "scale(1)";
    }
  });
}

function getSelectedValue(wheelId){
  const wheel = document.getElementById(wheelId);
  const items = wheel.querySelectorAll(".wheel-item");
  const wheelRect = wheel.getBoundingClientRect();
  const wheelCenter = wheelRect.top + (wheelRect.height / 2);

  let selectedValue = "";
  let closestDistance = Infinity;

  items.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const itemCenter = itemRect.top + (itemRect.height / 2);
    const distance = Math.abs(wheelCenter - itemCenter);
    if(distance < closestDistance){
      closestDistance = distance;
      selectedValue = item.innerText;
    }
  });
  return selectedValue;
}

function getCustomTime(){
  if(timeMode === "now") return "";
  const hour = getSelectedValue("hourWheel");
  const minute = getSelectedValue("minuteWheel");
  const period = getSelectedValue("periodWheel");
  return `${hour}:${minute} ${period}`;
}

function setMode(mode){
  timeMode = mode;
  document.getElementById("nowBtn").classList.remove("active");
  document.getElementById("customBtn").classList.remove("active");

  if(mode === "now"){
    document.getElementById("nowBtn").classList.add("active");
    document.getElementById("currentTimeBox").style.display = "block";
    document.getElementById("customTimeWrapper").style.display = "none";
  } else {
    document.getElementById("customBtn").classList.add("active");
    document.getElementById("currentTimeBox").style.display = "none";
    document.getElementById("customTimeWrapper").style.display = "block";

    setTimeout(() => {
      highlightActiveItem(document.getElementById("hourWheel"));
      highlightActiveItem(document.getElementById("minuteWheel"));
      highlightActiveItem(document.getElementById("periodWheel"));
    }, 120);
  }
}

function showToast(message, type = "success"){
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast";
  toast.classList.add(type);

  setTimeout(() => { toast.classList.add("show"); }, 10);
  setTimeout(() => { toast.classList.remove("show"); }, 3000);
}

// 🟢 زرار الحضور وبدء المهمة
async function startTask(){
  const taskName = document.getElementById("taskName").value.trim();
  const site = document.getElementById("taskSite").value.trim();
  const category = document.getElementById("taskCategory").value;

  if(!taskName){
    showToast("Enter task name", "warning");
    return;
  }

  // تجهيز الـ Payload لـ n8n
  const payload = {
    action: "start",
    timeType: timeMode === "now" ? "current" : "custom",
    taskName,
    site,
    category,
    customTime: getCustomTime()
  };

  // إرسال البيانات فوراً للـ Webhook
  sendToN8N(payload);

  const startTime = payload.customTime || new Date().toLocaleTimeString("en-US", {
      timeZone:"Asia/Riyadh",
      hour:"2-digit",
      minute:"2-digit",
      hour12:true
  });

  const task = {
    id: Date.now(),
    taskName,
    site,
    category,
    startTime,
    notes:""
  };

  activeTasks.push(task);
  saveTasks();
  renderActiveTasks(activeTasks);
  showToast("Task Started", "success");

  document.getElementById("taskName").value = "";
  document.getElementById("taskSite").value = "";
}

function renderActiveTasks(tasks){
  const container = document.getElementById("activeTasks");
  if(!tasks.length){
    container.innerHTML = `<div class="row"><span>No active tasks</span></div>`;
    return;
  }

  container.innerHTML = tasks.map(task => `
    <div class="task-card">
      <div class="task-header">${task.taskName}</div>
      <div class="task-meta">📍 ${task.site || "--"}</div>
      <div class="task-meta">🏷️ ${task.category || "--"}</div>
      <div class="task-meta">🕒 Started: ${task.startTime || "--"}</div>
      <div class="task-actions">
        <button class="task-btn notes-btn" onclick="addNote('${task.id}')">Note</button>
        <button class="task-btn finish-btn" onclick="finishTask('${task.id}')">Finish</button>
      </div>
    </div>
  `).join("");
}

function renderCompletedTasks(tasks){
  const container = document.getElementById("completedTasks");
  if(!tasks.length){
    container.innerHTML = `<div class="row"><span>No completed tasks</span></div>`;
    return;
  }
  container.innerHTML = tasks.map(task => `
    <div class="task-card">
      <strong>${task.taskName}</strong><br>
      <small>${task.duration}</small>
    </div>
  `).join("");
}

function addNote(taskId){
  const note = prompt("Task Note");
  if(!note) return;
  const task = activeTasks.find(t => t.id == taskId);
  if(task){
    task.notes = note;
    showToast("Note Saved", "success");
  }
}

// 🔴 زرار الانصراف وإنهاء المهمة
async function finishTask(taskId){
  const taskIndex = activeTasks.findIndex(t => t.id == taskId);
  if(taskIndex === -1) return;

  const task = activeTasks[taskIndex];

  // تجهيز الـ Payload بناءً على التوقيت المختار لحظة الضغط على إنهاء
  const payload = {
    action: "end",
    timeType: timeMode === "now" ? "current" : "custom",
    taskName: task.taskName,
    site: task.site,
    category: task.category,
    customTime: getCustomTime()
  };

  // إرسال البيانات فوراً للـ Webhook
  sendToN8N(payload);

  task.duration = "Finished";
  completedTasks.push(task);
  activeTasks.splice(taskIndex, 1);

  saveTasks();
  renderActiveTasks(activeTasks);
  renderCompletedTasks(completedTasks);
  showToast("Task Completed", "success");
}
