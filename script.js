document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "4TQU66HTCC74MR96BRQY44E6ZB6RIKJU";
  const FORMAT = "output_format=JSON";
  const URL = `https://www.boardgamer.ie/api`;
  const orders = {};

  // fetch the order from api and return json
  function getOrder() {
    let id = document.querySelector(".orderid").value;
    let promise = fetch(`${URL}/orders/${id}/?ws_key=${API_KEY}&${FORMAT}`);

    promise
      .then(res => res.json())
      .then(processedResponse => {
        createOrderObject(processedResponse.order);
      });
  }

  function getAddress() {
    let promise = fetch(
      `${URL}/address/${orders.addressId}/?ws_key=${API_KEY}&${FORMAT}`
    );
    promise
      .then(res => res.json())
      .then(processedResponse => {
        addAddressToOrderObject(processedResponse.address);
      });
  }

  function createOrderObject(order) {
    orders.orderId = order.id;
    orders.addressId = order.id_address_invoice;
    orders.carrierId = order.id_carrier;
    orders.invoiceDate = order.invoice_date;

    getAddress();
  }

  function addAddressToOrderObject(address) {
    orders.firstname = address.firstname;
    orders.lastname = address.lastname;
  }

  function printOrder(data) {
    const pre = document.createElement("pre");
    const orderDetails = document.querySelector(".order_details");
    pre.innerText = data;
    orderDetails.appendChild(pre);

    //console.log(pre);
  }

  //   promise
  //       .then(res => req.json())
  //       .then(processedResponse => {
  //           console.log(processedResponse.message);
  //       });

  // processAddress(addressRes.address);

  document.querySelector(".import").addEventListener("click", getOrder);

  // const addressRes = {
  //   address: {
  //     id: 1257,
  //     id_customer: "1075",
  //     id_manufacturer: "0",
  //     id_supplier: "0",
  //     id_warehouse: "0",
  //     id_country: "26",
  //     id_state: "318",
  //     alias: "My address",
  //     company: "",
  //     lastname: "Czaczyk",
  //     firstname: "Roland",
  //     vat_number: "",
  //     address1: "67 Bremore Pastures Way",
  //     address2: "",
  //     postcode: "",
  //     city: "Balbriggan",
  //     other: "",
  //     phone: "",
  //     phone_mobile: "0862136788",
  //     dni: "",
  //     deleted: "0",
  //     date_add: "2015-02-05 23:20:30",
  //     date_upd: "2015-02-05 23:20:30"
  //   }
  // };
});
