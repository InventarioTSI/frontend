import React from 'react';
import { Link } from 'react-router-dom';
import './NuevoEquipo.css';
import NuevoEquipoImagen from '../../../../imagenes/NuevoEquipo.jpg'

const NuevoEquipo = () => {
    return (
        <div className='divNuevoEquipo'>
        <Link to="/AddDevice" className='Link'>
          <a className='BotonNuevoEquipo'>
            <img className='BotonNuevoEquipoImage'
            src={NuevoEquipoImagen} 
            alt="Texto alternativo de la imagen"/>
            <p className='BotonNuevoEquipoText'>Nuevo equipo</p>
          </a>
        </Link>
      </div>
    );
}

export default NuevoEquipo;