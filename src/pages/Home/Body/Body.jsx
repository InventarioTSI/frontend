import React, { useEffect, useState } from "react";
import "./Body.css";
import LectorQR from "./LectorQR/LectorQR";
import GestionPersonal from "./GestionPersonal/GestionPersonal";
import ListaEquipos from "./ListaEquipos/ListaEquipos";
import NuevoEquipo from "./NuevoEquipo/NuevoEquipo";
import axios from "axios";

const Body = () => {
  const [isAdmin, setIsAdmin] = useState(false); // Estado para verificar si el usuario es admin

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem("token"); // Obtén el token del localStorage
        const response = await axios.get("http://localhost:3000/api/users/auth/check-admin", {
          headers: {
            Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
          },
        });

        setIsAdmin(response.data.isAdmin); // Actualiza el estado según el rol del usuario
      } catch (err) {
        console.error("Error al verificar permisos de administrador:", err.response || err);
        setIsAdmin(false); // Si hay un error, asume que no es admin
      }
    };

    checkAdmin();
  }, []);

  return (
    <div className="contenedor">
      <div className="fila">
        <div className="div-div">
          <LectorQR />
        </div>
        <div className="div-div">
          <ListaEquipos />
        </div>
      </div>
      {isAdmin && ( // Solo muestra esta fila si el usuario es admin
        <div className="fila">
          <div className="div-div">
            <NuevoEquipo />
          </div>
          <div className="div-div">
            <GestionPersonal />
          </div>
        </div>
      )}
    </div>
  );
};

export default Body;
