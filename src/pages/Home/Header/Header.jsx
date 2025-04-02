import React, { useState, useEffect, useRef } from "react"; // Importa React y hooks para manejar estado, efectos secundarios y referencias
import { Link, useNavigate } from "react-router-dom"; // Importa Link para navegación y useNavigate para redirecciones
import { useAuth } from "../../../context/AuthContext"; // Importa el contexto de autenticación
import "./Header.css"; // Importa los estilos específicos para este componente
import Logo from "../../../imagenes/Logo.png"; // Importa la imagen del logo
import IconoUsuario from "../../../imagenes/IconoUsuario.png"; // Importa la imagen del ícono de usuario

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false); // Estado para manejar la visibilidad del menú desplegable
  const { signout, user } = useAuth(); // Obtiene las funciones de cierre de sesión y el usuario actual del contexto de autenticación
  const navigate = useNavigate(); // Hook para redirigir a otras rutas
  const dropdownRef = useRef(null); // Referencia para el menú desplegable

  // Maneja el clic en el ícono de usuario para mostrar/ocultar el menú desplegable
  const handleUserIconClick = () => {
    setShowDropdown((prev) => !prev); // Alterna el estado de visibilidad del menú
  };

  // Maneja el cierre de sesión del usuario
  const handleSignout = () => {
    signout(); // Llama a la función de cierre de sesión del contexto
    setShowDropdown(false); // Oculta el menú desplegable
  };

  // Maneja la navegación a una ruta específica
  const handleNavigate = (path) => {
    setShowDropdown(false); // Oculta el menú desplegable
    navigate(path); // Redirige a la ruta especificada
  };

  // useEffect para cerrar el menú desplegable si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verifica si el clic ocurrió fuera del menú desplegable
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false); // Oculta el menú desplegable
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // Agrega un evento para detectar clics fuera del menú
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Limpia el evento al desmontar el componente
    };
  }, []); // Se ejecuta una vez al montar el componente

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
