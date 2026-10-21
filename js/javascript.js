/* =========================================================
   OJASWI ORDER SYSTEM
========================================================= */


/*
    BUSINESS CONTACT DETAILS
*/

const OJASWI_PHONE = "917620098478";

const OJASWI_DISPLAY_PHONE = "7620098478";

const OJASWI_EMAIL = "ojaswifoods@gmail.com";


/*
    PRODUCT PRICES

    Change prices here whenever required.
*/

const productPrices = {

    "Garam Masala": 199,

    "Kitchen King Masala": 199,

    "Sabji Masala": 199,

    "Chaat Masala": 199,

    "Biryani Masala": 199,

    "Pav Bhaji Masala": 199,

    "Misal Masala": 199,

    "Rajma Masala": 199,

    "Chole Masala": 199,

    "Rasam Masala": 199,

    "Sambar Masala": 199,

    "Tea Masala": 199,

    "Jaljeera Masala": 199,

    "Kasuri Methi": 99,

    "Dry Ginger Powder": 199

};


/* =========================================================
   OPEN ORDER MODAL
========================================================= */

function openOrderModal(productName, price) {

    const modal =
        document.getElementById("orderModal");

    const product =
        document.getElementById("orderProduct");

    const quantity =
        document.getElementById("orderQuantity");


    /*
        Set selected product
    */

    product.value = productName;


    /*
        Set quantity back to 1
    */

    quantity.value = 1;


    /*
        Update total
    */

    updateOrderTotal();


    /*
        Open modal
    */

    modal.classList.add("active");


    /*
        Prevent background scrolling
    */

    document.body.style.overflow = "hidden";

}


/* =========================================================
   CLOSE ORDER MODAL
========================================================= */

function closeOrderModal() {

    const modal =
        document.getElementById("orderModal");


    modal.classList.remove("active");


    document.body.style.overflow = "";

}


/* =========================================================
   CLOSE MODAL WHEN CLICKING BACKGROUND
========================================================= */

document
    .getElementById("orderModal")
    .addEventListener("click", function(event) {

        if (event.target === this) {

            closeOrderModal();

        }

    });


/* =========================================================
   QUANTITY CONTROL
========================================================= */

function changeQuantity(change) {

    const quantityInput =
        document.getElementById("orderQuantity");


    let quantity =
        parseInt(quantityInput.value) || 1;


    quantity += change;


    /*
        Minimum = 1
        Maximum = 50
    */

    if (quantity < 1) {

        quantity = 1;

    }


    if (quantity > 50) {

        quantity = 50;

    }


    quantityInput.value =
        quantity;


    updateOrderTotal();

}


/* =========================================================
   PRODUCT CHANGE
========================================================= */

document
    .getElementById("orderProduct")
    .addEventListener(
        "change",
        updateOrderTotal
    );


/* =========================================================
   UPDATE TOTAL
========================================================= */

function updateOrderTotal() {

    const product =
        document.getElementById("orderProduct").value;


    const quantity =
        parseInt(
            document.getElementById(
                "orderQuantity"
            ).value
        ) || 1;


    const price =
        productPrices[product] || 0;


    const total =
        price * quantity;


    document.getElementById(
        "orderTotal"
    ).textContent =
        "₹" + total;

}


/* =========================================================
   VALIDATE ORDER
========================================================= */

function validateOrder() {

    const name =
        document.getElementById("orderName").value.trim();


    const phone =
        document.getElementById("orderPhone").value.trim();


    const address =
        document.getElementById("orderAddress").value.trim();


    const product =
        document.getElementById("orderProduct").value;


    const quantity =
        document.getElementById("orderQuantity").value;


    if (!name) {

        alert("Please enter your name.");

        return false;

    }


    if (!/^[0-9]{10}$/.test(phone)) {

        alert(
            "Please enter a valid 10-digit phone number."
        );

        return false;

    }


    if (!address) {

        alert(
            "Please enter your delivery address."
        );

        return false;

    }


    if (!product) {

        alert(
            "Please select a product."
        );

        return false;

    }


    if (!quantity || quantity < 1) {

        alert(
            "Please select a valid quantity."
        );

        return false;

    }


    return true;

}


/* =========================================================
   GET ORDER DETAILS
========================================================= */

function getOrderDetails() {

    const name =
        document.getElementById("orderName").value.trim();


    const phone =
        document.getElementById("orderPhone").value.trim();


    const address =
        document.getElementById("orderAddress").value.trim();


    const product =
        document.getElementById("orderProduct").value;


    const quantity =
        parseInt(
            document.getElementById(
                "orderQuantity"
            ).value
        );


    const price =
        productPrices[product];


    const total =
        price * quantity;


    return {

        name: name,

        phone: phone,

        address: address,

        product: product,

        quantity: quantity,

        price: price,

        total: total

    };

}


