import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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
const db = getFirestore(app);

async function testRead() {
  try {
    const s = await getDoc(doc(db, "settings", "theme"));
    console.log("Read success, exists:", s.exists());
    if (s.exists()) console.log("Data:", s.data());
  } catch (err) {
    console.log("Read error:", err.code, err.message);
  }
}

testRead();

