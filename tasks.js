let timeMode = "now";

document.getElementById("tasksDate").innerText =
  new Date().toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );

function updateRiyadhClock() {

  const now = new Date();

  const time =
    now.toLocaleTimeString(
      "en-US",
      {
        timeZone: "Asia/Riyadh",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }
    );

  document.getElementById(
    "riyadhClock"
  ).innerText = time;

}

updateRiyadhClock();

setInterval(
  updateRiyadhClock,
  1000
);

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const hourWheel =
      document.getElementById(
        "hourWheel"
      );

    const minuteWheel =
      document.getElementById(
        "minuteWheel"
      );

    const periodWheel =
      document.getElementById(
        "periodWheel"
      );

    for(let i = 1; i <= 12; i++){

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "wheel-item";

      item.innerText =
        i.toString()
         .padStart(2,"0");

      hourWheel.appendChild(item);

    }

    for(let i = 0; i < 60; i++){

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "wheel-item";

      item.innerText =
        i.toString()
         .padStart(2,"0");

      minuteWheel.appendChild(item);

    }

    const wheels = [
      hourWheel,
      minuteWheel,
      periodWheel
    ];

    wheels.forEach(wheel => {

      wheel.addEventListener(
        "scroll",
        () => highlightActiveItem(wheel)
      );

      wheel.addEventListener(
        "wheel",
        (e) => {

          e.preventDefault();

          const itemHeight = 36;

          const direction =
            e.deltaY > 0 ? 1 : -1;

          wheel.scrollTop +=
            direction * itemHeight;

        },
        { passive:false }
      );

      setTimeout(
        () => highlightActiveItem(wheel),
        100
      );

    });

  }
);

function highlightActiveItem(wheel){

  const items =
    wheel.querySelectorAll(
      ".wheel-item"
    );

  const wheelRect =
    wheel.getBoundingClientRect();

  const wheelCenter =
    wheelRect.top +
    (wheelRect.height / 2);

  items.forEach(item => {

    const itemRect =
      item.getBoundingClientRect();

    const itemCenter =
      itemRect.top +
      (itemRect.height / 2);

    if(
      Math.abs(
        wheelCenter - itemCenter
      ) < 22
    ){

      item.style.opacity = "1";

      item.style.transform =
        "scale(1.1)";

    }else{

      item.style.opacity = ".25";

      item.style.transform =
        "scale(1)";

    }

  });

}

function getSelectedValue(wheelId){

  const wheel =
    document.getElementById(
      wheelId
    );

  const items =
    wheel.querySelectorAll(
      ".wheel-item"
    );

  const wheelRect =
    wheel.getBoundingClientRect();

  const wheelCenter =
    wheelRect.top +
    (wheelRect.height / 2);

  let selectedValue = "";

  let closestDistance =
    Infinity;

  items.forEach(item => {

    const itemRect =
      item.getBoundingClientRect();

    const itemCenter =
      itemRect.top +
      (itemRect.height / 2);

    const distance =
      Math.abs(
        wheelCenter - itemCenter
      );

    if(distance < closestDistance){

      closestDistance =
        distance;

      selectedValue =
        item.innerText;

    }

  });

  return selectedValue;

}
    function getCustomTime(){

  if(timeMode === "now")
    return "";

  const hour =
    getSelectedValue(
      "hourWheel"
    );

  const minute =
    getSelectedValue(
      "minuteWheel"
    );

  const period =
    getSelectedValue(
      "periodWheel"
    );

  return `${hour}:${minute} ${period}`;

}

function setMode(mode){

  timeMode = mode;

  document
    .getElementById("nowBtn")
    .classList.remove("active");

  document
    .getElementById("customBtn")
    .classList.remove("active");

  if(mode === "now"){

    document
      .getElementById("nowBtn")
      .classList.add("active");

    document
      .getElementById("currentTimeBox")
      .style.display = "block";

    document
      .getElementById("customTimeWrapper")
      .style.display = "none";

  }else{

    document
      .getElementById("customBtn")
      .classList.add("active");

    document
      .getElementById("currentTimeBox")
      .style.display = "none";

    document
      .getElementById("customTimeWrapper")
      .style.display = "block";

    setTimeout(() => {

      highlightActiveItem(
        document.getElementById(
          "hourWheel"
        )
      );

      highlightActiveItem(
        document.getElementById(
          "minuteWheel"
        )
      );

      highlightActiveItem(
        document.getElementById(
          "periodWheel"
        )
      );

    },120);

  }

}

function showToast(
  message,
  type = "success"
){

  const toast =
    document.getElementById(
      "toast"
    );

  toast.textContent =
    message;

  toast.className =
    "toast";

  toast.classList.add(type);

  setTimeout(() => {

    toast.classList.add(
      "show"
    );

  },10);

  setTimeout(() => {

    toast.classList.remove(
      "show"
    );

  },3000);

}

async function startTask(){

  const taskName =
    document
      .getElementById(
        "taskName"
      )
      .value
      .trim();

  const site =
    document
      .getElementById(
        "taskSite"
      )
      .value
      .trim();

  const category =
    document
      .getElementById(
        "taskCategory"
      )
      .value;

  if(!taskName){

    showToast(
      "Enter task name",
      "warning"
    );

    return;

  }

  const payload = {

    action:"start",

    taskName,

    site,

    category,

    customTime:
      getCustomTime()

  };

  console.log(
    "Task Payload",
    payload
  );

  showToast(
    "Task ready for webhook",
    "success"
  );

}

function renderActiveTasks(tasks){

  const container =
    document.getElementById(
      "activeTasks"
    );

  if(!tasks.length){

    container.innerHTML = `
      <div class="row">
        <span>No active tasks</span>
      </div>
    `;

    return;

  }

  container.innerHTML =
    tasks.map(task => `
      <div class="task-card">

        <strong>
          ${task.taskName}
        </strong>

        <br>

        <small>
          ${task.site}
        </small>

      </div>
    `).join("");

}

function renderCompletedTasks(tasks){

  const container =
    document.getElementById(
      "completedTasks"
    );

  if(!tasks.length){

    container.innerHTML = `
      <div class="row">
        <span>No completed tasks</span>
      </div>
    `;

    return;

  }

  container.innerHTML =
    tasks.map(task => `
      <div class="task-card">

        <strong>
          ${task.taskName}
        </strong>

        <br>

        <small>
          ${task.duration}
        </small>

      </div>
    `).join("");

};

console.log("tasks.js loaded");
