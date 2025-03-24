import React from 'react';
import { Link } from 'react-router-dom';
import './GestionPersonal.css';
import Personal from '../../../../imagenes/Personal.jpg'

const GestionPersonal = () => {
    return (
        <div className='divPersonal'>
        <Link to="/Personal" className='Link'>
          <a className='BotonPersonal'>
            <img className='BotonPersonalImage'
            src={Personal} 
            alt="Texto alternativo de la imagen"/>
            <p className='BotonPersonalText'>Gestiona el personal</p>
          </a>
        </Link>
      </div>
    );
}

export default GestionPersonal;