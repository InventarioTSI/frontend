import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ManageUsers.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]); // Estado para almacenar los usuarios
    const [loading, setLoading] = useState(true); // Estado para manejar la carga
    const [error, setError] = useState(null); // Estado para manejar errores
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
        alert(`Editar usuario con ID: ${userId}`);
        // Aquí puedes redirigir a un formulario de edición o abrir un modal
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
        </div>
    );
};

export default ManageUsers;