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
  const [isViewMode, setIsViewMode] = useState(true); // Modo "Ver"
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

      {isViewMode ? (
        // Modo "Ver": Mostrar datos en una tabla dividida en dos columnas
        <div className="view-mode">
          <h1>Detalles del dispositivo</h1>
          <div className="device-details-table">
            <div className="table-column">
              {filteredFields
                .filter((_, index) => index % 2 === 0) // Primera columna: campos pares
                .map((field) => (
                  <div key={field.name} className="row">
                    <div className="cell">{field.name}</div>
                    <div className="cell">{field.value || "N/A"}</div>
                  </div>
                ))}
            </div>
            <div className="table-column">
              {filteredFields
                .filter((_, index) => index % 2 !== 0) // Segunda columna: campos impares
                .map((field) => (
                  <div key={field.name} className="row">
                    <div className="cell">{field.name}</div>
                    <div className="cell">{field.value || "N/A"}</div>
                  </div>
                ))}
            </div>
          </div>
          <button className="cancel-button" onClick={handleNavigateHome}>
            Volver al menú
          </button>
        </div>
      ) : (
        // Modo "Formulario": Mostrar campos de formulario
        <form onSubmit={handleSubmit(async (data) => {})} className="form">
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
          <div className="form-buttons">
            <button
              type="button"
              className="cancel-button"
              onClick={handleNavigateHome}
            >
              Volver al menú
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default DeviceInfo;
