
import React, { useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import PatientRegistration from "./pages/PatientRegistration";
import Appointments from "./pages/Appointments";
import Doctors from "./pages/Doctors";

import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return (
          <Dashboard setActivePage={setActivePage} />
        );

      case "Patient Registration":
        return <PatientRegistration />;

      case "Appointments":
        return <Appointments />;

      case "Doctors":
        return <Doctors />;

      default:
        return (
          <div className="coming-soon">
            <h2>{activePage}</h2>
            <p>This module will be developed next.</p>
          </div>
        );
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">
        <Header />
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
