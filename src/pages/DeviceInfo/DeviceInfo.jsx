import { useForm } from "react-hook-form";
import { useDevice } from "../../context/DeviceContext";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const [stateTypes, setStateTypes] = useState([
    "Activo",
    "Inactivo",
    "En reparación",
    "Retirado",
  ]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDeviceData(null);
        setDeviceHistoric([]);

        const [historic, device, devicesList] = await Promise.all([
          getDeviceHistoricRequest(deviceId),
          getOneDevice(deviceType, deviceId),
          getAllDevices(1, 10, "", "", ""),
        ]);

        setDeviceHistoric(historic.data.data);
        setDeviceData(device);
        setEmployees(devicesList.employees);

        device.deviceFields.forEach((field) => {
          setValue(field.name, field.value);
        });
      } catch (error) {
        console.error("Error loading device data:", error);
      }
    };

    fetchData();

    return () => {
      reset();
    };
  }, [deviceType, deviceId]);

  const handleUpdate = handleSubmit(async (data) => {
    try {
      // Obtener solo los campos relevantes del formulario
      const relevantData = Object.keys(data)
        .filter((key) =>
          deviceData.deviceFields.some((field) => field.name === key)
        )
        .reduce((obj, key) => {
          obj[key] = data[key];
          return obj;
        }, {});

      // Detectar qué campos han cambiado realmente
      const changedFields = deviceData.deviceFields
        .filter((field) => {
          return (
            relevantData[field.name] !== undefined &&
            relevantData[field.name] !== field.value
          );
        })
        .map((field) => field.name);

      // Si no hay cambios, no hacer nada
      if (changedFields.length === 0) {
        alert("No se realizaron cambios.");
        setIsEditMode(false);
        return;
      }

      // Actualizar el dispositivo primero
      await updateDevice(deviceType, deviceId, relevantData);

      // Crear un único registro histórico detallado
      const observaciones = changedFields
        .map((field) => {
          const oldValue = deviceData.deviceFields.find(
            (f) => f.name === field
          ).value;
          const newValue = relevantData[field];
          return `Campo "${field}" modificado: de "${oldValue}" a "${newValue}"`;
        })
        .join(" | ");

      const historic = {
        IdEquipo: deviceId,
        Observaciones: observaciones,
        Creador: user.userName,
        Tipo: "Modificación",
        UsuarioAsignado: relevantData["PuestosTrabajo"] || null,
      };

      await createHistoricRequest(historic);

      // Actualizar los datos en la vista
      const updatedDevice = await getOneDevice(deviceType, deviceId);
      setDeviceData(updatedDevice);

      const updatedHistoric = await getDeviceHistoricRequest(deviceId);
      setDeviceHistoric(updatedHistoric.data.data);

      // Mostrar alerta y salir del modo edición
      alert("¡Los cambios se han guardado con éxito!");
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating device:", error);
      alert("Hubo un problema al actualizar el dispositivo.");
    }
  });

  const handleDelete = async () => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este dispositivo?")
    ) {
      try {
        await deleteDevice(deviceType, deviceId);
        alert("¡Dispositivo eliminado con éxito!");
        navigate("/DeviceList", { replace: true });
      } catch (error) {
        console.error("Error deleting device:", error);
        alert("Hubo un problema al eliminar el dispositivo.");
      }
    }
  };

  const handleNavigateHome = () => {
    navigate("/home", { replace: true });
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

      const updatedHistoric = await getDeviceHistoricRequest(deviceId);
      setDeviceHistoric(updatedHistoric.data.data);
    } finally {
      resetHistoric();
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const getEmployeeName = (puesto) => {
    const employee = employees.find((emp) => emp.Puesto === puesto);
    return employee ? `${employee.Puesto} - ${employee.Empleado}` : puesto;
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

      {!isEditMode ? (
        <div className="view-mode">
          <h1>Detalles del dispositivo</h1>
          <div className="device-details-table">
            <div className="table-column">
              {filteredFields
                .filter((_, index) => index % 2 === 0)
                .map((field) => (
                  <div key={field.name} className="row">
                    <div className="cell">{field.name}</div>
                    <div className="cell">
                      {field.name === "PuestosTrabajo"
                        ? getEmployeeName(field.value)
                        : field.value || "N/A"}
                    </div>
                  </div>
                ))}
            </div>
            <div className="table-column">
              {filteredFields
                .filter((_, index) => index % 2 !== 0)
                .map((field) => (
                  <div key={field.name} className="row">
                    <div className="cell">{field.name}</div>
                    <div className="cell">
                      {field.name === "PuestosTrabajo"
                        ? getEmployeeName(field.value)
                        : field.value || "N/A"}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="form-buttons-ver">
            <button className="cancel-button-ver" onClick={handleNavigateHome}>
              Volver al menú
            </button>
            {user.role === "Admin" && (
              <>
                <button
                  className="submit-button-ver"
                  onClick={() => setIsEditMode(true)}
                >
                  Actualizar
                </button>
                <button className="delete-button-ver" onClick={handleDelete}>
                  Eliminar
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="form">
          <h1>Editar dispositivo</h1>
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
                      {field.name === "PuestosTrabajo" ? (
                        <select
                          className={`form-input ${
                            errors[field.name] ? "error" : ""
                          }`}
                          name={field.name}
                          {...register(field.name)}
                        >
                          {employees.map((employee) => (
                            <option
                              key={employee.Puesto}
                              value={employee.Puesto}
                            >
                              {employee.Puesto} - {employee.Empleado}
                            </option>
                          ))}
                        </select>
                      ) : field.name === "Estado" ? (
                        <select
                          className={`form-input ${
                            errors[field.name] ? "error" : ""
                          }`}
                          name={field.name}
                          {...register(field.name)}
                        >
                          {stateTypes.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className={`form-input ${
                            errors[field.name] ? "error" : ""
                          }`}
                          type="text"
                          name={field.name}
                          defaultValue={field.value}
                          {...register(field.name)}
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
                      {field.name === "PuestosTrabajo" ? (
                        <select
                          className={`form-input ${
                            errors[field.name] ? "error" : ""
                          }`}
                          name={field.name}
                          {...register(field.name)}
                        >
                          {employees.map((employee) => (
                            <option
                              key={employee.Puesto}
                              value={employee.Puesto}
                            >
                              {employee.Puesto} - {employee.Empleado}
                            </option>
                          ))}
                        </select>
                      ) : field.name === "Estado" ? (
                        <select
                          className={`form-input ${
                            errors[field.name] ? "error" : ""
                          }`}
                          name={field.name}
                          {...register(field.name)}
                        >
                          {stateTypes.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className={`form-input ${
                            errors[field.name] ? "error" : ""
                          }`}
                          type="text"
                          name={field.name}
                          defaultValue={field.value}
                          {...register(field.name)}
                        />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="form-buttons-ver">
            <button
              type="button"
              className="cancel-button"
              onClick={() => setIsEditMode(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="submit-button">
              Guardar cambios
            </button>
          </div>
        </form>
      )}

      <button className="modal-button" onClick={() => setIsModalOpen(true)}>
        Añadir registro al histórico
      </button>

      {isModalOpen && (
        <div className="div-modal">
          <div className="modal-registro">
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
                  className="input-historico"
                  {...registerHistoric("Tipo")}
                >
                  <option value="Incidencia">Incidencia</option>
                  <option value="Asignación">Asignación</option>
                  <option value="Modificación">Modificación</option>
                </select>
              </label>
              <div className="div-botones-historico">
                <button
                  className="cerrar-historico"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cerraractua
                </button>
                <button className="add-historico" type="submit">
                  Añadir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="historical-records">
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
              {deviceHistoric.map((historic) => (
                <tr key={`${historic.Id}-${historic.Fecha}`}>
                  <td>{formatDate(historic.Fecha)}</td>
                  <td>{historic?.Observaciones}</td>
                  <td>{historic.Creador}</td>
                  <td>
                    {historic?.UsuarioAsignado
                      ? getEmployeeName(historic.UsuarioAsignado)
                      : "N/A"}
                  </td>
                  <td>{historic.Tipo}</td>
                </tr>
              ))}
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
