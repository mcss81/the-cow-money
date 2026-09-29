// ============================================================
// THE COW MONEY
// APP PRINCIPAL
// ============================================================

// ============================================================
// ELEMENTOS
// ============================================================

const loginScreen = document.getElementById("login-screen");
const mainScreen = document.getElementById("main-screen");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

const userName = document.getElementById("user-name");
const logout = document.getElementById("logout");

const connectionStatus =
    document.getElementById("connection-status");

const cantidadSocios =
    document.getElementById("cantidad-socios");

const moduloScreen =
    document.getElementById("modulo-screen");

const moduloContenido =
    document.getElementById("modulo-contenido");

const volverPanel =
    document.getElementById("volver-panel");


// ============================================================
// SUPABASE
// ============================================================

let supabaseClient = null;

let usuarioActual = null;

let usuarioEsAdmin = false;


if (
    window.SUPABASE_URL &&
    window.SUPABASE_ANON_KEY &&
    !window.SUPABASE_URL.startsWith("PEGA_")
) {

    supabaseClient =
        window.supabase.createClient(
            window.SUPABASE_URL,
            window.SUPABASE_ANON_KEY
        );

} else {

    if (connectionStatus) {

        connectionStatus.textContent =
            "Falta configurar Supabase en config.js.";

    }

}


// ============================================================
// MOSTRAR PANEL PRINCIPAL
// ============================================================

function showMain(user) {

    loginScreen.classList.add("hidden");

    mainScreen.classList.remove("hidden");

    if (userName && user) {

        userName.textContent =
            user.email || "";

    }

}


// ============================================================
// MOSTRAR LOGIN
// ============================================================

function showLogin() {

    mainScreen.classList.add("hidden");

    loginScreen.classList.remove("hidden");

}


// ============================================================
// OBTENER DATOS DEL USUARIO
// ============================================================

async function cargarUsuarioActual(user) {

    usuarioActual = user;

    usuarioEsAdmin = false;

    if (!supabaseClient || !user) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("socios")
            .select("id,nombre,email,rol,estado,user_id")
            .eq("user_id", user.id)
            .maybeSingle();


    if (error) {

        console.error(
            "Error consultando usuario:",
            error
        );

        return;

    }


    if (data) {

        usuarioEsAdmin =
            data.rol === "ADMIN" &&
            data.estado === "ACTIVO";

    }

}


// ============================================================
// LOGIN
// ============================================================

loginForm.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();

        loginMessage.textContent = "";


        if (!supabaseClient) {

            loginMessage.textContent =
                "Falta configurar Supabase en config.js.";

            return;

        }


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


        if (error) {

            loginMessage.textContent =
                error.message;

            return;

        }


        await cargarUsuarioActual(data.user);

        showMain(data.user);

        await cargarDatosIniciales();

    }
);


// ============================================================
// CERRAR SESIÓN
// ============================================================

logout.addEventListener(
    "click",
    async function () {

        if (supabaseClient) {

            await supabaseClient.auth.signOut();

        }

        usuarioActual = null;

        usuarioEsAdmin = false;

        showLogin();

    }
);


// ============================================================
// OBTENER SOCIOS
// ============================================================

async function obtenerSocios() {

    if (!supabaseClient) {

        return [];

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("socios")
            .select(
                "id,nombre,email,telefono,fecha_ingreso,rol,estado,user_id"
            )
            .order(
                "nombre",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Error cargando socios:",
            error
        );


        if (connectionStatus) {

            connectionStatus.textContent =
                "Error al consultar socios: " +
                error.message;

        }


        return [];

    }


    return data || [];

}


// ============================================================
// CARGAR DATOS INICIALES
// ============================================================

async function cargarDatosIniciales() {

    const socios =
        await obtenerSocios();


    const sociosActivos =
        socios.filter(
            function (socio) {

                return socio.estado === "ACTIVO";

            }
        );


    if (cantidadSocios) {

        cantidadSocios.textContent =
            sociosActivos.length;

    }


    if (connectionStatus) {

        connectionStatus.textContent =
            "Conexión correcta. Socios encontrados: " +
            socios.length;

    }

}


