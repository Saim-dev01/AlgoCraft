// src/utils/sessionService.js

import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, getDocs, orderBy, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Save a new session under algocraft/{uid}/sessions
export async function saveUserSession(algorithm, inputParams, duration, result, notes = "") {
  // Check if history is enabled in localStorage
  const enabled = localStorage.getItem('algocraft-history-enabled');
  if (enabled === 'false') return;
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(
    collection(db, "algocraft", user.uid, "sessions"),
    {
      algorithm,
      inputParams,
      duration,
      result,
      notes,
      device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
      timestamp: serverTimestamp()
    }
  );
}

// Fetch all sessions for the current user
export async function getUserSessions() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, "algocraft", user.uid, "sessions"),
    orderBy("timestamp", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
