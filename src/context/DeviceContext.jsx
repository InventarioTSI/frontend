/*
Este archivo gestiona el contexto de dispositivos, proporcionando funciones para realizar
operaciones CRUD sobre los dispositivos (crear, leer, actualizar y eliminar). Además,
mantiene el estado de un formulario y gestiona los errores relacionados con las solicitudes.
*/

import { createContext, useContext, useState, useEffect } from "react";
import {
  getAllDevicesRequest,
  getOneDeviceRequest,
  getDeviceFormRequest,
  createDeviceRequest,
  deleteDeviceRequest,
  updateDeviceRequest,
} from "../api/device"; // Funciones para interactuar con la API de dispositivos

// Creamos el contexto de dispositivos, que será utilizado por el DeviceProvider
const DeviceContext = createContext();

// Hook personalizado para acceder al contexto de dispositivos. 
// Este hook garantiza que solo se puede usar dentro del contexto proporcionado.
export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context)
    throw new Error("useDevice must be used within a DeviceProvider");
  return context;
};

// Proveedor de contexto para dispositivos. Envuelve los componentes hijos y proporciona funciones y estados relacionados con dispositivos.
export function DeviceProvider({ children }) {
  // Estado local para almacenar los datos del formulario y los errores de la API
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState(null);
  
  // Función para obtener un dispositivo específico por tipo e id
  const getOneDevice = async (deviceType, deviceId) => {
    try {
      const response = await getOneDeviceRequest(deviceType, deviceId);
      setFormData(response.data.data); // Almacena los datos del dispositivo en el estado
      return response.data.data; // Devuelve los datos del dispositivo
    } catch (error) {
      setErrors(error.response.data); // Maneja errores de la API
    }
  };
  
  // Función para obtener todos los dispositivos, con soporte de paginación y filtros
  const getAllDevices = async (
    page,
    limit,
    searchTerm,
    stateFilter,
    employeeFilter
  ) => {
    try {
      const response = await getAllDevicesRequest(
        page,
        limit,
        searchTerm,
        stateFilter,
        employeeFilter
      );
      return response.data.data;
    } catch (error) {
      setErrors(error.response.data);
    }
  };

  // Función para obtener los datos de un formulario específico para un tipo de dispositivo
  const getDeviceForm = async (deviceType) => {
    try {
      const response = await getDeviceFormRequest(deviceType);
      setFormData(response.data.data);
    } catch (error) {
      setErrors(error.response.data);
    }
  };

  // Función para crear un nuevo dispositivo
  const createDevice = async (deviceType, device) => {
    try {
      const response = await createDeviceRequest(deviceType, device);
    // Si la actualización es exitosa, limpia el estado de errores (si había alguno previo)
    setErrors(null); // Limpiar cualquier error previo
    return response.data; // Retorna los datos de la respuesta
  } catch (error) {
      // Si el error es por permisos denegados (error 403), no lo ponemos en los errores
      if (error.response && error.response.status === 403) {
        alert("Permiso denegado. Contacte con un administrador");
        throw new Error('PERMISSION_DENIED');
      }
      // Si el error es otro, actualizamos el estado de los errores con el mensaje de error
      setErrors(error.response?.data?.message || 'Hubo un error al crear el dispositivo');
      throw error;  // Vuelve a lanzar el error para que el frontend lo pueda manejar si es necesario
    }
  };

  // Función para actualizar un dispositivo existente
  const updateDevice = async (deviceType, deviceId, device) => {
    try {
      const response = await updateDeviceRequest(deviceType, deviceId, device);
    // Si la actualización es exitosa, limpia el estado de errores (si había alguno previo)
    setErrors(null); // Limpiar cualquier error previo
    return response.data; // Retorna los datos de la respuesta
  } catch (error) {
      // Si el error es por permisos denegados (error 403), no lo ponemos en los errores
      if (error.response && error.response.status === 403) {
        alert("Permiso denegado. Contacte con un administrador");
        throw new Error('PERMISSION_DENIED');
      }
      // Si el error es otro, actualizamos el estado de los errores con el mensaje de error
      setErrors(error.response?.data?.message || 'Hubo un error al actualizar el dispositivo');
      throw error;  // Vuelve a lanzar el error para que el frontend lo pueda manejar si es necesario
    }
  };

  // Función para eliminar un dispositivo
  const deleteDevice = async (deviceType, deviceId) => {
    try {
      await deleteDeviceRequest(deviceType, deviceId);
    // Si la actualización es exitosa, limpia el estado de errores (si había alguno previo)
    setErrors(null); // Limpiar cualquier error previo
  } catch (error) {
      // Si el error es por permisos denegados (error 403), no lo ponemos en los errores
      if (error.response && error.response.status === 403) {
        alert("Permiso denegado. Contacte con un administrador");
        throw new Error('PERMISSION_DENIED');
      }
      // Si el error es otro, actualizamos el estado de los errores con el mensaje de error
      setErrors(error.response?.data?.message || 'Hubo un error al eliminar el dispositivo');
      throw error;  // Vuelve a lanzar el error para que el frontend lo pueda manejar si es necesario
    }
  };

  // Efecto para limpiar los errores después de 5 segundos de haber sido establecidos
  useEffect(() => {
    if (errors) {
      const timer = setTimeout(() => {
        setErrors(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  // El proveedor de contexto expone las funciones y los datos del estado para ser utilizados en los componentes hijos.
  return (
    <DeviceContext.Provider
      value={{
        formData,
        getAllDevices,
        getOneDevice,
        getDeviceForm,
        createDevice,
        updateDevice,
        deleteDevice,
        errors,
      }}
    >
      {children} {/* Los componentes hijos podrán acceder al contexto */}
    </DeviceContext.Provider>
  );
}
