// ============================================================
// THE COW MONEY
// APP PRINCIPAL
// ============================================================


// ============================================================
// ELEMENTOS DE LA PÁGINA
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

const sociosLista =
    document.getElementById("socios-lista");

const sociosInicio =
    document.getElementById("socios-inicio");

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


// ============================================================
// INICIALIZAR SUPABASE
// ============================================================

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

        showLogin();

    }
);


// ============================================================
// CARGAR SOCIOS
// ============================================================

async function cargarSocios() {

    if (!supabaseClient) {

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("socios")
                .select(
                    "id,nombre,email,rol,estado"
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

            connectionStatus.textContent =
                "Error al consultar los socios: " +
                error.message;

            return;

        }


        const socios =
            data || [];


        const sociosActivos =
            socios.filter(
                function (socio) {

                    return socio.estado === "ACTIVO";

                }
            );


        cantidadSocios.textContent =
            sociosActivos.length;


        connectionStatus.textContent =
            "Conexión correcta. Socios encontrados: " +
            socios.length;


        sociosLista.innerHTML = "";


        if (socios.length === 0) {

            sociosLista.innerHTML =
                "<p>No hay socios registrados.</p>";

            return;

        }


        socios.forEach(
            function (socio) {

                const fila =
                    document.createElement("div");

                fila.className =
                    "socio-row";


                const nombre =
                    document.createElement("strong");

                nombre.textContent =
                    socio.nombre || "Sin nombre";


                const email =
                    document.createElement("span");

                email.textContent =
                    socio.email || "Sin correo";


                const rol =
                    document.createElement("span");

                rol.textContent =
                    socio.rol || "SOCIO";


                const estado =
                    document.createElement("span");

                estado.textContent =
                    socio.estado || "ACTIVO";


                fila.appendChild(nombre);
                fila.appendChild(email);
                fila.appendChild(rol);
                fila.appendChild(estado);


                sociosLista.appendChild(fila);

            }
        );


    } catch (error) {

        console.error(
            "Error inesperado:",
            error
        );

        connectionStatus.textContent =
            "Error inesperado al cargar socios.";

    }

}


// ============================================================
// CARGAR APORTES
// ============================================================

