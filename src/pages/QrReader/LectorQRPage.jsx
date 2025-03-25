/*
  Este componente maneja la lectura de códigos QR. Al escanear un código QR, se extrae y procesa la información 
  contenida en el código para redirigir al usuario a la página de información correspondiente del dispositivo.
*/

import React, { useState, useEffect } from "react";
import { useZxing } from "react-zxing";
//import { useMediaDevices } from "react-media-devices";//Added RG 24/06/2024
import { Link } from "react-router-dom";
import "./LectorQRPage.css";

function LectorQRPage() {
  const [deviceId, setDeviceId] = useState(null);
  const [deviceType, setDeviceType] = useState(null);

  // Hook useZxing para gestionar la lectura del QR
  const { ref } = useZxing({
    onDecodeResult(result) {
      const decodeResult = result.getText();
      try {
        const deviceData = JSON.parse(decodeResult);
        const { id, deviceType } = deviceData;
        setDeviceType(deviceType);
        setDeviceId(id);
      } catch (error) {
        console.error("Error al analizar el texto como JSON:", error);
      }
    },
  });

  // Efecto que se ejecuta cuando el tipo de dispositivo o el id cambian
  useEffect(() => {
    if (deviceType) {
      (window.location.href = `/DeviceInfo/${deviceType}/${deviceId}`),
        "_blank";
    }
  }, [deviceType, deviceId]);

  return (
    <div className="LectorQR">
      <h1>Lector de QR</h1>
      <div className="DivVideoQR">
        <video className="VideoQR" ref={ref} />
      </div>
      <button className="boton-cancelar-qr">
        <Link className="Link" to="/home">
          Volver al menú
        </Link>
      </button>
    </div>
  );
}

export default LectorQRPage;
