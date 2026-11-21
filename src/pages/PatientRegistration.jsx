
import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  User,
  Venus,
  Mars,
  ClipboardList
} from "lucide-react";
import "./PatientRegistration.css";

const STORAGE_KEY = "hospitalPatients";

const emptyForm = {
  name: "",
  age: "",
  gender: "Male",
  phone: "",
  email: "",
  address: ""
};

function loadPatients() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function PatientRegistration() {
  const [patients, setPatients] = useState(loadPatients);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  }, [patients]);

  const openAddModal = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (patient) => {
    setForm({
      name: patient.name || "",
      age: patient.age || "",
      gender: patient.gender || "Male",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || ""
    });
    setEditId(patient.id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.age || !form.phone.trim()) {
      alert("Please enter patient name, age and phone number.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (editId) {
      setPatients((prev) =>
        prev.map((patient) =>
          patient.id === editId
            ? { ...patient, ...form }
            : patient
        )
      );
    } else {
      const newPatient = {
        id: `PAT-${Date.now()}`,
        ...form,
        registeredAt: new Date().toISOString()
      };

      setPatients((prev) => [newPatient, ...prev]);
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditId(null);
  };

  const deletePatient = (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      setPatients((prev) =>
        prev.filter((patient) => patient.id !== id)
      );
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const text = search.toLowerCase();

    return (
      (patient.name || "").toLowerCase().includes(text) ||
      (patient.id || "").toLowerCase().includes(text) ||
      (patient.phone || "").includes(text)
    );
  });

  const malePatients = patients.filter(
    (patient) => patient.gender === "Male"
  ).length;

  const femalePatients = patients.filter(
    (patient) => patient.gender === "Female"
  ).length;

  return (
    <div className="patient-page">

      {/* Page Heading */}
      <div className="patient-page-heading">
        <div>
          <span className="patient-eyebrow">
            HOSPITAL MANAGEMENT / PATIENTS
          </span>
          <h1>Patient Management</h1>
          <p>Register, manage and view all hospital patients.</p>
        </div>

        <button className="add-patient-btn" onClick={openAddModal}>
          <UserPlus size={19} />
          Add New Patient
        </button>
      </div>

      {/* Statistics */}
      <div className="patient-stats-grid">
        <div className="patient-stat-card">
          <div className="patient-stat-icon blue">
            <Users size={24} />
          </div>
          <div>
            <span>Total Patients</span>
            <h2>{patients.length}</h2>
            <small>Registered patients</small>
          </div>
        </div>

        <div className="patient-stat-card">
          <div className="patient-stat-icon purple">
            <Mars size={24} />
          </div>
          <div>
            <span>Male Patients</span>
            <h2>{malePatients}</h2>
            <small>Male registrations</small>
          </div>
        </div>

        <div className="patient-stat-card">
          <div className="patient-stat-icon pink">
            <Venus size={24} />
          </div>
          <div>
            <span>Female Patients</span>
            <h2>{femalePatients}</h2>
            <small>Female registrations</small>
          </div>
        </div>

        <div className="patient-stat-card">
          <div className="patient-stat-icon green">
            <ClipboardList size={24} />
          </div>
          <div>
            <span>Records</span>
            <h2>{patients.length}</h2>
            <small>Total saved records</small>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="patient-table-panel">
        <div className="patient-table-heading">
          <div>
            <h3>All Patients</h3>
            <p>View and manage patient information</p>
          </div>

          <div className="patient-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search name, ID or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="patient-table-wrapper">
          <table className="patient-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Patient ID</th>
                <th>Age / Gender</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="patient-empty">
                      <Users size={42} />
                      <h3>No Patients Found</h3>
                      <p>
                        {search
                          ? "Try another search."
                          : "Register your first patient to get started."}
                      </p>
                      {!search && (
                        <button onClick={openAddModal}>
                          Add Patient
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div className="patient-name-cell">
                        <div className="patient-avatar-large">
                          {(patient.name || "P")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <strong>{patient.name}</strong>
                          <small>Hospital Patient</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="patient-id">
                        {patient.id}
                      </span>
                    </td>

                    <td>
                      <div className="patient-age-gender">
                        <strong>{patient.age} Years</strong>
                        <span>{patient.gender}</span>
                      </div>
                    </td>

                    <td>
                      <div className="patient-contact">
                        <span><Phone size={13} /> {patient.phone}</span>
                        <span>
                          <Mail size={13} />
                          {patient.email || "Not provided"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="patient-address">
                        <MapPin size={14} />
                        {patient.address || "Not provided"}
                      </div>
                    </td>

                    <td>
                      <div className="patient-actions">
                        <button
                          className="patient-edit-btn"
                          title="Edit patient"
                          onClick={() => openEditModal(patient)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className="patient-delete-btn"
                          title="Delete patient"
                          onClick={() => deletePatient(patient.id)}
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

        <div className="patient-table-footer">
          Showing {filteredPatients.length} of {patients.length} patients
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="patient-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="patient-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="patient-modal-heading">
              <div className="patient-modal-icon">
                <User size={23} />
              </div>

              <div>
                <h2>
                  {editId ? "Edit Patient" : "Register New Patient"}
                </h2>
                <p>Enter the patient's personal information.</p>
              </div>

              <button
                className="patient-close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="patient-form-grid">

                <div className="patient-form-group full">
                  <label>Patient Full Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter patient name"
                    required
                  />
                </div>

                <div className="patient-form-group">
                  <label>Age *</label>
                  <input
                    name="age"
                    type="number"
                    min="0"
                    max="120"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                    required
                  />
                </div>

                <div className="patient-form-group">
                  <label>Gender *</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="patient-form-group">
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

                <div className="patient-form-group">
                  <label>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="patient@email.com"
                  />
                </div>

                <div className="patient-form-group full">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter patient address"
                    rows="3"
                  />
                </div>

              </div>

              <div className="patient-modal-actions">
                <button
                  type="button"
                  className="patient-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="patient-save-btn"
                >
                  <UserPlus size={17} />
                  {editId ? "Update Patient" : "Save Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default PatientRegistration;
