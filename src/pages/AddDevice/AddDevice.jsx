/*
Componente para agregar un dispositivo. Permite seleccionar un tipo de dispositivo de una lista y
muestra un formulario dinámico para la entrada de detalles del dispositivo seleccionado.
*/

import React, { useState } from "react";
import DeviceForm from "./DeviceFormPage";
import "./AddDevice.css";

// Lista de dispositivos disponibles. Podría cambiarse por datos provenientes de una API en el futuro.
const devices = [
  { id: 1, name: "Cable" },
  { id: 2, name: "Camara" },
  { id: 3, name: "DAQ" },
  { id: 4, name: "Impresora" },
  { id: 5, name: "LectorDiscos" },
  { id: 6, name: "MemoriaExterna" },
  { id: 7, name: "OrdenadorPortatil" },
  { id: 8, name: "OrdenadorSobremesa" },
  { id: 9, name: "Otros" },
  { id: 10, name: "Pantalla" },
  { id: 11, name: "Raton" },
  { id: 12, name: "Router" },
  { id: 13, name: "Servidor" },
  { id: 14, name: "Switch" },
  { id: 15, name: "Tablet" },
  { id: 16, name: "Teclado" },
  { id: 17, name: "TelefonoMovil" },
];

export default function AddDevice() {
  // Estado para gestionar el dispositivo seleccionado por el usuario
  const [selectedDevice, setSelectedDevice] = useState("");

  // Maneja el cambio de selección en el dropdown de dispositivos
  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
  };

  return (
    <div className="device-page">
      <div className="device-selector">
        <label>Selecciona un dispositivo</label>
        <select onChange={handleDeviceChange}>
          <option value="">Selecciona un dispositivo </option>
          {devices.map((device) => (
            <option key={device.id} value={device.name}>
              {device.name}
            </option>
          ))}
        </select>
      </div>

      {/* Si hay un dispositivo seleccionado, muestra el formulario del dispositivo */}
      {selectedDevice && <DeviceForm deviceType={selectedDevice} />}
    </div>
  );
}
