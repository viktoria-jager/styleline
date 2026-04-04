async function loadProducts() {
  try {
    const res = await fetch("http://localhost:3000/products");
    const products = await res.json();

    const container = document.getElementById("products");
    container.innerHTML = ""; // üresre törlés minden betöltésnél

    products.forEach(p => {
      const div = document.createElement("div");
      div.className = "product-card"; // későbbi stílushoz

      div.innerHTML = `
        <h3>${p.name}</h3>
        <img src="${p.image_url}" alt="${p.name}" />
        <p>${(parseFloat(p.price)).toFixed(2)} €</p>
        <p>${p.description}</p>
      `;
      container.appendChild(div);
    });

  } catch (err) {
    console.error("FAIL:", err);
  }
}

loadProducts();