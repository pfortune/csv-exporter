const API_KEY = '4TQU66HTCC74MR96BRQY44E6ZB6RIKJU';
const FORMAT = 'output_format=JSON';
const URL = `https://www.boardgamer.ie/api`;
const status = { payment_accepted: 2 };
let order_ids = {};

async function main() {
  let orders = [];
  // fetch orderids of the selected status
  let response = await getOrders(status.payment_accepted);
  let json = await response.json();

  order_ids = json.orders;

  for (let data in order_ids) {
    let order_response = await getOrderById(order_ids[data].id);
    let order_json = await order_response.json();

    let order = order_json.order;
    let address_id = order.id_address_delivery;

    let address_response = await getAddressById(address_id);
    let address_json = await address_response.json();

    let address = address_json.address;
    let state = '';
    if (address_json.id_state > 0) {
      let state_response = await getState(address.id_state);
      let state_json = await state_response.json();

      state = state_json.state;
    }

    let country_response = await getCountry(address.id_country);
    let country_json = await country_response.json();

    let country = country_json.country.name;

    let customer_response = await getCustomerEmail(order.id_customer);
    let customer_json = await customer_response.json();

    let email = customer_json.customer.email;

    orders[order.id] = {
      company: address.company,
      firstname: address.firstname,
      lastname: address.lastname,
      order_no: order.id,
      invoice_date: order.invoice_date,
      products: order.associations.order_rows,
      id_customer: order.id_customer,
      address1: address.address1,
      address2: address.address2,
      address3: address.address3,
      city: address.city,
      state: state.name,
      phone: address.phone,
      phone_mobile: address.phone_mobile,
      email: email,
      eircode: address.postcode,
      id_carrier: order.id_carrier,
      country: country
    };
  }

  downloadCSV(buildCSV(orders));
}

let getOrders = function(stateId) {
  return fetch(
    `${URL}/orders/?ws_key=${API_KEY}&${FORMAT}&filter[current_state]=[${stateId}]&rand=${Math.floor(
      Math.random() * 1000000
    )}`
  );
};

let getOrderById = function(id) {
  return fetch(`${URL}/orders/${id}/?ws_key=${API_KEY}&${FORMAT}`);
};

let getState = function(id) {
  return fetch(`${URL}/states/${id}/?ws_key=${API_KEY}&${FORMAT}`);
};

let getCountry = function(country_id) {
  return fetch(`${URL}/countries/${country_id}/?ws_key=${API_KEY}&${FORMAT}`);
};

let getCustomerEmail = function(customer_id) {
  return fetch(`${URL}/customers/${customer_id}/?ws_key=${API_KEY}&${FORMAT}`);
};

let getAddressById = function(id) {
  return fetch(`${URL}/addresses/${id}/?ws_key=${API_KEY}&${FORMAT}`);
};

let buildCSV = function(data) {
  let csv =
    'Company,Firstname,Lastname,Order,Date,Quantity,Customer,Address1,Address2,Address3,City,State,Postcode,Other,Country,Email,Sku,Phone\n';
  data.forEach(function(order) {
    console.log(order);
    for (let i = 0; i < order.products.length; i++) {
      csv += escape(order.company);
      csv += escape(order.firstname);
      csv += escape(order.lastname);
      csv += order.order_no + ',';
      csv += order.invoice_date + ',';
      csv += order.products[i].product_quantity + ',';
      csv += order.id_customer + ',';

      // check if the order is for collection, and change all the address fields
      if (order.id_carrier === '193') {
        csv +=
          'Collection,Collection,Collection,Collection,Collection,Collection,Collection,Collection,';
      } else {
        csv += escape(order.address1);
        csv += escape(order.address2);
        csv += escape(order.address3);
        csv += escape(order.city);
        csv += escape(order.state);
        csv += escape(order.eircode);
        csv += escape(order.other);
        csv += escape(order.country);
      }

      csv += escape(order.email);
      csv += order.products[i].product_reference + ',';
      csv += order.phone_mobile
        ? `"${order.phone_mobile}"`
        : `"${order.phone}"`;
      csv += '\n';
    }
  });

  return csv;
};

let downloadCSV = function(csv) {
  let hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = `orders.csv`;
  hiddenElement.click();
};

function escape(data) {
  return (data ? `"${data}"` : '') + ',';
}

document.querySelector('.download').addEventListener('click', main);
