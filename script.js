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
  listing,
}) {
  quantity++;
  quantityElement.innerHTML = quantity;
  const countedTotal = countTotal(quantity, itemPrice, halfPrice);
  totalElement.innerHTML = `£${formatNum(countedTotal)}`;
  calculateTotal();
  addBackground(quantity, listing);
  addFadeAnimation(quantityElement, 'quantityAnimation');
  addFadeAnimation(totalElement, 'quantityAnimation');
  updateDebtField();
}

function handleMinusButton({
  itemPrice,
  total,
  quantity,
  totalElement,
  quantityElement,
  halfPrice,
  listing,
}) {
  if (quantity <= 0) return;
  quantity--;
  quantityElement.innerHTML = quantity;
  const countedTotal = countTotal(quantity, itemPrice, halfPrice);
  totalElement.innerHTML = `£${formatNum(countedTotal)}`;
  calculateTotal();
  addBackground(quantity, listing);
  addFadeAnimation(quantityElement, 'quantityAnimation');
  addFadeAnimation(totalElement, 'quantityAnimation');
  updateDebtField();
}

function addBackground(quantity, listing) {
  if (quantity > 0) listing.classList.add('active');
  else listing.classList.remove('active');
}

function addFadeAnimation(element, className) {
  element.classList.remove(className);
  setTimeout(() => {
    element.classList.add(className);
  }, 10);
  // element.addEventListener('animationend', helper);
}

function handleQuantity(e, isCustom) {
  const buttonPressed = e.currentTarget;
  const id = buttonPressed.dataset.id;
  const listing = document.querySelector(`.listing[data-id="${id}"]`);
  let itemPrice;

  const itemPriceElement = listing.querySelector(
    `.listing [data-price="${id}"]`
  );
  if (isCustom) {
    itemPrice = parseFloat(itemPriceElement.value);
  } else {
    itemPrice = parseFloat(itemPriceElement.innerHTML.slice(1));
  }
  const totalElement = listing.querySelector(`.listing [data-total="${id}"]`);
  const quantityElement = listing.querySelector(
    `.listing [data-quantity="${id}"]`
  );

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
      listing: listing,
    });
  if (buttonPressed.id === 'plusB')
    handlePlusButton({
      total: total,
      quantity: quantity,
      totalElement: totalElement,
      quantityElement: quantityElement,
      itemPrice: itemPrice,
      halfPrice: halfPrice,
      listing: listing,
    });
}

function formatNum(num) {
  let numAsString = '' + num;
  let counter = 0;
  let startCount = false;

  if (numAsString.indexOf('.') === -1) {
    numAsString += '.00';
    return numAsString;
  }

  for (let char of numAsString) {
    if (startCount) {
      counter++;
    }
    if (char === '.') {
      startCount = true;
    }
  }

  if (counter === 1) numAsString += '0';
  return numAsString;
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

  minusButton.addEventListener('click', (e) => {
    handleQuantity(e, false);
    addFadeAnimation(minusButton, 'buttonBackgroundAnimation');
  });
  plusButton.addEventListener('click', (e) => {
    handleQuantity(e, false);
    addFadeAnimation(plusButton, 'buttonBackgroundAnimation');
  });

  const quantity = document.createElement('span');
  quantity.innerHTML = '0';
  quantity.dataset.quantity = id;

  quantityDiv.append(minusButton);
  quantityDiv.append(quantity);
  quantityDiv.append(plusButton);

  listing.innerHTML = `
  <p>${name}</p>
  <p data-price="${id}">£${formatNum(price)}</p>`;
  listing.append(quantityDiv);

  const total = document.createElement('p');
  total.dataset.total = id;
  total.innerHTML = '£0.00';

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

  addCustomField(parent);
}