/* =========================================================
   CREATE ORDER MESSAGE
========================================================= */

function createOrderMessage() {

    const order =
        getOrderDetails();


    const message =

`Hello Ojaswi Foods,

I would like to place an order.

Customer Details
-------------------------
Name: ${order.name}
Phone: ${order.phone}

Delivery Address:
${order.address}

Order Details
-------------------------
Product: ${order.product}
Quantity: ${order.quantity}
Price per packet: ₹${order.price}
Total Amount: ₹${order.total}

Please confirm my order.

Thank you.`;


    return message;

}


/* =========================================================
   WHATSAPP ORDER
========================================================= */

function orderThroughWhatsApp() {

    if (!validateOrder()) {

        return;

    }


    const message =
        createOrderMessage();


    const whatsappURL =
        "https://wa.me/" +
        OJASWI_PHONE +
        "?text=" +
        encodeURIComponent(message);


    window.open(
        whatsappURL,
        "_blank"
    );

}


/* =========================================================
   EMAIL / GMAIL ORDER
========================================================= */

function orderThroughEmail() {

    if (!validateOrder()) {

        return;

    }


    const order =
        getOrderDetails();


    const subject =
        "New Order - " +
        order.product;


    const body =
        createOrderMessage();


    /*
        mailto opens the customer's
        default email application.

        Gmail users can also use:
        https://mail.google.com/
    */

    const mailURL =
        "mailto:" +
        OJASWI_EMAIL +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);


    window.location.href =
        mailURL;

}


/* =========================================================
   PHONE CALL
========================================================= */

function orderThroughCall() {

    if (!validateOrder()) {

        return;

    }


    /*
        Open phone dialer
    */

    window.location.href =
        "tel:" +
        OJASWI_PHONE;

}


/* =========================================================
   SMS / MESSAGE
========================================================= */

function orderThroughSMS() {

    if (!validateOrder()) {

        return;

    }


    const message =
        createOrderMessage();


    /*
        SMS URL

        Works mainly on mobile devices.
    */

    const smsURL =
        "sms:" +
        OJASWI_PHONE +
        "?body=" +
        encodeURIComponent(message);


    window.location.href =
        smsURL;

}


/* =========================================================
   ESC KEY CLOSE
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeOrderModal();

        }

    }
);/* =========================================================
   OJASWI ORDER SYSTEM
========================================================= */


/*
    BUSINESS CONTACT DETAILS
*/

const OJASWI_PHONE = "917620098478";

const OJASWI_DISPLAY_PHONE = "7620098478";

const OJASWI_EMAIL = "ojaswifoods@gmail.com";


/*
    PRODUCT PRICES

    Change prices here whenever required.
*/

const productPrices = {

    "Garam Masala": 199,

    "Kitchen King Masala": 199,

    "Sabji Masala": 199,

    "Chaat Masala": 199,

    "Biryani Masala": 199,

    "Pav Bhaji Masala": 199,

    "Misal Masala": 199,

    "Rajma Masala": 199,

    "Chole Masala": 199,

    "Rasam Masala": 199,

    "Sambar Masala": 199,

    "Tea Masala": 199,

    "Jaljeera Masala": 199,

    "Kasuri Methi": 99,

    "Dry Ginger Powder": 199

};


/* =========================================================
   OPEN ORDER MODAL
========================================================= */

function openOrderModal(productName, price) {

    const modal =
        document.getElementById("orderModal");

    const product =
        document.getElementById("orderProduct");

    const quantity =
        document.getElementById("orderQuantity");


    /*
        Set selected product
    */

    product.value = productName;


    /*
        Set quantity back to 1
    */

    quantity.value = 1;


    /*
        Update total
    */

    updateOrderTotal();


    /*
        Open modal
    */

    modal.classList.add("active");


    /*
        Prevent background scrolling
    */

    document.body.style.overflow = "hidden";

}


/* =========================================================
   CLOSE ORDER MODAL
========================================================= */

function closeOrderModal() {

    const modal =
        document.getElementById("orderModal");


    modal.classList.remove("active");


    document.body.style.overflow = "";

}


/* =========================================================
   CLOSE MODAL WHEN CLICKING BACKGROUND
========================================================= */

document
    .getElementById("orderModal")
    .addEventListener("click", function(event) {

        if (event.target === this) {

            closeOrderModal();

        }

    });


/* =========================================================
   QUANTITY CONTROL
========================================================= */

