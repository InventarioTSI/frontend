import { useForm } from "react-hook-form";
import { useDevice } from "../../context/DeviceContext";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./DeviceInfo.css";

function DeviceInfo() {
  const { deviceId, deviceType } = useParams();
  const [deviceData, setDeviceData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false); // Controla si el formulario de edición está abierto
  const [isModalOpen, setIsModalOpen] = useState(false); // Controla si el modal del informe está abierto
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
  } = useDevice();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDeviceData(null);

        const device = await getOneDevice(deviceType, deviceId);
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

  const handleGenerateReport = () => {
    // Aquí puedes implementar la lógica para generar el informe
    alert("Generando informe...");
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
          <div className="form-buttons">
            <button className="cancel-button" onClick={handleNavigateHome}>
              Volver al menú
            </button>
            {user.role === "Admin" && (
              <>
                <button
                  className="submit-button"
                  onClick={() => setIsEditMode(true)}
                >
                  Actualizar
                </button>
                <button className="delete-button" onClick={handleDelete}>
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
          <div className="form-buttons">
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

      {/* Botón para generar informe */}
      <div className="form-buttons">
        <button className="report-button" onClick={handleGenerateReport}>
          Generar Informe
        </button>
      </div>
    </div>
  );
}

export default DeviceInfo;
