import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Header.css";
import Logo from "../../../imagenes/Logo.png";
import IconoUsuario from "../../../imagenes/IconoUsuario.png";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { signout, user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleUserIconClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleSignout = () => {
    signout();
    setShowDropdown(false);
  };

  const handleNavigate = (path) => {
    setShowDropdown(false);
    navigate(path);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <Link to="/home">
        <img src={Logo} alt="Logo" className="logo" />
      </Link>
      {user && (
        <div
          className="userIcon"
          onClick={handleUserIconClick}
          ref={dropdownRef}
        >
          <img className="userIcon" src={IconoUsuario} alt="User" />
          <span className="username">{user.userName}</span>
          {showDropdown && (
            <div className="dropdownMenu">
              {user.role === "Admin" && (
                <button
                  className="dropdownItem"
                  onClick={() => handleNavigate("/admin/users")}
                >
                  Administrar usuarios
                </button>
              )}
              <button
                className="dropdownItem"
                onClick={() => handleNavigate("/perfil")}
              >
                Ver perfil
              </button>
              <button className="dropdownItem" onClick={handleSignout}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
