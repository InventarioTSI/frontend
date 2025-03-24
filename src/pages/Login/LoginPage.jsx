/*
  Este componente maneja la página de inicio de sesión (Login) de la aplicación.
  Permite al usuario ingresar sus credenciales, que luego se validan a través del contexto de autenticación.
  Si la autenticación es exitosa, el usuario es redirigido a la página principal ("/home").
*/

import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './LoginPage.css';

export default function LoginPage() {
  // Desestructuramos el hook useForm para gestionar los datos del formulario y los errores
  const {
    register, // Función para registrar los inputs del formulario
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Extraemos funciones y estados del contexto de autenticación
  const { signin, isAuthenticated, errors: authErrors } = useAuth();

  // Usamos useNavigate para redirigir al usuario después de iniciar sesión
  const navigate = useNavigate();

  // Función que se ejecuta cuando el formulario es enviado
  const onSubmit = handleSubmit(async (values) => {
    await signin(values); // Llamamos al método signin del contexto de autenticación para intentar autenticar al usuario
  });

  // Efecto que redirige al usuario a la página de inicio si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) navigate("/home");
  }, [isAuthenticated]);

  return (
    <div className="loginPage">
      <div className="loginForm">
        <h1 className="loginTitle">LOGIN</h1>
        
        {/* Mostramos los errores de autenticación si los hay */}
        {authErrors && (
          <div className="alert">
            <strong className="alertText">{authErrors.data}</strong>
          </div>
        )}

        
        <form onSubmit={onSubmit}>
          <div className="formGroup">
            <div className="inputGroup">
              <label className="label">Usuario</label>
              {errors.userName && (
                <p className="errorText">Este campo es requerido</p>
              )}
              <input
                className="input"
                type="text"
                {...register("userName", { required: true })}
                placeholder="Usuario"
              />
            </div>
            <div className="inputGroup">
              <label className="label">Contraseña</label>
              {errors.password && (
                <p className="errorText">Este campo es requerido</p>
              )}
              <input
                className="input"
                type="password"
                {...register("password", { required: true })}
                placeholder="Contraseña"
              />
            </div>
          </div>

          <div className="buttonGroup">
            <button className="submitButton" type="submit">
              INICIAR SESIÓN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
