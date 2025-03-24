// Componente que protege las rutas, asegurando que el usuario esté autenticado antes de acceder a ellas.

import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDevice } from "../context/DeviceContext";
import { useEffect } from "react";

export default function ProtectedRoutes() {
  // Obtiene el estado de autenticación y carga desde el contexto de autenticación
  const { loading, isAuthenticated } = useAuth();
  const { errors } = useDevice(); // Obtiene los posibles errores desde el contexto de dispositivos
  const navigate = useNavigate();

  // Si hay un error, redirige después de 5 segundos
  useEffect(() => {
    if (errors) {
      const timer = setTimeout(() => {
        navigate("/Home");
      }, 5000);
      return () => clearTimeout(timer); // Limpia el temporizador cuando se desmonta
    }
  }, [errors]);

  // Si hay errores, los muestra en pantalla
  if (errors) return <div>{errors.data}</div>;

  // Muestra un mensaje de carga mientras se obtiene el estado de autenticación
  if (loading) return <div>Loading...</div>;

  // Si el usuario no está autenticado, redirige al login
  if (!isAuthenticated) return <Navigate to="/" replace />;

  // Si está autenticado, renderiza el contenido de la ruta protegida
  return <Outlet />;
}
