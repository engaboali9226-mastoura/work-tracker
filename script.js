const WEBHOOK_URL =
"https://n8n-mq4x.onrender.com/webhook/5327c892-98c4-43d5-9fe4-1f00bdfe077e";

const DASHBOARD_URL =
"https://n8n-mq4x.onrender.com/webhook/today-status";

let timeMode = "now";

// ضبط تاريخ اليوم في الكارت العلوي
document.getElementById("todayDate").innerText =
  new Date().toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  );

// تحديث ساعة الرياض الحالية
function updateRiyadhClock(){

  const now = new Date();

  const time = now.toLocaleTimeString(
    'en-US',
    {
      timeZone: 'Asia/Riyadh',
      hour: '2-digit',
      minute: '2-digit',
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

// توليد الـ Wheels
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

  toast.classList.remove(
    "success",
    "warning",
    "error",
    "show"
  );

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

async function loadDashboard(){

  try{

    const response =
      await fetch(
        DASHBOARD_URL,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({})
        }
      );

    const data =
      await response.json();

    console.log(
      "Dashboard Response:",
      data
    );

    updateDashboard(data);

  }catch(error){

    console.error(error);

    showToast(
      "Dashboard load failed",
      "error"
    );

  }

}

function updateDashboard(data){

  document.getElementById(
    "statusTitle"
  ).textContent =
    data.status || "--";

  document.getElementById(
    "startedValue"
  ).textContent =
    data.startTime || "--";

  document.getElementById(
    "endedValue"
  ).textContent =
    data.endTime || "--";

  document.getElementById(
    "hoursValue"
  ).textContent =
    data.workHours || "--";

  document.getElementById(
    "overtimeValue"
  ).textContent =
    data.overtime || "--";

  document.getElementById(
    "activitiesValue"
  ).textContent =
    data.activitiesCount || 0;

  const icon =
    document.getElementById(
      "statusIcon"
    );

  switch(data.status){

    case "In Progress":

      icon.textContent = "🟢";
      break;

    case "Completed":

      icon.textContent = "🔵";
      break;

    case "Cancelled":

      icon.textContent = "🔴";
      break;

    case "Planned":

      icon.textContent = "🟣";
      break;

    default:

      icon.textContent = "🟡";

  }

}

async function startWork(){

  const chosenTime =
    getCustomTime();

  try{

    const response =
      await fetch(
        WEBHOOK_URL,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            action:"start",
            customTime:chosenTime,
            timestamp:new Date().toISOString()
          })
        }
      );

    const data =
      await response.json();

    if(!data.blocked){

      switch(data.caseType){

        case "start_current":

          showToast(
            "Work start recorded successfully",
            "success"
          );

          break;

        case "start_custom":

          showToast(
            "Custom work start recorded successfully",
            "success"
          );

          break;

        default:

          showToast(
            "Work start recorded successfully",
            "success"
          );

      }

      setTimeout(
        loadDashboard,
        2000
      );

    }else{

      showToast(
        data.message,
        "warning"
      );

    }

  }catch(error){

    console.error(error);

    showToast(
      "Unable to connect to server",
      "error"
    );

  }

}

async function endWork(){

  const chosenTime =
    getCustomTime();

  try{

    const response =
      await fetch(
        WEBHOOK_URL,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            action:"end",
            customTime:chosenTime,
            timestamp:new Date().toISOString()
          })
        }
      );

    const data =
      await response.json();

    if(!data.blocked){

      switch(data.caseType){

        case "end_current":

          showToast(
            "Work end recorded successfully",
            "success"
          );

          break;

        case "end_custom":

          showToast(
            "Custom work end recorded successfully",
            "success"
          );

          break;

        default:

          showToast(
            "Work end recorded successfully",
            "success"
          );

      }

      setTimeout(
        loadDashboard,
        2000
      );

    }else{

      showToast(
        data.message,
        "warning"
      );

    }

  }catch(error){

    console.error(error);

    showToast(
      "Unable to connect to server",
      "error"
    );

  }

}

loadDashboard();

setInterval(
  loadDashboard,
  300000
);
