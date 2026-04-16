function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart");

  container.innerHTML = "";

  fetch("http://localhost:3000/products")
    .then(res => res.json())
    .then(products => {
      let total = 0;

      cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return;

        const subtotal = product.price * item.quantity;
        total += subtotal;

        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
          <h3>${product.name}</h3>
          <p>${product.price} €</p>

          <p>Subtotal: ${subtotal.toFixed(2)} €</p>
          <button onclick="removeFromCart(${item.productId})">Remove</button>
         <div class="quantity-controls">
         <button onclick="decreaseQty(${item.productId})">-</button>
         <span class="qty">${item.quantity}</span>
         <button onclick="increaseQty(${item.productId})">+</button>
         </div>
        `;

        container.appendChild(div);
      });
      
      document.getElementById("total").innerText =
        "Total: " + total.toFixed(2) + " €";
    });
}
function decreaseQty(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart = cart.map(item => {
    if (item.productId === id) {
      return {
        ...item,
        quantity: Math.max(1, item.quantity - 1)
      };
    }
    return item;
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

function increaseQty(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart = cart.map(item => {
    if (item.productId === id) {
      return {
        ...item,
        quantity: item.quantity + 1
      };
    }
    return item;
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

function removeFromCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart = cart.filter(item => item.productId !== id);

  localStorage.setItem("cart", JSON.stringify(cart));

  loadCart();
}

function checkout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  fetch("http://localhost:3000/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ items: cart })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Order response:", data);

    alert("Order placed successfully! 🎉");

    localStorage.removeItem("cart");
    loadCart();
  })
  .catch(err => {
    console.error("Error:", err);
    alert("Something went wrong!");
  });
}


loadCart();