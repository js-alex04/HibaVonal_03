import React, { useState, useEffect } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function AppContent() {
  const { user } = useAuth();

  return <div className="App">{user ? <Dashboard /> : <Login />}</div>;
}

function App() {
  // Ide mentjük el a backendről kapott üzenetet
  const [serverMessage, setServerMessage] = useState("Töltés...");

  // A useEffect akkor fut le, amikor az oldal betöltődik
  useEffect(() => {
    fetch("https://localhost:7192/api/test")
      .then((response) => response.json())
      .then((data) => {
        setServerMessage(data.message); // Beállítjuk a kapott szöveget
      })
      .catch((error) => {
        console.error("Hiba történt a lekérdezéskor:", error);
        setServerMessage("Nem sikerült csatlakozni a szerverhez.");
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Frontend - Backend Teszt</h1>
        {/* Itt jelenítjük meg a szerver üzenetét */}
        <p style={{ color: "lightgreen", fontWeight: "bold" }}>
          Backend üzenete: {serverMessage}
        </p>
      </header>
    </div>
  );
}

export default App;
