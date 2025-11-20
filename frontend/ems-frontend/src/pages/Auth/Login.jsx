import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const user = await login(email, password);

      if (user.role === "admin") navigate("/admin/dashboard");
      else navigate("/me/profile");
    } catch (error) {
      setErr(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto" }}>
      <h2>Login</h2>

      <form onSubmit={submit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" style={{ marginTop: "15px" }}>Login</button>

        {err && <div style={{ color: "red", marginTop: "10px" }}>{err}</div>}
      </form>
    </div>
  );
}