// ============================================================
// ABRIR MÓDULO
// ============================================================

async function abrirModulo(modulo) {

    console.log(
        "Abriendo módulo:",
        modulo
    );


    moduloScreen.classList.remove(
        "hidden"
    );


    // ========================================================
    // SOCIOS
    // ========================================================

    if (modulo === "socios") {

        moduloContenido.innerHTML = `

            <h2>👥 Socios</h2>

            <p>
                Administración de los socios
                de The Cow Money.
            </p>

            <div class="modulo-info">

                <div class="socios-cabecera">

                    <div>

                        <h3>
                            Socios registrados
                        </h3>

                        <p>
                            Aquí puedes consultar
                            los socios del banquito.
                        </p>

                    </div>

                    ${
                        usuarioEsAdmin
                        ?
                        `
                        <button
                            id="nuevo-socio"
                            class="primary"
                            type="button"
                        >
                            + Nuevo socio
                        </button>
                        `
                        :
                        ""
                    }

                </div>


                <div class="buscador-socios">

                    <input
                        id="buscar-socio"
                        type="text"
                        placeholder="🔎 Buscar socio por nombre..."
                    >

                </div>


                <div id="lista-socios">

                    Cargando socios...

                </div>

            </div>

        `;


        const buscar =
            document.getElementById(
                "buscar-socio"
            );


        if (buscar) {

            buscar.addEventListener(
                "input",
                function () {

                    filtrarSocios(
                        buscar.value
                    );

                }
            );

        }


        const nuevoSocio =
            document.getElementById(
                "nuevo-socio"
            );


        if (nuevoSocio) {

            nuevoSocio.addEventListener(
                "click",
                mostrarFormularioNuevoSocio
            );

        }


        await mostrarSocios();

        return;

    }


    // ========================================================
    // APORTES
    // ========================================================

    if (modulo === "aportes") {

        moduloContenido.innerHTML = `

            <h2>💵 Aportes</h2>

            <p>
                Control de aportes mensuales y multas.
            </p>

            <div class="modulo-info">

                <h3>
                    Módulo de aportes
                </h3>

                <p>
                    Aquí construiremos el control
                    de aportes, pagos, multas y saldos.
                </p>

            </div>

        `;

        return;

    }


    // ========================================================
    // PRÉSTAMOS
    // ========================================================

    if (modulo === "prestamos") {

        moduloContenido.innerHTML = `

            <h2>🏦 Préstamos</h2>

            <p>
                Administración de préstamos.
            </p>

            <div class="modulo-info">

                <h3>
                    Módulo de préstamos
                </h3>

                <p>
                    Aquí construiremos solicitudes,
                    aprobaciones, cuotas, pagos
                    y renovaciones.
                </p>

            </div>

        `;

        return;

    }


    // ========================================================
    // CAJA
    // ========================================================

    if (modulo === "caja") {

        moduloContenido.innerHTML = `

            <h2>📒 Caja</h2>

            <p>
                Control de movimientos de caja.
            </p>

            <div class="modulo-info">

                <h3>
                    Módulo de caja
                </h3>

                <p>
                    Aquí construiremos el control
                    de ingresos y movimientos.
                </p>

            </div>

        `;

        return;

    }

}


// ============================================================
// LISTA DE SOCIOS
// ============================================================

let todosLosSocios = [];


// ============================================================
// MOSTRAR SOCIOS
// ============================================================

async function mostrarSocios() {

    const lista =
        document.getElementById(
            "lista-socios"
        );


    if (!lista) {

        return;

    }


    lista.innerHTML = `
        <p>
            Cargando socios desde Supabase...
        </p>
    `;


    todosLosSocios =
        await obtenerSocios();


    renderizarSocios(
        todosLosSocios
    );

}


// ============================================================
// MOSTRAR TABLA
// ============================================================

