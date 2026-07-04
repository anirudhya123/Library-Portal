import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  getDocFromServer,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCiB-dYuzhLEqdm-Eutgw05STSASYY5S28",
  authDomain: "library-management-6ced0.firebaseapp.com",
  projectId: "library-management-6ced0",
  storageBucket: "library-management-6ced0.firebasestorage.app",
  messagingSenderId: "964430196274",
  appId: "1:964430196274:web:38ca64ff301d308383162b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Validate connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore initialized and connected successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client appears to be offline.");
    } else {
      console.error("Connection check warning: ", error);
    }
  }
}
testConnection();

// Skill requirement: handleFirestoreError function
const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  alert(`Firestore Error [${operationType}]: ${errInfo.error}`);
  throw new Error(JSON.stringify(errInfo));
}

export {
  app,
  db,
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  serverTimestamp,
  OperationType,
  handleFirestoreError
};
