const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ==================== RUTAS DE USUARIOS ====================

// Crear usuario
app.post('/api/usuarios', async (req, res) => {
    try {
        const { nombre, apellido_paterno, apellido_materno, email, telefono, departamento, puesto } = req.body;
        
        const result = await pool.query(
            `INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, email, telefono, departamento, puesto)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [nombre, apellido_paterno, apellido_materno, email, telefono, departamento, puesto]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error al crear usuario', detalle: error.message });
    }
});

// Obtener usuario por email
app.get('/api/usuarios/email/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al buscar usuario:', error);
        res.status(500).json({ error: 'Error al buscar usuario' });
    }
});

// ==================== RUTAS DE TIPOS DE SERVICIO ====================

// Obtener todos los tipos de servicio
app.get('/api/tipos-servicio', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipos_servicio ORDER BY nombre');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener tipos de servicio:', error);
        res.status(500).json({ error: 'Error al obtener tipos de servicio' });
    }
});

// ==================== RUTAS DE SOLICITUDES ====================

// Crear solicitud
app.post('/api/solicitudes', async (req, res) => {
    try {
        const {
            id_usuario,
            id_tipo,
            titulo,
            descripcion,
            prioridad,
            equipo,
            ubicacion
        } = req.body;
        
        const result = await pool.query(
            `INSERT INTO solicitudes (id_usuario, id_tipo, titulo, descripcion, prioridad, equipo, ubicacion)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [id_usuario, id_tipo, titulo, descripcion, prioridad, equipo, ubicacion]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear solicitud:', error);
        res.status(500).json({ error: 'Error al crear solicitud', detalle: error.message });
    }
});

// Obtener todas las solicitudes con información completa
app.get('/api/solicitudes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vista_solicitudes_completas');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        res.status(500).json({ error: 'Error al obtener solicitudes' });
    }
});

// Obtener solicitudes por usuario
app.get('/api/solicitudes/usuario/:id_usuario', async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const result = await pool.query(
            'SELECT * FROM vista_solicitudes_completas WHERE id_usuario = $1',
            [id_usuario]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener solicitudes del usuario:', error);
        res.status(500).json({ error: 'Error al obtener solicitudes del usuario' });
    }
});

// Obtener solicitud por ID
app.get('/api/solicitudes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM vista_solicitudes_completas WHERE id_solicitud = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener solicitud:', error);
        res.status(500).json({ error: 'Error al obtener solicitud' });
    }
});

// Actualizar estado de solicitud
app.patch('/api/solicitudes/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        const result = await pool.query(
            `UPDATE solicitudes SET estado = $1, 
            fecha_resolucion = CASE WHEN $1 = 'Resuelto' THEN CURRENT_TIMESTAMP ELSE fecha_resolucion END
             WHERE id_solicitud = $2 RETURNING *`,
            [estado, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar solicitud:', error);
        res.status(500).json({ error: 'Error al actualizar solicitud' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});