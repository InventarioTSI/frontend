import Pagination from "../../components/Pagination/Pagination";
import Template from "../../components/Template";
import { useDevice } from "../../context/DeviceContext";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importamos useNavigate
import "./DeviceListPage.css";
import { PDFDownloadLink } from "@react-pdf/renderer";
import axios from "axios"; // Importamos axios para manejar cancelación de solicitudes

function DeviceListPage() {
  const { getAllDevices, errors } = useDevice();
  const [devices, setDevices] = useState([]); // Estado para almacenar los dispositivos obtenidos
  const [employees, setEmployees] = useState([]); // Estado para almacenar los empleados asociados
  const [currentPage, setCurrentPage] = useState(1); // Página actual para la paginación
  const [totalPages, setTotalPages] = useState(""); // Total de páginas para la paginación
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda para filtrar dispositivos
  const [stateFilter, setStateFilter] = useState(""); // Filtro por estado de los dispositivos
  const [employeeFilter, setEmployeeFilter] = useState(""); // Filtro por empleado
  const templateRef = useRef();
  const [limit, setLimit] = useState(10); // Valor inicial: 10 dispositivos por página
  const navigate = useNavigate(); // Creamos una instancia de useNavigate

  // CancelToken para manejar solicitudes concurrentes
  const cancelTokenSource = useRef(null);

  useEffect(() => {
    const fetchDevices = async () => {
      if (cancelTokenSource.current) {
        cancelTokenSource.current.cancel("Canceling previous request");
      }
      cancelTokenSource.current = axios.CancelToken.source();

      try {
        // Llamar a getAllDevices con los filtros y la paginación
        const result = await getAllDevices(
          currentPage,
          limit,
          searchTerm.trim(), // Asegurarse de no enviar espacios extra
          stateFilter,
          employeeFilter,
          cancelTokenSource.current.token // Pasamos el token de cancelación
        );

        // Actualizar los estados con los datos recibidos
        setDevices(result.devices);
        setEmployees(result.employees);

        // Calcular el número total de páginas
        setTotalPages(result.total ? Math.ceil(result.total / limit) : 1);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
        } else {
          console.error("Error fetching devices:", error);
        }
      }
    };

    fetchDevices();

    return () => {
      if (cancelTokenSource.current) {
        cancelTokenSource.current.cancel("Component unmounted");
      }
    };
  }, [currentPage, limit, searchTerm, stateFilter, employeeFilter]); // Cuando cambian los filtros, se vuelve a cargar

  const handlePageChange = (page) => {
    setCurrentPage(page); // Cambia la página actual
  };

  const findEmployee = (puestoTrabajo) => {
    return employees.find((employee) => employee.Puesto === puestoTrabajo);
  };
  useEffect(() => {
    // Resetear a la primera página si cambia cualquier filtro
    setCurrentPage(1);
  }, [limit, searchTerm, stateFilter, employeeFilter]);

  if (errors) return <div>{errors.data}</div>;

  return (
    <div className="div-list">
      <h1 className="titulo">Dispositivos</h1>

      <div className="div-filtros">
        {/* Filtro de búsqueda */}
        <div className="div-filtro-dispositivo">
          <label className="label-filtro">Buscador</label>
          <input
            type="text"
            placeholder="Tipo/Código/Observaciones"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtro por empleado */}
        <div className="div-filtro-empleado">
          <label className="label-filtro">Empleados</label>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="">Todos</option>
            {employees
              .sort((a, b) => a.Empleado.localeCompare(b.Empleado)) // Ordenar alfabéticamente por nombre
              .map((employee) => (
                <option key={employee.Id} value={employee.Puesto}>
                  {employee.Empleado} - {employee.Puesto}
                </option>
              ))}
          </select>
        </div>

        {/* Filtro por estado */}
        <div className="div-filtro-estado">
          <label className="label-filtro">Estado</label>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="En uso">En uso</option>
            <option value="Disponible">Disponible</option>
            <option value="No usable">No usable</option>
            <option value="De Baja">De Baja</option>
            <option value="Asignación temporal">Asignación temporal</option>
            <option value="Pendiente actualizar datos">
              Pendiente actualizar datos
            </option>
          </select>
        </div>
      </div>
      {/* Filtro por cantidad de dispositivos por página */}
      <div className="div-filtros">
        {/* Selector para dispositivos por página */}
        <div className="div-filtro-limite">
          <label className="label-filtro">Dispositivos por página</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>


      {/* Renderizado de la tabla */}
      {devices.length > 0 ? (
        <table className="table-dispositivos">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Código</th>
              <th>Factura</th>
              <th>Modelo</th>
              <th>Año de compra</th>
              <th>Puesto de trabajo</th>
              <th>Observaciones</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => {
              let deviceType = device.Tipo;
              let deviceId = device.Id;
              let employee = findEmployee(device.PuestosTrabajo);

              return (
                <tr key={`${device.Id}-${device.Tipo}`}>
                  <td>{deviceType}</td>
                  <td>{device.Referencia}</td>
                  <td>
                    <a
                      href={`./facturas/${device.Factura}.pdf`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {device.Factura}
                    </a>
                  </td>
                  <td>{device.Modelo}</td>
                  <td>{device.AñoCompra}</td>
                  <td>
                    {employee
                      ? `${employee.Puesto} - ${employee.Empleado || ""}`
                      : ""}
                  </td>
                  <td>{device.Observaciones}</td>
                  <td>{device.Estado}</td>
                  <td>
                    {/* Cambiado para usar navigate */}
                    <a
                      onClick={() => {
                        // Forzar recarga pasando un estado único
                        navigate(`/DeviceInfo/${deviceType}/${deviceId}`, {
                          state: { timestamp: Date.now() } // Esto fuerza una recarga
                        });
                      }}
                      className="boton-ver"
                    >
                      Ver
                    </a>
                    {/* Fin del cambio */}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="no-data">No hay datos disponibles</p>
      )}


      <div className="div-list">

        {/* Renderizado de la tabla y paginación */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Botón para volver */}
      <Link to="/home">
        <button className="boton-cancelar">Volver al menú</button>
      </Link>

      {/* Descargar informe */}
      {employeeFilter && (
        <div className="">
          <div>
            <PDFDownloadLink
              document={
                <Template
                  ref={templateRef}
                  employee={employeeFilter}
                  date={new Date().toLocaleDateString()}
                  devices={devices}
                />
              }
              fileName="Documento_entrega_instrumentos.pdf"
            >
              {({ blob, url, loading, error }) =>
                loading ? (
                  "Cargando documento..."
                ) : (
                  <button className="boton-descarga">Descargar informe</button>
                )
              }
            </PDFDownloadLink>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeviceListPage;