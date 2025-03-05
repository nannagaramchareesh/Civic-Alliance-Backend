import React from "react";

const Button = ({ children, onClick, className, type = "button" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
