import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8P4bhQfpCj7w69olTS0OfrZbLKXFFdgc",
  authDomain: "hotel-demo-8b71d.firebaseapp.com",
  projectId: "hotel-demo-8b71d",
  storageBucket: "hotel-demo-8b71d.firebasestorage.app",
  messagingSenderId: "147315228890",
  appId: "1:147315228890:web:56a864b3dc95118e2da5e3",
  measurementId: "G-FZTXZE1VDX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testAuth() {
  const email = process.env.ADMIN_EMAIL || "admin@hotel.com";
  const pass = process.env.ADMIN_PASSWORD || "";
  if (!pass) {
    console.log("Please provide ADMIN_PASSWORD environment variable.");
    return;
  }
  console.log("Testing Firebase Auth for", email);
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    console.log("Signed in successfully:", cred.user.uid);
  } catch (err) {
    console.log("Sign-in failed, trying to create user:", err.code);
    try {
      const newCred = await createUserWithEmailAndPassword(auth, email, pass);
      console.log("Created user successfully:", newCred.user.uid);
    } catch (createErr) {
      console.log("User creation failed:", createErr.code, createErr.message);
    }
  }
}

testAuth();

