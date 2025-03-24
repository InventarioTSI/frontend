/*
Este archivo define el contexto de autenticación para la aplicación, proporcionando funciones y 
estados relacionados con el inicio de sesión, cierre de sesión y gestión del estado de autenticación 
a lo largo de la aplicación. Los componentes que necesiten acceder a la autenticación pueden usar el hook `useAuth`.
*/

import { createContext, useState, useContext, useEffect } from "react";
import { loginRequest, varifyTokenRequest } from "../api/auth";

// Creación del contexto de autenticación
export const AuthContext = createContext();

// Custom hook para consumir el contexto de autenticación.
// Este hook asegura que cualquier componente que intente usarlo esté dentro de un AuthProvider.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// Componente que envuelve la aplicación con el contexto de autenticación.
export const AuthProvider = ({ children }) => {
  // Estado local para manejar el usuario, el estado de autenticación, errores y la carga
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para iniciar sesión: realiza una solicitud a la API para obtener el token
  const signin = async (user) => {
    try {
      const response = await loginRequest(user);
      localStorage.setItem("token", response.data.data.token); // Guarda el token en el almacenamiento local
      setUser(response.data.data.userData);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      setErrors(error.response.data);
      setLoading(false);
    }
  };

  // Función para cerrar sesión: elimina el token y restablece el estado de autenticación
  const signout = () => {
    localStorage.removeItem("token");// Elimina el token del almacenamiento local
    setUser(null);// Restablece el estado del usuario y la autenticación
    setIsAuthenticated(false);
  };

  // Verifica si existe un token en el almacenamiento local cuando el componente se monta
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      varifyTokenRequest() // Si hay un token, verifica su validez llamando a la API
        .then((response) => {
          setUser(response.data.data.userData);
          setIsAuthenticated(true);
          setLoading(false);
        })
        .catch((error) => { // Si el token no es válido, elimina el token y actualiza los errores
          setLoading(false);
          localStorage.removeItem("token");
          setErrors(error.response.data);
        });
    }
  }, []);

  // Manejamos los errores, limpiándolos automáticamente después de 5 segundos
  useEffect(() => {
    if (errors) {
      const timer = setTimeout(() => {
        setErrors(null);
      }, 5000);
      return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta
    }
  }, [errors]);

  return (
    // Proveedor del contexto de autenticación, que permitirá acceder a los valores en otros componentes
    <AuthContext.Provider
      value={{
        signin,
        signout,
        user,
        isAuthenticated,
        errors,
        loading,
      }}
    >
      {children} {/* Renderiza los componentes hijos que están dentro del proveedor */}
    </AuthContext.Provider>
  );
};
