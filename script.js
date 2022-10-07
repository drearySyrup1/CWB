import items from './items.js';

function updateItemsPrice() {
  items.forEach((item) => {
    if (item.populate === true) item.price = parseFloat(breadPrice);
  });
}

function idGenerator() {
  let id = 0;

  return () => {
    id++;
    return id;
  };
}

function countTotal(quantity, itemPrice, halfPrice) {
  if (halfPrice) {
    return Math.round(quantity * (itemPrice / 2) * 100) / 100;
  } else {
    return Math.round(quantity * itemPrice * 100) / 100;
  }
}

function handlePlusButton({
  itemPrice,
  total,
  quantity,
  totalElement,
  quantityElement,
  halfPrice,
}) {
  quantity++;
  quantityElement.innerHTML = quantity;
  totalElement.innerHTML = `£${countTotal(quantity, itemPrice, halfPrice)}`;
  calculateTotal();
}

function handleMinusButton({
  itemPrice,
  total,
  quantity,
  totalElement,
  quantityElement,
  halfPrice,
}) {
  if (quantity <= 0) return;
  quantity--;
  quantityElement.innerHTML = quantity;
  totalElement.innerHTML = `£${countTotal(quantity, itemPrice, halfPrice)}`;
  calculateTotal();
}

function handleQuantity(e) {
  const buttonPressed = e.currentTarget;
  const id = buttonPressed.dataset.id;
  const listing = document.querySelector(`.listing[data-id="${id}"]`);

  const itemPriceElement = listing.querySelector(
    `.listing [data-price="${id}"]`
  );
  const totalElement = listing.querySelector(`.listing [data-total="${id}"]`);
  const quantityElement = listing.querySelector(
    `.listing [data-quantity="${id}"]`
  );

  const itemPrice = parseFloat(itemPriceElement.innerHTML.slice(1));
  const total = parseFloat(totalElement.innerHTML.slice(1));
  const quantity = parseInt(quantityElement.innerHTML);
  const halfPrice = listing.dataset.halfPrice === 'true' ? true : false;

  if (buttonPressed.id === 'minusB')
    handleMinusButton({
      total: total,
      quantity: quantity,
      totalElement: totalElement,
      quantityElement: quantityElement,
      itemPrice: itemPrice,
      halfPrice: halfPrice,
    });
  if (buttonPressed.id === 'plusB')
    handlePlusButton({
      total: total,
      quantity: quantity,
      totalElement: totalElement,
      quantityElement: quantityElement,
      itemPrice: itemPrice,
      halfPrice: halfPrice,
    });
}

function createListing(price, name, halfPrice) {
  const id = idGen();
  const listing = document.createElement('div');
  listing.classList.add('listing');
  listing.dataset.id = id;
  listing.dataset.halfPrice = halfPrice;
  // Create buttons
  const quantityDiv = document.createElement('div');
  quantityDiv.classList.add('quantity-things');

  const minusButton = document.createElement('button');
  minusButton.id = 'minusB';
  minusButton.innerHTML = '-';
  minusButton.dataset.id = id;
  const plusButton = document.createElement('button');
  plusButton.id = 'plusB';
  plusButton.innerHTML = '+';
  plusButton.dataset.id = id;

  minusButton.addEventListener('click', handleQuantity);
  plusButton.addEventListener('click', handleQuantity);

  const quantity = document.createElement('span');
  quantity.innerHTML = '0';
  quantity.dataset.quantity = id;

  quantityDiv.append(minusButton);
  quantityDiv.append(quantity);
  quantityDiv.append(plusButton);

  listing.innerHTML = `
  <p>${name}</p>
  <p data-price="${id}">£${price}</p>`;
  listing.append(quantityDiv);

  const total = document.createElement('p');
  total.dataset.total = id;
  total.innerHTML = '£0';

  listing.append(total);
  return listing;
}

function restartListings() {
  listings.innerHTML = `
  <div class="listing top-row">
        <p>Name</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
      </div>`;
}

function populateListings(items, parent) {
  restartListings();

  items.forEach((item) => {
    let listing;
    if (item.populate === true) {
      listing = createListing(breadPrice, item.name, item.halfPrice);
    } else {
      listing = createListing(item.price, item.name, item.halfPrice);
    }
    parent.appendChild(listing);
  });
}

function calculateTotal() {
  const total =
    Math.round(
      [...listings.children].reduce((accu, child) => {
        if (child.classList.contains('top-row')) return accu + 0;
        const total = parseFloat(
          child.querySelector('[data-total]').innerHTML.slice(1)
        );
        return accu + total;
      }, 0) * 100
    ) / 100;

  if (total > Math.round(invoiceTotal.value * 0.1 * 100) / 100) {
    warning.classList.remove('hidden');
  } else {
    warning.classList.add('hidden');
  }

  discount.innerHTML = `Discount: £${total}`;

  const invoiceTotalValue =
    invoiceTotal.value === '' ? '0.00' : parseFloat(invoiceTotal.value);

  const totalTotal = Math.round((invoiceTotalValue - total) * 100) / 100;

  totalSum.innerHTML = `£${totalTotal}`;
}

function exceedsDots(string) {
  // true if contains more than one dot
  if (string[0] === '.') return true;

  let dots = 0;
  // true if stars with dot
  for (let char of string) {
    if (char === '.') dots++;
  }

  return dots > 1;
}

// Event listener for day
const priceType = document.getElementById('price');
let breadPrice = priceType.value;
const listings = document.getElementById('listings');
const idGen = idGenerator();
const invoiceTotal = document.getElementById('invoice-total');
const totalSum = document.getElementById('totalSum');
const warning = document.getElementById('warning');
const discount = document.getElementById('discount');
const currencyPrefix = '£';
populateListings(items, listings);

priceType.addEventListener('change', (e) => {
  breadPrice = priceType.value;
  updateItemsPrice();
  populateListings(items, listings);
});

invoiceTotal.addEventListener('input', (e) => {
  if ((e.data !== '.' && isNaN(e.data)) || exceedsDots(invoiceTotal.value)) {
    invoiceTotal.value = invoiceTotal.value.slice(
      0,
      invoiceTotal.value.length - 1
    );
  } else {
    calculateTotal();
  }
});
// After seleted shop
// Load items with correct prices
