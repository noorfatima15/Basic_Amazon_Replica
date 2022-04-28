import React, { useEffect } from "react";
import "./App.css";
import Header from "./Header";
import Home from "./Home";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavigationType,
  //useNavigate,
} from "react-router-dom";
import Checkout from "./Checkout";
import Login from "./Login";
import Payment from "./Payment";
// import Orders from "./Orders";
import { auth } from "./firebase";
import { useStateValue } from "./StateProvider";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Orders from "./Orders";

const stripePromise = loadStripe(
  "pk_test_51KHFX1SIFSxGoVEhz0U0DLrVSSrAAYuJ3Ulf6vpxfYpnboLku0bJlkwHyGSppuaVCqJKp7LM2O1nHMlfZVG2iLQI00ttUwiiEt"
);

function App() {
  const [{ user }, dispatch] = useStateValue();
  // const navigate = useNavigate();

  useEffect(() => {
    // will only run once when the app component loads...

    auth.onAuthStateChanged((authUser) => {
      console.log("THE USER IS >>> ", authUser);

      if (authUser) {
        // the user just logged in / the user was logged in

        dispatch({
          type: "SET_USER",
          user: authUser,
        });
      } else {
        // the user is logged out
        dispatch({
          type: "SET_USER",
          user: null,
        });
        // navigate("/login");
        console.log("===", window.location.pathname);
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    });
  }, []);

  const options = {
    // passing the client secret obtained from the server
    clientSecret:
      "{{sk_test_51KHFX1SIFSxGoVEhWWxcD6ntrZCjWtO13AmCTcXWnnzgbS0s44R6V2ZK6U5ixP0KI0M24gBm1UgPCYt16NYunuW200HGglINFd}}",
  };

  return (
    <Elements stripe={stripePromise}>
      <div>
        <Router>
          {user && <Header />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />

            <Route path="/login" element={<Login />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </Router>
      </div>
    </Elements>
  );
}

export default App;
