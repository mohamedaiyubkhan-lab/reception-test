
import React from "react";
import { Bell, Search, UserCircle } from "lucide-react";

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <h2>Reception Dashboard</h2>
        <p>Welcome back! Manage your hospital activities.</p>
      </div>

      <div className="header-right">
        <div className="search-box">
          <Search size={18} />
          <input placeholder="Search here..." />
        </div>

        <button className="notification-button">
          <Bell size={21} />
          <span className="notification-dot"></span>
        </button>

        <div className="profile">
          <UserCircle size={38} />
          <div>
            <h4>Reception Admin</h4>
            <span>Receptionist</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
