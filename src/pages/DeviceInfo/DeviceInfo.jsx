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
  const [isEditMode, setIsEditMode] = useState(false); // Controla si el formulario de edición está abierto
  const [isModalOpen, setIsModalOpen] = useState(false); // Controla si el modal del histórico está abierto
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
  } = useDevice();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDeviceData(null);
        setDeviceHistoric([]);

        const [historic, device] = await Promise.all([
          getDeviceHistoricRequest(deviceId),
          getOneDevice(deviceType, deviceId),
        ]);

        setDeviceHistoric(historic.data.data);
        setDeviceData(device);

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
      const relevantData = Object.keys(data)
        .filter((key) =>
          deviceData.deviceFields.some((field) => field.name === key)
        )
        .reduce((obj, key) => {
          obj[key] = data[key];
          return obj;
        }, {});

      await updateDevice(deviceType, deviceId, relevantData);
      alert("¡Dispositivo actualizado con éxito!");
      setIsEditMode(false); // Cierra el formulario de edición
      const updatedDevice = await getOneDevice(deviceType, deviceId);
      setDeviceData(updatedDevice);
    } catch (error) {
      console.error("Error updating device:", error);
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
      // Actualizar el historial después de agregar
      const result = await getDeviceHistoricRequest(deviceId);
      setDeviceHistoric(result.data.data);
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
        // Vista de solo lectura
        <div className="view-mode">
          <h1>Detalles del dispositivo</h1>
          <div className="device-details-table">
            <div className="table-column">
              {filteredFields
                .filter((_, index) => index % 2 === 0)
                .map((field) => (
                  <div key={field.name} className="row">
                    <div className="cell">{field.name}</div>
                    <div className="cell">{field.value || "N/A"}</div>
                  </div>
                ))}
            </div>
            <div className="table-column">
              {filteredFields
                .filter((_, index) => index % 2 !== 0)
                .map((field) => (
                  <div key={field.name} className="row">
                    <div className="cell">{field.name}</div>
                    <div className="cell">{field.value || "N/A"}</div>
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
        // Formulario de edición
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
                      <input
                        className={`form-input ${
                          errors[field.name] ? "error" : ""
                        }`}
                        type="text"
                        name={field.name}
                        defaultValue={field.value}
                        {...register(field.name)}
                      />
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
                      <input
                        className={`form-input ${
                          errors[field.name] ? "error" : ""
                        }`}
                        type="text"
                        name={field.name}
                        defaultValue={field.value}
                        {...register(field.name)}
                      />
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

      {/* Botón para añadir registro al histórico */}
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
              <select className="input-historico" {...registerHistoric("Tipo")}>
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

      {/* Tabla de registros históricos */}
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
                  <td>{historic?.UsuarioAsignado}</td>
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
