const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addBtn").addEventListener("click", addProduct);
  document.getElementById("loadOrdersBtn").addEventListener("click", loadOrders);
  document.getElementById("deleteBtn").addEventListener("click", deleteProduct);
  document.getElementById("editBtn").addEventListener("click", editProduct);
  loadProducts();
});

async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/api/products`);
    const products = await res.json();

    const list = document.getElementById("productList");
    list.innerHTML = "";

    products.forEach(p => {
  const li = document.createElement("li");

  li.innerHTML = `
    <img src="http://localhost:3000/uploads/${p.image}" width="50" />

    <div>
      <strong>${p.name}</strong> - ${p.priceEUR} €
      <p>${p.description}</p>
    </div>

    <input type="file" id="file-${p.id}" />

    <button onclick="editProduct(${p.id}, '${p.name}', '${p.priceEUR}', '${p.description}')">
      Edit
    </button>

    <button onclick="deleteProduct(${p.id})">Delete</button>
  `;

  list.appendChild(li);
});

  } catch (err) {
    console.error(err);
    alert("Error loading products");
  }
}

async function addProduct() {
  const name = document.getElementById("name").value;
  const priceEUR = document.getElementById("priceEUR").value;
  const description = document.getElementById("description").value;
  const imageFile = document.getElementById("image").files[0];

  const formData = new FormData();
  formData.append("name", name);
  formData.append("priceEUR", priceEUR);
  formData.append("description", description);
  formData.append("image", imageFile);

  try {
    const res = await fetch(`${API_URL}/api/products`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    document.getElementById("msg").innerText =
      data.message || "Product uploaded successfully";

    loadProducts();

  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Upload failed";
  }
}



async function loadOrders() {
  const res = await fetch(`${API_URL}/api/orders`);
  const orders = await res.json();

  console.log("orders:", orders);

  const list = document.getElementById("orders");
  list.innerHTML = "";

  orders.forEach(order => {
    const li = document.createElement("li");

     let itemsHtml = "";

    if (order.items) {
    order.items.forEach(item => {
    itemsHtml += `${item.name} x ${item.quantity}<br>`;
    });
   }
  

li.innerHTML = `
  <strong>Order #${order.id}</strong><br>
  ${itemsHtml}
  Total: ${order.total_price} €<br>
  Status: ${order.status}<br>

  <button onclick="updateStatus(${order.id}, 'pending')">Pending</button>
  <button onclick="updateStatus(${order.id}, 'shipped')">Shipped</button>
  <button onclick="updateStatus(${order.id}, 'completed')">Completed</button>

  <hr>
`;

    list.appendChild(li);
    
  });
}


async function updateStatus(id, status) {
  await fetch(`${API_URL}/api/orders/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });

  loadOrders(); 
}

async function deleteProduct(id) {
  const confirmDelete = confirm("Are you sure you want to delete this product?");

  if (!confirmDelete) return;

  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    document.getElementById("msg").innerText =
      data.message || "Product deleted successfully";

    loadProducts();

  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Delete failed";
  }
}

async function editProduct(id, oldName, oldPriceEUR, oldDescription) {
  const name = prompt("New name:", oldName);
  const priceEUR = prompt("New price:", oldPriceEUR);
  const description = prompt("New description:", oldDescription);

  const changeImage = confirm("Do you want to change the image?");

  const formData = new FormData();
  formData.append("name", name);
  formData.append("priceEUR", priceEUR);
  formData.append("description", description);

  if (changeImage) {
    const fileInput = document.getElementById(`file-${id}`);
    const imageFile = fileInput.files[0];

    if (!imageFile) {
      alert("Please select a file for this product!");
      return;
    }

    formData.append("image", imageFile);
  }

  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      method: "PATCH",
      body: formData
    });

    const data = await res.json();

    document.getElementById("msg").innerText =
      data.message || "Product updated";

    loadProducts();

  } catch (err) {
    console.error(err);
    document.getElementById("msg").innerText = "Update failed";
  }
}

async function loadAppointments() {
  const res = await fetch(`${API_URL}/api/appointments`);
  const data = await res.json();

  const list = document.getElementById("appointments");
  list.innerHTML = "";

  data.forEach(a => {
    const li = document.createElement("li");

    li.innerHTML = `
      ${a.name} - ${a.date} ${a.time} (${a.status})
    `;

    list.appendChild(li);
  });
}

function saveSchedule() {
  const hairdresserId = document.getElementById("hairdresser").value;
  const weekday = document.getElementById("weekday").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;

  fetch("http://localhost:3000/api/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      hairdresserId,
      weekday,
      startTime,
      endTime
    })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("msg").innerText = data.message;
    loadSchedule();
  });
}

function loadSchedule() {
  const hairdresserId = document.getElementById("hairdresser").value;

  fetch(`http://localhost:3000/api/schedule?hairdresserId=${hairdresserId}`)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("list");
      list.innerHTML = "";

      data.forEach(s => {
        const div = document.createElement("div");

        const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

        div.innerText = `${days[s.weekday]}: ${s.startTime} - ${s.endTime}`;

        list.appendChild(div);
      });
    });
}