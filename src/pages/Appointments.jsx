
import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  CalendarCheck,
  Phone
} from "lucide-react";
import "./Appointments.css";
import {
  getAppointments,
  saveAppointments
} from "../utils/appointmentStorage";

const APPOINTMENT_KEY = "hospital_appointments";
const PATIENT_KEY = "hospitalPatients";
const DOCTOR_KEY = "hospitalDoctorAvailability";

const defaultDoctors = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    department: "Cardiology",
    hours: "09:00 AM - 05:00 PM",
    available: true
  },
  {
    id: 2,
    name: "Dr. Priya Sharma",
    department: "General Medicine",
    hours: "10:00 AM - 06:00 PM",
    available: true
  },
  {
    id: 3,
    name: "Dr. Amit Singh",
    department: "Orthopedics",
    hours: "09:00 AM - 04:00 PM",
    available: false
  },
  {
    id: 4,
    name: "Dr. Sneha Reddy",
    department: "Gynecology",
    hours: "11:00 AM - 07:00 PM",
    available: true
  }
];

const emptyForm = {
  patient: "",
  phone: "",
  doctor: "",
  department: "",
  date: "",
  time: "",
  reason: "",
  status: "Pending"
};

function loadArray(key, fallback = []) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(saved) ? saved : fallback;
  } catch {
    return fallback;
  }
}

function Appointments() {
const [appointments, setAppointments] = useState(() =>
  getAppointments()
);

  const [patients] = useState(() =>
    loadArray(PATIENT_KEY)
  );

  const [doctors, setDoctors] = useState(() =>
    loadArray(DOCTOR_KEY, defaultDoctors)
  );

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // useEffect(() => {
  //   localStorage.setItem(
  //     APPOINTMENT_KEY,
  //     JSON.stringify(appointments)
  //   );
  // }, [appointments]);

  useEffect(() => {
    localStorage.setItem(
      DOCTOR_KEY,
      JSON.stringify(doctors)
    );
  }, [doctors]);

  const today = new Date().toISOString().slice(0, 10);

  const todayCount = appointments.filter(
    (item) => item.date === today
  ).length;

  const confirmedCount = appointments.filter(
    (item) => item.status === "Confirmed"
  ).length;

  const pendingCount = appointments.filter(
    (item) => item.status === "Pending"
  ).length;

  const completedCount = appointments.filter(
    (item) => item.status === "Completed"
  ).length;

  const openAddModal = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setForm({
      patient: item.patient || "",
      phone: item.phone || "",
      doctor: item.doctor || "",
      department: item.department || "",
      date: item.date || "",
      time: item.time || "",
      reason: item.reason || "",
      status: item.status || "Pending"
    });

    setEditId(item.id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === "doctor") {
      const selectedDoctor = doctors.find(
        (doctor) => doctor.name === value
      );

      if (selectedDoctor) {
        setForm((prev) => ({
          ...prev,
          doctor: value,
          department: selectedDoctor.department || ""
        }));
      }
    }

    if (name === "patient") {
      const selectedPatient = patients.find(
        (patient) => patient.name === value
      );

      if (selectedPatient) {
        setForm((prev) => ({
          ...prev,
          patient: value,
          phone: selectedPatient.phone || ""
        }));
      }
    }
  };

  
const handleSubmit = (e) => {
  e.preventDefault();

  if (
    !form.patient ||
    !form.phone ||
    !form.doctor ||
    !form.date ||
    !form.time
  ) {
    alert("Please fill in all required fields.");
    return;
  }

  const selectedPatient = patients.find(
    (patient) => patient.name === form.patient
  );

  const appointmentData = {
    ...form,

    id: editId || `APT-${Date.now()}`,

    patientName: form.patient,
    patientId: selectedPatient?.patientId || selectedPatient?.id || "",
    age: selectedPatient?.age || "",
    gender: selectedPatient?.gender || "",

    doctorName: form.doctor,
    appointmentDate: form.date,
    appointmentTime: form.time
  };

  let updatedAppointments;

  if (editId) {
    updatedAppointments = appointments.map((item) =>
      item.id === editId ? appointmentData : item
    );
  } else {
    updatedAppointments = [
      appointmentData,
      ...appointments
    ];
  }

  // Save to shared LocalStorage
  saveAppointments(updatedAppointments);

  // Update Reception page
  setAppointments(updatedAppointments);

  setShowModal(false);
  setForm(emptyForm);
  setEditId(null);

  alert("Appointment saved successfully!");
};


  const deleteAppointment = (id) => {
  if (window.confirm("Delete this appointment?")) {
    const updated = appointments.filter(
      (item) => item.id !== id
    );

    saveAppointments(updated);
    setAppointments(updated);
  }
};

