/* Mento e-pood — ostukorv, tellimuse vormistamine ja UI-loogika.
   Makselahendus on teadlikult lahti ühendamata: vt submitOrder(). */

"use strict";

/* ---------- Toote seadistus ----------
   Hinda ja andmeid muuda siit (ja HTML-is [data-price] kuvahindu). */
const PRODUCT = {
  id: "mento-kristallid-10g",
  title: "Mentoolikristallid saunale",
  subtitle: "10 g · veski + purk + laastud",
  price: 24.90,
  maxQty: 20,
};

const FREE_SHIPPING_FROM = 39.00;

/* ---------- Abifunktsioonid ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const formatEur = (n) =>
  n.toLocaleString("et-EE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

/* ---------- Ostukorvi olek ---------- */

const CART_KEY = "mento-cart";

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY));
    const qty = Math.min(Math.max(parseInt(raw?.qty, 10) || 0, 0), PRODUCT.maxQty);
    return { qty };
  } catch {
    return { qty: 0 };
  }
}

let cart = loadCart();

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cartSubtotal() {
  return cart.qty * PRODUCT.price;
}

/* ---------- Ostukorvi kuvamine ---------- */

const cartDrawer = $("#cart-drawer");
const cartBackdrop = $("#cart-backdrop");
const cartBody = $("#cart-body");
const cartFoot = $("#cart-foot");
const cartCount = $("#cart-count");