function renderizarSocios(socios) {

    const lista =
        document.getElementById(
            "lista-socios"
        );


    if (!lista) {

        return;

    }


    if (socios.length === 0) {

        lista.innerHTML = `
            <p>
                No existen socios que coincidan
                con la búsqueda.
            </p>
        `;

        return;

    }


    const tabla =
        document.createElement("table");

    tabla.className =
        "tabla-socios";


    tabla.innerHTML = `

        <thead>

            <tr>

                <th>Nombre</th>

                <th>Correo</th>

                <th>Teléfono</th>

                <th>Ingreso</th>

                <th>Rol</th>

                <th>Estado</th>

                ${
                    usuarioEsAdmin
                    ?
                    "<th>Acciones</th>"
                    :
                    ""
                }

            </tr>

        </thead>

        <tbody></tbody>

    `;


    const tbody =
        tabla.querySelector(
            "tbody"
        );


    socios.forEach(
        function (socio) {

            const fila =
                document.createElement("tr");


            const nombre =
                document.createElement("td");

            nombre.textContent =
                socio.nombre || "Sin nombre";


            const email =
                document.createElement("td");

            email.textContent =
                socio.email || "Sin correo";


            const telefono =
                document.createElement("td");

            telefono.textContent =
                socio.telefono || "Sin teléfono";


            const fecha =
                document.createElement("td");

            if (socio.fecha_ingreso) {

                const fechaObj =
                    new Date(
                        socio.fecha_ingreso +
                        "T00:00:00"
                    );

                fecha.textContent =
                    fechaObj.toLocaleDateString(
                        "es-EC"
                    );

            } else {

                fecha.textContent =
                    "Sin fecha";

            }


            const rol =
                document.createElement("td");

            rol.textContent =
                socio.rol || "SOCIO";


            const estado =
                document.createElement("td");

            estado.textContent =
                socio.estado || "ACTIVO";


            fila.appendChild(nombre);

            fila.appendChild(email);

            fila.appendChild(telefono);

            fila.appendChild(fecha);

            fila.appendChild(rol);

            fila.appendChild(estado);


            // =================================================
            // ACCIONES ADMIN
            // =================================================

            if (usuarioEsAdmin) {

                const acciones =
                    document.createElement("td");


                const editar =
                    document.createElement("button");

                editar.type = "button";

                editar.className =
                    "secondary";

                editar.textContent =
                    "✏️ Editar";


                editar.addEventListener(
                    "click",
                    function () {

                        mostrarFormularioEditarSocio(
                            socio
                        );

                    }
                );


                acciones.appendChild(
                    editar
                );


                const cambiarEstado =
                    document.createElement("button");

                cambiarEstado.type =
                    "button";

                cambiarEstado.className =
                    "secondary";

                cambiarEstado.textContent =
                    socio.estado === "ACTIVO"
                    ?
                    "🔴 Desactivar"
                    :
                    "🟢 Activar";


                cambiarEstado.addEventListener(
                    "click",
                    function () {

                        cambiarEstadoSocio(
                            socio
                        );

                    }
                );


                acciones.appendChild(
                    cambiarEstado
                );


                fila.appendChild(
                    acciones
                );

            }


            tbody.appendChild(
                fila
            );

        }
    );


    lista.innerHTML = "";

    lista.appendChild(
        tabla
    );

}


// ============================================================
// BUSCAR SOCIO
// ============================================================

function filtrarSocios(texto) {

    const busqueda =
        texto
            .toLowerCase()
            .trim();


    if (!busqueda) {

        renderizarSocios(
            todosLosSocios
        );

        return;

    }


    const filtrados =
        todosLosSocios.filter(
            function (socio) {

                const nombre =
                    (
                        socio.nombre || ""
                    ).toLowerCase();


                const email =
                    (
                        socio.email || ""
                    ).toLowerCase();


                const telefono =
                    (
                        socio.telefono || ""
                    ).toLowerCase();


                return (
                    nombre.includes(busqueda) ||
                    email.includes(busqueda) ||
                    telefono.includes(busqueda)
                );

            }
        );


    renderizarSocios(
        filtrados
    );

}


