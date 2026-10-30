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

async function testUser() {
  const email = process.env.ADMIN_EMAIL || "admin@hotel.com";
  const pass = process.env.ADMIN_PASSWORD || "";
  if (!pass) {
    console.log("Please provide ADMIN_PASSWORD environment variable.");
    return;
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    console.log("Signed in as:", cred.user.email);
  } catch (err) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      console.log("Created user in Firebase Auth:", cred.user.email);
    } catch (cErr) {
      console.log("User create note:", cErr.code, cErr.message);
    }
  }
}

testUser();