async function cargarAportes() {

    if (!supabaseClient) {

        return;

    }


    moduloContenido.innerHTML = `
        <h2>💵 Aportes</h2>

        <p>
            Cargando aportes...
        </p>
    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("aportes")
                .select(`
                    id,
                    socio_id,
                    fecha_vencimiento,
                    valor_aporte,
                    fecha_pago,
                    estado,
                    multa,
                    total_pagado,
                    observacion,
                    socios (
                        nombre
                    )
                `)
                .order(
                    "fecha_vencimiento",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Error cargando aportes:",
                error
            );


            moduloContenido.innerHTML = `

                <h2>💵 Aportes</h2>

                <div class="modulo-info">

                    <h3>Error al cargar los aportes</h3>

                    <p>
                        ${error.message}
                    </p>

                </div>

            `;

            return;

        }


        const aportes =
            data || [];


        // ====================================================
        // RESUMEN
        // ====================================================

        let pagados = 0;
        let pendientes = 0;
        let atrasados = 0;
        let multas = 0;
        let totalPendiente = 0;


        aportes.forEach(
            function (aporte) {

                if (aporte.estado === "PAGADO") {

                    pagados++;

                }

                if (aporte.estado === "PENDIENTE") {

                    pendientes++;

                }

                if (aporte.estado === "ATRASADO") {

                    atrasados++;

                }


                multas +=
                    Number(aporte.multa || 0);


                if (
                    aporte.estado !== "PAGADO"
                ) {

                    totalPendiente +=
                        Number(aporte.valor_aporte || 0) +
                        Number(aporte.multa || 0);

                }

            }
        );


        // ====================================================
        // CREAR PANTALLA
        // ====================================================

        let html = `

            <h2>💵 Aportes</h2>

            <p>
                Control de aportes mensuales y multas.
            </p>


            <div class="aportes-resumen">

                <div class="aporte-resumen-card">
                    <strong>${aportes.length}</strong>
                    <span>Total aportes</span>
                </div>

                <div class="aporte-resumen-card">
                    <strong>${pagados}</strong>
                    <span>Pagados</span>
                </div>

                <div class="aporte-resumen-card">
                    <strong>${pendientes}</strong>
                    <span>Pendientes</span>
                </div>

                <div class="aporte-resumen-card">
                    <strong>${atrasados}</strong>
                    <span>Atrasados</span>
                </div>

                <div class="aporte-resumen-card">
                    <strong>$${multas.toFixed(2)}</strong>
                    <span>Multas</span>
                </div>

                <div class="aporte-resumen-card">
                    <strong>$${totalPendiente.toFixed(2)}</strong>
                    <span>Total pendiente</span>
                </div>

            </div>


            <div class="modulo-info">

                <h3>
                    Aportes registrados
                </h3>

                <div class="aportes-tabla">

                    <div class="aporte-header">

                        <strong>Socio</strong>

                        <strong>Vencimiento</strong>

                        <strong>Aporte</strong>

                        <strong>Multa</strong>

                        <strong>Total pagado</strong>

                        <strong>Estado</strong>

                    </div>

        `;


        // ====================================================
        // LISTAR APORTES
        // ====================================================

        if (aportes.length === 0) {

            html += `

                <div class="aporte-vacio">

                    No existen aportes registrados.

                </div>

            `;

        } else {


            aportes.forEach(
                function (aporte) {

                    const socio =
                        aporte.socios;


                    const nombreSocio =
                        socio
                            ? socio.nombre
                            : "Socio no encontrado";


                    const valor =
                        Number(
                            aporte.valor_aporte || 0
                        );


                    const multa =
                        Number(
                            aporte.multa || 0
                        );


                    const totalPagado =
                        Number(
                            aporte.total_pagado || 0
                        );


                    let claseEstado =
                        "";


                    if (
                        aporte.estado === "PAGADO"
                    ) {

                        claseEstado =
                            "estado-pagado";

                    }


                    if (
                        aporte.estado === "PENDIENTE"
                    ) {

                        claseEstado =
                            "estado-pendiente";

                    }


                    if (
                        aporte.estado === "ATRASADO"
                    ) {

                        claseEstado =
                            "estado-atrasado";

                    }


                    html += `

                        <div class="aporte-row">

                            <span>
                                ${nombreSocio}
                            </span>

                            <span>
                                ${formatearFecha(
                                    aporte.fecha_vencimiento
                                )}
                            </span>

                            <span>
                                $${valor.toFixed(2)}
                            </span>

                            <span>
                                $${multa.toFixed(2)}
                            </span>

                            <span>
                                $${totalPagado.toFixed(2)}
                            </span>

                            <span class="${claseEstado}">
                                ${aporte.estado}
                            </span>

                        </div>

                    `;

                }
            );

        }


        html += `

                </div>

            </div>

        `;


        moduloContenido.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Error inesperado cargando aportes:",
            error
        );


        moduloContenido.innerHTML = `

            <h2>💵 Aportes</h2>

            <div class="modulo-info">

                <h3>
                    Error inesperado
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


// ============================================================
// FORMATEAR FECHA
// ============================================================

function formatearFecha(fecha) {

    if (!fecha) {

        return "-";

    }


    const partes =
        fecha.split("-");


    if (partes.length !== 3) {

        return fecha;

    }


    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


// ============================================================
// CARGAR DATOS INICIALES
// ============================================================

async function cargarDatosIniciales() {

    if (!supabaseClient) {

        return;

    }

    await cargarSocios();

}


// ============================================================
// ABRIR MÓDULO
// ============================================================

async function abrirModulo(modulo) {

    console.log(
        "Abriendo módulo:",
        modulo
    );


    if (sociosInicio) {

        sociosInicio.classList.add("hidden");

    }


    if (moduloScreen) {

        moduloScreen.classList.remove("hidden");

    }


    // ========================================================
    // SOCIOS
    // ========================================================

    if (modulo === "socios") {

        moduloContenido.innerHTML = `

            <h2>👥 Socios</h2>

            <p>
                Administración de los socios de
                The Cow Money.
            </p>

            <div class="modulo-info">

                <h3>
                    Socios registrados
                </h3>

                <p>
                    Actualmente existen
                    ${cantidadSocios.textContent}
                    socios activos.
                </p>

                <div id="socios-modulo-lista">

                    Cargando socios...

                </div>

            </div>

        `;


        await cargarSociosModulo();

        return;

    }


    // ========================================================
    // APORTES
    // ========================================================

    if (modulo === "aportes") {

        await cargarAportes();

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
                    Aquí construiremos las solicitudes,
                    aprobaciones, cuotas, pagos y renovaciones.
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
// CARGAR SOCIOS DENTRO DEL MÓDULO
// ============================================================

async function cargarSociosModulo() {

    const lista =
        document.getElementById(
            "socios-modulo-lista"
        );


    if (!lista || !supabaseClient) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("socios")
            .select(
                "id,nombre,email,rol,estado"
            )
            .order(
                "nombre",
                {
                    ascending: true
                }
            );


    if (error) {

        lista.innerHTML =
            `<p>Error: ${error.message}</p>`;

        return;

    }


    const socios =
        data || [];


    let html = `

        <div class="socios-tabla">

            <div class="socio-row socio-header">

                <strong>Nombre</strong>

                <strong>Correo</strong>

                <strong>Rol</strong>

                <strong>Estado</strong>

            </div>

    `;


    socios.forEach(
        function (socio) {

            html += `

                <div class="socio-row">

                    <span>
                        ${socio.nombre || "Sin nombre"}
                    </span>

                    <span>
                        ${socio.email || "Sin correo"}
                    </span>

                    <span>
                        ${socio.rol || "SOCIO"}
                    </span>

                    <span>
                        ${socio.estado || "ACTIVO"}
                    </span>

                </div>

            `;

        }
    );


    html += `
        </div>
    `;


    lista.innerHTML =
        html;

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
        "Botones encontrados:",
        botones.length
    );


    botones.forEach(
        function (boton) {

            boton.onclick =
                function () {

                    const modulo =
                        boton.getAttribute(
                            "data-modulo"
                        );


                    console.log(
                        "Botón presionado:",
                        modulo
                    );


                    abrirModulo(modulo);

                };

        }
    );

}


// ============================================================
// BOTÓN VOLVER
// ============================================================

if (volverPanel) {

    volverPanel.onclick =
        function () {

            moduloScreen.classList.add(
                "hidden"
            );

            sociosInicio.classList.remove(
                "hidden"
            );

        };

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

        showMain(
            data.session.user
        );


        await cargarDatosIniciales();

    }

})();
