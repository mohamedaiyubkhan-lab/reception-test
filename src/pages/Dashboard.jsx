
import React, { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  Stethoscope,
  CheckCircle,
  Clock,
  ArrowUpRight,
  UserPlus,
  CalendarPlus,
  Activity,
  HeartPulse
} from "lucide-react";

import "./Dashboard.css";
import { getAppointments } from "../utils/appointmentStorage";

const getSavedData = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

// Support different appointment field names
const getPatientName = (item) =>
  item.patientName ||
  item.patient ||
  item.name ||
  "Unknown";

const getDoctorName = (item) =>
  item.doctorName ||
  item.doctor ||
  item.doctor_name ||
  "Not assigned";

const getAppointmentDate = (item) =>
  item.appointmentDate ||
  item.date ||
  item.bookingDate ||
  "";

const getAppointmentTime = (item) =>
  item.appointmentTime ||
  item.time ||
  item.bookingTime ||
  "";

const getAppointmentStatus = (item) =>
  item.status || "Pending";

const normalizeDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function Dashboard({ setActivePage }) {
  const [patients, setPatients] = useState(() =>
    getSavedData("hospitalPatients")
  );

  const [appointments, setAppointments] = useState(() =>
    getAppointments()
  );

  const [doctors, setDoctors] = useState(() =>
    getSavedData("hospitalDoctorAvailability")
  );

  // Refresh dashboard data
  useEffect(() => {
    const refreshData = () => {
      setPatients(getSavedData("hospitalPatients"));
      setAppointments(getAppointments());
      setDoctors(getSavedData("hospitalDoctorAvailability"));
    };

    // Initial refresh
    refreshData();

    // Same-tab appointment updates
    window.addEventListener("appointments-updated", refreshData);

    // Updates from another browser tab
    window.addEventListener("storage", refreshData);

    // Refresh when returning to the dashboard tab
    window.addEventListener("focus", refreshData);

    return () => {
      window.removeEventListener("appointments-updated", refreshData);
      window.removeEventListener("storage", refreshData);
      window.removeEventListener("focus", refreshData);
    };
  }, []);

  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  const todayAppointments = appointments.filter((item) => {
    return normalizeDate(getAppointmentDate(item)) === todayString;
  });

  const availableDoctors = doctors.filter(
    (doctor) =>
      doctor.available === true ||
      doctor.status?.toLowerCase() === "available"
  ).length;

  const confirmedAppointments = appointments.filter(
    (item) =>
      getAppointmentStatus(item).toLowerCase() === "confirmed"
  ).length;

  const recentAppointments = [...appointments]
    .sort((a, b) => {
      const dateA = new Date(
        `${normalizeDate(getAppointmentDate(a)) || "2000-01-01"}T${getAppointmentTime(a) || "00:00"}`
      );

      const dateB = new Date(
        `${normalizeDate(getAppointmentDate(b)) || "2000-01-01"}T${getAppointmentTime(b) || "00:00"}`
      );

      return dateB - dateA;
    })
    .slice(0, 5);

  const stats = [
    {
      title: "Total Patients",
      value: patients.length,
      subtitle: "Registered patients",
      icon: Users,
      color: "blue",
      page: "Patient Registration"
    },
    {
      title: "Appointments",
      value: appointments.length,
      subtitle: `${todayAppointments.length} scheduled today`,
      icon: CalendarDays,
      color: "purple",
      page: "Appointments"
    },
    {
      title: "Available Doctors",
      value: availableDoctors,
      subtitle: `${doctors.length} registered doctors`,
      icon: Stethoscope,
      color: "green",
      page: "Doctors"
    },
    {
      title: "Confirmed",
      value: confirmedAppointments,
      subtitle: "Confirmed appointments",
      icon: CheckCircle,
      color: "orange",
      page: "Appointments"
    }
  ];

  const goTo = (page) => {
    if (setActivePage) {
      setActivePage(page);
    }
  };

  const getInitial = (name) =>
    (name || "P").charAt(0).toUpperCase();

  return (
    <div className="dashboard-page">

      {/* Welcome Banner */}
      <section className="dashboard-welcome">
        <div className="welcome-content">
          <span className="welcome-tag">
            <HeartPulse size={15} /> HOSPITAL MANAGEMENT
          </span>

          <h1>Welcome Back, Receptionist! 👋</h1>

          <p>
            Manage your patients, doctors and appointments
            from one place.
          </p>

          <button
            className="welcome-button"
            onClick={() => goTo("Patient Registration")}
          >
            <UserPlus size={17} />
            Register New Patient
          </button>
        </div>

        <div className="welcome-illustration">
          <div className="welcome-circle">
            <span>🏥</span>
          </div>
          <div className="welcome-floating">✚</div>
        </div>
      </section>

      {/* Statistics */}
      <div className="dashboard-section-heading">
        <div>
          <h2>Hospital Overview</h2>
          <p>Here's what's happening in your hospital</p>
        </div>

        <span className="dashboard-live">
          <span></span> Live Overview
        </span>
      </div>

      <section className="dashboard-stats">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              className={`dashboard-stat-card ${item.color}`}
              key={item.title}
              onClick={() => goTo(item.page)}
            >
              <div className="stat-top">
                <div className="stat-icon">
                  <Icon size={23} />
                </div>
                <ArrowUpRight size={19} className="stat-arrow" />
              </div>

              <h2>{item.value}</h2>
              <h4>{item.title}</h4>
              <p>{item.subtitle}</p>
            </div>
          );
        })}
      </section>

      {/* Main Dashboard Content */}
      <section className="dashboard-content-grid">

        {/* Recent Appointments */}
        <div className="dashboard-panel appointments-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Appointments</h3>
              <p>Your latest appointment records</p>
            </div>

            <button
              className="view-all-button"
              onClick={() => goTo("Appointments")}
            >
              View All <ArrowUpRight size={16} />
            </button>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="dashboard-empty">
              <CalendarDays size={38} />
              <h3>No Appointments Found</h3>
              <p>Register an appointment to see it here.</p>

              <button onClick={() => goTo("Appointments")}>
                Book Appointment
              </button>
            </div>
          ) : (
            <div className="recent-table-wrapper">
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentAppointments.map((item, index) => {
                    const patientName = getPatientName(item);
                    const doctorName = getDoctorName(item);
                    const appointmentDate = getAppointmentDate(item);
                    const appointmentTime = getAppointmentTime(item);
                    const status = getAppointmentStatus(item);

                    return (
                      <tr key={item.id || item.appointmentId || index}>
                        <td>
                          <div className="recent-patient">
                            <div className="patient-avatar">
                              {getInitial(patientName)}
                            </div>
                            <span>{patientName}</span>
                          </div>
                        </td>

                        <td>{doctorName}</td>

                        <td>
                          <div className="date-cell">
                            <Clock size={14} />
                            {appointmentDate || "-"}
                            <small>{appointmentTime}</small>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`appointment-status ${status.toLowerCase()}`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Hospital Activity */}
        <div className="dashboard-panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>Hospital Activity</h3>
              <p>Current registration overview</p>
            </div>
            <Activity size={22} />
          </div>

          <div className="activity-item">
            <div className="activity-label">
              <span><Users size={16} /> Patients</span>
              <strong>{patients.length}</strong>
            </div>
            <div className="activity-progress">
              <div
                style={{
                  width: `${Math.min(patients.length * 5, 100)}%`
                }}
              ></div>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-label">
              <span><CalendarDays size={16} /> Appointments</span>
              <strong>{appointments.length}</strong>
            </div>
            <div className="activity-progress purple-progress">
              <div
                style={{
                  width: `${Math.min(appointments.length * 5, 100)}%`
                }}
              ></div>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-label">
              <span><Stethoscope size={16} /> Available Doctors</span>
              <strong>{availableDoctors}</strong>
            </div>
            <div className="activity-progress green-progress">
              <div
                style={{
                  width: `${
                    doctors.length
                      ? (availableDoctors / doctors.length) * 100
                      : 0
                  }%`
                }}
              ></div>
            </div>
          </div>

          <div className="activity-summary">
            <CheckCircle size={19} />
            <div>
              <strong>System Overview</strong>
              <p>Your saved records are displayed here.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="dashboard-panel quick-actions-panel">
        <div className="panel-heading">
          <div>
            <h3>Quick Actions</h3>
            <p>Frequently used reception operations</p>
          </div>
        </div>

        <div className="quick-actions">
          <button onClick={() => goTo("Patient Registration")}>
            <span className="quick-icon blue-quick">
              <UserPlus size={22} />
            </span>
            <span>
              <strong>New Patient</strong>
              <small>Register a patient</small>
            </span>
            <ArrowUpRight size={17} />
          </button>

          <button onClick={() => goTo("Appointments")}>
            <span className="quick-icon purple-quick">
              <CalendarPlus size={22} />
            </span>
            <span>
              <strong>Book Appointment</strong>
              <small>Schedule a visit</small>
            </span>
            <ArrowUpRight size={17} />
          </button>

          <button onClick={() => goTo("Doctors")}>
            <span className="quick-icon green-quick">
              <Stethoscope size={22} />
            </span>
            <span>
              <strong>Doctor Details</strong>
              <small>Manage doctors</small>
            </span>
            <ArrowUpRight size={17} />
          </button>
        </div>
      </section>

    </div>
  );
}

export default Dashboard;
