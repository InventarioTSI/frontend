// Funciones para interactuar con la API relacionada con el historial de dispositivos

import axios from "./axios";

// Obtener el historial de un dispositivo por su ID
export const getDeviceHistoricRequest = (deviceId) =>
    axios.get(`/historic/${deviceId}`);

// Crear un nuevo registro de historial
export const createHistoricRequest = (historic) =>
    axios.post(`/historic/`, historic);