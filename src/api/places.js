// Funciones para interactuar con la API de lugares (puestos)

import axios from "./axios";

// Obtener todos los puestos
export const getAllPlacesRequest = () =>
  axios.get(`/places`);

// Obtener un puesto específico por su nombre o identificador
export const getOnePlaceRequest = (puesto) =>
  axios.get(`/places/${puesto}`);

// Crear un nuevo puesto
export const createPlaceRequest = (puesto) =>
  axios.post(`/places`, puesto);

// Actualizar un puesto existente
export const updatePlaceRequest = (puestoId, puesto) =>
  axios.patch(`/places/${puestoId}`, puesto);

// Eliminar un puesto
export const deletePlaceRequest = (puestoId, puesto) =>
  axios.delete(`/places/${puestoId}`, puesto);