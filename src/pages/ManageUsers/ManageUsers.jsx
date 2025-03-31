import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ManageUsers.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]); // Estado para almacenar los usuarios
    const [loading, setLoading] = useState(true); // Estado para manejar la carga
    const [error, setError] = useState(null); // Estado para manejar errores
    const [selectedUser, setSelectedUser] = useState(null); // Usuario seleccionado para editar
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Estado para manejar el diálogo
    const navigate = useNavigate(); // Hook para redirigir

    // Verificar si el usuario es administrador
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/api/users/auth/check-admin', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.data.isAdmin) {
                    navigate('/home'); // Redirige si no es administrador
                }
            } catch (err) {
                console.error('Error al verificar permisos de administrador:', err.response || err);
                navigate('/home'); // Redirige si hay un error
            }
        };

        checkAdmin();
    }, [navigate]);

    // Función para obtener los usuarios desde el backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/users'); // Cambia la URL si es necesario
                setUsers(response.data); // Guarda los usuarios en el estado
                setLoading(false); // Desactiva el estado de carga
            } catch (err) {
                setError('Error al cargar los usuarios');
                setLoading(false); // Desactiva el estado de carga
            }
        };

        fetchUsers();
    }, []);

    const handleEdit = (userId) => {
        const user = users.find((u) => u.id === userId);
        setSelectedUser(user); // Establece el usuario seleccionado
        setIsDialogOpen(true); // Abre el diálogo
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false); // Cierra el diálogo
        setSelectedUser(null); // Limpia el usuario seleccionado
    };

    const handleDialogSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/api/users/${selectedUser.id}`, selectedUser, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(users.map((user) => (user.id === selectedUser.id ? selectedUser : user))); // Actualiza el usuario en el estado
            alert('Usuario actualizado correctamente');
            handleDialogClose(); // Cierra el diálogo
        } catch (err) {
            console.error('Error al actualizar el usuario:', err.response || err);
            alert('Error al actualizar el usuario');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedUser({ ...selectedUser, [name]: value });
    };

    const handleDelete = async (userId) => {
        const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este usuario?');
        if (confirmDelete) {
            try {
                const token = localStorage.getItem('token'); // Obtén el token del localStorage
                await axios.delete(`http://localhost:3000/api/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                    },
                });
                setUsers(users.filter((user) => user.id !== userId)); // Elimina el usuario del estado
                alert('Usuario eliminado correctamente');
            } catch (err) {
                console.error('Error al eliminar el usuario:', err.response || err);
                alert('Error al eliminar el usuario');
            }
        }
    };

    if (loading) {
        return <p>Cargando usuarios...</p>;
    }

    if (error) {
        return <p>{error}</p>;
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