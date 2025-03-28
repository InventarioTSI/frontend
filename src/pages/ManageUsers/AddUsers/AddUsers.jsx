import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddUsers.css';

const AddUsers = () => {
    const [formData, setFormData] = useState({
        userName: '',
        role: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        try {
            const token = localStorage.getItem('token'); // Obtén el token del localStorage
            await axios.post(
                'http://localhost:3000/api/users',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
                    },
                }
            );
            alert('Usuario añadido correctamente');
            navigate('/admin/users'); // Redirige a la lista de usuarios
        } catch (err) {
            setError('Error al añadir el usuario');
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