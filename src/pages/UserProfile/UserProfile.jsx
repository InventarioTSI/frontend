import React from "react";
import { useAuth } from "../../context/AuthContext";
import "./UserProfile.css";

const UserProfile = () => {
  const { user } = useAuth(); // Obtener el usuario autenticado del contexto

  return (
    <div className="user-profile">
      <h1 className="titulo">Perfil de Usuario</h1>
      <table className="profile-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{user.id}</td>
            <td>{user.userName}</td>
            <td>{user.role}</td>
          </tr>
        </tbody>
      </table>
      <button className="boton-cancelar" onClick={() => window.history.back()}>
        Volver
      </button>
    </div>
  );
};

export default UserProfile;
