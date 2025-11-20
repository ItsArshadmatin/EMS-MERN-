// stat card component 
import React from "react";

export default function StatsCard({ label, value }) {
  return (
    <div style={card}>
      <div style={labelS}>{label}</div>
      <div style={valueS}>{value}</div>
    </div>
  );
}

const card = {
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "10px",
  minWidth: "180px",
  background: "white",
  textAlign: "center",
};

const labelS = {
  fontSize: "16px",
  color: "#666",
};

const valueS = {
  fontSize: "32px",
  fontWeight: "bold",
  marginTop: "10px",
};
