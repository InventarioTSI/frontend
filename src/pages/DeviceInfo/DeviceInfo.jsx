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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [selectedValue, setSelectedValue] = useState();
  const [initialFormValues, setInitialFormValues] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deviceHistoric, setDeviceHistoric] = useState([]);

  const { user } = useAuth();

  const {
    register: registerHistoric,
    handleSubmit: handleSubmitHistoric,
    formState: { errors: errorsHistoric },
    reset: resetHistoric,
  } = useForm();


  const limit = 10;

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm();


  const {
    getOneDevice,
    updateDevice,
    deleteDevice,
    formData,
    errors: responseErrors,
    getAllDevices
  } = useDevice();

  const [employees, setEmployees] = useState([]);
  const [initialData, setInitialData] = useState(formData);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistoric = async () => {
      try {
        const result = await getDeviceHistoricRequest(deviceId);
        setDeviceHistoric(result.data.data); // Carga el historial del dispositivo
      } catch (error) {
        console.error("Error fetching historic:", error);
      }
    };
    fetchHistoric();
  }, []); // Este efecto solo se ejecuta una vez al cargar el componente


  useEffect(() => {
    // Actualiza el estado inicial cuando cambia formData
    setInitialData(formData);
  }, [formData]); // Dependencia en formData, se ejecuta cada vez que cambia

  useEffect(() => {
    if (deviceId) {
      getOneDevice(deviceType, deviceId).then(data => {
        setInitialFormValues(data); // Establece los valores iniciales del formulario
      });
    }
  }, [deviceType, deviceId]);


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
        setEmployees(result.employees); // Actualiza la lista de empleados del dispositivo
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };
    fetchDevices();
  }, []); // Este efecto se ejecuta una vez al cargar el componente

  // Efecto para establecer el valor seleccionado de 'PuestosTrabajo' cuando se obtiene formData y empleados
  useEffect(() => {
    if (employees.length > 0 && formData) {
      const puestoTrabajoField = formData.deviceFields.find(field => field.name === 'PuestosTrabajo');
      if (puestoTrabajoField) {
        setSelectedValue(puestoTrabajoField.value);
      }
    }
  }, [employees, formData]);

  // Efecto para establecer el valor por defecto
  useEffect(() => {
    // Efecto para establecer el valor por defecto en el formulario
    if (employees.length > 0 && formData) {
      const puestoTrabajoField = formData.deviceFields.find(field => field.name === 'PuestosTrabajo');
      if (puestoTrabajoField) {
        // Usa setValue para establecer el valor de PuestosTrabajo en el estado del formulario
        setValue('PuestosTrabajo', puestoTrabajoField.value);
      }
    }
  }, [employees, formData]);


  if (!formData) return <div>Loading...</div>; // Mientras se carga el formData, muestra un cargando

  const filteredFields = formData.deviceFields.filter(
    (field) => field.name !== "Id" // Excluye el campo 'Id' al mostrar los campos del dispositivo
  );


  const formatDate = (dateString) => {
    const date = new Date(dateString);


    // Obtener día, mes y año
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // Los meses van de 0 a 11
    const year = date.getUTCFullYear();


    // Formatear la fecha en dd/MM/yyyy
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
    console.log(historic);
    try {
      await createHistoricRequest(historic); // Crea una nueva entrada en el historial
      alert("¡Historial creado con éxito!");
      setIsModalOpen(false); // Cierra el modal después de agregar el historial
    } finally {
      resetHistoric(); // Resetea los campos del formulario después de enviar
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

    // Obtiene los valores actuales del formulario
    const currentValues = getValues();

    // Filtramos el objeto data para que solo contenga los campos relevantes
    const relevantData = Object.keys(currentValues)
      .filter(key => formData.deviceFields.some(field => field.name === key))
      .reduce((obj, key) => {
        obj[key] = currentValues[key];
        return obj;
      }, {});

    // Convierte todos los valores de `relevantData` a cadenas
    const relevantDataStr = Object.keys(relevantData).reduce((obj, key) => {
      obj[key] = String(relevantData[key]);
      return obj;
    }, {});

    // Transforma los datos iniciales en un objeto plano y convierte todos los valores a cadenas
    const initialDataFlat = initialData.deviceFields.reduce((obj, field) => {
      obj[field.name] = String(field.value);
      return obj;
    }, {});

    delete initialDataFlat['Id'];


    // Ordena las propiedades de los objetos
    const sortedRelevantDataStr = sortObject(relevantDataStr);
    const sortedInitialDataFlat = sortObject(initialDataFlat);

    // Compara el estado inicial con el estado actual
    if (JSON.stringify(sortedRelevantDataStr) === JSON.stringify(sortedInitialDataFlat)) {
      // Si no hay cambios, muestra un mensaje y no envíes el formulario
      alert('No se han realizado cambios.');
      return;
    }

    try {
      if (deviceId) {
        await updateDevice(deviceType, deviceId, relevantData);
        // Si la actualización fue exitosa, muestra un pop-up con el mensaje de éxito
        alert("¡Dispositivo actualizado con éxito!");
        props.onRefresh(); // Forzar el remontaje de DeviceInfo
      }
    } finally {
      reset();
    }
  });

  // Función para manejar el clic en el botón de eliminar
  const handleDelete = async (event) => {
    event.preventDefault(); // Evita que se envíe el formulario
    if (window.confirm('¿Estás seguro de que quieres eliminar este dispositivo?')) {
      await deleteDevice(deviceType, deviceId);
      navigate('/home'); // Navega a la página de inicio después de eliminar el dispositivo
    }
  };
  const handleNavigateHome = () => {
    window.location.href = '/#/home'; // Recarga completa de la página
  };
  return (
    <div className="device-form">
      {responseErrors && (
        <div className="error-message">
          <strong>{responseErrors.data}</strong>
        </div>
      )}
      <div className="titulo-device">Tipo de Dispositivo: {deviceType}</div>
      <form onSubmit={handleUpdate} className="form" >
        <div className="form-fields">
          <div className="column">
            {filteredFields.filter((_, index) => index % 2 === 0).map((field) => (
              <div key={field.name} className={`row ${errors[field.name] ? 'error' : ''}`}>
                <div className="cell">
                  <label className={`form-label ${errors[field.name] ? 'error' : ''}`}>{field.name}</label>
                </div>
                <div className="cell">
                  {errors[field.name] && (
                    <p className="error-text">Este campo es requerido</p>
                  )}
                  {field.name === 'PuestosTrabajo' ? (
                    <select
                      className={`form-input ${errors[field.name] ? 'error' : ''}`}
                      name={field.name}
                      {...register(field.name)}
                      value={selectedValue} // Usa el valor seleccionado
                      onChange={e => {
                        setValue(field.name, e.target.value); // Actualiza el valor del campo en el estado del formulario
                        setSelectedValue(e.target.value); // Actualiza el valor seleccionado
                      }}
                    >
                      {employees.map((employee) => {
                        return (
                          <option key={employee.Puesto} value={employee.Puesto}>
                            {employee.Puesto} - {employee.Empleado}
                          </option>
                        );
                      })}
                    </select>
                  ) : field.name === 'AñoCompra' ? (
                    <input
                      className={`form-input ${errors[field.name] ? 'error' : ''}`}
                      type="date"
                      name={field.name}
                      value={field.value}
                      {...register(field.name, { required: true })}
                    />
                  ) : field.name === 'Estado' ? (
                    <select
                      className={`form-input ${errors[field.name] ? 'error' : ''}`}
                      defaultValue={field.value}
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
                      defaultValue={field.value}
                      {...register(field.name, { pattern: /^\d+(\.\d{1,2})?$/ })}
                    />
                  ) : (
                    <input
                      className={`form-input ${errors[field.name] ? 'error' : ''}`}
                      type={field.type}
                      name={field.name}
                      defaultValue={field.value}
                      {...register(field.name, { required: ['AñoCompra', 'PuestoTrabajo', 'Estado', 'Referencia'].includes(field.name) })}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="column">
            {filteredFields.filter((_, index) => index % 2 !== 0).map((field) => (
              <div key={field.name} className={`row ${errors[field.name] ? 'error' : ''}`}>
                <div className="cell">
                  <label className={`form-label ${errors[field.name] ? 'error' : ''}`}>{field.name}</label>
                </div>
                <div className="cell">
                  {errors[field.name] && (
                    <p className="error-text">Este campo es requerido</p>
                  )}
                  {field.name === 'PuestosTrabajo' ? (
                    <select
                      className={`form-input ${errors[field.name] ? 'error' : ''}`}
                      name={field.name}
                      {...register(field.name)}
                      value={selectedValue} // Usa el valor seleccionado
                      onChange={e => {
                        setValue(field.name, e.target.value); // Actualiza el valor del campo en el estado del formulario
                        setSelectedValue(e.target.value); // Actualiza el valor seleccionado
                      }}
                    >
                      {employees.map((employee) => {
                        return (
                          <option key={employee.Puesto} value={employee.Puesto}>
                            {employee.Puesto} - {employee.Empleado}
                          </option>
                        );
                      })}
                    </select>
                  ) : field.name === 'AñoCompra' ? (
                    <input
                      className={`form-input ${errors[field.name] ? 'error' : ''}`}
                      type="date"
                      name={field.name}
                      value={field.value}
                      {...register(field.name, { required: true })}
                    />
                  ) : field.name === 'Estado' ? (
                    <select
                      className={`form-input ${errors[field.name] ? 'error' : ''}`}
                      name={field.name}
                      defaultValue={field.value}
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
                      defaultValue={field.value}
                      {...register(field.name, { required: true, pattern: /^\d+(\.\d{1,2})?$/ })}
                    />
                  ) : (
                    <input
                      className={`form-input ${errors[field.name] ? 'error' : ''}`}
                      type={field.type}
                      name={field.name}
                      defaultValue={field.value}
                      {...register(field.name, { required: ['AñoCompra', 'PuestoTrabajo', 'Estado', 'Referencia'].includes(field.name) })}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="form-buttons">
          <button type="button" className="cancel-button" onClick={handleNavigateHome}>
            Volver al menú
          </button>
          <button className="submit-button">
            Actualizar
          </button>
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
              <input className={`input-historico ${errorsHistoric.Observacion ? 'error' : ''}`} {...registerHistoric('Observacion', { required: true })} />
            </label>
            <label className="label-historico">
              Usuario asignado
              <input className={`input-historico ${errorsHistoric.UsuarioAsignado ? 'error' : ''}`} {...registerHistoric('UsuarioAsignado')} />
            </label>
            <label className="label-historico">
              Tipo
              <select className="input-historico "{...registerHistoric('Tipo')}>
                <option value="Incidencia">Incidencia</option>
                <option value="Asignación">Asignación</option>
                <option value="Actualización">Actualización</option>
              </select>
            </label>
            <button className="cerrar-historico" type="button" onClick={() => setIsModalOpen(false)}>
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
                  <tr key={deviceId}>
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
//props.onRefresh(); // Forzar el remontaje de DeviceInfo
//(window.location.href = `/DeviceInfo/${deviceType}/${deviceId}`)//RG added
export default DeviceInfo;
