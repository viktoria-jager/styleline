const API_URL = "http://localhost:3000";

export async function getProducts() {
  const res = await fetch(`${API_URL}/products`);
  return await res.json();
}