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
// INICIAR SUPABASE
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
// MOSTRAR PANEL
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


        const socios = data || [];


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


        // Encabezado

        const encabezado =
            document.createElement("div");

        encabezado.className =
            "socio-row socio-header";

        encabezado.innerHTML = `
            <strong>Nombre</strong>
            <strong>Correo</strong>
            <strong>Rol</strong>
            <strong>Estado</strong>
        `;

        sociosLista.appendChild(encabezado);


        socios.forEach(
            function (socio) {

                const fila =
                    document.createElement("div");

                fila.className =
                    "socio-row";


                fila.innerHTML = `
                    <span>${socio.nombre || "Sin nombre"}</span>
                    <span>${socio.email || "Sin correo"}</span>
                    <span>${socio.rol || "SOCIO"}</span>
                    <span>${socio.estado || "ACTIVO"}</span>
                `;


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
// FORMATEAR DINERO
// ============================================================

function formatearDinero(valor) {

    const numero =
        Number(valor || 0);

    return (
        "$ " +
        numero.toFixed(2)
    );

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
        <p>Cargando información de aportes...</p>
    `;


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


    const pendientes =
        aportes.filter(
            function (aporte) {

                return aporte.estado === "PENDIENTE";

            }
        );


    const pagados =
        aportes.filter(
            function (aporte) {

                return aporte.estado === "PAGADO";

            }
        );


    const atrasados =
        aportes.filter(
            function (aporte) {

                return aporte.estado === "ATRASADO";

            }
        );


    let filas = "";


    aportes.forEach(
        function (aporte) {

            const nombre =
                aporte.socios &&
                aporte.socios.nombre
                    ? aporte.socios.nombre
                    : "Sin nombre";


            let claseEstado =
                "";


            if (aporte.estado === "PAGADO") {

                claseEstado =
                    "estado-pagado";

            } else if (aporte.estado === "ATRASADO") {

                claseEstado =
                    "estado-atrasado";

            } else {

                claseEstado =
                    "estado-pendiente";

            }


            filas += `

                <tr>

                    <td>
                        <strong>
                            ${nombre}
                        </strong>
                    </td>

                    <td>
                        ${formatearFecha(
                            aporte.fecha_vencimiento
                        )}
                    </td>

                    <td>
                        ${formatearDinero(
                            aporte.valor_aporte
                        )}
                    </td>

                    <td>
                        ${formatearDinero(
                            aporte.multa
                        )}
                    </td>

                    <td>
                        ${formatearDinero(
                            aporte.total_pagado
                        )}
                    </td>

                    <td>
                        ${formatearFecha(
                            aporte.fecha_pago
                        )}
                    </td>

                    <td>
                        <span class="${claseEstado}">
                            ${aporte.estado}
                        </span>
                    </td>

                </tr>

            `;

        }
    );


    moduloContenido.innerHTML = `

        <h2>💵 Aportes</h2>

        <p>
            Control de aportes mensuales y multas.
        </p>


        <div class="resumen-aportes">

            <div class="resumen-aporte">
                <strong>${aportes.length}</strong>
                <span>Total registros</span>
            </div>

            <div class="resumen-aporte">
                <strong>${pagados.length}</strong>
                <span>Pagados</span>
            </div>

            <div class="resumen-aporte">
                <strong>${pendientes.length}</strong>
                <span>Pendientes</span>
            </div>

            <div class="resumen-aporte">
                <strong>${atrasados.length}</strong>
                <span>Atrasados</span>
            </div>

        </div>


        <div class="modulo-info">

            <h3>
                Registro de aportes
            </h3>

            <div class="tabla-contenedor">

                <table class="tabla-aportes">

                    <thead>

                        <tr>

                            <th>Socio</th>

                            <th>Vencimiento</th>

                            <th>Aporte</th>

                            <th>Multa</th>

                            <th>Total pagado</th>

                            <th>Fecha pago</th>

                            <th>Estado</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${filas}

                    </tbody>

                </table>

            </div>

        </div>

    `;

}


// ============================================================
// ABRIR MÓDULO
// ============================================================

function abrirModulo(modulo) {

    sociosInicio.classList.add("hidden");

    moduloScreen.classList.remove("hidden");


    // ========================================================
    // SOCIOS
    // ========================================================

    if (modulo === "socios") {

        cargarSociosModulo();

        return;

    }


    // ========================================================
    // APORTES
    // ========================================================

    if (modulo === "aportes") {

        cargarAportes();

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
                    Próximamente
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
                    Próximamente
                </h3>

                <p>
                    Aquí construiremos el control
                    de ingresos y movimientos de caja.
                </p>

            </div>

        `;

        return;

    }

}


// ============================================================
// MÓDULO SOCIOS
// ============================================================

async function cargarSociosModulo() {

    moduloContenido.innerHTML = `

        <h2>👥 Socios</h2>

        <p>
            Administración de los socios de The Cow Money.
        </p>

        <div class="modulo-info">

            <h3>
                Socios registrados
            </h3>

            <p>
                Cargando socios...
            </p>

        </div>

    `;


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

        moduloContenido.innerHTML = `

            <h2>👥 Socios</h2>

            <div class="modulo-info">

                <h3>
                    Error
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

        return;

    }


    const socios =
        data || [];


    let filas = "";


    socios.forEach(
        function (socio) {

            filas += `

                <tr>

                    <td>
                        <strong>
                            ${socio.nombre || "Sin nombre"}
                        </strong>
                    </td>

                    <td>
                        ${socio.email || "Sin correo"}
                    </td>

                    <td>
                        ${socio.rol || "SOCIO"}
                    </td>

                    <td>
                        ${socio.estado || "ACTIVO"}
                    </td>

                </tr>

            `;

        }
    );


    moduloContenido.innerHTML = `

        <h2>👥 Socios</h2>

        <p>
            Administración de los socios de The Cow Money.
        </p>

        <div class="modulo-info">

            <h3>
                Socios registrados
            </h3>

            <p>
                ${socios.length} socios registrados
            </p>

            <div class="tabla-contenedor">

                <table class="tabla-aportes">

                    <thead>

                        <tr>

                            <th>Nombre</th>

                            <th>Correo</th>

                            <th>Rol</th>

                            <th>Estado</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${filas}

                    </tbody>

                </table>

            </div>

        </div>

    `;

}


// ============================================================
// CONFIGURAR MENÚ
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

            boton.addEventListener(
                "click",
                function () {

                    const modulo =
                        boton.getAttribute(
                            "data-modulo"
                        );


                    abrirModulo(modulo);

                }
            );

        }
    );

}


// ============================================================
// VOLVER AL PANEL
// ============================================================

if (volverPanel) {

    volverPanel.addEventListener(
        "click",
        function () {

            moduloScreen.classList.add(
                "hidden"
            );

            sociosInicio.classList.remove(
                "hidden"
            );

        }
    );

}


// ============================================================
// CARGAR DATOS INICIALES
// ============================================================

async function cargarDatosIniciales() {

    await cargarSocios();

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
