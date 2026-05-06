import { getProducts } from "./api.js";

async function loadProducts() {
  try {
    const products = await getProducts();

    const container = document.getElementById("products");
    container.innerHTML = ""; 

    products.forEach(p => {
       const div = document.createElement("div");
       div.className = "product-card"; 
    
       div.innerHTML = `
         <h3>${p.name}</h3>
         <img src="http://localhost:3000/uploads/${p.image}" alt="${p.name}" />
         <p>${(parseFloat(p.priceEUR)).toFixed(2)} €</p>
         <p>${p.description}</p>
         <button>Add to Cart</button>
       `;

       const button = div.querySelector("button");
       button.addEventListener("click", () => {
         addToCart(p.id);
  });

  container.appendChild(div);
});

  } catch (err) {
    console.error("FAIL:", err);
  }
}

function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = cart.find(item => item.productId === id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ productId: id, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}

loadProducts();