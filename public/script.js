// URL base de la API
const API_URL = 'http://localhost:3000/api';

// Al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarTiposServicio();
    
    // Configurar el formulario
    document.getElementById('form-solicitud').addEventListener('submit', enviarSolicitud);
});

// ==================== FUNCIONES DE NAVEGACIÓN ====================

function showTab(tabName) {
    // Ocultar todos los contenidos
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    // Desactivar todos los botones
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));
    
    // Mostrar el contenido seleccionado
    document.getElementById(tabName).classList.add('active');
    
    // Activar el botón correspondiente
    event.target.classList.add('active');
}

// ==================== FUNCIONES DE TIPOS DE SERVICIO ====================

// Tipos de servicio predefinidos (respaldo si la API no responde)
const TIPOS_SERVICIO_DEFAULT = [
    { id_tipo: 1, nombre: 'Instalación de Software o Programa' },
    { id_tipo: 2, nombre: 'Virus' },
    { id_tipo: 3, nombre: 'Impresora No Funciona o No Imprime' },
    { id_tipo: 4, nombre: 'No Tengo Internet' },
    { id_tipo: 5, nombre: 'Otra' }
];

async function cargarTiposServicio() {
    const select = document.getElementById('tipo_servicio');

    function poblarSelect(tipos) {
        tipos.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.id_tipo;
            option.textContent = tipo.nombre;
            select.appendChild(option);
        });
    }

    try {
        const response = await fetch(`${API_URL}/tipos-servicio`);
        if (!response.ok) throw new Error('API no disponible');
        const tipos = await response.json();
        const nombresFiltrados = [
            'Instalación de Software o Programa',
            'Virus',
            'Impresora No Funciona o No Imprime',
            'No Tengo Internet',
            'Otra'
        ];
        const tiposFiltrados = tipos.filter(t => nombresFiltrados.includes(t.nombre));
        poblarSelect(tiposFiltrados.length > 0 ? tiposFiltrados : tipos);
    } catch (error) {
        console.warn('API no disponible, usando tipos predefinidos:', error);
        poblarSelect(TIPOS_SERVICIO_DEFAULT);
    }
}

// ==================== FUNCIONES DE SOLICITUDES ====================

async function enviarSolicitud(e) {
    e.preventDefault();
    
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="loading"></span> Enviando...';
    
    try {
        // Datos del usuario
        const datosUsuario = {
            nombre: document.getElementById('nombre').value.trim(),
            apellido_paterno: document.getElementById('apellido_paterno').value.trim(),
            apellido_materno: document.getElementById('apellido_materno').value.trim() || null,
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            departamento: document.getElementById('departamento').value.trim(),
            puesto: document.getElementById('puesto').value.trim()
        };
        
        // Verificar si el usuario ya existe
        let usuario;
        try {
            const responseUsuario = await fetch(`${API_URL}/usuarios/email/${datosUsuario.email}`);
            if (responseUsuario.ok) {
                usuario = await responseUsuario.json();
            } else {
                // Crear nuevo usuario
                const responseCrear = await fetch(`${API_URL}/usuarios`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosUsuario)
                });
                usuario = await responseCrear.json();
            }
        } catch (error) {
            // Si no existe, crear nuevo usuario
            const responseCrear = await fetch(`${API_URL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosUsuario)
            });
            usuario = await responseCrear.json();
        }
        
        // Datos de la solicitud
        const datosSolicitud = {
            id_usuario: usuario.id_usuario,
            id_tipo: parseInt(document.getElementById('tipo_servicio').value),
            titulo: document.getElementById('titulo').value.trim(),
            descripcion: document.getElementById('descripcion').value.trim(),
            prioridad: document.getElementById('prioridad').value,
            equipo: document.getElementById('equipo').value.trim() || null,
            ubicacion: document.getElementById('ubicacion').value.trim()
        };
        
        // Enviar solicitud
        const responseSolicitud = await fetch(`${API_URL}/solicitudes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosSolicitud)
        });
        
        if (responseSolicitud.ok) {
            const solicitud = await responseSolicitud.json();
            mostrarModalExito(solicitud);
            document.getElementById('form-solicitud').reset();
        } else {
            throw new Error('Error al crear la solicitud');
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarModalError();
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = textoOriginal;
    }
}

