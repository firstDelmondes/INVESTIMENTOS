import React from "react";

interface LogoProps {
  className?: string;
}

const Logo = ({ className = "" }: LogoProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img src="/logo.png" alt="AEGIS Capital" className="h-8 w-auto" />
      <span className="ml-2 text-lg font-bold text-white">AEGIS Capital</span>
    </div>
  );
};

export default Logo;
