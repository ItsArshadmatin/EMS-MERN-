import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin"   // default to admin for the first user
  });

  const [error, setError] = useState("");

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/register", form);
      alert("User registered successfully!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto" }}>
      <h2>Register</h2>

      <form onSubmit={submit}>
        <div>
          <label>Name</label>
          <input name="name" value={form.name} onChange={change} required />
        </div>

        <div>
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={change} required />
        </div>

        <div>
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={change} required />
        </div>

        <div>
          <label>Role</label>
          <select name="role" value={form.role} onChange={change}>
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        <button type="submit" style={{ marginTop: "15px" }}>Register</button>

        {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      </form>
    </div>
  );
}
