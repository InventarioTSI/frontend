import React, { useEffect, useState } from 'react'; // Importa React y hooks para manejar estado y efectos secundarios
import { Link, useNavigate } from 'react-router-dom'; // Importa Link para navegación y useNavigate para redirecciones
import axios from 'axios'; // Librería para realizar solicitudes HTTP
import './ManageUsers.css'; // Importa los estilos específicos para este componente

const ManageUsers = () => {
    const [users, setUsers] = useState([]); // Estado para almacenar la lista de usuarios
    const [loading, setLoading] = useState(true); // Estado para manejar la carga de datos
    const [error, setError] = useState(null); // Estado para manejar errores en la carga de datos
    const [selectedUser, setSelectedUser] = useState(null); // Estado para almacenar el usuario seleccionado para editar
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Estado para manejar la visibilidad del diálogo de edición
    const navigate = useNavigate(); // Hook para redirigir a otras rutas

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

    // useEffect para obtener la lista de usuarios desde el backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/users'); // Realiza una solicitud GET para obtener los usuarios
                setUsers(response.data); // Guarda los usuarios obtenidos en el estado
                setLoading(false); // Desactiva el estado de carga
            } catch (err) {
                setError('Error al cargar los usuarios'); // Establece un mensaje de error
                setLoading(false); // Desactiva el estado de carga
            }
        };

        fetchUsers(); // Llama a la función para obtener los usuarios
    }, []); // Se ejecuta una vez al montar el componente

    // Maneja la acción de editar un usuario
    const handleEdit = (userId) => {
        const user = users.find((u) => u.id === userId); // Busca el usuario por su ID
        setSelectedUser(user); // Establece el usuario seleccionado en el estado
        setIsDialogOpen(true); // Abre el diálogo de edición
    };

    // Cierra el diálogo de edición
    const handleDialogClose = () => {
        setIsDialogOpen(false); // Cierra el diálogo
        setSelectedUser(null); // Limpia el usuario seleccionado
    };

    // Maneja el envío del formulario de edición
    const handleDialogSubmit = async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario
        try {
            const token = localStorage.getItem('token'); // Obtiene el token almacenado en localStorage
            await axios.put(`http://localhost:3000/api/users/${selectedUser.id}`, selectedUser, {
                headers: {
                    Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                },
            });
            setUsers(users.map((user) => (user.id === selectedUser.id ? selectedUser : user))); // Actualiza el usuario en el estado
            alert('Usuario actualizado correctamente'); // Muestra un mensaje de éxito
            handleDialogClose(); // Cierra el diálogo
        } catch (err) {
            console.error('Error al actualizar el usuario:', err.response || err); // Muestra el error en la consola
            alert('Error al actualizar el usuario'); // Muestra un mensaje de error
        }
    };

    // Maneja los cambios en los campos del formulario de edición
    const handleInputChange = (e) => {
        const { name, value } = e.target; // Obtiene el nombre y valor del campo que cambió
        setSelectedUser({ ...selectedUser, [name]: value }); // Actualiza el estado del usuario seleccionado
    };

    // Maneja la acción de eliminar un usuario
    const handleDelete = async (userId) => {
        const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este usuario?'); // Solicita confirmación al usuario
        if (confirmDelete) {
            try {
                const token = localStorage.getItem('token'); // Obtiene el token almacenado en localStorage
                await axios.delete(`http://localhost:3000/api/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                    },
                });
                setUsers(users.filter((user) => user.id !== userId)); // Elimina el usuario del estado
                alert('Usuario eliminado correctamente'); // Muestra un mensaje de éxito
            } catch (err) {
                console.error('Error al eliminar el usuario:', err.response || err); // Muestra el error en la consola
                alert('Error al eliminar el usuario'); // Muestra un mensaje de error
            }
        }
    };

    if (loading) {
        return <p>Cargando usuarios...</p>; // Muestra un mensaje mientras se cargan los datos
    }

    if (error) {
        return <p>{error}</p>; // Muestra un mensaje de error si ocurre un problema
    }

    return (
        <div className="manage-users">
            <h1 className='titulo'>Administrar Usuarios</h1>
            <button className="add-user-button" onClick={() => navigate('/admin/users/add')}>
                Añadir Nuevo Usuario
            </button>
            <table className="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.userName}</td>
                            <td>{user.role}</td>
                            <td>
                                <button className="edit-button" onClick={() => handleEdit(user.id)}>
                                    Editar
                                </button>
                                <button className="delete-button" onClick={() => handleDelete(user.id)}>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Link to="/home">
                <button className="boton-cancelar">Volver al menú</button>
            </Link>

            {/* Diálogo para editar usuario */}
            {isDialogOpen && selectedUser && (
                <div className="dialog-overlay">
                    <div className="dialog">
                        <h1 className='titulo'>Editar Usuario</h1>
                        <form onSubmit={handleDialogSubmit}>
                            <div className="form-group">
                                <label htmlFor="userName">Nombre de Usuario:</label>
                                <input
                                    type="text"
                                    id="userName"
                                    name="userName"
                                    value={selectedUser.userName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="role">Rol:</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={selectedUser.role}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="Admin">Administrador</option>
                                    <option value="Lectura">Lector</option>
                                </select>
                            </div>
                            <div className="dialog-buttons">
                                <button type="submit" className="submit-button">Guardar Cambios</button>
                                <button type="button" className="cancel-button" onClick={handleDialogClose}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;