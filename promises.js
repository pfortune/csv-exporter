const API_KEY = "4TQU66HTCC74MR96BRQY44E6ZB6RIKJU";
const FORMAT = "output_format=JSON";
const URL = `https://www.boardgamer.ie/api`;

//
async function getOrders() {
  const orders = await getOrderIds();

  orders.forEach(order => {
    getOrderDetails(order.id).then(orderDetails => {
      customerOrderDetails(orderDetails);
    });
  });
}

//Returns the IDs of every order with a particular status
function getOrderIds() {
  return fetch(
    `${URL}/orders/?ws_key=${API_KEY}&filter[current_state]=[2]&${FORMAT}&rand=${Math.floor(
      Math.random() * 1000000
    )}`
  )
    .then(res => {
      return res.json();
    })
    .then(res => res.orders);
}

// fetches products and various ids needed for future calls
function getOrderDetails(id) {
  return fetch(`${URL}/orders/${id}/?ws_key=${API_KEY}&${FORMAT}`)
    .then(res => {
      return res.json();
    })
    .then(res => {
      return {
        id: res.order.id,
        id_address_delivery: res.order.id_address_delivery,
        id_carrier: res.order.id_carrier,
        id_customer: res.order.id_customer,
        products: res.order.associations.order_rows
      };
    });
}

// fetches address details, uses id_address_delivery from getOrderDetails
function getAddressDetails(id) {
  return fetch(`${URL}/addresses/${id}/?ws_key=${API_KEY}&${FORMAT}`)
    .then(res => {
      return res.json();
    })
    .then(res => {
      return res.address;
    })
    .then(res => {
      return {
        id_state: res.id_state,
        company: res.company,
        firstname: res.firstname,
        lastname: res.lastname,
        address1: res.address1,
        address2: res.address2,
        postcode: res.postcode,
        city: res.city,
        other: res.other,
        phone: res.phone.replace(/\D+/g, ""),
        phone_mobile: res.phone_mobile.replace(/\D+/g, "")
      };
    });
}

// fetches carrier information, uses id_carrier from getOrderDetails
function getCarrierDetails(id) {
  return fetch(`${URL}/carriers/${id}/?ws_key=${API_KEY}&${FORMAT}`)
    .then(res => {
      return res.json();
    })
    .then(res => {
      return { id_carrier: res.carrier.id, carrier: res.carrier.name };
    });
}

// fetches the customer email address, uses id_customer from getOrderDetails
function getCustomerDetails(id) {
  return fetch(`${URL}/customers/${id}/?ws_key=${API_KEY}&${FORMAT}`)
    .then(res => {
      return res.json();
    })
    .then(res => {
      return {
        email: res.customer.email
      };
    });
}

// fetches the name of state/county, uses id_state from getAddressDetails
function getStateDetails(id) {
  return fetch(`${URL}/states/${id}/?ws_key=${API_KEY}&${FORMAT}`)
    .then(res => {
      return res.json();
    })
    .then(res => {
      return {
        state: res.state.name
      };
    });
}

// combines the customer, address, carrier, state, and orderdetails together
function customerOrderDetails(orderDetails) {
  return Promise.all([
    getCustomerDetails(orderDetails.id_customer),
    getAddressDetails(orderDetails.id_address_delivery),
    getCarrierDetails(orderDetails.id_carrier),
    orderDetails
  ])
    .then(([customer, address, carrier]) => {
      return { ...customer, ...address, ...carrier, ...orderDetails };
    })
    .then(order => {
      return Promise.all([getStateDetails(order.id_state), order]);
    })
    .then(([state, order]) => {
      return { ...state, ...order };
    })
    .then(orders => {
      assignCollectionOrders(orders);
    });
}

// if an order has the carrier with id 193 it is marked for collection
function assignCollectionOrders(order) {
  const COLLECTION = "193";
  if (order.id_carrier === COLLECTION) {
    order.address1 = order.address2 = order.city = order.company = order.state =
      "Collection";
  }
  console.log(order);
  return order;
}

function buildCSV() {
  let csv =
    "Company,Firstname,Lastname,Order,Date,Quantity,Customer,Address1,Address2,Address3,City,State,Postcode,Other,Country,Email,Sku,Phone\n";
}

document.querySelector(".status").addEventListener("click", getOrders);