function calculateTotal(useTen) {
  const invoiceTotalValue =
    invoiceTotal.value === '' ? '0.00' : parseFloat(invoiceTotal.value);

  if (useTen) {
    discount.innerHTML = `Discount: £${formatNum(tenPrcValue)}`;
    discountValue = tenPrcValue;
    const totalMinusTenPrc =
      Math.round((invoiceTotalValue - tenPrcValue) * 100) / 100;

    totalSum.innerHTML = `£${formatNum(totalMinusTenPrc)}`;
    totalSumValue = totalMinusTenPrc;
    populateListings(items, listings);
    displayWarning({ diff: 0, show: false });
    return;
  }
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

  const overflow = Math.round((total - tenPrcValue) * 100) / 100;
  const totalTotal = Math.round((invoiceTotalValue - total) * 100) / 100;

  if (total > tenPrcValue) {
    displayWarning({ diff: overflow, show: true });
  } else {
    displayWarning({ diff: 0, show: false });
  }

  discount.innerHTML = `Discount: £${formatNum(total)}`;
  discountValue = total;

  totalSum.innerHTML = `£${formatNum(totalTotal)}`;
  totalSumValue = totalTotal;
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

function decimalDigits(num) {
  const numAsString = '' + num;

  let counter = 0;
  let startCount = false;

  for (let char of num) {
    if (startCount) counter++;
    if (char === '.') startCount = true;
  }

  return counter;
}

function displayWarning({ diff, show }) {
  if (show) {
    warning.innerHTML = `${currencyPrefix}${diff} MORE THAN 10%`;
    warning.classList.remove('hidden');
  } else {
    warning.classList.add('hidden');
  }
}

function addCustomField(parent) {
  const id = idGen();
  const listing = document.createElement('div');
  listing.classList.add('listing');
  listing.dataset.id = id;
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

  minusButton.addEventListener('click', (e) => {
    handleQuantity(e, true);
    addFadeAnimation(minusButton, 'buttonBackgroundAnimation');
  });
  plusButton.addEventListener('click', (e) => {
    handleQuantity(e, true);
    addFadeAnimation(plusButton, 'buttonBackgroundAnimation');
  });

  const quantity = document.createElement('span');
  quantity.innerHTML = '0';
  quantity.dataset.quantity = id;

  quantityDiv.append(minusButton);
  quantityDiv.append(quantity);
  quantityDiv.append(plusButton);

  const customAddButton = document.createElement('button');
  customAddButton.dataset.id = id;
  customAddButton.innerHTML = '+';
  customAddButton.classList.add('addMoreButton');

  customAddButton.addEventListener('click', () => {
    addCustomField(listings);
    addFadeAnimation(customAddButton, 'buttonBackgroundAnimation');
  });

  const customFieldParent = document.createElement('p');
  customFieldParent.append(customAddButton);

  customFieldParent.append('Custom');
  listing.append(customFieldParent);

  const priceInputParent = document.createElement('p');
  const priceInput = document.createElement('input');

  priceInput.addEventListener('input', (e) => {
    const inputId = e.currentTarget.dataset.price;
    const quantity = listings.querySelector(
      `[data-id="${inputId}"] [data-quantity="${inputId}"]`
    ).innerHTML;
    const totalElement = listings.querySelector(
      `[data-id="${inputId}"] [data-total="${inputId}"]`
    );
    const price = priceInput.value === '' ? 0 : priceInput.value;
    totalElement.innerHTML = `${currencyPrefix}${formatNum(
      countTotal(parseInt(quantity), parseFloat(price), false)
    )}`;
    calculateTotal();
  });

  priceInput.type = 'number';
  priceInput.value = 0.0;
  priceInput.dataset.price = id;
  priceInputParent.innerHTML = currencyPrefix;
  priceInputParent.append(priceInput);

  priceInput.addEventListener('click', () => {
    if (priceInput.value === '0') priceInput.value = '';
  });
  priceInput.addEventListener('blur', () => {
    if (priceInput.value === '') priceInput.value = 0;
  });

  listing.append(customFieldParent);
  listing.append(priceInputParent);
  listing.append(quantityDiv);

  const total = document.createElement('p');
  total.dataset.total = id;
  total.innerHTML = '£0.00';

  listing.append(total);
  parent.append(listing);
}

function displayTenPrc(inputPrice) {
  const tenPrc = Math.round(inputPrice * 0.1 * 100) / 100;
  const tenPrcFormatted = formatNum(tenPrc);
  tenPrcValue = tenPrc;
  tenPrcElement.innerHTML = `10%: ${currencyPrefix}
  ${tenPrc}
  `;
}

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json',
      'api-key': 'admin-123',
      'Access-Control-Allow-Origin': '*',
    },
    cors: 'no-cors',
    redirect: 'manual',
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