const updateStatus = (id, status) => {
  const updated = appointments.map((item) =>
    item.id === id ? { ...item, status } : item
  );

  saveAppointments(updated);
  setAppointments(updated);
};

  const filteredAppointments = appointments.filter((item) => {
    const query = search.toLowerCase();

    return (
      (item.patient || "").toLowerCase().includes(query) ||
      (item.doctor || "").toLowerCase().includes(query) ||
      (item.department || "").toLowerCase().includes(query) ||
      (item.id || "").toLowerCase().includes(query)
    );
  });


const handleBookAppointment = () => {

  const newAppointment = {
    id: Date.now(),
    patientId: "PAT001",
    patientName: "Arun Kumar",
    age: 35,
    gender: "Male",
    phone: "9876543210",

    doctorName: "Dr. Kumar",
    department: "Cardiology",

    appointmentDate: "2026-11-20",
    appointmentTime: "10:30 AM",

    reason: "Chest Pain",
    status: "Scheduled"
  };

  saveAppointment(newAppointment);

  alert("Appointment sent successfully to Doctor Dashboard!");
};


  const availableDoctors = doctors.filter(
    (doctor) => doctor.available === true
  );

  const stats = [
    {
      title: "Total Appointments",
      value: appointments.length,
      subtitle: "All bookings",
      icon: CalendarDays,
      color: "blue"
    },
    {
      title: "Today's Appointments",
      value: todayCount,
      subtitle: "Scheduled today",
      icon: CalendarCheck,
      color: "purple"
    },
    {
      title: "Confirmed",
      value: confirmedCount,
      subtitle: "Confirmed bookings",
      icon: CheckCircle,
      color: "green"
    },
    {
      title: "Pending",
      value: pendingCount,
      subtitle: "Awaiting confirmation",
      icon: AlertCircle,
      color: "orange"
    }
  ];

  return (
    <div className="appointment-page">

      {/* Header */}
      <div className="appointment-page-heading">
        <div>
          <span className="appointment-eyebrow">
            HOSPITAL MANAGEMENT / APPOINTMENTS
          </span>
          <h1>Appointment Management</h1>
          <p>Schedule and manage patient appointments.</p>
        </div>

        <button
          className="add-appointment-btn"
          onClick={openAddModal}
        >
          <Plus size={19} />
          Book Appointment
        </button>
      </div>

      {/* Statistics */}
      <div className="appointment-stats-grid">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              className={`appointment-stat-card ${item.color}`}
              key={item.title}
            >
              <div className="appointment-stat-icon">
                <Icon size={23} />
              </div>

              <div>
                <span>{item.title}</span>
                <h2>{item.value}</h2>
                <small>{item.subtitle}</small>
              </div>
            </div>
          );
        })}
      </div>

      {/* Doctor Availability */}
      <div className="doctor-availability-panel">
        <div className="appointment-panel-heading">
          <div>
            <h3>Doctor Availability</h3>
            <p>Current doctor availability status</p>
          </div>

          <Stethoscope size={23} />
        </div>

        <div className="availability-list">
          {doctors.map((doctor) => (
            <div className="availability-item" key={doctor.id}>
              <div className="availability-doctor-icon">
                <Stethoscope size={19} />
              </div>

              <div className="availability-doctor-info">
                <strong>{doctor.name}</strong>
                <span>{doctor.department}</span>
                <small>{doctor.hours || "Schedule not set"}</small>
              </div>

              <span
                className={`doctor-availability-status ${
                  doctor.available ? "available" : "unavailable"
                }`}
              >
                {doctor.available ? "Available" : "Unavailable"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Appointment List */}
      <div className="appointment-table-panel">
        <div className="appointment-table-heading">
          <div>
            <h3>All Appointments</h3>
            <p>Manage patient appointment records</p>
          </div>

          <div className="appointment-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, doctor or ID..."
            />
          </div>
        </div>

        <div className="appointment-table-wrapper">
          <table className="appointment-table">
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="appointment-empty">
                      <CalendarDays size={42} />
                      <h3>No Appointments Found</h3>
                      <p>
                        {search
                          ? "Try another search."
                          : "Book your first appointment."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="appointment-id">
                        {item.id}
                      </span>
                    </td>

                    <td>
                      <div className="appointment-patient">
                        <div className="appointment-avatar">
                          {(item.patient || "P")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{item.patient}</strong>
                          <small>
                            <Phone size={12} />
                            {item.phone}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="appointment-doctor">
                        <strong>{item.doctor}</strong>
                        <small>{item.department}</small>
                      </div>
                    </td>

                    <td>
                      <div className="appointment-date">
                        <span>
                          <CalendarDays size={14} />
                          {item.date}
                        </span>
                        <small>
                          <Clock size={13} />
                          {item.time}
                        </small>
                      </div>
                    </td>

                    <td>
                      <select
                        className={`appointment-status-select ${
                          (item.status || "Pending").toLowerCase()
                        }`}
                        value={item.status || "Pending"}
                        onChange={(e) =>
                          updateStatus(item.id, e.target.value)
                        }
                      >
                        <option>Pending</option>
                        <option>Confirmed</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                      </select>
                    </td>

                    <td>
                      <div className="appointment-actions">
                        <button
                          className="appointment-edit-btn"
                          title="Edit appointment"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className="appointment-delete-btn"
                          title="Delete appointment"
                          onClick={() => deleteAppointment(item.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="appointment-table-footer">
          Showing {filteredAppointments.length} of {appointments.length} appointments
          <span>{completedCount} completed</span>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="appointment-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="appointment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="appointment-modal-heading">
              <div className="appointment-modal-icon">
                <CalendarDays size={23} />
              </div>

              <div>
                <h2>
                  {editId ? "Edit Appointment" : "Book New Appointment"}
                </h2>
                <p>Enter the patient and appointment details.</p>
              </div>

              <button
                className="appointment-close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="appointment-form-grid">

                <div className="appointment-form-group full">
                  <label>Patient Name *</label>
                  <select
                    name="patient"
                    value={form.patient}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.name}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                  {patients.length === 0 && (
                    <small className="appointment-form-hint">
                      No registered patients. Register a patient first.
                    </small>
                  )}
                </div>

                <div className="appointment-form-group">
                  <label>Phone Number *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Patient phone number"
                    required
                  />
                </div>

                <div className="appointment-form-group">
                  <label>Doctor *</label>
                  <select
                    name="doctor"
                    value={form.doctor}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select doctor</option>
                    {doctors.map((doctor) => (
                      <option
                        key={doctor.id}
                        value={doctor.name}
                        disabled={!doctor.available && doctor.name !== form.doctor}
                      >
                        {doctor.name} {!doctor.available ? "(Unavailable)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="appointment-form-group">
                  <label>Department</label>
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="Department"
                    readOnly
                  />
                </div>

                <div className="appointment-form-group">
                  <label>Appointment Date *</label>
                  <input
                    type="date"
                    name="date"
                    min={today}
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="appointment-form-group">
                  <label>Appointment Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="appointment-form-group full">
                  <label>Reason for Visit</label>
                  <textarea
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    placeholder="Enter reason for appointment"
                    rows="3"
                  />
                </div>

                <div className="appointment-form-group full">
                  <label>Appointment Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option>Pending</option>
                    <option>Confirmed</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>

              </div>

              <div className="appointment-modal-actions">
                <button
                  type="button"
                  className="appointment-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="appointment-save-btn"
                  disabled={patients.length === 0 || availableDoctors.length === 0}
                >
                  <CalendarCheck size={17} />
                  {editId ? "Update Appointment" : "Save Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{/* <button onClick={handleBookAppointment}>
  Test Book Appointment
</button> */}
    </div>
  );
}

export default Appointments;
