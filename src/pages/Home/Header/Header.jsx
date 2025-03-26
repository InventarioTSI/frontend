import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Header.css';
import Logo from '../../../imagenes/Logo.png';
import IconoUsuario from '../../../imagenes/IconoUsuario.png';

const Header = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isClosing, setIsClosing] = useState(false); // Estado para manejar la animación de salida
    const { signout, user } = useAuth();
    const navigate = useNavigate();

    const handleUserIconClick = () => {
        if (showDropdown) {
            setIsClosing(true); // Activa la animación de salida
            setTimeout(() => {
                setShowDropdown(false); // Oculta el menú después de la animación
                setIsClosing(false); // Resetea el estado de salida
            }, 300); // Duración de la animación (0.3s)
        } else {
            setShowDropdown(true); // Muestra el menú
        }
    };

    const handleSignout = (event) => {
        event.stopPropagation();
        signout();
        setShowDropdown(false);
    };

    const handleNavigate = (path) => {
        setShowDropdown(false);
        navigate(path);
    };

    return (
        <header className="header">
            <Link to="/home">
                <img src={Logo} alt="Logo" className="logo" />
            </Link>
            {user && ( // Mostrar el ícono de usuario solo si hay un usuario autenticado
                <div className="userIcon" onClick={handleUserIconClick}>
                    <img className="userIcon" src={IconoUsuario} alt="User" />

                    {/* Mostrar el nombre de usuario */}
                    <span className="username">{user.userName}</span>

                    {showDropdown && (
                        <div className={`dropdownMenu ${isClosing ? 'fadeOut' : ''}`}>
                            {/* Mostrar "Administrar usuarios" solo si el usuario es administrador */}
                            {user.role === 'Admin' && (
                                <button className="dropdownItem" onClick={() => handleNavigate('/admin/users')}>
                                    Administrar usuarios
                                </button>
                            )}
                            <button className="dropdownItem" onClick={() => handleNavigate('/profile')}>
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