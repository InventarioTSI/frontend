import React, { useState, useEffect } from 'react'; // Importa React y hooks para manejar estado y efectos secundarios
import { useNavigate } from 'react-router-dom'; // Hook para redirigir a otras rutas
import axios from 'axios'; // Librería para realizar solicitudes HTTP
import './AddUsers.css'; // Importa los estilos específicos para este componente

const AddUsers = () => {
    // Estado para manejar los datos del formulario
    const [formData, setFormData] = useState({
        userName: '', // Nombre de usuario
        role: '', // Rol del usuario
        password: '', // Contraseña del usuario
    });

    // Estado para manejar errores
    const [error, setError] = useState(null);

    // Hook para redirigir a otras rutas
    const navigate = useNavigate();

    // useEffect para verificar si el usuario actual es administrador
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const token = localStorage.getItem('token'); // Obtiene el token almacenado en localStorage
                const response = await axios.get('http://localhost:3000/api/users/auth/check-admin', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Incluye el token en los encabezados de la solicitud
                    },
                });
                if (!response.data.isAdmin) {
                    navigate('/home'); // Redirige al home si el usuario no es administrador
                }
            } catch (err) {
                console.error('Error al verificar permisos de administrador:', err.response || err); // Muestra el error en la consola
                navigate('/home'); // Redirige al home si ocurre un error
            }
        };

        checkAdmin(); // Llama a la función para verificar permisos
    }, [navigate]); // Se ejecuta cuando cambia la función navigate

    // Maneja los cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target; // Obtiene el nombre y valor del campo que cambió
        setFormData({ ...formData, [name]: value }); // Actualiza el estado con el nuevo valor
    };

    // Maneja el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario
        console.log(formData); // Muestra los datos del formulario en la consola
        try {
            const token = localStorage.getItem('token'); // Obtiene el token del localStorage
            await axios.post(
                'http://localhost:3000/api/users', // URL de la API para añadir usuarios
                formData, // Datos del formulario
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                    },
                }
            );
            alert('Usuario añadido correctamente'); // Muestra un mensaje de éxito
            navigate('/admin/users'); // Redirige a la lista de usuarios
        } catch (err) {
            setError('Error al añadir el usuario'); // Muestra un mensaje de error
        }
    };

    return (
        <div className="add-users">
            <h1 className="titulo">Añadir Nuevo Usuario</h1>
            <form className="add-user-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="userName">Nombre de Usuario:</label>
                    <input
                        type="text"
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="role">Rol:</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione un rol</option>
                        <option value="Admin">Administrador</option>
                        <option value="Lectura">Lector</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="submit-button">Añadir Usuario</button>
                <button type="button" className="cancel-button" onClick={() => navigate('/admin/users')}>
                    Cancelar
                </button>
            </form>
        </div>
    );
};

export default AddUsers;