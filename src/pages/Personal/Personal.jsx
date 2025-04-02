/*
  Este componente maneja la gestión de personal dentro de la aplicación. Permite mostrar y modificar la información
  de los puestos de trabajo, así como añadir nuevos puestos y eliminar existentes. Además, ofrece la visualización de
  planos de las plantas con opciones de navegación.
*/

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// Importación de las funciones para interactuar con la API relacionada con los puestos de trabajo
import {
  getAllPlacesRequest,
  createPlaceRequest,
  updatePlaceRequest,
  deletePlaceRequest,
} from "../../api/places";

// Importación de imágenes para los planos de las plantas
import Plano_P0 from "../../imagenes/Plano_P0.png";
import Plano_P1 from "../../imagenes/Plano_P1.png";

import "./Personal.css";
import axios from "axios";

function Personal() {
  // Definición de los estados necesarios para manejar la selección de puestos, empleados, planos y mapa
  const [selectedOption, setSelectedOption] = useState("");
  const [empleados, setEmpleados] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [newPuesto, setNewPuesto] = useState("");
  const [newEmpleado, setNewEmpleado] = useState("");
  const [newPlanta, setNewPlanta] = useState("Baja");

  const [selectedImage, setSelectedImage] = useState(Plano_P1);

  const [iPuesto, setIPuesto] = useState("");
  const [iEmpleado, setIEmpleado] = useState("");
  const [iPlanta, setIPlanta] = useState("");

  const [activeButton, setActiveButton] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Efecto para cargar los datos de los empleados al cargar el componente
  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const result = await getAllPlacesRequest();
        setEmpleados(result.data.data);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };

    fetchEmpleados();
  }, []);

  // Controlador de cambio de la selección de puesto
  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
    const empleadoSeleccionado = empleados.find(
      (empleado) => empleado.Puesto === event.target.value
    );
    // Si se encuentra el empleado, actualizamos los estados de los campos de edición
    if (empleadoSeleccionado) {
      setIPuesto(empleadoSeleccionado.Puesto);
      setIEmpleado(empleadoSeleccionado.Empleado || "");
      setIPlanta(empleadoSeleccionado.Planta);
    } else {
      // Si no se encuentra el puesto, limpiamos los campos
      setIPuesto("");
      setIEmpleado("");
      setIPlanta("");
    }
  };

  // Controlador para los cambios en los campos de entrada del formulario de edición
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "iPuesto") setIPuesto(value);
    if (name === "iEmpleado") setIEmpleado(value);
    if (name === "iPlanta") setIPlanta(value);
  };

  // Función para manejar la actualización de un puesto
  const handleUpdate = async () => {
    try {
      await updatePlaceRequest(iPuesto, {
        Puesto: iPuesto,
        Empleado: iEmpleado,
        Planta: iPlanta,
      });
      alert("Puesto actualizado con éxito");
      const result = await getAllPlacesRequest();
      setEmpleados(result.data.data);
    } catch (error) {
      // Manejo del error: si el error es 403, muestra el mensaje de permisos insuficientes
      if (error.response && error.response.status === 403) {
        alert("Permisos insuficientes. Contacte con un administrador");
      } else {
        console.error("Error updating place:", error);
      }
    }
  };

  // Función para manejar la creación de un nuevo puesto
  const handleCreate = async () => {
    if (!newPuesto || !newEmpleado || !newPlanta) {
      alert(
        "Por favor, rellena todos los campos antes de crear un nuevo puesto."
      );
      return;
    }

    try {
      await createPlaceRequest({
        Puesto: newPuesto,
        Empleado: newEmpleado,
        Planta: newPlanta,
      });
      alert("Puesto creado con éxito");
      setShowModal(false);
      const result = await getAllPlacesRequest();
      setEmpleados(result.data.data);
    } catch (error) {
      // Manejo del error: si el error es 403, muestra el mensaje de permisos insuficientes
      if (error.response && error.response.status === 403) {
        alert("Permisos insuficientes. Contacte con un administrador");
      } else {
        console.error("Error creating place:", error);
      }
    }
  };

  // Función para manejar la eliminación de un puesto
  const handleDelete = async () => {
    const confirmation = window.confirm(
      "¿Estás seguro de que quieres eliminar este puesto?"
    );
    if (confirmation) {
      try {
        await deletePlaceRequest(iPuesto, {
          Puesto: iPuesto,
          Empleado: iEmpleado,
          Planta: iPlanta,
        });
        alert("Puesto eliminado con éxito");
        setIPuesto("");
        setIEmpleado("");
        setIPlanta("");
        setSelectedOption("");
        const result = await getAllPlacesRequest();
        setEmpleados(result.data.data);
      } catch (error) {
        // Manejo del error: si el error es 403, muestra el mensaje de permisos insuficientes
        if (error.response && error.response.status === 403) {
          alert("Permisos insuficientes. Contacte con un administrador");
        } else {
          console.error("Error deleting place:", error);
        }
      }
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem("token"); // Obtén el token del localStorage
        const response = await axios.get(
          "http://localhost:3000/api/users/auth/check-admin",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
            },
          }
        );

        if (!response.data.isAdmin) {
          navigate("/home"); // Redirige si no es administrador
        } else {
          setIsAdmin(true); // Actualiza el estado si es administrador
        }
      } catch (err) {
        console.error(
          "Error al verificar permisos de administrador:",
          err.response || err
        );
        navigate("/home"); // Redirige si hay un error
      }
    };

    checkAdmin();
  }, [navigate]);

  if (!isAdmin) {
    return null; // No renderiza nada mientras verifica el rol
  }

  return (
    <div className="main-container">
      <h1 className="title">Gestión del personal</h1>
      <div className="personal-container">
        <div className="left-section">
          <div className="divGestion">
            <h1 className="personal-h2">Elige:</h1>
            <select
              className="personal-select"
              value={selectedOption}
              onChange={handleSelectChange}
            >
              {empleados
                .sort((a, b) => a.Puesto - b.Puesto) // Ordenar por número de puesto
                .map((empleado) => (
                  <option key={empleado.Puesto} value={empleado.Puesto}>
                    {empleado.Puesto} - {empleado.Empleado}
                  </option>
                ))}
            </select>

            <form className="form-personal">
              <label className="label-personal">
                Puesto:{" "}
                <input
                  className="input-personal"
                  type="text"
                  name="iPuesto"
                  value={iPuesto}
                  onChange={handleInputChange}
                  placeholder="Puesto"
                  readOnly
                />
              </label>
              <label className="label-personal">
                Empleado:{" "}
                <input
                  className="input-personal"
                  type="text"
                  name="iEmpleado"
                  value={iEmpleado}
                  onChange={handleInputChange}
                  placeholder="Empleado"
                />
              </label>
              <label className="label-personal">
                Planta:
                <select
                  className="select-personal"
                  name="iPlanta"
                  value={iPlanta}
                  onChange={handleInputChange}
                >
                  <option value="Baja">Baja</option>
                  <option value="Laboratorio">Laboratorio</option>
                </select>
              </label>
            </form>
          </div>
          <div className="div-botones-personal">
            <button className="modificar-personal" onClick={handleUpdate}>
              Modificar puesto
            </button>
            <button
              className="agregar-personal"
              onClick={() => setShowModal(true)}
            >
              Añadir nuevo puesto
            </button>
            {showModal && (
              <div className="modal-personal">
                <div className="modal-content">
                  <h2 className="modal-h2">Añadir nuevo puesto</h2>
                  <input
                    className="input-modal"
                    type="text"
                    value={newPuesto}
                    onChange={(e) => setNewPuesto(e.target.value)}
                    placeholder="Puesto (Número)"
                  />
                  <input
                    className="input-modal"
                    type="text"
                    value={newEmpleado}
                    onChange={(e) => setNewEmpleado(e.target.value)}
                    placeholder="Empleado"
                  />
                  <select
                    className="input-modal"
                    value={newPlanta}
                    onChange={(e) => setNewPlanta(e.target.value)}
                  >
                    <option value="Baja">Baja</option>
                    <option value="Laboratorio">Laboratorio</option>
                  </select>
                  <div className="botones-modal">
                    <button className="modal-crear" onClick={handleCreate}>
                      Crear
                    </button>
                    <button
                      className="modal-cancelar"
                      onClick={() => {
                        setShowModal(false);
                        setNewPuesto("");
                        setNewEmpleado("");
                        setNewPlanta("");
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
            <button className="eliminar-personal" onClick={handleDelete}>
              Eliminar puesto
            </button>
          </div>
          <div className="boton-volver-container">
            <Link to="/home">
              <button className="boton-volver"> Volver al menú </button>
            </Link>
          </div>
        </div>
        <div className="right-section">
          <img
            className="imagen"
            src={selectedImage}
            alt="Planta seleccionada"
          />
          <div className="botones-mapa">
            <button
              className={`controlador-imagen ${
                activeButton === "PlantaBaja" ? "active" : ""
              }`}
              onClick={() => {
                setActiveButton("PlantaBaja");
                setSelectedImage(Plano_P1);
              }}
            >
              Planta Baja
            </button>
            <button
              className={`controlador-imagen ${
                activeButton === "Laboratorio" ? "active" : ""
              }`}
              onClick={() => {
                setActiveButton("Laboratorio");
                setSelectedImage(Plano_P0);
              }}
            >
              Laboratorio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Personal;
