window.onload = getProducts;
let myCartStore;
let products;
const BASE_URL = "http://localhost:8181/api/v1";
const RESOURCE_URL = "http://localhost:8181/public/resources/";
const header = {
  Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
};

const tbodyList = document.getElementById("tbodyCartList");
const orderButton = document.getElementById("placeOrder");
orderButton.addEventListener("click", async function () {
  console.log("clicked order ");
  await placeOrder();
});

const logoutBtn = document.getElementById("login-btn");
logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  sessionStorage.setItem("accessToken", undefined);
  window.location.replace("/index.html");
});
async function placeOrder() {
  try {
    const response = await fetch(`${BASE_URL}/order`, {
      headers: header,
      method: "POST",
    });
    if (response.status >= 300) {
      throw new Error("Something went wrong while fetching product.");
    }
    const jsonData = await response.json();
    getProducts();
    console.log(myCartStore);
    window.location.reload();
  } catch (error) {}
}

async function getProducts() {
  try {
    const headerUsername = document.getElementById("headerUsername");
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      headerUsername.innerHTML = `Welcome,  <span>${
        token.split(".")[0]
      }</span>`;
    } else {
       window.location.replace("/index.html");
      document.getElementById("login-btn").textContent = "Login";
    }
    const response = await fetch(`${BASE_URL}/products`, { headers: header });
    if (response.status >= 300) {
      throw new Error("Something went wrong while fetching product.");
    }
    const jsonData = await response.json();
    products = jsonData;
    products = products.filter((p) => p.stock != 0);
    for (let e of products) {
      addNewProductRowToTable(e.id, e.name, e.price, e.image, e.stock);
    }
    getMyCart();
  } catch (error) {
    console.log(error);
  }
}

async function getMyCart() {
  try {
    const response = await fetch(`${BASE_URL}/cart`, { headers: header });
    if (response.status >= 300) {
      throw new Error("Something went wrong fetching Cart");
    }
    const data = await response.json();
    myCartStore = data;
    if (myCartStore) {
      for (let e of myCartStore.products.filter((p) => p.stock != 0)) {
        addNewCartRowToTable(e);
      }
      calculateTotal(tbodyList);
    }
  } catch (error) {
    console.log("error  here: ", error);
  }
}

// populate product table
function addNewProductRowToTable(id, name, price, image, stock) {
  const row = document.createElement("tr");
  row.setAttribute("class", "table-row");


  cell = document.createElement("td");
  cell.appendChild(document.createTextNode(name));
  row.appendChild(cell);

  cell = document.createElement("td");
  cell.appendChild(document.createTextNode(price));
  row.appendChild(cell);

  cell = document.createElement("img");
  cell.src = `${RESOURCE_URL}${image}`;
  cell.style =
    "width:80px;height:80px;display:block;margin:auto;object-fit: cover;vertical-align: middle;";
  row.appendChild(cell);

  cell = document.createElement("td");
  cell.appendChild(document.createTextNode(stock));
  row.appendChild(cell);

  cell = document.createElement("td");
  const button = document.createElement("button");
  button.setAttribute("id", "cart-btn");
  button.innerHTML =
    "<img src='../public/images/cartt.png' alt='Cart'style='width: 70px;height:50px'>";
  button.addEventListener("click", async function () {
    await addToCart(id);
  });

  cell.appendChild(button);
  row.appendChild(cell);
  calculateTotal(tbodyList);

  document.getElementById("tbodyProductList").appendChild(row);

  calculateTotal(tbodyList);
}

// populate cart table
function addNewCartRowToTable({ id, name, price, stock }) {
  const row = document.createElement("tr");

  cell = document.createElement("td");
  cell.appendChild(document.createTextNode(name));
  row.appendChild(cell);

  cell = document.createElement("td");
  const priceNode = document.createTextNode(price);
  cell.appendChild(priceNode);
  row.appendChild(cell);

  cell = document.createElement("td");
  const quantityText = document.createTextNode(stock);
  cell.appendChild(quantityText);
  row.appendChild(cell);

  cell = document.createElement("td");
  const textNode = document.createTextNode(price * stock);
  textNode.id = "resultText";
  cell.appendChild(textNode);
  row.appendChild(cell);

  cell = document.createElement("td");
  const leftButton = document.createElement("button");
  leftButton.setAttribute("class", "btn-cart btn-decrement ");
  leftButton.appendChild(document.createTextNode("-"));

  const inputField = document.createElement("input");
  inputField.setAttribute("id", "cart-input");
  inputField.type = "text";
  inputField.value = stock;

  const rightButton = document.createElement("button");
  rightButton.setAttribute("class", "btn-cart btn-increment");
  rightButton.appendChild(document.createTextNode("+"));
  const totalPriceCell = document.getElementById("totalPriceCell");

  // Append the elements to the cell
  cell.appendChild(leftButton);
  cell.appendChild(inputField);
  cell.appendChild(rightButton);
  row.appendChild(cell);

  // Update the total and hide row if it reaches zero
  const updateTotal = () => {
    let currentValue = parseInt(inputField.value);
    if (isNaN(currentValue)) {
      currentValue = 0;
    }
    let total = price * currentValue;
    textNode.nodeValue = total;
    quantityText.nodeValue = currentValue;

    if (total === 0) {
      row.style.display = "none";
    } else {
      row.style.display = "";
    }
  };

  const productsCount = products.find((p) => p.id === id);
  // Decrease the quantity and update the total
  leftButton.addEventListener("click", function () {
    let currentValue = parseInt(inputField.value);

    if (currentValue > 0) {
      inputField.value = String(currentValue - 1);
      updateTotal();
      if (parseInt(inputField.value) < productsCount.stock) {
        rightButton.removeAttribute("disabled");
      }
      calculateTotal(tbodyList);
      updateCart(id, "minus");
    }
    updateTotal();
  });

  rightButton.addEventListener("click", function () {
    let currentValue = parseInt(inputField.value);
    inputField.value = String(currentValue + 1);
    updateTotal();

    if (parseInt(inputField.value) >= productsCount.stock) {
      rightButton.setAttribute("disabled", "disabled");
    } else {
      rightButton.removeAttribute("disabled");
    }
    updateTotal();

    calculateTotal(tbodyList);
    updateCart(id, "add");
  });

  tbodyList.appendChild(row);
}

function calculateTotal(tbodyList) {
  let to = 0;
  for (var i = 0; i < tbodyList.rows.length; i++) {
    var quantityCell = tbodyList.rows[i].cells[1];
    var priceCell = tbodyList.rows[i].cells[2];
    var quantity = parseFloat(quantityCell.innerHTML);
    var price = parseFloat(priceCell.innerHTML);
    to += quantity * price;
  }
  // Update the total price in the table footer

  if (to == 0) {
    document.getElementById("tfoot").style.display = "none";
    document.getElementById("placeOrder").style.visibility = "hidden";
    document.getElementById("divCartList").style.visibility = "hidden";
    document.getElementById("no-cart-message").style.visibility = "visible";
  } else {
    document.getElementById("no-cart-message").style.visibility = "hidden";
    document.getElementById("tfoot").style.display = "";
    document.getElementById("placeOrder").style.visibility = "visible";
    document.getElementById("cart-carto").style.visibility = "visible";
        document.getElementById("divCartList").style.visibility = "visible";
    totalPriceCell.innerHTML = to.toFixed(2);
  }
   
}

async function updateCart(id, type) {
  try {
    const response = await fetch(`${BASE_URL}/cart/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: type }),
    });
    const data = await response.json();
  } catch (e) {
    console.log("error", e);
  }
}

async function addToCart(id) {
  try {
    const request = { productId: id };
    const response = await fetch(`${BASE_URL}/cart`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (response.status >= 300) {
      console.log(response.status);
      console.log("EO", response);
      throw new Error("Cannot add anymore.");
    }
    const data = await response.json();
    myCartStore = data;
    document.getElementById("tbodyCartList").innerHTML = "";

   window.location.reload();
    for (let e of myCartStore.products.filter((p) => p.stock != 0)) {
      addNewCartRowToTable(e);
    }
    calculateTotal(tbodyList);
  } catch (error) {
    //show snack
    console.log("error here: ",error);
     var snack = document.getElementById("snackbar1");
     snack.className = "show";
     snack.style.backgroundColor = "red";
     snack.style.zIndex = 100;
     snack.innerHTML = "We are out of stock, please wait for new product.";
      console.log(snack);
     setTimeout(function () {
       snack.className = snack.className.replace("show", "");
     }, 2000);
  }
}
