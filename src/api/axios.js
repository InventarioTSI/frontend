// Configura y exporta una instancia personalizada de Axios para las solicitudes API

import axios from "axios";

// Crear una instancia de axios con la URL base configurada
const instance = axios.create({
  baseURL: "http://127.0.0.1:3000/api",
});

// Interceptor para agregar el token de autenticación a cada solicitud
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Añadir token al header
    if (token) {
      config.headers.authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); // Manejo de errores
  }
);

export default instance; // Exportar la instancia de Axios configurada
