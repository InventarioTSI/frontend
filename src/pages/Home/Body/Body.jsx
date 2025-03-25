import React from "react";
import "./Body.css";
import LectorQR from "./LectorQR/LectorQR";
import GestionPersonal from "./GestionPersonal/GestionPersonal";
import ListaEquipos from "./ListaEquipos/ListaEquipos";
import NuevoEquipo from "./NuevoEquipo/NuevoEquipo";

const Body = () => {
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
      <div className="fila">
        <div className="div-div">
          <NuevoEquipo />
        </div>
        <div className="div-div">
          <GestionPersonal />
        </div>
      </div>
    </div>
  );
};

export default Body;
