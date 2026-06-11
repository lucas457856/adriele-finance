import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBibujT0ZMG3ObFRDF4KvVr_KfRMp26DZo",
  authDomain: "agt-adriele.firebaseapp.com",
  projectId: "agt-adriele",
  storageBucket: "agt-adriele.firebasestorage.app",
  messagingSenderId: "827046066864",
  appId: "1:827046066864:web:7d593be4bd929e46ac1975",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);