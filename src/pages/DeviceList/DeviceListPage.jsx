import Pagination from "../../components/Pagination/Pagination";
import Template from "../../components/Template";
import { useDevice } from "../../context/DeviceContext";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./DeviceListPage.css";
import { PDFDownloadLink } from "@react-pdf/renderer";
import axios from "axios";

function DeviceListPage() {
  const { getAllDevices, errors } = useDevice();
  const [devices, setDevices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDevices, setTotalDevices] = useState(0); // Total de dispositivos
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const templateRef = useRef();
  const [limit, setLimit] = useState(10);
  const navigate = useNavigate();

  const cancelTokenSource = useRef(null);

  useEffect(() => {
    const fetchDevices = async () => {
      if (cancelTokenSource.current) {
        cancelTokenSource.current.cancel("Canceling previous request");
      }
      cancelTokenSource.current = axios.CancelToken.source();

      try {
        const result = await getAllDevices(
          currentPage,
          limit,
          searchTerm.trim(),
          stateFilter,
          employeeFilter,
          cancelTokenSource.current.token
        );

        // Actualizar los estados con los datos recibidos
        setDevices(result.devices);
        setEmployees(result.employees);
        setTotalDevices(result.total); // Total de dispositivos desde la API
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
  }, [currentPage, limit, searchTerm, stateFilter, employeeFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const findEmployee = (puestoTrabajo) => {
    return employees.find((employee) => employee.Puesto === puestoTrabajo);
  };

  const totalPages = Math.ceil(totalDevices / limit); // Total de páginas basado en el total de dispositivos

  if (errors) return <div>{errors.data}</div>;

  return (
    <div className="div-list">
      <h1 className="titulo">Dispositivos</h1>

      <div className="div-filtros">
        <div className="div-filtro-dispositivo">
          <label className="label-filtro">Buscador</label>
          <input
            type="text"
            placeholder="Tipo/Código/Observaciones"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="div-filtro-empleado">
          <label className="label-filtro">Empleados</label>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="">Todos</option>
            {employees
              .sort((a, b) => a.Empleado.localeCompare(b.Empleado))
              .map((employee) => (
                <option key={employee.Id} value={employee.Puesto}>
                  {employee.Empleado} - {employee.Puesto}
                </option>
              ))}
          </select>
        </div>

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

      <div className="div-filtros">
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

      {devices.length > 0 ? (
        <table className="table-dispositivos">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Código</th>
              <th>Factura</th>
              <th>Modelo</th>
              <th>Número de serie</th>
              <th>Año de compra</th>
              <th>Puesto de trabajo</th>
              <th>Observaciones</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => {
              let employee = findEmployee(device.PuestosTrabajo);

              return (
                <tr key={`${device.Id}-${device.Tipo}`}>
                  <td>{device.Tipo}</td>
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
                  <td>{device.NumSerie || "N/A"}</td>
                  <td>{device.AñoCompra}</td>
                  <td>
                    {employee
                      ? `${employee.Puesto} - ${employee.Empleado || ""}`
                      : ""}
                  </td>
                  <td>{device.Observaciones}</td>
                  <td>{device.Estado}</td>
                  <td>
                    <a
                      onClick={() =>
                        navigate(`/DeviceInfo/${device.Tipo}/${device.Id}`, {
                          state: { timestamp: Date.now() },
                        })
                      }
                      className="boton-ver"
                    >
                      Ver
                    </a>
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
        <Pagination
          currentPage={currentPage}
          totalItems={totalDevices}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
          hasMoreData={currentPage < totalPages}
        />
      </div>

      <Link to="/home">
        <div className="div-boton-cancelar">
          <button className="boton-cancelar">Volver al menú</button>
        </div>
      </Link>

      {employeeFilter && (
        <div className="div-boton-descarga">
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
      )}
    </div>
  );
}

export default DeviceListPage;
