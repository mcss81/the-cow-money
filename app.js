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

const menuCards =
    document.querySelectorAll(".menu-card");


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


        // ----------------------------------------------------
        // CANTIDAD DE SOCIOS
        // ----------------------------------------------------

        const sociosActivos =
            socios.filter(
                function (socio) {

                    return socio.estado === "ACTIVO";

                }
            );


        cantidadSocios.textContent =
            sociosActivos.length;


        // ----------------------------------------------------
        // ESTADO DE CONEXIÓN
        // ----------------------------------------------------

        connectionStatus.textContent =
            "Conexión correcta. Socios encontrados: " +
            socios.length;


        // ----------------------------------------------------
        // LISTA DE SOCIOS
        // ----------------------------------------------------

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


    // Ocultar lista inicial de socios

    if (sociosInicio) {

        sociosInicio.classList.add("hidden");

    }


    // Mostrar pantalla del módulo

    if (moduloScreen) {

        moduloScreen.classList.remove("hidden");

    }


    // --------------------------------------------------------
    // SOCIOS
    // --------------------------------------------------------

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

                <p>
                    La información se está obteniendo
                    directamente desde Supabase.
                </p>

            </div>

        `;

        return;

    }


    // --------------------------------------------------------
    // APORTES
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // PRÉSTAMOS
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // CAJA
    // --------------------------------------------------------

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

    // Configuramos los botones
    // después de cargar todo el HTML.

    configurarMenu();


    // Si no existe Supabase,
    // no continuamos.

    if (!supabaseClient) {

        return;

    }


    // Comprobar sesión actual.

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