function hideIcon(iconElement, time, className) {
  function hide() {
    iconElement.classList.add(className);
    iconElement.classList.remove('fadeout');
    iconElement.classList.remove('fadein');
    iconElement.removeEventListener('animationend', hide);
  }
  setTimeout(() => {
    iconElement.classList.add('fadeout');
    iconElement.addEventListener('animationend', hide);
  }, time);
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
const tenPrcElement = document.getElementById('tenprc-element');
const useTenButton = document.getElementById('10prc-btn');
const addShopButton = document.getElementById('addshop-btn');
const finishdayBtn = document.getElementById('finishday-btn');
const loadingIcon = document.getElementById('loadingsvg');
const successIcon = document.getElementById('successIcon');
const errorIcon = document.getElementById('errorIcon');
const isDebt = document.getElementById('isDebt');
const debtPaid = document.getElementById('debtpaid');
const debtPaidInput = document.getElementById('debtpaid-input');
const debtpaidInputField = document.getElementById('debtpaidInputField');
const debtField = document.getElementById('debtField');
let discountValue = 0;
let totalSumValue = 0;
let tenPrcValue = 0;

populateListings(items, listings);

useTenButton.addEventListener('click', () => {
  if (!(invoiceTotal.value === '')) {
    calculateTotal(true);
  }
});

function updateDebtField() {
  debtField.innerHTML = `Debt: <em>${currencyPrefix}${formatNum(
    Math.round((totalSumValue - parseFloat(debtpaidInputField.value)) * 100) /
      100
  )}</em>`;
}

debtpaidInputField.addEventListener('input', updateDebtField);

addShopButton.addEventListener('click', () => {
  let debt;
  let paid;
  if (debtPaid.checked) {
    const paidFromInput = parseFloat(debtpaidInputField.value);
    debt = totalSumValue - paidFromInput;
    paid = paidFromInput;
  } else {
    debt = isDebt.checked ? totalSumValue : 0;
    paid = !isDebt.checked ? totalSumValue : 0;
  }

  const shop = {
    discount: discountValue,
    debt: debt,
    paid: paid,
  };

  console.log(shop);
  loadingIcon.classList.remove('displaynone');
  postData('https://aurimasg7.pythonanywhere.com/data', shop).then((data) => {
    loadingIcon.classList.add('displaynone');
    if (data.message === 'SHOP ADDED') {
      successIcon.classList.remove('displaynone');
      successIcon.classList.add('fadein');
      hideIcon(successIcon, 2000, 'displaynone');
    } else {
      errorIcon.classList.remove('displaynone');
      successIcon.classList.add('fadein');
      hideIcon(errorIcon, 2000, 'displaynone');
    }
  });
});

debtPaid.addEventListener('click', () => {
  if (debtPaid.checked) {
    isDebt.checked = false;
    debtPaidInput.classList.remove('displaynone');
  } else {
    debtPaidInput.classList.add('displaynone');
  }
});
isDebt.addEventListener('click', () => {
  if (isDebt.checked) debtPaid.checked = false;
  debtPaidInput.classList.add('displaynone');
});

priceType.addEventListener('change', (e) => {
  breadPrice = priceType.value;
  updateItemsPrice();
  populateListings(items, listings);
});

function numbersOnly(e, sourceEl) {
  if (decimalDigits(sourceEl.value) > 2) {
    sourceEl.value = sourceEl.value.slice(0, sourceEl.value.length - 1);
  }
  if ((e.data !== '.' && isNaN(e.data)) || exceedsDots(sourceEl.value)) {
    sourceEl.value = sourceEl.value.slice(0, sourceEl.value.length - 1);
  } else {
    calculateTotal();
  }
}

invoiceTotal.addEventListener('input', (e) => {
  displayTenPrc(invoiceTotal.value);
  numbersOnly(e, invoiceTotal);
  updateDebtField();
});

finishdayBtn.addEventListener('click', () => {
  fetch('https://aurimasg7.pythonanywhere.com/getfile', {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json',
      'api-key': 'admin-123',
    },
    cors: 'cors',
  })
    .then((response) => response.blob())
    .then((blob) => {
      var url = window.URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'filename.xlsx';
      document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
      a.click();
      a.remove(); //afterwards we remove the element again
    })
    .catch((err) => console.log(err));
});
// After seleted shop
// Load items with correct prices
