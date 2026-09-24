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
// GUARDAR SOCIOS EN MEMORIA
// ============================================================

let sociosData = [];


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


        // ----------------------------------------------------
        // GUARDAR SOCIOS
        // ----------------------------------------------------

        sociosData = data || [];


        // ----------------------------------------------------
        // CANTIDAD DE SOCIOS ACTIVOS
        // ----------------------------------------------------

        const sociosActivos =
            sociosData.filter(
                function (socio) {

                    return socio.estado === "ACTIVO";

                }
            );


        if (cantidadSocios) {

            cantidadSocios.textContent =
                sociosActivos.length;

        }


        // ----------------------------------------------------
        // ESTADO DE CONEXIÓN
        // ----------------------------------------------------

        if (connectionStatus) {

            connectionStatus.textContent =
                "Conexión correcta. Socios encontrados: " +
                sociosData.length;

        }


        // ----------------------------------------------------
        // MOSTRAR SOCIOS EN EL PANEL PRINCIPAL
        // ----------------------------------------------------

        mostrarListaSocios(
            sociosLista,
            sociosData
        );


    } catch (error) {

        console.error(
            "Error inesperado:",
            error
        );

        if (connectionStatus) {

            connectionStatus.textContent =
                "Error inesperado al cargar socios.";

        }

    }

}


// ============================================================
// FUNCIÓN PARA MOSTRAR LISTA DE SOCIOS
// ============================================================

function mostrarListaSocios(contenedor, socios) {

    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = "";


    if (!socios || socios.length === 0) {

        contenedor.innerHTML =
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


            contenedor.appendChild(fila);

        }
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

function abrirModulo(modulo) {

    console.log(
        "Abriendo módulo:",
        modulo
    );


    // --------------------------------------------------------
    // OCULTAR PANEL PRINCIPAL
    // --------------------------------------------------------

    if (sociosInicio) {

        sociosInicio.classList.add("hidden");

    }


    // --------------------------------------------------------
    // MOSTRAR PANTALLA DEL MÓDULO
    // --------------------------------------------------------

    if (moduloScreen) {

        moduloScreen.classList.remove("hidden");

    }


    // ========================================================
    // MÓDULO SOCIOS
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
                    Socios activos:
                    <strong>
                        ${sociosData.filter(
                            socio => socio.estado === "ACTIVO"
                        ).length}
                    </strong>
                </p>

                <div class="socios-modulo-lista">

                    ${generarHTMLSocios(sociosData)}

                </div>

            </div>

        `;

        return;

    }


    // ========================================================
    // MÓDULO APORTES
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
    // MÓDULO PRÉSTAMOS
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
    // MÓDULO CAJA
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
// GENERAR HTML DE SOCIOS PARA EL MÓDULO
// ============================================================

function generarHTMLSocios(socios) {

    if (!socios || socios.length === 0) {

        return `
            <p>
                No hay socios registrados.
            </p>
        `;

    }


    let html = "";


    socios.forEach(
        function (socio) {

            html += `

                <div class="socio-row">

                    <strong>
                        ${escapeHTML(
                            socio.nombre || "Sin nombre"
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            socio.email || "Sin correo"
                        )}
                    </span>

                    <span>
                        ${escapeHTML(
                            socio.rol || "SOCIO"
                        )}
                    </span>

                    <span>
                        ${escapeHTML(
                            socio.estado || "ACTIVO"
                        )}
                    </span>

                </div>

            `;

        }
    );


    return html;

}


// ============================================================
// PROTEGER TEXTO HTML
// ============================================================

function escapeHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent =
        texto;

    return div.innerHTML;

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

            boton.addEventListener(
                "click",
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

            if (moduloScreen) {

                moduloScreen.classList.add(
                    "hidden"
                );

            }


            if (sociosInicio) {

                sociosInicio.classList.remove(
                    "hidden"
                );

            }

        }
    );

}


// ============================================================
// INICIAR APLICACIÓN
// ============================================================

(async function () {

    // --------------------------------------------------------
    // CONFIGURAR MENÚ
    // --------------------------------------------------------

    configurarMenu();


    // --------------------------------------------------------
    // VERIFICAR SUPABASE
    // --------------------------------------------------------

    if (!supabaseClient) {

        return;

    }


    // --------------------------------------------------------
    // COMPROBAR SESIÓN
    // --------------------------------------------------------

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
