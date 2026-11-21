
import React, { useEffect, useState } from "react";
import {
  Stethoscope,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Phone,
  Clock,
  Users,
  UserCheck,
  UserX,
  Activity,
  Building2
} from "lucide-react";
import "./Doctors.css";

const STORAGE_KEY = "hospitalDoctorAvailability";

const defaultDoctors = [
  {
    id: 1,
    name: "Dr. Rajesh Kumar",
    phone: "9876543210",
    specialization: "Cardiologist",
    department: "Cardiology",
    hours: "09:00 AM - 05:00 PM",
    available: true
  },
  {
    id: 2,
    name: "Dr. Priya Sharma",
    phone: "9876543211",
    specialization: "General Physician",
    department: "General Medicine",
    hours: "10:00 AM - 06:00 PM",
    available: true
  },
  {
    id: 3,
    name: "Dr. Amit Singh",
    phone: "9876543212",
    specialization: "Orthopedic",
    department: "Orthopedics",
    hours: "09:00 AM - 04:00 PM",
    available: false
  },
  {
    id: 4,
    name: "Dr. Sneha Reddy",
    phone: "9876543213",
    specialization: "Gynecologist",
    department: "Gynecology",
    hours: "11:00 AM - 07:00 PM",
    available: true
  }
];

const emptyForm = {
  name: "",
  phone: "",
  specialization: "",
  department: "",
  hours: "",
  available: true
};

function loadDoctors() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "null"
    );

    return Array.isArray(saved) ? saved : defaultDoctors;
  } catch {
    return defaultDoctors;
  }
}

