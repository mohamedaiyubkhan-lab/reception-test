
import React, { useEffect, useState } from "react";

import {
  CalendarDays,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Clock,
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

const loadArray = (key, fallback = []) => {
  try {
    const saved = JSON.parse(
      localStorage.getItem(key) || "null"
    );

    return Array.isArray(saved) ? saved : fallback;
  } catch (error) {
    console.error(`Unable to load ${key}:`, error);
    return fallback;
  }
};

const getPatientName = (patient) =>
  patient?.name ||
  patient?.patientName ||
  patient?.patient ||
  "";

const getPatientId = (patient) =>
  patient?.patientId ||
  patient?.patient_id ||
  patient?.id ||
  "";

const getPatientDetails = (patient) => {
  const details =
    patient?.patientDetails ||
    patient?.patientInfo ||
    patient?.personalDetails ||
    {};

  return {
    patientId:
      getPatientId(patient) ||
      details.patientId ||
      details.id ||
      "",

    age:
      patient?.age ||
      patient?.patientAge ||
      details.age ||
      "",

    gender:
      patient?.gender ||
      patient?.patientGender ||
      details.gender ||
      "",

    phone:
      patient?.phone ||
      patient?.mobile ||
      patient?.mobileNumber ||
      patient?.phoneNumber ||
      details.phone ||
      details.mobile ||
      "",

    email:
      patient?.email ||
      patient?.patientEmail ||
      patient?.emailAddress ||
      details.email ||
      details.patientEmail ||
      "",

    bloodGroup:
      patient?.bloodGroup ||
      patient?.bloodType ||
      patient?.patientBloodGroup ||
      details.bloodGroup ||
      details.bloodType ||
      "",

    address:
      patient?.address ||
      patient?.patientAddress ||
      patient?.fullAddress ||
      details.address ||
      details.patientAddress ||
      ""
  };
};

function Appointments() {
  const [appointments, setAppointments] = useState(() =>
    loadArray("hospital_appointments")
  );

  const [patients, setPatients] = useState(() =>
    loadArray(PATIENT_KEY)
  );

  const [doctors, setDoctors] = useState(() =>
    loadArray(DOCTOR_KEY, defaultDoctors)
  );

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Refresh patients and appointments
  useEffect(() => {
    const refreshPatients = () => {
      setPatients(loadArray(PATIENT_KEY));
    };

    const refreshAppointments = () => {
      setAppointments(loadArray("hospital_appointments"));
    };

    refreshPatients();

    window.addEventListener(
      "patients-updated",
      refreshPatients
    );

    window.addEventListener(
      "appointments-updated",
      refreshAppointments
    );

    window.addEventListener(
      "storage",
      refreshPatients
    );

    window.addEventListener(
      "storage",
      refreshAppointments
    );

    return () => {
      window.removeEventListener(
        "patients-updated",
        refreshPatients
      );

      window.removeEventListener(
        "appointments-updated",
        refreshAppointments
      );

      window.removeEventListener(
        "storage",
        refreshPatients
      );

      window.removeEventListener(
        "storage",
        refreshAppointments
      );
    };
  }, []);

  // Save doctor availability
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

  // Save appointments and notify other pages
  const updateAppointmentStorage = (updated) => {
    saveAppointments(updated);
    setAppointments(updated);

    window.dispatchEvent(
      new Event("appointments-updated")
    );
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setForm({
      patient: item.patient || item.patientName || "",
      phone: item.phone || "",
      doctor: item.doctor || item.doctorName || "",
      department: item.department || "",
      date: item.date || item.appointmentDate || "",
      time: item.time || item.appointmentTime || "",
      reason: item.reason || "",
      status: item.status || "Pending"
    });

    setEditId(item.id);
    setShowModal(true);
  };

  // Form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "patient") {
      const selectedPatient = patients.find(
        (patient) => getPatientName(patient) === value
      );

      if (!selectedPatient) {
        setForm((prev) => ({
          ...prev,
          patient: value,
          phone: ""
        }));

        return;
      }

      const details = getPatientDetails(selectedPatient);

      setForm((prev) => ({
        ...prev,
        patient: value,
        phone: details.phone
      }));

      return;
    }

    if (name === "doctor") {
      const selectedDoctor = doctors.find(
        (doctor) => doctor.name === value
      );

      setForm((prev) => ({
        ...prev,
        doctor: value,
        department: selectedDoctor?.department || ""
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Save appointment
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
      (patient) => getPatientName(patient) === form.patient
    );

    if (!selectedPatient) {
      alert("Selected patient was not found. Please refresh the patient list.");
      return;
    }

    const patientDetails = getPatientDetails(selectedPatient);

    const existingAppointment = appointments.find(
      (item) => item.id === editId
    );

    const appointmentData = {
      ...existingAppointment,
      ...form,

      id: editId || `APT-${Date.now()}`,

      patient: form.patient,
      patientName: form.patient,

      patientId: patientDetails.patientId,
      age: patientDetails.age,
      gender: patientDetails.gender,

      phone: patientDetails.phone || form.phone,
      email: patientDetails.email,
      bloodGroup: patientDetails.bloodGroup,
      address: patientDetails.address,

      patientEmail: patientDetails.email,
      patientBloodGroup: patientDetails.bloodGroup,
      patientAddress: patientDetails.address,

      doctor: form.doctor,
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

    updateAppointmentStorage(updatedAppointments);

    setShowModal(false);
    setForm(emptyForm);
    setEditId(null);

    alert("Appointment saved successfully!");
  };

  // Delete appointment
  const deleteAppointment = (id) => {
    if (!window.confirm("Delete this appointment?")) {
      return;
    }

    const updated = appointments.filter(
      (item) => item.id !== id
    );

    updateAppointmentStorage(updated);
  };

  // Update appointment status
  const updateStatus = (id, status) => {
    const updated = appointments.map((item) =>
      item.id === id
        ? { ...item, status }
        : item
    );

    updateAppointmentStorage(updated);
  };

  // Search appointments
  const filteredAppointments = appointments.filter((item) => {
    const query = search.toLowerCase();

    return (
      (item.patient || item.patientName || "")
        .toLowerCase()
        .includes(query) ||
      (item.doctor || item.doctorName || "")
        .toLowerCase()
        .includes(query) ||
      (item.department || "")
        .toLowerCase()
        .includes(query) ||
      String(item.id || "")
        .toLowerCase()
        .includes(query)
    );
  });

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

      <div className="appointment-page-heading">
        <div>
          <span className="appointment-eyebrow">
            HOSPITAL MANAGEMENT / APPOINTMENTS
          </span>

          <h1>Appointment Management</h1>

          <p>Schedule and manage patient appointments.</p>
        </div>

        <button
          type="button"
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
            <div
              className="availability-item"
              key={doctor.id}
            >
              <div className="availability-doctor-icon">
                <Stethoscope size={19} />
              </div>

              <div className="availability-doctor-info">
                <strong>{doctor.name}</strong>
                <span>{doctor.department}</span>
                <small>
                  {doctor.hours || "Schedule not set"}
                </small>
              </div>

              <span
                className={`doctor-availability-status ${
                  doctor.available
                    ? "available"
                    : "unavailable"
                }`}
              >
                {doctor.available
                  ? "Available"
                  : "Unavailable"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Appointment Table */}
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
                          {(item.patient || item.patientName || "P")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {item.patient || item.patientName}
                          </strong>

                          <small>
                            <Phone size={12} />
                            {item.phone}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="appointment-doctor">
                        <strong>
                          {item.doctor || item.doctorName}
                        </strong>

                        <small>{item.department}</small>
                      </div>
                    </td>

                    <td>
                      <div className="appointment-date">
                        <span>
                          <CalendarDays size={14} />
                          {item.date || item.appointmentDate}
                        </span>

                        <small>
                          <Clock size={13} />
                          {item.time || item.appointmentTime}
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
                          type="button"
                          className="appointment-edit-btn"
                          title="Edit appointment"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          className="appointment-delete-btn"
                          title="Delete appointment"
                          onClick={() =>
                            deleteAppointment(item.id)
                          }
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
          Showing {filteredAppointments.length} of{" "}
          {appointments.length} appointments

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
                  {editId
                    ? "Edit Appointment"
                    : "Book New Appointment"}
                </h2>

                <p>
                  Enter the patient and appointment details.
                </p>
              </div>

              <button
                type="button"
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

                    {patients.map((patient, index) => {
                      const name = getPatientName(patient);

                      return name ? (
                        <option
                          key={getPatientId(patient) || index}
                          value={name}
                        >
                          {name}
                        </option>
                      ) : null;
                    })}
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
                        disabled={
                          !doctor.available &&
                          doctor.name !== form.doctor
                        }
                      >
                        {doctor.name}
                        {!doctor.available
                          ? " (Unavailable)"
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="appointment-form-group">
                  <label>Department</label>

                  <input
                    name="department"
                    value={form.department}
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
                  disabled={patients.length === 0}
                >
                  <CalendarCheck size={17} />

                  {editId
                    ? "Update Appointment"
                    : "Save Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Appointments;
