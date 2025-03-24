// Funciones para manejar las solicitudes de autenticación (login y verificación de token)

import axios from "./axios"; // Instancia de Axios configurada previamente

// Realiza la solicitud de login con las credenciales del usuario
export const loginRequest = (user) => axios.post("/auth/login", user);

// Verifica si el token de autenticación es válido
export const varifyTokenRequest = () => axios.get("/auth/verify");
