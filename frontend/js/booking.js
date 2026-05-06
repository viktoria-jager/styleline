let selectedDate = null;
let selectedTime = null;

document.addEventListener("DOMContentLoaded", () => {
  loadHairdressers();
  loadServices();
  renderWeek();

  document.getElementById("date")?.addEventListener("change", loadSlots);
  document.getElementById("hairdresser")?.addEventListener("change", loadSlots);
  document.getElementById("service")?.addEventListener("change", loadSlots);

  document.getElementById("bookBtn")?.addEventListener("click", book);
});

function loadSlots() {
  const hairdresserId = document.getElementById("hairdresser")?.value;
  const serviceId = document.getElementById("service")?.value;

  if (!selectedDate || !hairdresserId || !serviceId) return;

  fetch(`http://localhost:3000/api/appointments/availability?hairdresserId=${hairdresserId}&date=${selectedDate}&serviceId=${serviceId}`)
    .then(res => res.json())
    .then(slots => {
      const container = document.getElementById("slots");
      if (!container) return;

      container.innerHTML = "";

      selectedTime = null;

      slots.forEach(time => {
        const btn = document.createElement("button");
        btn.innerText = time;

        btn.addEventListener("click", () => {
          selectedTime = time;

          document.querySelectorAll("#slots button")
            .forEach(b => b.style.background = "");

          btn.style.background = "lightgreen";
        });

        container.appendChild(btn);
      });
    });
}

function book() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;

  const hairdresserId = document.getElementById("hairdresser").value;
  const serviceId = document.getElementById("service").value;

  if (!selectedDate || !selectedTime) {
    document.getElementById("msg").innerText = "Select date and time!";
    return;
  }

  fetch("http://localhost:3000/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      date: selectedDate,
      startTime: selectedTime,
      hairdresserId,
      serviceId
    })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("msg").innerText = data.message;
  });
}

function renderWeek() {
  const container = document.getElementById("week");
  if (!container) return;

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.style.display = "grid";
  wrapper.style.gridTemplateColumns = "repeat(7, 1fr)";
  wrapper.style.gap = "8px";

  getNext7Days().forEach(date => {
    const btn = document.createElement("button");

    const d = new Date(date);
    btn.innerText = d.toLocaleDateString("hu-HU", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });

    btn.addEventListener("click", () => {
      selectedDate = date;

      document.querySelectorAll("#week button")
        .forEach(b => b.style.background = "");

      btn.style.background = "#cce5ff";

      loadSlots();
    });

    wrapper.appendChild(btn);
  });

  container.appendChild(wrapper);
}

function book() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;

  const hairdresserId = document.getElementById("hairdresser").value;
  const serviceId = document.getElementById("service").value;

  if (!selectedDate || !selectedTime) {
    document.getElementById("msg").innerText = "Select date and time!";
    return;
  }

  fetch("http://localhost:3000/api/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      email,
      date: selectedDate,
      startTime: selectedTime,
      hairdresserId,
      serviceId
    })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("msg").innerText = data.message;
  });
}

function getNext7Days() {
  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);

    const dateStr = d.toISOString().split("T")[0];

    days.push(dateStr);
  }

  return days;
}

function renderWeek() {
  const container = document.getElementById("week");
  container.innerHTML = "";

  const days = getNext7Days();

  const wrapper = document.createElement("div");
  wrapper.style.display = "grid";
  wrapper.style.gridTemplateColumns = "repeat(7, 1fr)";
  wrapper.style.gap = "8px";

  days.forEach(date => {
    const btn = document.createElement("button");

    const d = new Date(date);
    const label = d.toLocaleDateString("hu-HU", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });

    btn.innerText = label;

    btn.style.padding = "10px";
    btn.style.border = "1px solid #ccc";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";

    btn.onclick = () => {
      selectedDate = date;

      document.querySelectorAll("#week button")
        .forEach(b => b.style.background = "");

      btn.style.background = "#cce5ff";

      loadSlots();
    };

    wrapper.appendChild(btn);
  });

  container.appendChild(wrapper);
}

function deleteAppointment(id) {
  fetch(`http://localhost:3000/api/appointments/${id}`, {
    method: "DELETE"
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    loadAppointments(); // frissítés
  });
}

function updateAppointment(id) {
  const date = prompt("New date (YYYY-MM-DD)");
  const time = prompt("New time (HH:MM)");
  const hairdresserId = prompt("Hairdresser ID");
  const serviceId = prompt("Service ID");

  fetch(`http://localhost:3000/api/appointments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      date,
      startTime: time,
      hairdresserId,
      serviceId
    })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    loadAppointments();
  });
}

function loadHairdressers() {
  fetch("http://localhost:3000/api/meta/hairdressers")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("hairdresser");
      if (!select) return;

      select.innerHTML = "";

      data.forEach(h => {
        const option = document.createElement("option");
        option.value = h.id;
        option.innerText = h.name;
        select.appendChild(option);
      });
    });
}

function loadServices() {
  fetch("http://localhost:3000/api/meta/services")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("service");
      if (!select) return;

      select.innerHTML = "";

      data.forEach(s => {
        const option = document.createElement("option");
        option.value = s.id;
        option.innerText = `${s.name} (${s.durationMinutes} min - ${s.priceEUR} €)`;
        select.appendChild(option);
      });
    });
}