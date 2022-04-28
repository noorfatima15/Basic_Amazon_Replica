import firebase from "firebase";
//import "firebase/firestore";
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD9lQI6bFiGeNHg1-uL07XSCEdT053Y7Gg",
  authDomain: "ecommerce-webandapp.firebaseapp.com",
  projectId: "ecommerce-webandapp",
  storageBucket: "ecommerce-webandapp.appspot.com",
  messagingSenderId: "485990807907",
  appId: "1:485990807907:web:b5af470b3c905db001fb56",
  measurementId: "G-L98R72FKQ1",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
// let db;
// let auth;

export { db, auth };
