/*
Este archivo maneja la información de un dispositivo específico, incluyendo su historial
y la capacidad de actualizar sus detalles. Además, permite eliminar el dispositivo y agregar
entradas al historial del dispositivo.
*/

import { useForm } from "react-hook-form";
import { useDevice } from "../../context/DeviceContext";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getDeviceHistoricRequest,
  createHistoricRequest,
} from "../../api/historic";
import "./DeviceInfo.css";

function DeviceInfo() {
  const { deviceId, deviceType } = useParams();
  const [deviceData, setDeviceData] = useState(null);
  const [deviceHistoric, setDeviceHistoric] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm();

  const {
    register: registerHistoric,
    handleSubmit: handleSubmitHistoric,
    formState: { errors: errorsHistoric },
    reset: resetHistoric,
  } = useForm();

  const {
    getOneDevice,
    updateDevice,
    deleteDevice,
    errors: responseErrors,
    getAllDevices,
  } = useDevice();

  // Cargar todos los datos cuando cambian los parámetros
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Resetear estados
        setDeviceData(null);
        setDeviceHistoric([]);

        // Cargar datos en paralelo
        const [historic, device, devicesList] = await Promise.all([
          getDeviceHistoricRequest(deviceId),
          getOneDevice(deviceType, deviceId),
          getAllDevices(1, 10, "", "", ""),
        ]);

        setDeviceHistoric(historic.data.data);
        setDeviceData(device);
        setEmployees(devicesList.employees);

        // Establecer valores iniciales del formulario
        device.deviceFields.forEach((field) => {
          setValue(field.name, field.value);
          if (field.name === "PuestosTrabajo") {
            setSelectedValue(field.value);
          }
        });
      } catch (error) {
        console.error("Error loading device data:", error);
      }
    };

    fetchData();

    return () => {
      // Limpiar el formulario al desmontar
      reset();
    };
  }, [deviceType, deviceId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const onSubmitHistoric = handleSubmitHistoric(async (data) => {
    const { Observacion, Tipo, UsuarioAsignado } = data;
    const historic = {
      IdEquipo: deviceId,
      Observaciones: Observacion,
      Creador: user.userName,
      Tipo,
      UsuarioAsignado,
    };
    try {
      await createHistoricRequest(historic);
      alert("¡Historial creado con éxito!");
      setIsModalOpen(false);
      // Actualizar el historial después de agregar
      const result = await getDeviceHistoricRequest(deviceId);
      setDeviceHistoric(result.data.data);
    } finally {
      resetHistoric();
    }
  });

  function sortObject(obj) {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = obj[key];
        return result;
      }, {});
  }

  const handleUpdate = handleSubmit(async (data) => {
    if (!deviceData) return;

    const currentValues = getValues();

    const relevantData = Object.keys(currentValues)
      .filter((key) =>
        deviceData.deviceFields.some((field) => field.name === key)
      )
      .reduce((obj, key) => {
        obj[key] = currentValues[key];
        return obj;
      }, {});

    const relevantDataStr = Object.keys(relevantData).reduce((obj, key) => {
      obj[key] = String(relevantData[key]);
      return obj;
    }, {});

    const initialDataFlat = deviceData.deviceFields.reduce((obj, field) => {
      obj[field.name] = String(field.value);
      return obj;
    }, {});

    delete initialDataFlat["Id"];

    const sortedRelevantDataStr = sortObject(relevantDataStr);
    const sortedInitialDataFlat = sortObject(initialDataFlat);

    if (
      JSON.stringify(sortedRelevantDataStr) ===
      JSON.stringify(sortedInitialDataFlat)
    ) {
      alert("No se han realizado cambios.");
      return;
    }

    try {
      await updateDevice(deviceType, deviceId, relevantData);
      alert("¡Dispositivo actualizado con éxito!");
      // Recargar los datos actualizados
      const updatedDevice = await getOneDevice(deviceType, deviceId);
      setDeviceData(updatedDevice);
    } catch (error) {
      console.error("Error updating device:", error);
    }
  });

  const handleDelete = async (event) => {
    event.preventDefault();
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este dispositivo?")
    ) {
      await deleteDevice(deviceType, deviceId);
      navigate("/home", { replace: true });
    }
  };

  const handleNavigateHome = () => {
    navigate("/home", { replace: true });
  };

  if (!deviceData) return <div>Loading...</div>;

  const filteredFields = deviceData.deviceFields.filter(
    (field) => field.name !== "Id"
  );

  return (
    <div className="device-form">
      {responseErrors && (
        <div className="error-message">
          <strong>{responseErrors.data}</strong>
        </div>
      )}
      <div className="titulo-device">Tipo de Dispositivo: {deviceType}</div>
      <form onSubmit={handleUpdate} className="form">
        <div className="form-fields">
          <div className="column">
            {filteredFields
              .filter((_, index) => index % 2 === 0)
              .map((field) => (
                <div
                  key={field.name}
                  className={`row ${errors[field.name] ? "error" : ""}`}
                >
                  <div className="cell">
                    <label
                      className={`form-label ${
                        errors[field.name] ? "error" : ""
                      }`}
                    >
                      {field.name}
                    </label>
                  </div>
                  <div className="cell">
                    {errors[field.name] && (
                      <p className="error-text">Este campo es requerido</p>
                    )}
                    {field.name === "PuestosTrabajo" ? (
                      <select
                        className={`form-input ${
                          errors[field.name] ? "error" : ""
                        }`}
                        name={field.name}
                        {...register(field.name)}
                        value={selectedValue}
                        onChange={(e) => {
                          setValue(field.name, e.target.value);
                          setSelectedValue(e.target.value);
                        }}
                      >
                        {employees.map((employee) => {
                          return (
                            <option
                              key={employee.Puesto}
                              value={employee.Puesto}
                            >
                              {employee.Puesto} - {employee.Empleado}
                            </option>
                          );
                        })}
                      </select>
                    ) : field.name === "AñoCompra" ? (
                      <input
                        className={`form-input ${
                          errors[field.name] ? "error" : ""
                        }`}
                        type="date"
                        name={field.name}
                        defaultValue={field.value}
                        {...register(field.name, { required: true })}
                      />
                    ) : field.name === "Estado" ? (
                      <select
                        className={`form-input ${
                          errors[field.name] ? "error" : ""
                        }`}
                        defaultValue={field.value}
                        name={field.name}
                        {...register(field.name, { required: true })}
                      >
                        <option value="En uso">En uso</option>
                        <option value="Disponible">Disponible</option>
                        <option value="No usable">No usable</option>
                        <option value="De baja">De baja</option>
                        <option value="Asignación Temporal">
                          Asignación Temporal
                        </option>
                        <option value="Pendiente actualizar datos">
                          Pendiente actualizar datos
                        </option>
                      </select>
                    ) : field.name === "Pulgadas" ? (
                      <input
                        className={`form-input ${
                          errors[field.name] ? "error" : ""
                        }`}
                        type="number"
                        step="0.1"
                        name={field.name}
                        defaultValue={field.value}
                        {...register(field.name, {
                          pattern: /^\d+(\.\d{1,2})?$/,
                        })}
                      />
                    ) : (
                      <input
                        className={`form-input ${
                          errors[field.name] ? "error" : ""
                        }`}
                        type={field.type}
                        name={field.name}
                        defaultValue={field.value}
                        {...register(field.name, {
                          required: [
                            "AñoCompra",
                            "PuestoTrabajo",
                            "Estado",
                            "Referencia",
                          ].includes(field.name),
                        })}
                      />
                    )}
                  </div>
                </div>
              ))}
          </div>
          <div className="column">
            {filteredFields
              .filter((_, index) => index % 2 !== 0)
              .map((field) => (
                <div
                  key={field.name}
                  className={`row ${errors[field.name] ? "error" : ""}`}
                >
                  <div className="cell">
                    <label
                      className={`form-label ${
                        errors[field.name] ? "error" : ""
                      }`}
                    >
                      {field.name}
                    </label>
                  </div>
                  <div className="cell">
                    {errors[field.name] && (
                      <p className="error-text">Este campo es requerido</p>
                    )}
                    {field.name === "PuestosTrabajo" ? (
                      <select
                        className={`form-input ${
                          errors[field.name] ? "error" : ""
                        }`}
                        name={field.name}
                        {...register(field.name)}
                        value={selectedValue}
                        onChange={(e) => {
                          setValue(field.name, e.target.value);
                          setSelectedValue(e.target.value);
                        }}
                      >
                        {employees.map((employee) => {
                          return (
                            <option
                              key={employee.Puesto}
                              value={employee.Puesto}
                            >
                              {employee.Puesto} - {employee.Empleado}
                            </option>
                          );
                        })}
                      </select>
                    ) : field.name === "AñoCompra" ? (
                      <input
                        className={`form-input ${
                          errors[field.name] ? "error" : ""
                        }`}
                        type="date"
                        name={field.name}
                        defaultValue={field.value}
                        {...register(field.name, { required: true })}
                      />
                    ) : field.name === "Estado" ? (
                      <select
                        className={`form-input ${
                          errors[field.name] ? "error" : ""
                        }`}
                        name={field.name}
                        defaultValue={field.value}
                        {...register(field.name, { required: true })}
                      >
                        <option value="En uso">En uso</option>
                        <option value="Disponible">Disponible</option>
                        <option value="No usable">No usable</option>
                        <option value="De baja">De baja</option>
                        <option value="Asignación Temporal">
                          Asignación Temporal
                        </option>
                        <option value="Pendiente actualizar datos">
                          Pendiente actualizar datos
                        </option>
                      </select>
                    ) : field.name === "Pulgadas" ? (
                      <input
                        className={`form-input ${
                          errors[field.name] ? "error" : ""
                        }`}
                        type="number"
                        step="0.1"
                        name={field.name}
                        defaultValue={field.value}
                        {...register(field.name, {
                          required: true,
                          pattern: /^\d+(\.\d{1,2})?$/,
                        })}
                      />
                    ) : (
                      <input
                        className={`form-input ${
                          errors[field.name] ? "error" : ""
                        }`}
                        type={field.type}
                        name={field.name}
                        defaultValue={field.value}
                        {...register(field.name, {
                          required: [
                            "AñoCompra",
                            "PuestoTrabajo",
                            "Estado",
                            "Referencia",
                          ].includes(field.name),
                        })}
                      />
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="form-buttons">
          <button
            type="button"
            className="cancel-button"
            onClick={handleNavigateHome}
          >
            Volver al menú
          </button>
          <button className="submit-button">Actualizar</button>
          <button onClick={handleDelete} className="delete-button">
            Eliminar
          </button>
        </div>
      </form>

      <button className="modal-button" onClick={() => setIsModalOpen(true)}>
        Añadir registro al histórico
      </button>

      {isModalOpen && (
        <div className="modal">
          <form onSubmit={onSubmitHistoric}>
            <label className="label-historico">
              Observación
              <input
                className={`input-historico ${
                  errorsHistoric.Observacion ? "error" : ""
                }`}
                {...registerHistoric("Observacion", { required: true })}
              />
            </label>
            <label className="label-historico">
              Usuario asignado
              <input
                className={`input-historico ${
                  errorsHistoric.UsuarioAsignado ? "error" : ""
                }`}
                {...registerHistoric("UsuarioAsignado")}
              />
            </label>
            <label className="label-historico">
              Tipo
              <select
                className="input-historico "
                {...registerHistoric("Tipo")}
              >
                <option value="Incidencia">Incidencia</option>
                <option value="Asignación">Asignación</option>
                <option value="Actualización">Actualización</option>
              </select>
            </label>
            <button
              className="cerrar-historico"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cerrar
            </button>
            <button className="add-historico" type="submit">
              Añadir
            </button>
          </form>
        </div>
      )}

      <div className="">
        {deviceHistoric.length > 0 ? (
          <table className="table-dispositivos">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Observaciones</th>
                <th>Creador</th>
                <th>Usuario</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {deviceHistoric.map((historic) => {
                return (
                  <tr key={`${historic.Id}-${historic.Fecha}`}>
                    <td>{formatDate(historic.Fecha)}</td>
                    <td>{historic?.Observaciones}</td>
                    <td>{historic.Creador}</td>
                    <td>{historic?.UsuarioAsignado}</td>
                    <td>{historic.Tipo}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No hay datos disponibles</p>
        )}
      </div>
    </div>
  );
}

export default DeviceInfo;
