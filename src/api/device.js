// Funciones para interactuar con las rutas de la API relacionadas con los dispositivos

import axios from "./axios";

// Obtener todos los dispositivos con filtros y paginación
export const getAllDevicesRequest = (
  page,
  limit,
  searchTerm,
  stateFilter,
  employeeFilter
) =>
  axios.get(
    `/devices?page=${page}&limit=${limit}&searchTerm=${searchTerm}&stateFilter=${stateFilter}&employeeFilter=${employeeFilter}`
  );

// Obtener un dispositivo específico por su tipo y ID
export const getOneDeviceRequest = (deviceType, deviceId) =>
  axios.get(`/devices/${deviceType}/${deviceId}`);

// Obtener los datos del formulario para un tipo de dispositivo
export const getDeviceFormRequest = (deviceType) =>
  axios.get(`/devices/${deviceType}`);

// Crear un nuevo dispositivo de un tipo específico
export const createDeviceRequest = (deviceType, device) =>
  axios.post(`/devices/${deviceType}`, device);

// Actualizar un dispositivo existente por su tipo y ID
export const updateDeviceRequest = (deviceType, deviceId, device) =>
  axios.patch(`/devices/${deviceType}/${deviceId}`, device);

// Eliminar un dispositivo específico por su tipo y ID
export const deleteDeviceRequest = (deviceType, deviceId) =>
  axios.delete(`/devices/${deviceType}/${deviceId}`);