function Doctors() {
  const [doctors, setDoctors] = useState(loadDoctors);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(doctors)
    );
  }, [doctors]);

  const availableCount = doctors.filter(
    (doctor) => doctor.available
  ).length;

  const unavailableCount = doctors.length - availableCount;

  const departments = [
    ...new Set(doctors.map((doctor) => doctor.department).filter(Boolean))
  ];

  const openAddModal = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (doctor) => {
    setForm({
      name: doctor.name || "",
      phone: doctor.phone || "",
      specialization: doctor.specialization || "",
      department: doctor.department || "",
      hours: doctor.hours || "",
      available: doctor.available !== false
    });

    setEditId(doctor.id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.specialization.trim() ||
      !form.department.trim() ||
      !form.hours.trim()
    ) {
      alert("Please complete all required fields.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (editId) {
      setDoctors((prev) =>
        prev.map((doctor) =>
          doctor.id === editId
            ? { ...doctor, ...form }
            : doctor
        )
      );
    } else {
      const newDoctor = {
        id: `DOC-${Date.now()}`,
        ...form
      };

      setDoctors((prev) => [newDoctor, ...prev]);
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditId(null);
  };

  const deleteDoctor = (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this doctor?"
      )
    ) {
      setDoctors((prev) =>
        prev.filter((doctor) => doctor.id !== id)
      );
    }
  };

  const toggleAvailability = (id) => {
    setDoctors((prev) =>
      prev.map((doctor) =>
        doctor.id === id
          ? { ...doctor, available: !doctor.available }
          : doctor
      )
    );
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const query = search.toLowerCase();

    const matchesSearch =
      (doctor.name || "").toLowerCase().includes(query) ||
      (doctor.department || "").toLowerCase().includes(query) ||
      (doctor.specialization || "").toLowerCase().includes(query) ||
      (doctor.phone || "").includes(query);

    const matchesDepartment =
      departmentFilter === "All" ||
      doctor.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="doctor-page">

      {/* Page Heading */}
      <div className="doctor-page-heading">
        <div>
          <span className="doctor-eyebrow">
            HOSPITAL MANAGEMENT / DOCTORS
          </span>

          <h1>Doctor Management</h1>

          <p>
            Manage doctor profiles, departments and availability.
          </p>
        </div>

        <button
          className="add-doctor-btn"
          onClick={openAddModal}
        >
          <Plus size={19} />
          Add New Doctor
        </button>
      </div>

      {/* Statistics */}
      <div className="doctor-stats-grid">

        <div className="doctor-stat-card">
          <div className="doctor-stat-icon blue">
            <Stethoscope size={24} />
          </div>
          <div>
            <span>Total Doctors</span>
            <h2>{doctors.length}</h2>
            <small>Registered doctors</small>
          </div>
        </div>

        <div className="doctor-stat-card">
          <div className="doctor-stat-icon green">
            <UserCheck size={24} />
          </div>
          <div>
            <span>Available Doctors</span>
            <h2>{availableCount}</h2>
            <small>Currently available</small>
          </div>
        </div>

        <div className="doctor-stat-card">
          <div className="doctor-stat-icon red">
            <UserX size={24} />
          </div>
          <div>
            <span>Unavailable Doctors</span>
            <h2>{unavailableCount}</h2>
            <small>Currently unavailable</small>
          </div>
        </div>

        <div className="doctor-stat-card">
          <div className="doctor-stat-icon purple">
            <Building2 size={24} />
          </div>
          <div>
            <span>Departments</span>
            <h2>{departments.length}</h2>
            <small>Medical departments</small>
          </div>
        </div>

      </div>

      {/* Doctor Search and Filter */}
      <div className="doctor-directory-panel">

        <div className="doctor-directory-heading">
          <div>
            <h3>Our Medical Team</h3>
            <p>View and manage registered doctors.</p>
          </div>

          <div className="doctor-filters">
            <div className="doctor-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search doctor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="doctor-department-filter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All Departments</option>

              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctor Cards */}
        <div className="doctor-cards-grid">

          {filteredDoctors.length === 0 ? (
            <div className="doctor-empty">
              <Stethoscope size={42} />
              <h3>No Doctors Found</h3>
              <p>Try another search or add a new doctor.</p>
            </div>
          ) : (
            filteredDoctors.map((doctor) => (
              <div className="doctor-profile-card" key={doctor.id}>

                <div className="doctor-card-top">
                  <div className="doctor-profile-avatar">
                    <Stethoscope size={29} />
                  </div>

                  <span
                    className={`doctor-status-badge ${
                      doctor.available ? "online" : "offline"
                    }`}
                  >
                    <span></span>
                    {doctor.available ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="doctor-profile-info">
                  <h3>{doctor.name}</h3>
                  <p>{doctor.specialization}</p>

                  <span className="doctor-department-label">
                    <Building2 size={13} />
                    {doctor.department}
                  </span>
                </div>

                <div className="doctor-card-details">
                  <div>
                    <Phone size={15} />
                    <span>{doctor.phone}</span>
                  </div>

                  <div>
                    <Clock size={15} />
                    <span>{doctor.hours}</span>
                  </div>
                </div>

                <div className="doctor-card-footer">
                  <button
                    className={`availability-toggle ${
                      doctor.available ? "toggle-on" : "toggle-off"
                    }`}
                    onClick={() => toggleAvailability(doctor.id)}
                  >
                    <Activity size={15} />
                    {doctor.available ? "Set Unavailable" : "Set Available"}
                  </button>

                  <div className="doctor-card-actions">
                    <button
                      className="doctor-edit-btn"
                      title="Edit doctor"
                      onClick={() => openEditModal(doctor)}
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      className="doctor-delete-btn"
                      title="Delete doctor"
                      onClick={() => deleteDoctor(doctor.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}

        </div>

        <div className="doctor-directory-footer">
          Showing {filteredDoctors.length} of {doctors.length} doctors
        </div>

      </div>

      {/* Add / Edit Doctor Modal */}
      {showModal && (
        <div
          className="doctor-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="doctor-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="doctor-modal-heading">
              <div className="doctor-modal-icon">
                <Stethoscope size={23} />
              </div>

              <div>
                <h2>
                  {editId ? "Edit Doctor Details" : "Register New Doctor"}
                </h2>
                <p>Enter doctor information below.</p>
              </div>

              <button
                className="doctor-close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="doctor-form-grid">

                <div className="doctor-form-group full">
                  <label>Doctor Full Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter doctor name"
                    required
                  />
                </div>

                <div className="doctor-form-group">
                  <label>Phone Number *</label>
                  <input
                    name="phone"
                    type="tel"
                    maxLength="10"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit phone number"
                    required
                  />
                </div>

                <div className="doctor-form-group">
                  <label>Specialization *</label>
                  <input
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    placeholder="e.g. Cardiologist"
                    required
                  />
                </div>

                <div className="doctor-form-group">
                  <label>Department *</label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select department</option>
                    <option>Cardiology</option>
                    <option>General Medicine</option>
                    <option>Orthopedics</option>
                    <option>Gynecology</option>
                    <option>Neurology</option>
                    <option>Dermatology</option>
                    <option>Pediatrics</option>
                    <option>ENT</option>
                    <option>Ophthalmology</option>
                    <option>Dental</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="doctor-form-group">
                  <label>Working Hours *</label>
                  <input
                    name="hours"
                    value={form.hours}
                    onChange={handleChange}
                    placeholder="09:00 AM - 05:00 PM"
                    required
                  />
                </div>

                <div className="doctor-form-group full">
                  <label>Doctor Availability</label>

                  <select
                    name="available"
                    value={String(form.available)}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        available: e.target.value === "true"
                      }))
                    }
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>

              </div>

              <div className="doctor-modal-actions">
                <button
                  type="button"
                  className="doctor-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="doctor-save-btn"
                >
                  <Plus size={17} />
                  {editId ? "Update Doctor" : "Save Doctor"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Doctors;
