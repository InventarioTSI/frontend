import { Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import LectorQRPage from "./pages/QrReader/LectorQRPage";
import LoginPage from "./pages/Login/LoginPage";
import ProtectedRoutes from "./components/ProtectedRoutes";
import DeviceListPage from "./pages/DeviceList/DeviceListPage";
import { DeviceProvider } from "./context/DeviceContext";
import Home from "./pages/Home/Home";
import Header from "./pages/Home/Header/Header";
import AddDevice from "./pages/AddDevice/AddDevice";
import DeviceInfo from "./pages/DeviceInfo/DeviceInfo";
import Personal from "./pages/Personal/Personal";
import ManageUsers from "./pages/ManageUsers/ManageUsers";
import UserProfile from "./pages/UserProfile/UserProfile"; // Importar el componente actualizado

export default function App() {
  return (
    <AuthProvider>
      <DeviceProvider>
        <Header />
        <Routes>
          <Route element={<ProtectedRoutes />}>
            <Route path="/home" element={<Home />} />
            <Route path="/AddDevice" element={<AddDevice />} />
            <Route path="/QrReader" element={<LectorQRPage />} />
            <Route
              path="/DeviceInfo/:deviceType/:deviceId"
              element={<DeviceInfo />}
            />
            <Route path="/DeviceList" element={<DeviceListPage />} />
            <Route path="/Personal" element={<Personal />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/perfil" element={<UserProfile />} />{" "}
            {/* Ruta actualizada */}
          </Route>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </DeviceProvider>
    </AuthProvider>
  );
}
