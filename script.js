const API_KEY = '4TQU66HTCC74MR96BRQY44E6ZB6RIKJU';
const FORMAT = 'output_format=JSON';
const URL = `https://www.boardgamer.ie/api`;

//Returns the IDs of every order with a particular status
function getOrderIds() {
  return fetch(
    `${URL}/orders/?ws_key=${API_KEY}&filter[current_state]=[2]&${FORMAT}&rand=${Math.floor(
      Math.random() * 1000000
    )}`
  ).then(res => {
    return res.json();
  });
}

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
        phone: res.phone.replace(/\D+/g, ''),
        phone_mobile: res.phone_mobile.replace(/\D+/g, '')
      };
    });
}

function getCarrierDetails(id) {
  return fetch(`${URL}/carriers/${id}/?ws_key=${API_KEY}&${FORMAT}`)
    .then(res => {
      return res.json();
    })
    .then(res => {
      return { id_carrier: res.carrier.id, carrier: res.carrier.name };
    });
}

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

function getCustomerOrderDetails(orderDetails) {
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
    });
}

function start() {
  getOrderIds().then(data => {
    data.orders.forEach(order => {
      getOrderDetails(order.id).then(orderDetails => {
        getCustomerOrderDetails(orderDetails).then(res => {
          if (res.id_carrier === '193') {
            res.address1 = res.address2 = res.city = res.company = res.state =
              'Collection';
          }

          console.log(res);
        });
      });
    });
  });
}

document.querySelector('.status').addEventListener('click', start);