function renderCart() {
  cartCount.hidden = cart.qty === 0;
  cartCount.textContent = cart.qty;

  if (cart.qty === 0) {
    cartFoot.hidden = true;
    cartBody.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l1.5 13.5a1 1 0 0 1-1 1.1H5.5a1 1 0 0 1-1-1.1L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>
        <p>Ostukorv on tühi.<br>Lisa mentoolikristallid ja saun saab uue hingamise.</p>
      </div>`;
    return;
  }

  cartFoot.hidden = false;
  cartBody.innerHTML = `
    <div class="cart-item">
      <div class="cart-item-thumb" aria-hidden="true">m</div>
      <div>
        <p class="cart-item-title">${PRODUCT.title}</p>
        <p class="cart-item-sub">${PRODUCT.subtitle}</p>
        <div class="qty" data-qty>
          <button type="button" class="qty-btn" data-qty-minus aria-label="Vähenda kogust">−</button>
          <input type="number" inputmode="numeric" value="${cart.qty}" min="1" max="${PRODUCT.maxQty}" data-qty-input aria-label="Kogus">
          <button type="button" class="qty-btn" data-qty-plus aria-label="Suurenda kogust">+</button>
        </div>
      </div>
      <div style="text-align:right">
        <div class="cart-item-price">${formatEur(cartSubtotal())}</div>
        <button type="button" class="cart-remove" data-cart-remove>Eemalda</button>
      </div>
    </div>`;

  $("#cart-subtotal").textContent = formatEur(cartSubtotal());

  const hint = $("#cart-shipping-hint");
  const missing = FREE_SHIPPING_FROM - cartSubtotal();
  hint.textContent = missing > 0
    ? `Lisa veel ${formatEur(missing)} ja tarne pakiautomaati on tasuta`
    : "Tasuta tarne pakiautomaati on aktiveeritud 🎉";

  bindQtyControls(cartBody, (qty) => setCartQty(qty));
  $("[data-cart-remove]", cartBody).addEventListener("click", () => setCartQty(0));
}

function setCartQty(qty) {
  cart.qty = Math.min(Math.max(qty, 0), PRODUCT.maxQty);
  saveCart();
  renderCart();
}

/* ---------- Koguse valijad (üldine) ---------- */

function clampQty(value) {
  return Math.min(Math.max(parseInt(value, 10) || 1, 1), PRODUCT.maxQty);
}

function bindQtyControls(root, onChange) {
  $$("[data-qty]", root).forEach((wrap) => {
    const input = $("[data-qty-input]", wrap);
    const apply = (v) => {
      input.value = clampQty(v);
      if (onChange) onChange(parseInt(input.value, 10));
    };
    $("[data-qty-minus]", wrap).addEventListener("click", () => apply(parseInt(input.value, 10) - 1));
    $("[data-qty-plus]", wrap).addEventListener("click", () => apply(parseInt(input.value, 10) + 1));
    input.addEventListener("change", () => apply(input.value));
  });
}

/* Lehe ostuplokkide koguse valijad (hero + ostuplokk) */
bindQtyControls(document.body, null);

/* ---------- Lisa ostukorvi ---------- */

$$("[data-add-to-cart]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const wrap = btn.closest(".buy-controls");
    const input = wrap ? $("[data-qty-input]", wrap) : null;
    const qty = input ? clampQty(input.value) : 1;
    setCartQty(cart.qty + qty);
    showToast(`${PRODUCT.title} lisatud ostukorvi`);
    openCart();
  });
});

/* ---------- Sahtli avamine/sulgemine ---------- */

let lastFocused = null;

function openCart() {
  lastFocused = document.activeElement;
  cartDrawer.hidden = false;
  cartBackdrop.hidden = false;
  requestAnimationFrame(() => {
    cartDrawer.classList.add("open");
    cartBackdrop.classList.add("open");
  });
  document.body.style.overflow = "hidden";
  $("#cart-close").focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartBackdrop.classList.remove("open");
  document.body.style.overflow = "";
  setTimeout(() => {
    cartDrawer.hidden = true;
    cartBackdrop.hidden = true;
  }, 300);
  if (lastFocused) lastFocused.focus();
}

$("#cart-open").addEventListener("click", openCart);
$("#cart-close").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);

/* ---------- Tellimuse modaal ---------- */

const checkoutBackdrop = $("#checkout-backdrop");
const checkoutForm = $("#checkout-form");
const orderConfirm = $("#order-confirm");

function shippingPrice() {
  const checked = $('input[name="tarne"]:checked');
  const base = parseFloat(checked?.dataset.price || "0");
  const parcel = checked?.value !== "kuller";
  return parcel && cartSubtotal() >= FREE_SHIPPING_FROM ? 0 : base;
}

function renderSummary() {
  $("#sum-products").textContent = formatEur(cartSubtotal());
  $("#sum-shipping").textContent = shippingPrice() === 0 ? "Tasuta" : formatEur(shippingPrice());
  $("#sum-total").textContent = formatEur(cartSubtotal() + shippingPrice());
  $$("[data-ship-price]").forEach((el) => {
    el.textContent = cartSubtotal() >= FREE_SHIPPING_FROM ? "Tasuta" : formatEur(2.99);
  });
}

function openCheckout() {
  closeCart();
  checkoutForm.hidden = false;
  orderConfirm.hidden = true;
  renderSummary();
  checkoutBackdrop.hidden = false;
  requestAnimationFrame(() => checkoutBackdrop.classList.add("open"));
  document.body.style.overflow = "hidden";
  $("#f-nimi").focus();
}

function closeCheckout() {
  checkoutBackdrop.classList.remove("open");
  document.body.style.overflow = "";
  setTimeout(() => { checkoutBackdrop.hidden = true; }, 250);
}

$("#checkout-open").addEventListener("click", openCheckout);
$("#checkout-close").addEventListener("click", closeCheckout);
$("#confirm-close").addEventListener("click", closeCheckout);
checkoutBackdrop.addEventListener("click", (e) => {
  if (e.target === checkoutBackdrop) closeCheckout();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!checkoutBackdrop.hidden) closeCheckout();
  else if (!cartDrawer.hidden) closeCart();
});

/* Tarneviisi vahetus: pakiautomaat vs kulleri aadress */
$$('input[name="tarne"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const courier = radio.value === "kuller";
    $("#parcel-field").hidden = courier;
    $("#f-automaat").required = !courier;
    $("#address-field").hidden = !courier;
    $("#f-aadress").required = courier;
    renderSummary();
  });
});

/* ---------- Vormi valideerimine ja "tellimuse" esitamine ---------- */

function validateField(input) {
  const field = input.closest(".form-field");
  const error = field ? $(".field-error", field) : null;
  const valid = input.checkValidity();
  input.setAttribute("aria-invalid", String(!valid));
  if (error) error.hidden = valid;
  return valid;
}

$$("#checkout-form input[required]").forEach((input) => {
  input.addEventListener("blur", () => validateField(input));
});

checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const inputs = $$("#checkout-form input[required]").filter((i) => !i.closest("[hidden]"));
  const firstInvalid = inputs.find((i) => !validateField(i));
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }
  submitOrder();
});

function submitOrder() {
  /* SIIA TULEB MAKSEINTEGRATSIOON.
     Plaan: saada tellimus backendile, mis loob makse (nt Montonio
     või Maksekeskuse API kaudu) ja suunab kliendi makselehele:
       const order = collectOrder();
       const { paymentUrl } = await fetch("/api/orders", {...});
       location.href = paymentUrl;
     Praegu näitame testkinnitust. */
  const submitBtn = $("#checkout-submit");
  submitBtn.disabled = true;
  submitBtn.textContent = "Esitan…";

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = "Esita tellimus (testrežiim)";
    checkoutForm.hidden = true;
    orderConfirm.hidden = false;
    setCartQty(0);
  }, 700);
}

function collectOrder() {
  const data = Object.fromEntries(new FormData(checkoutForm).entries());
  return {
    product: PRODUCT.id,
    qty: cart.qty,
    subtotal: cartSubtotal(),
    shipping: shippingPrice(),
    total: cartSubtotal() + shippingPrice(),
    customer: data,
  };
}

/* ---------- Teavitus ---------- */

let toastTimer = null;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => { toast.hidden = true; }, 300);
  }, 3200);
}

/* ---------- Lumesadu (dekoratiivne) ---------- */

$$("[data-snow]").forEach((box) => {
  for (let i = 0; i < 14; i++) {
    const flake = document.createElement("i");
    flake.style.left = (i * 7.3 + 2) % 100 + "%";
    flake.style.animationDuration = 6 + (i % 5) * 1.7 + "s";
    flake.style.animationDelay = (i * 0.9) % 6 + "s";
    flake.style.opacity = 0.35 + (i % 4) * 0.18;
    flake.style.width = flake.style.height = 3 + (i % 3) + "px";
    box.appendChild(flake);
  }
});

/* ---------- Puuduvad lingid ---------- */

$$("[data-todo-link]").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    showToast("See leht lisatakse koos müügitingimustega");
  });
});

/* ---------- Init ---------- */

renderCart();