async function consultarSolicitudes() {
    const email = document.getElementById('email-consulta').value.trim();
    
    if (!email) {
        mostrarMensaje('Por favor ingrese un correo electrónico', 'error');
        return;
    }
    
    const lista = document.getElementById('lista-solicitudes');
    lista.innerHTML = '<p style="text-align: center;">Buscando solicitudes...</p>';
    
    try {
        // Obtener el usuario
        const responseUsuario = await fetch(`${API_URL}/usuarios/email/${email}`);
        
        if (!responseUsuario.ok) {
            lista.innerHTML = '<div class="mensaje mensaje-info">No se encontraron solicitudes para este correo electrónico.</div>';
            return;
        }
        
        const usuario = await responseUsuario.json();
        
        // Obtener solicitudes del usuario
        const responseSolicitudes = await fetch(`${API_URL}/solicitudes/usuario/${usuario.id_usuario}`);
        const solicitudes = await responseSolicitudes.json();
        
        if (solicitudes.length === 0) {
            lista.innerHTML = '<div class="mensaje mensaje-info">No se encontraron solicitudes para este usuario.</div>';
            return;
        }
        
        // Mostrar solicitudes
        lista.innerHTML = solicitudes.map(solicitud => `
            <div class="solicitud-item prioridad-${solicitud.prioridad.toLowerCase()}">
                <div class="solicitud-header">
                    <div class="solicitud-titulo">${solicitud.titulo}</div>
                    <span class="solicitud-badge badge-${solicitud.estado.toLowerCase().replace(' ', '-')}">
                        ${solicitud.estado}
                    </span>
                </div>
                <p style="color: #666; margin: 10px 0;">${solicitud.descripcion}</p>
                <div class="solicitud-info">
                    <div class="solicitud-info-item">
                        <strong>Tipo de Servicio:</strong>
                        <span>${solicitud.tipo_servicio}</span>
                    </div>
                    <div class="solicitud-info-item">
                        <strong>Prioridad:</strong>
                        <span>${solicitud.prioridad}</span>
                    </div>
                    <div class="solicitud-info-item">
                        <strong>Ubicación:</strong>
                        <span>${solicitud.ubicacion}</span>
                    </div>
                    <div class="solicitud-info-item">
                        <strong>Fecha de Solicitud:</strong>
                        <span>${formatearFecha(solicitud.fecha_solicitud)}</span>
                    </div>
                    ${solicitud.equipo ? `
                    <div class="solicitud-info-item">
                        <strong>Equipo:</strong>
                        <span>${solicitud.equipo}</span>
                    </div>
                    ` : ''}
                    ${solicitud.tecnico_asignado ? `
                    <div class="solicitud-info-item">
                        <strong>Técnico Asignado:</strong>
                        <span>${solicitud.tecnico_asignado}</span>
                    </div>
                    ` : ''}
                    ${solicitud.fecha_resolucion ? `
                    <div class="solicitud-info-item">
                        <strong>Fecha de Resolución:</strong>
                        <span>${formatearFecha(solicitud.fecha_resolucion)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error:', error);
        lista.innerHTML = '<div class="mensaje mensaje-error">Error al consultar las solicitudes. Por favor intente nuevamente.</div>';
    }
}

// ==================== FUNCIONES DE UTILIDAD ====================

function formatearFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function mostrarMensaje(mensaje, tipo) {
    const div = document.createElement('div');
    div.className = `mensaje mensaje-${tipo}`;
    div.textContent = mensaje;
    
    const form = document.getElementById('form-solicitud');
    form.insertBefore(div, form.firstChild);
    
    setTimeout(() => div.remove(), 5000);
}

// ==================== FUNCIONES DE MODAL ====================

function mostrarModalExito(solicitud) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="modal-icon success">✓</div>
        <h2 style="color: var(--success-color); margin-bottom: 15px;">¡Solicitud Enviada Exitosamente!</h2>
        <p style="margin-bottom: 20px;">Su solicitud ha sido registrada con éxito.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; text-align: left;">
            <p><strong>Folio:</strong> #${solicitud.id_solicitud}</p>
            <p><strong>Título:</strong> ${solicitud.titulo}</p>
            <p><strong>Estado:</strong> ${solicitud.estado}</p>
        </div>
        <p style="margin-top: 20px; color: #666;">
            Recibirá un correo de confirmación y actualizaciones sobre el estado de su solicitud.
        </p>
        <button onclick="cerrarModal()" class="btn btn-primary" style="margin-top: 20px;">Aceptar</button>
    `;
    
    modal.style.display = 'block';
}

function mostrarModalError() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="modal-icon error">✕</div>
        <h2 style="color: var(--danger-color); margin-bottom: 15px;">Error al Enviar Solicitud</h2>
        <p style="margin-bottom: 20px;">
            Ha ocurrido un error al procesar su solicitud. Por favor, intente nuevamente.
        </p>
        <button onclick="cerrarModal()" class="btn btn-primary" style="margin-top: 20px;">Cerrar</button>
    `;
    
    modal.style.display = 'block';
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        cerrarModal();
    }
}