
import React from "react";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  LogOut,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Patient Registration", icon: Users },
  { name: "Appointments", icon: CalendarDays },
  { name: "Doctors", icon: Stethoscope },
];

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h2>🏥 City Care</h2>
        <p>Hospital Management</p>
      </div>

      <div className="sidebar-menu">
        <h4>MAIN MENU</h4>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              type="button"
              key={item.name}
              onClick={() => setActivePage(item.name)}
              className={`menu-item ${
                activePage === item.name ? "active" : ""
              }`}
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-logout">
        <LogOut size={19} />
        <span>Logout</span>
      </div>

    </aside>
  );
}

export default Sidebar;
