import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Header.css';
import Logo from '../../../imagenes/Logo.png';
import IconoUsuario from '../../../imagenes/IconoUsuario.png';


const Header = () => {

    const [showLogout, setShowLogout] = useState(false);
    const { signout, user } = useAuth();

    const handleUserIconClick = () => {
        setShowLogout(prevShowLogout => !prevShowLogout);
    };

    const handleSignout = (event) => {
        event.stopPropagation();
        signout();
        setShowLogout(false);
    };
    

    return (
        <header className="header">
            <Link to="/home">
                <img src={Logo} alt="Logo" className="logo" />
            </Link>
            <div className="userIcon" onClick={handleUserIconClick}>
                <img className="userIcon" src={IconoUsuario} alt="User" />

                {/* Mostrar el nombre de usuario solo si hay un usuario autenticado */}
                {user && <span className="username">{user.userName}</span>} 

                {showLogout && (
                    <div className="logoutDiv">
                        <button className="buttonlogout" onClick={handleSignout}>Cerrar sesión</button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;

