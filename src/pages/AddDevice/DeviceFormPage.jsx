/*
Este archivo contiene la lógica y el formulario para crear o editar dispositivos. 
Permite capturar información sobre dispositivos, gestionarlos mediante un formulario, 
y generar un código QR con los datos del dispositivo. El formulario también maneja validaciones
y tiene funcionalidad de impresión del QR.
*/

import { useForm } from "react-hook-form";
import { useDevice } from "../../context/DeviceContext";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import "./DeviceFormPage.css";

export default function DeviceFormPage({ deviceType }) {


  const { deviceId } = useParams(); // Obtiene el ID del dispositivo desde la URL
  const [qrValues, setQrValues] = useState(null); // Almacena los valores para el QR generado
  const [employees, setEmployees] = useState([]); // Lista de empleados que se muestra en el formulario
  const { getAllDevices } = useDevice(); // Llama a la función del contexto para obtener dispositivos
  const [devices, setDevices] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const limit = 10;
  const navigate = useNavigate();


  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const {
    getOneDevice,
    getDeviceForm,
    createDevice,
    updateDevice,
    formData,
    errors: responseErrors,
  } = useDevice();

  // Esta función obtiene la lista de dispositivos cuando se monta el componente.
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const result = await getAllDevices(
          currentPage,
          limit,
          searchTerm,
          stateFilter,
          employeeFilter
        );
        setDevices(result.devices);
        setTotalPages(Math.ceil(result.total / limit)); // Calcular total de páginas para la paginación
        setEmployees(result.employees); // Obtener los empleados asociados
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };
    fetchDevices();
  }, []);

  // Llama a las funciones del contexto para cargar un dispositivo existente o el formulario de un nuevo dispositivo.
  useEffect(() => {
    if (deviceId) getOneDevice(deviceType, deviceId);
    else getDeviceForm(deviceType);
  }, [deviceType, deviceId]); // Añade deviceType a la lista de dependencias


  // Este controlador de formulario se encarga de procesar el envío de los datos.
  const onSubmit = handleSubmit(async (data) => {

    const referencia = data.Referencia;

    // Filtramos el objeto data para que solo contenga los campos relevantes
    const relevantData = Object.keys(data)
      .filter(key => formData.deviceFields.some(field => field.name === key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

    try {
      if (deviceId) {
        updateDevice(deviceType, deviceId, relevantData); // Si el dispositivo existe, actualizar
      } else {
        const deviceCreated = await createDevice(deviceType, relevantData); // Si no, crear un nuevo dispositivo
        setQrValues({ ...deviceCreated.data.data.deviceData, Referencia: referencia }); // Añade la referencia a qrValues
      }
    } finally {
      reset(); // Resetear formulario después de guardar
    }
  });


  // Función que maneja la impresión del código QR
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const qrCode = document.querySelector('.qr-section').children[0].outerHTML;
    const referencia = qrValues.Referencia; // Obtiene la referencia de qrValues
    printWindow.document.write(`
      <html>
        <body>
          ${qrCode}
        <p style="font-size: 32px; font-weight: bold;">${referencia}</p> <!-- Aquí se imprime la referencia -->
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };


  // Si no hay datos de formulario disponibles, se muestra un mensaje de carga
  if (!formData) return <div></div>;

  // Filtrar los campos del formulario que no necesitan ser mostrados
  const filteredFields = formData.deviceFields.filter(
    (field) => field.name !== "Id"
  );
  
  // Función de navegación para volver al menú principal
  const handleNavigateHome = () => {
    window.location.href = '/home'; // Recarga completa de la página
  };

  return (
    <div className="device-form">
      {responseErrors && (
        <div className="error-message">
          <strong>{responseErrors.data}</strong>
        </div>
      )}
      <form onSubmit={onSubmit} className="form">
        <div className="form-fields">
          <div className="column">
            {/* Mapeo de los campos para la primera columna del formulario */}
            {filteredFields.filter((_, index) => index % 2 === 0).map((field) => (
              <div key={field.name} className={`form-field ${errors[field.name] ? 'error' : ''}`}>
                <label className={`form-label ${errors[field.name] ? 'error' : ''}`}>{field.name}</label>
                {errors[field.name] && (
                  <p className="error-text"></p>
                )}
                {/* Lógica de renderizado dependiendo del tipo de campo */}
                {field.name === 'PuestosTrabajo' ? (
                  <select
                    className={`form-input ${errors[field.name] ? 'error' : ''}`}
                    name={field.name}
                    {...register(field.name, { required: true })}
                  >
                    {employees.map((employee) => (
                      <option key={employee.Puesto} value={employee.Puesto}>
                        {employee.Puesto} - {employee.Empleado}
                      </option>
                    ))}
                  </select>
                ) : field.name === 'AñoCompra' ? (
                  <input
                    className={`form-input ${errors[field.name] ? 'error' : ''}`}
                    type="date"
                    name={field.name}
                    {...register(field.name, { required: true })}
                  />
                ) : field.name === 'Estado' ? (
                  <select
                    className={`form-input ${errors[field.name] ? 'error' : ''}`}
                    name={field.name}
                    {...register(field.name, { required: true })}
                  >
                    <option value="En uso">En uso</option>
                    <option value="Disponible">Disponible</option>
                    <option value="No usable">No usable</option>
                    <option value="De baja">De baja</option>
                    <option value="Asignación Temporal">Asignación Temporal</option>
                    <option value="Pendiente actualizar datos">Pendiente actualizar datos</option>
                  </select>
                ) : field.name === 'Pulgadas' ? (
                  <input
                    className={`form-input ${errors[field.name] ? 'error' : ''}`}
                    type="number"
                    step="0.1"
                    name={field.name}
                    {...register(field.name, { pattern: /^\d+(\.\d{1,2})?$/ })}
                  />
                ) : (
                  <input
                    className={`form-input ${errors[field.name] ? 'error' : ''}`}
                    type={field.type}
                    name={field.name}
                    defaultValue={field.value}
                    {...register(field.name, { required: ['Modelo', 'AñoCompra', 'PuestoTrabajo', 'Estado', 'Referencia'].includes(field.name) })}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="column">
            {/* Mapeo para la segunda columna del formulario */}
            {filteredFields.filter((_, index) => index % 2 !== 0).map((field) => (
              <div key={field.name} className={`form-field ${errors[field.name] ? 'error' : ''}`}>
                <label className={`form-label ${errors[field.name] ? 'error' : ''}`}>{field.name}</label>
                {errors[field.name] && (
                  <p className="error-text"></p>
                )}
                {/* Renderizar campos dependiendo del tipo */}
                {field.name === 'PuestosTrabajo' ? (
                  <select
                    className={`form-input ${errors[field.name] ? 'error' : ''}`}
                    name={field.name}
                    {...register(field.name, { required: true })}
                  >
                    {employees.map((employee) => (
                      <option key={employee.Puesto} value={employee.Puesto}>
                        {employee.Puesto} - {employee.Empleado}
                      </option>
                    ))}
                  </select>
                ) : field.name === 'AñoCompra' ? (
                  <input
                    className={`form-input ${errors[field.name] ? 'error' : ''}`}
                    type="date"
                    name={field.name}
                    {...register(field.name, { required: true })}
                  />
                ) : field.name === 'Estado' ? (
                  <select
                    className={`form-input ${errors[field.name] ? 'error' : ''}`}
                    name={field.name}
                    {...register(field.name, { required: true })}
                  >
                    <option value="En uso">En uso</option>
                    <option value="Disponible">Disponible</option>
                    <option value="No usable">No usable</option>
                    <option value="De baja">De baja</option>
                    <option value="Asignación Temporal">Asignación Temporal</option>
                    <option value="Pendiente actualizar datos">Pendiente actualizar datos</option>
                  </select>
                ) : field.name === 'Pulgadas' ? (
                  <input
                    className={`form-input ${errors[field.name] ? 'error' : ''}`}
                    type="number"
                    step="0.1"
                    name={field.name}
                    {...register(field.name, { pattern: /^\d+(\.\d{1,2})?$/ })}
                  />
                ) : (
                  <input
                    className={`form-input ${errors[field.name] ? 'error' : ''}`}
                    type={field.type}
                    name={field.name}
                    defaultValue={field.value}
                    {...register(field.name, { required: ['Modelo', 'AñoCompra', 'PuestoTrabajo', 'Estado', 'Referencia'].includes(field.name) })}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="form-buttons">
          <div className="column">
            <button type="button" className="cancel-button" onClick={handleNavigateHome}>
              Volver al menú
            </button>
          </div>
          <div className="column">
            <button className="submit-button">
              {"Añadir dispositivo"}
            </button>
          </div>
        </div>
      </form>

      {qrValues && (
        <div className="qr-section">
          {/* Muestra el código QR generado */}
          <QRCode
            size={256}
            value={JSON.stringify(qrValues)}
            viewBox={`0 0 256 256`}
          />
          <div className="div-ref">{qrValues.Referencia}</div> {/* Aquí se muestra la referencia */}
          <button onClick={handlePrint} className="print-button"> {/* Botón de impresión del QR */}
            Imprimir QR
          </button>
        </div>
      )}
    </div>
  );
}