function changeQuantity(change) {

    const quantityInput =
        document.getElementById("orderQuantity");


    let quantity =
        parseInt(quantityInput.value) || 1;


    quantity += change;


    /*
        Minimum = 1
        Maximum = 50
    */

    if (quantity < 1) {

        quantity = 1;

    }


    if (quantity > 50) {

        quantity = 50;

    }


    quantityInput.value =
        quantity;


    updateOrderTotal();

}


/* =========================================================
   PRODUCT CHANGE
========================================================= */

document
    .getElementById("orderProduct")
    .addEventListener(
        "change",
        updateOrderTotal
    );


/* =========================================================
   UPDATE TOTAL
========================================================= */

function updateOrderTotal() {

    const product =
        document.getElementById("orderProduct").value;


    const quantity =
        parseInt(
            document.getElementById(
                "orderQuantity"
            ).value
        ) || 1;


    const price =
        productPrices[product] || 0;


    const total =
        price * quantity;


    document.getElementById(
        "orderTotal"
    ).textContent =
        "₹" + total;

}


/* =========================================================
   VALIDATE ORDER
========================================================= */

function validateOrder() {

    const name =
        document.getElementById("orderName").value.trim();


    const phone =
        document.getElementById("orderPhone").value.trim();


    const address =
        document.getElementById("orderAddress").value.trim();


    const product =
        document.getElementById("orderProduct").value;


    const quantity =
        document.getElementById("orderQuantity").value;


    if (!name) {

        alert("Please enter your name.");

        return false;

    }


    if (!/^[0-9]{10}$/.test(phone)) {

        alert(
            "Please enter a valid 10-digit phone number."
        );

        return false;

    }


    if (!address) {

        alert(
            "Please enter your delivery address."
        );

        return false;

    }


    if (!product) {

        alert(
            "Please select a product."
        );

        return false;

    }


    if (!quantity || quantity < 1) {

        alert(
            "Please select a valid quantity."
        );

        return false;

    }


    return true;

}


/* =========================================================
   GET ORDER DETAILS
========================================================= */

function getOrderDetails() {

    const name =
        document.getElementById("orderName").value.trim();


    const phone =
        document.getElementById("orderPhone").value.trim();


    const address =
        document.getElementById("orderAddress").value.trim();


    const product =
        document.getElementById("orderProduct").value;


    const quantity =
        parseInt(
            document.getElementById(
                "orderQuantity"
            ).value
        );


    const price =
        productPrices[product];


    const total =
        price * quantity;


    return {

        name: name,

        phone: phone,

        address: address,

        product: product,

        quantity: quantity,

        price: price,

        total: total

    };

}


/* =========================================================
   CREATE ORDER MESSAGE
========================================================= */

function createOrderMessage() {

    const order =
        getOrderDetails();


    const message =

`Hello Ojaswi Foods,

I would like to place an order.

Customer Details
-------------------------
Name: ${order.name}
Phone: ${order.phone}

Delivery Address:
${order.address}

Order Details
-------------------------
Product: ${order.product}
Quantity: ${order.quantity}
Price per packet: ₹${order.price}
Total Amount: ₹${order.total}

Please confirm my order.

Thank you.`;


    return message;

}


/* =========================================================
   WHATSAPP ORDER
========================================================= */

function orderThroughWhatsApp() {

    if (!validateOrder()) {

        return;

    }


    const message =
        createOrderMessage();


    const whatsappURL =
        "https://wa.me/" +
        OJASWI_PHONE +
        "?text=" +
        encodeURIComponent(message);


    window.open(
        whatsappURL,
        "_blank"
    );

}


/* =========================================================
   EMAIL / GMAIL ORDER
========================================================= */

function orderThroughEmail() {

    if (!validateOrder()) {

        return;

    }


    const order =
        getOrderDetails();


    const subject =
        "New Order - " +
        order.product;


    const body =
        createOrderMessage();


    /*
        mailto opens the customer's
        default email application.

        Gmail users can also use:
        https://mail.google.com/
    */

    const mailURL =
        "mailto:" +
        OJASWI_EMAIL +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);


    window.location.href =
        mailURL;

}


/* =========================================================
   PHONE CALL
========================================================= */

function orderThroughCall() {

    if (!validateOrder()) {

        return;

    }


    /*
        Open phone dialer
    */

    window.location.href =
        "tel:" +
        OJASWI_PHONE;

}


/* =========================================================
   SMS / MESSAGE
========================================================= */

function orderThroughSMS() {

    if (!validateOrder()) {

        return;

    }


    const message =
        createOrderMessage();


    /*
        SMS URL

        Works mainly on mobile devices.
    */

    const smsURL =
        "sms:" +
        OJASWI_PHONE +
        "?body=" +
        encodeURIComponent(message);


    window.location.href =
        smsURL;

}


/* =========================================================
   ESC KEY CLOSE
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeOrderModal();

        }

    }
);