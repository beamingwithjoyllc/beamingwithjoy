// assets/app.js
function money(n){ return `$${Number(n).toFixed(2)}`; }

function getCart(){
  return JSON.parse(localStorage.getItem("bw_cart") || "[]");
}
function setCart(cart){
  localStorage.setItem("bw_cart", JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount(){
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = count);
}

function addToCart(productId, qty=1){
  const cart = getCart();
  const idx = cart.findIndex(x => x.id === productId);
  if(idx >= 0) cart[idx].qty += qty;
  else cart.push({ id: productId, qty });
  setCart(cart);
}

function removeFromCart(productId){
  const cart = getCart().filter(x => x.id !== productId);
  setCart(cart);
}

function changeQty(productId, qty){
  const cart = getCart();
  const item = cart.find(x => x.id === productId);
  if(!item) return;
  item.qty = Math.max(1, qty);
  setCart(cart);
}

function findProduct(id){
  return (window.PRODUCTS || []).find(p => p.id === id);
}

function renderProductGrid(containerId, opts={}){
  const el = document.getElementById(containerId);
  if(!el) return;

  const { category=null, tag=null, query="" } = opts;

  let list = [...(window.PRODUCTS || [])];

  if(category) list = list.filter(p => p.category === category);
  if(tag) list = list.filter(p => (p.tags || []).includes(tag));
  if(query) {
    const q = query.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.blurb || "").toLowerCase().includes(q)
    );
  }

  el.innerHTML = list.map(p => `
    <div class="card product">
      <div class="prodTop">
        <div class="badge">${(p.tags||[])[0] ? (p.tags[0]).toUpperCase() : "NEW"}</div>
      </div>
      <div class="prodImg">${p.image ? `<img src="${p.image}" alt="${p.name}">` : ""}</div>
      <div class="prodBody">
        <div class="prodName">${p.name}</div>
        <div class="prodBlurb">${p.blurb || ""}</div>
        <div class="prodRow">
          <div class="price">${money(p.price)}</div>
          <button class="btn primary" data-add="${p.id}">Add</button>
        </div>
      </div>
    </div>
  `).join("");

  el.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.getAttribute("data-add"), 1));
  });
}

function renderCart(containerId){
  const el = document.getElementById(containerId);
  if(!el) return;

  const cart = getCart();
  if(cart.length === 0){
    el.innerHTML = `<div class="card">Your cart is empty.</div>`;
    return;
  }

  const rows = cart.map(item => {
    const p = findProduct(item.id);
    if(!p) return "";
    return `
      <div class="cartRow">
        <div>
          <div class="prodName">${p.name}</div>
          <div class="small muted">${money(p.price)} each</div>
        </div>
        <div class="cartControls">
          <input class="qty" type="number" min="1" value="${item.qty}" data-qty="${p.id}">
          <div class="price">${money(p.price * item.qty)}</div>
          <button class="btn" data-remove="${p.id}">Remove</button>
        </div>
      </div>
    `;
  }).join("");

  const total = cart.reduce((sum, item) => {
    const p = findProduct(item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  el.innerHTML = `
    <div class="card">
      ${rows}
      <div class="line"></div>
      <div class="cartTotal">
        <strong>Total</strong>
        <strong>${money(total)}</strong>
      </div>
      <div class="small muted" style="margin-top:10px;">
        Checkout is handled via your order form / payment link (for now).
      </div>
      <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
        <a class="btn primary" href="ORDER_FORM_LINK" target="_blank" rel="noopener">Complete Order</a>
        <a class="btn" href="shop.html">Keep Shopping</a>
      </div>
    </div>
  `;

  el.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => removeFromCart(btn.getAttribute("data-remove")));
  });
  el.querySelectorAll("[data-qty]").forEach(input => {
    input.addEventListener("change", () => changeQty(input.getAttribute("data-qty"), Number(input.value || 1)));
  });
}

document.addEventListener("DOMContentLoaded", () => updateCartCount());
