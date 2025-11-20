// modal component 
export default function Modal({ children }) {
  return (
    <div style={{ padding: "20px", border: "2px solid #333", marginTop: "20px" }}>
      {children}
    </div>
  );
}
