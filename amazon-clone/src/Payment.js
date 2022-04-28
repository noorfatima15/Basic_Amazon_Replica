import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CurrencyFormat from "react-currency-format";

import CheckoutProduct from "./CheckoutProduct";
import { useStateValue } from "./StateProvider";
import { getBasketTotal } from "./reducer";
import axios from "./axios";
import { db } from "./firebase";
import "./Payment.css";

function Payment() {
  const [{ basket, user }, dispatch] = useStateValue();
  const navigate = useNavigate();

  const stripe = useStripe();
  const elements = useElements();

  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState("");
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState(true);

  useEffect(() => {
    // generate the special stripe secret which allows us to charge a customer
    // const getClientSecret = async () => {
    //   const response = await axios({
    //     method: "post",
    //     // Stripe expects the total in a currencies subunits
    //     url: `/payments/create?total=${getBasketTotal(basket) * 100}`,
    //   });
    //   setClientSecret(response.data.clientSecret);
    // };
    // getClientSecret();
    setSucceeded(false);
    setError(null);
    setProcessing(false);
    console.log(getBasketTotal(basket));
  }, [basket]);

  //console.log('THE SECRET IS >>>', clientSecret)
  //console.log('👱', user)

  const handleSubmit = async (event) => {
    // do all the fancy stripe stuff...
    event.preventDefault();
    setProcessing(true);
    console.log(user);
    const payload = await stripe
      .createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
      })
      .then((paymentIntent) => {
        console.log(paymentIntent); //paymentMethod
        if (paymentIntent?.error) {
          //   console.log(err);
          setProcessing(false);
          setError(paymentIntent?.error?.message);
          return;
        }

        db.collection("users")
          .doc(user?.uid)
          .collection("orders")
          .doc(paymentIntent?.paymentMethod?.id)
          .set({
            basket: basket,
            created: paymentIntent?.paymentMethod?.created,
            amount: getBasketTotal(basket),
          })
          .then(() => {
            setSucceeded(true);
            setError(null);
            setProcessing(false);
            navigate("/orders");
          })
          .catch((err) => {
            console.log(err);
            setProcessing(false);
            setError(err?.message);
          });
      })
      .catch((err) => {
        console.log(err);
        setProcessing(false);
        setError(err?.message);
      });

    // const payload = await stripe
    //   .confirmCardPayment(
    //     "sk_test_51KHFX1SIFSxGoVEhWWxcD6ntrZCjWtO13AmCTcXWnnzgbS0s44R6V2ZK6U5ixP0KI0M24gBm1UgPCYt16NYunuW200HGglINFd",
    //     {
    //       payment_method: {
    //         card: elements.getElement(CardElement),
    //       },
    //     }
    //   )
    //   .then(({ paymentIntent }) => {
    //     // paymentIntent = payment confirmation

    //     // db
    //     //   .collection('users')
    //     //   .doc(user?.uid)
    //     //   .collection('orders')
    //     //   .doc(paymentIntent.id)
    //     //   .set({
    //     //       basket: basket,
    //     //       amount: paymentIntent.amount,
    //     //       created: paymentIntent.created
    //     //   })

    //     setSucceeded(true);
    //     setError(null);
    //     setProcessing(false);

    //     // dispatch({
    //     //     type: 'EMPTY_BASKET'
    //     // })

    //     history.replace("/orders");
    //   });
  };

  const handleChange = (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  return (
    <div className="payment">
      <div className="payment__container">
        <h1>
          Checkout (<Link to="/checkout">{basket?.length} items</Link>)
        </h1>

        {/* Payment section - delivery address */}
        <div className="payment__section">
          <div className="payment__title">
            <h3>Delivery Address</h3>
          </div>
          <div className="payment__address">
            <p>{user?.email}</p>
            <p>123 React Lane</p>
            <p>Los Angeles, CA</p>
          </div>
        </div>

        {/* Payment section - Review Items */}
        <div className="payment__section">
          <div className="payment__title">
            <h3>Review items and delivery</h3>
          </div>
          <div className="payment__items">
            {basket.map((item, ind) => (
              <CheckoutProduct
                id={item.id}
                key={ind}
                title={item.title}
                image={item.image}
                price={item.price}
                rating={item.rating}
              />
            ))}
          </div>
        </div>

        {/* Payment section - Payment method */}
        <div className="payment__section">
          <div className="payment__title">
            <h3>Payment Method</h3>
          </div>
          <div className="payment__details">
            {/* Stripe magic will go */}

            <form onSubmit={handleSubmit}>
              <CardElement onChange={handleChange} />

              <div className="payment__priceContainer">
                <CurrencyFormat
                  renderText={(value) => <h3>Order Total: {value}</h3>}
                  decimalScale={2}
                  value={getBasketTotal(basket)}
                  displayType={"text"}
                  thousandSeparator={true}
                  prefix={"$"}
                />
                <button
                  disabled={processing || disabled || succeeded}
                  type="submitt"
                >
                  <span>{processing ? <p>Processing</p> : "Buy Now"}</span>
                </button>
              </div>

              {/* Errors */}
              {error && <div>{error}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