// ============================================================
// FORMULARIO NUEVO SOCIO
// ============================================================

function mostrarFormularioNuevoSocio() {

    moduloContenido.innerHTML = `

        <h2>➕ Nuevo socio</h2>

        <div class="modulo-info">

            <label>
                Nombre
            </label>

            <input
                id="nuevo-nombre"
                type="text"
                placeholder="Nombre completo"
            >


            <label>
                Correo
            </label>

            <input
                id="nuevo-email"
                type="email"
                placeholder="correo@ejemplo.com"
            >


            <label>
                Teléfono
            </label>

            <input
                id="nuevo-telefono"
                type="text"
                placeholder="Teléfono"
            >


            <label>
                Fecha de ingreso
            </label>

            <input
                id="nuevo-fecha"
                type="date"
            >


            <div style="margin-top:20px">

                <button
                    id="guardar-nuevo"
                    class="primary"
                    type="button"
                >
                    Guardar socio
                </button>

                <button
                    id="cancelar-nuevo"
                    class="secondary"
                    type="button"
                >
                    Cancelar
                </button>

            </div>

        </div>

    `;


    document
        .getElementById("guardar-nuevo")
        .addEventListener(
            "click",
            guardarNuevoSocio
        );


    document
        .getElementById("cancelar-nuevo")
        .addEventListener(
            "click",
            function () {

                abrirModulo("socios");

            }
        );

}


// ============================================================
// GUARDAR NUEVO SOCIO
// ============================================================

