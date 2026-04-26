const API_URL = "http://localhost:3000";

export async function getProducts() {
  const res = await fetch(`${API_URL}/products`);
  return await res.json();
}

export async function createOrder(items) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ items })
  });

  return await res.json();
}