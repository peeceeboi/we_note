import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex gap-2 justify-center items-center p-2.5 rounded ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
