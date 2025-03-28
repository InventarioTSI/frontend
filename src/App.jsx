/*
Este archivo contiene las rutas principales de la aplicación, y maneja la lógica de autenticación
y provisión de dispositivos a través de contextos. La estructura de rutas está protegida por el componente 
`ProtectedRoutes` que asegura que las páginas solo sean accesibles para usuarios autenticados.

*/

import { Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import LectorQRPage from "./pages/QrReader/LectorQRPage";
import LoginPage from "./pages/Login/LoginPage";
import ProtectedRoutes from "./components/ProtectedRoutes";
import DeviceListPage from "./pages/DeviceList/DeviceListPage";
import { DeviceProvider } from "./context/DeviceContext";
import Home from "./pages/Home/Home";
import Header from "./pages/Home/Header/Header"
import AddDevice from "./pages/AddDevice/AddDevice";
import DeviceInfo from "./pages/DeviceInfo/DeviceInfo";
import Personal from "./pages/Personal/Personal";
import ManageUsers from "./pages/ManageUsers/ManageUsers";
import AddUsers from "./pages/ManageUsers/AddUsers/AddUsers";

export default function App() {


  return (
    /*
    AuthProvider y DeviceProvider son los contextos principales que gestionan el estado
    de autenticación y dispositivos a lo largo de la aplicación. Se deben envolver
    alrededor de la aplicación para que cualquier componente pueda acceder a estos datos.
    */
    <AuthProvider>
      <DeviceProvider>
      <Header/>
        <Routes> {/* Las rutas dentro de ProtectedRoutes solo serán accesibles para usuarios autenticados */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/home" element={<Home />} />
            <Route path="/AddDevice" element={<AddDevice />} />
            <Route path="/QrReader" element={<LectorQRPage />} />
            <Route path="/DeviceInfo/:deviceType/:deviceId" element={<DeviceInfo/>} />
            <Route path="/DeviceList" element={<DeviceListPage />} />
            <Route path="/Personal" element={<Personal />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/users/add" element={<AddUsers />} />
          </Route>
          <Route path="*" element={<LoginPage />} /> {/* Si el usuario no está autenticado, será redirigido a la página de login */}
        </Routes>
      </DeviceProvider>
    </AuthProvider>
  );
}