async function guardarNuevoSocio() {

    if (!usuarioEsAdmin) {

        alert(
            "Solo un administrador puede realizar esta acción."
        );

        return;

    }


    const nombre =
        document
            .getElementById("nuevo-nombre")
            .value
            .trim();


    const email =
        document
            .getElementById("nuevo-email")
            .value
            .trim();


    const telefono =
        document
            .getElementById("nuevo-telefono")
            .value
            .trim();


    const fecha =
        document
            .getElementById("nuevo-fecha")
            .value;


    if (!nombre) {

        alert(
            "Debes ingresar el nombre del socio."
        );

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("socios")
            .insert({
                nombre: nombre,
                email: email || null,
                telefono: telefono || null,
                fecha_ingreso: fecha || null,
                estado: "ACTIVO",
                rol: "SOCIO"
            });


    if (error) {

        alert(
            "No se pudo guardar el socio:\n\n" +
            error.message
        );

        console.error(
            error
        );

        return;

    }


    alert(
        "Socio creado correctamente."
    );


    await cargarDatosIniciales();

    await abrirModulo("socios");

}


// ============================================================
// EDITAR SOCIO
// ============================================================

function mostrarFormularioEditarSocio(socio) {

    moduloContenido.innerHTML = `

        <h2>✏️ Editar socio</h2>

        <div class="modulo-info">

            <label>
                Nombre
            </label>

            <input
                id="editar-nombre"
                type="text"
                value="${escapeHtml(socio.nombre || "")}"
            >


            <label>
                Correo
            </label>

            <input
                id="editar-email"
                type="email"
                value="${escapeHtml(socio.email || "")}"
            >


            <label>
                Teléfono
            </label>

            <input
                id="editar-telefono"
                type="text"
                value="${escapeHtml(socio.telefono || "")}"
            >


            <label>
                Fecha de ingreso
            </label>

            <input
                id="editar-fecha"
                type="date"
                value="${socio.fecha_ingreso || ""}"
            >


            <label>
                Rol
            </label>

            <select
                id="editar-rol"
            >

                <option
                    value="SOCIO"
                    ${
                        socio.rol === "SOCIO"
                        ? "selected"
                        : ""
                    }
                >
                    SOCIO
                </option>

                <option
                    value="ADMIN"
                    ${
                        socio.rol === "ADMIN"
                        ? "selected"
                        : ""
                    }
                >
                    ADMIN
                </option>

            </select>


            <div style="margin-top:20px">

                <button
                    id="guardar-edicion"
                    class="primary"
                    type="button"
                >
                    Guardar cambios
                </button>

                <button
                    id="cancelar-edicion"
                    class="secondary"
                    type="button"
                >
                    Cancelar
                </button>

            </div>

        </div>

    `;


    document
        .getElementById("guardar-edicion")
        .addEventListener(
            "click",
            function () {

                guardarEdicionSocio(
                    socio.id
                );

            }
        );


    document
        .getElementById("cancelar-edicion")
        .addEventListener(
            "click",
            function () {

                abrirModulo("socios");

            }
        );

}


// ============================================================
// GUARDAR EDICIÓN
// ============================================================

async function guardarEdicionSocio(id) {

    if (!usuarioEsAdmin) {

        alert(
            "Solo un administrador puede realizar esta acción."
        );

        return;

    }


    const nombre =
        document
            .getElementById("editar-nombre")
            .value
            .trim();


    const email =
        document
            .getElementById("editar-email")
            .value
            .trim();


    const telefono =
        document
            .getElementById("editar-telefono")
            .value
            .trim();


    const fecha =
        document
            .getElementById("editar-fecha")
            .value;


    const rol =
        document
            .getElementById("editar-rol")
            .value;


    if (!nombre) {

        alert(
            "El nombre es obligatorio."
        );

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("socios")
            .update({
                nombre: nombre,
                email: email || null,
                telefono: telefono || null,
                fecha_ingreso: fecha || null,
                rol: rol
            })
            .eq(
                "id",
                id
            );


    if (error) {

        alert(
            "No se pudo actualizar el socio:\n\n" +
            error.message
        );

        console.error(
            error
        );

        return;

    }


    alert(
        "Socio actualizado correctamente."
    );


    await cargarDatosIniciales();

    await abrirModulo("socios");

}


// ============================================================
// CAMBIAR ESTADO
// ============================================================

async function cambiarEstadoSocio(socio) {

    if (!usuarioEsAdmin) {

        alert(
            "Solo un administrador puede realizar esta acción."
        );

        return;

    }


    const nuevoEstado =
        socio.estado === "ACTIVO"
        ?
        "INACTIVO"
        :
        "ACTIVO";


    const confirmar =
        confirm(
            "¿Deseas cambiar a " +
            socio.nombre +
            " al estado " +
            nuevoEstado +
            "?"
        );


    if (!confirmar) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("socios")
            .update({
                estado: nuevoEstado
            })
            .eq(
                "id",
                socio.id
            );


    if (error) {

        alert(
            "No se pudo cambiar el estado:\n\n" +
            error.message
        );

        console.error(
            error
        );

        return;

    }


    await cargarDatosIniciales();

    await abrirModulo("socios");

}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escapeHtml(texto) {

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll(
            "'",
            "&#039;"
        );

}


// ============================================================
// CONFIGURAR BOTONES DEL MENÚ
// ============================================================

function configurarMenu() {

    const botones =
        document.querySelectorAll(
            ".menu-card"
        );


    console.log(
        "BOTONES ENCONTRADOS:",
        botones.length
    );


    botones.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                async function () {

                    const modulo =
                        boton.getAttribute(
                            "data-modulo"
                        );


                    console.log(
                        "BOTÓN PRESIONADO:",
                        modulo
                    );


                    await abrirModulo(
                        modulo
                    );

                }
            );

        }
    );

}


// ============================================================
// BOTÓN VOLVER
// ============================================================

if (volverPanel) {

    volverPanel.addEventListener(
        "click",
        function () {

            moduloScreen.classList.add(
                "hidden"
            );

        }
    );

}


// ============================================================
// INICIAR APLICACIÓN
// ============================================================

(async function () {

    configurarMenu();


    if (!supabaseClient) {

        return;

    }


    const {
        data
    } =
        await supabaseClient.auth.getSession();


    if (data.session) {

        await cargarUsuarioActual(
            data.session.user
        );


        showMain(
            data.session.user
        );


        await cargarDatosIniciales();

    }

})();
