import React from "react";
import { Link } from "react-router-dom";
import "./ListaEquipos.css";
import Equipos from "../../../../imagenes/Equipos.jpg";

const ListaEquipos = () => {
  return (
    <div className="divLista">
      <Link to="/DeviceList" className="BotonLista">
        <img
          className="BotonListaImage"
          src={Equipos}
          alt="Texto alternativo de la imagen"
        />
        <p className="BotonListaText">Lista de los equipos</p>
      </Link>
    </div>
  );
};

export default ListaEquipos;
