/*
Este archivo contiene la lógica y el formulario para crear o editar dispositivos. 
Permite capturar información sobre dispositivos, gestionarlos mediante un formulario, 
y generar un código QR con los datos del dispositivo. El formulario también maneja validaciones
y tiene funcionalidad de impresión del QR.
*/

import { useForm } from "react-hook-form";
import { useDevice } from "../../context/DeviceContext";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import "./DeviceFormPage.css";

export default function DeviceFormPage({ deviceType, onSuccess }) {
  const { deviceId } = useParams(); // Obtener el ID del dispositivo desde los parámetros de la URL
  const [qrValues, setQrValues] = useState(null); // Estado para los valores del código QR
  const [employees, setEmployees] = useState([]); // Estado para la lista de empleados
  const navigate = useNavigate(); // Hook para la navegación

  // Inicializar el formulario con react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  // Obtener funciones y datos del contexto de dispositivo
  const {
    getOneDevice,
    getDeviceForm,
    createDevice,
    updateDevice,
    getAllDevices,
    formData,
    errors: responseErrors,
  } = useDevice();

  // Estado para controlar la carga inicial
  const [isLoading, setIsLoading] = useState(true);

  // useEffect para cargar datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Resetear estados
        setQrValues(null);
        reset();

        // Cargar empleados
        const devicesResult = await getAllDevices(1, 10, "", "", "");
        setEmployees(devicesResult.employees);

        // Cargar datos del dispositivo o formulario vacío
        const result = deviceId
          ? await getOneDevice(deviceType, deviceId)
          : await getDeviceForm(deviceType);

        // Establecer valores del formulario
        if (result?.deviceFields) {
          result.deviceFields.forEach((field) => {
            setValue(field.name, field.value);
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      reset();
    };
  }, [deviceType, deviceId]);

  // Función para manejar el envío del formulario
  const onSubmit = handleSubmit(async (data) => {
    try {
      // Filtrar datos relevantes del formulario
      const relevantData = Object.keys(data)
        .filter((key) =>
          formData.deviceFields.some((field) => field.name === key)
        )
        .reduce((obj, key) => {
          obj[key] = data[key];
          return obj;
        }, {});

      if (deviceId) {
        // Actualizar dispositivo existente
        await updateDevice(deviceType, deviceId, relevantData);
        alert("Dispositivo actualizado con éxito");

        // Forzar recarga de los datos
        const updatedDevice = await getOneDevice(deviceType, deviceId);
        updatedDevice.deviceFields.forEach((field) => {
          setValue(field.name, field.value);
        });
      } else {
        // Crear nuevo dispositivo
        const deviceCreated = await createDevice(deviceType, relevantData);
        navigate("/home", { replace: true });
        alert("Dispositivo creado con éxito");
        setQrValues({
          ...deviceCreated.data.data.deviceData,
          Referencia: data.Referencia,
        });

        reset();

        // Mostrar alerta de éxito
        alert("Dispositivo creado correctamente");

        // Redirigir al apartado "Home" si se pasa la función onSuccess
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error al guardar el dispositivo:", error);
    }
  });

  // Función para renderizar campos dinámicamente
  const renderField = (field) => {
    const commonProps = {
      className: `form-input ${errors[field.name] ? "error" : ""}`,
      ...register(field.name, {
        required: [
          "Modelo",
          "AñoCompra",
          "PuestosTrabajo",
          "Estado",
          "Referencia",
        ].includes(field.name),
        pattern: field.name === "Pulgadas" ? /^\d+(\.\d{1,2})?$/ : undefined,
      }),
    };

    switch (field.name) {
      case "PuestosTrabajo":
        return (
          <select {...commonProps}>
            <option value="">Seleccione un puesto</option>
            {employees.map((employee) => (
              <option key={employee.Puesto} value={employee.Puesto}>
                {employee.Puesto} - {employee.Empleado}
              </option>
            ))}
          </select>
        );
      case "AñoCompra":
        return <input type="date" {...commonProps} />;
      case "Estado":
        return (
          <select {...commonProps}>
            <option value="">Seleccione un estado</option>
            <option value="En uso">En uso</option>
            <option value="Disponible">Disponible</option>
            <option value="No usable">No usable</option>
            <option value="De baja">De baja</option>
            <option value="Asignación Temporal">Asignación Temporal</option>
            <option value="Pendiente actualizar datos">
              Pendiente actualizar datos
            </option>
          </select>
        );
      case "Pulgadas":
        return <input type="number" step="0.1" {...commonProps} />;
      default:
        return (
          <input
            type={field.type}
            {...commonProps}
            key={`${deviceId}-${field.name}`} // Clave única para forzar rerender
          />
        );
    }
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="device-form">
      {responseErrors && (
        <div className="error-message">
          <strong>{responseErrors.data}</strong>
        </div>
      )}

      <form onSubmit={onSubmit} className="form">
        <div className="form-fields">
          {formData?.deviceFields
            ?.filter((field) => field.name !== "Id")
            ?.reduce(
              (columns, field, index) => {
                const columnIndex = index % 2;
                columns[columnIndex].push(field);
                return columns;
              },
              [[], []]
            )
            ?.map((columnFields, colIndex) => (
              <div key={colIndex} className="column">
                {columnFields.map((field) => (
                  <div
                    key={`${deviceId}-${field.name}`}
                    className={`form-field ${
                      errors[field.name] ? "error" : ""
                    }`}
                  >
                    <label
                      className={`form-label ${
                        errors[field.name] ? "error" : ""
                      }`}
                    >
                      {field.name}
                    </label>
                    {errors[field.name] && (
                      <p className="error-text">Este campo es requerido</p>
                    )}
                    {renderField(field)}
                  </div>
                ))}
              </div>
            ))}
        </div>

        <div className="form-buttons">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/home", { replace: true })}
          >
            Volver al menú
          </button>
          <button type="submit" className="submit-button">
            {deviceId ? "Actualizar dispositivo" : "Añadir dispositivo"}
          </button>
        </div>
      </form>

      {qrValues && (
        <div className="qr-section">
          <QRCode
            size={256}
            value={JSON.stringify(qrValues)}
            viewBox="0 0 256 256"
          />
          <div className="div-ref">{qrValues.Referencia}</div>
          <button
            onClick={() => {
              const printWindow = window.open("", "_blank");
              printWindow.document.write(`
              <html>
                <body style="text-align: center;">
                  <div style="margin: 0 auto;">
                    ${
                      document.querySelector(".qr-section > svg")?.outerHTML ||
                      ""
                    }
                    <p style="font-size: 32px; font-weight: bold;">${
                      qrValues.Referencia
                    }</p>
                  </div>
                </body>
              </html>
            `);
              printWindow.document.close();
              printWindow.print();
            }}
            className="print-button"
          >
            Imprimir QR
          </button>
        </div>
      )}
    </div>
  );
}
