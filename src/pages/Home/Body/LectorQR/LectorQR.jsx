import React from 'react';
import { Link } from 'react-router-dom';
import './LectorQR.css';
import ScanMeQr from '../../../../imagenes/ScanMeQr.jpg'

const LectorQR = () => {
    return (
        <div className='divQr'>
        <Link to="/QrReader" className='Link'>
          <a className='BotonQR'>
            <img className='BotonQRImage'
            src={ScanMeQr} 
            alt="Texto alternativo de la imagen"/>
            <p className='BotonQRText'>Escanea un equipo</p>
          </a>
        </Link>
      </div>
    );
}

export default LectorQR;