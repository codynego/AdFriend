import React from "react";
import ReactDOM from "react-dom";

const Widget = () => {
  return (
    <div style={{ background: "#f3f3f3", padding: "10px", borderRadius: "5px", textAlign: "center" }}>
      <p>🚀 Stay Motivated! 🚀</p>
      <p>"Believe in yourself!"</p>
    </div>
  );
};

// Find all ad replacement containers
document.querySelectorAll("#adfriend-widget").forEach(widget => {
  ReactDOM.render(<Widget />, widget);
});
