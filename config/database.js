const { Pool } = require('pg');

// Configuración de conexión a PostgreSQL
// IMPORTANTE: Actualiza estos valores con tus credenciales de PostgreSQL
const pool = new Pool({
    user: 'postgres',              // Tu usuario de PostgreSQL
    host: 'localhost',             // Host de la base de datos
    database: 'sistema_computo',   // Nombre de tu base de datos
    password: '',       // Tu contraseña de PostgreSQL
    port: 5432,                    // Puerto de PostgreSQL (default: 5432)
});

// Verificar conexión al iniciar
pool.connect((err, client, release) => {
    if (err) {
        console.error(' Error al conectar a la base de datos PostgreSQL:');
        console.error('   Mensaje:', err.message);
        console.error('   Código:', err.code);
        console.error('');
        console.error('🔧 Verifica lo siguiente:');
        console.error('   1. PostgreSQL está corriendo');
        console.error('   2. La base de datos "sistema_computo" existe');
        console.error('   3. Las credenciales en config/database.js son correctas');
        console.error('   4. El puerto 5432 está disponible');
        console.error('');
    } else {
        console.log('✅ Conexión exitosa a PostgreSQL');
        console.log('   Base de datos: sistema_computo');
        release();
    }
});

// Manejo de errores del pool
pool.on('error', (err, client) => {
    console.error('Error inesperado en el cliente de PostgreSQL', err);
    process.exit(-1);
});

module.exports = pool;
