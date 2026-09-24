// ============================================================
// THE COW MONEY
// Aplicación principal
// ============================================================

// ------------------------------------------------------------
// ELEMENTOS DE LA PÁGINA
// ------------------------------------------------------------

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


// ------------------------------------------------------------
// SUPABASE
// ------------------------------------------------------------

let supabaseClient = null;


// ------------------------------------------------------------
// INICIALIZAR SUPABASE
// ------------------------------------------------------------

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


// ------------------------------------------------------------
// MOSTRAR PANTALLA PRINCIPAL
// ------------------------------------------------------------

function showMain(user) {

    loginScreen.classList.add("hidden");

    mainScreen.classList.remove("hidden");

    if (userName && user) {

        userName.textContent =
            user.email || "";

    }

}


// ------------------------------------------------------------
// MOSTRAR LOGIN
// ------------------------------------------------------------

function showLogin() {

    mainScreen.classList.add("hidden");

    loginScreen.classList.remove("hidden");

}


// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------

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


// ------------------------------------------------------------
// CERRAR SESIÓN
// ------------------------------------------------------------

logout.addEventListener(
    "click",
    async function () {

        if (supabaseClient) {

            await supabaseClient.auth.signOut();

        }

        showLogin();

    }
);


// ------------------------------------------------------------
// CARGAR SOCIOS
// ------------------------------------------------------------

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


        // --------------------------------------------
        // CANTIDAD DE SOCIOS
        // --------------------------------------------

        const sociosActivos =
            socios.filter(
                function (socio) {

                    return socio.estado === "ACTIVO";

                }
            );


        cantidadSocios.textContent =
            sociosActivos.length;


        // --------------------------------------------
        // ESTADO DE CONEXIÓN
        // --------------------------------------------

        connectionStatus.textContent =
            "Conexión correcta. Socios encontrados: " +
            socios.length;


        // --------------------------------------------
        // SI NO HAY SOCIOS
        // --------------------------------------------

        if (socios.length === 0) {

            sociosLista.innerHTML =
                "<p>No hay socios registrados.</p>";

            return;

        }


        // --------------------------------------------
        // MOSTRAR SOCIOS
        // --------------------------------------------

        sociosLista.innerHTML = "";


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


// ------------------------------------------------------------
// CARGAR DATOS INICIALES
// ------------------------------------------------------------

async function cargarDatosIniciales() {

    if (!supabaseClient) {

        return;

    }

    await cargarSocios();

}


// ------------------------------------------------------------
// MENÚ DE MÓDULOS
// ------------------------------------------------------------

menuCards.forEach(
    function (card) {

        card.addEventListener(
            "click",
            function () {

                const modulo =
                    card.dataset.modulo;

                abrirModulo(modulo);

            }
        );

    }
);


// ------------------------------------------------------------
// ABRIR MÓDULO
// ------------------------------------------------------------

function abrirModulo(modulo) {

    sociosInicio.classList.add("hidden");

    moduloScreen.classList.remove("hidden");


    // --------------------------------------------
    // SOCIOS
    // --------------------------------------------

    if (modulo === "socios") {

        moduloContenido.innerHTML = `

            <h2>👥 Socios</h2>

            <p>
                Aquí administraremos los socios
                de The Cow Money.
            </p>

            <div class="modulo-info">

                <h3>Socios registrados</h3>

                <p>
                    Los socios actualmente registrados
                    en Supabase aparecen aquí.
                </p>

            </div>

        `;

        return;

    }


    // --------------------------------------------
    // APORTES
    // --------------------------------------------

    if (modulo === "aportes") {

        moduloContenido.innerHTML = `

            <h2>💵 Aportes</h2>

            <p>
                Módulo de control de aportes mensuales.
            </p>

            <div class="modulo-info">

                <h3>Próximamente</h3>

                <p>
                    Aquí mostraremos los aportes,
                    multas, pagos y saldos.
                </p>

            </div>

        `;

        return;

    }


    // --------------------------------------------
    // PRÉSTAMOS
    // --------------------------------------------

    if (modulo === "prestamos") {

        moduloContenido.innerHTML = `

            <h2>🏦 Préstamos</h2>

            <p>
                Módulo de solicitudes y administración
                de préstamos.
            </p>

            <div class="modulo-info">

                <h3>Próximamente</h3>

                <p>
                    Aquí mostraremos solicitudes,
                    préstamos activos, cuotas y renovaciones.
                </p>

            </div>

        `;

        return;

    }


    // --------------------------------------------
    // CAJA
    // --------------------------------------------

    if (modulo === "caja") {

        moduloContenido.innerHTML = `

            <h2>📒 Caja</h2>

            <p>
                Control de movimientos de caja.
            </p>

            <div class="modulo-info">

                <h3>Próximamente</h3>

                <p>
                    Aquí mostraremos ingresos,
                    egresos y movimientos registrados.
                </p>

            </div>

        `;

        return;

    }

}


// ------------------------------------------------------------
// VOLVER AL PANEL
// ------------------------------------------------------------

volverPanel.addEventListener(
    "click",
    function () {

        moduloScreen.classList.add("hidden");

        sociosInicio.classList.remove("hidden");

    }
);


// ------------------------------------------------------------
// COMPROBAR SESIÓN AL ABRIR LA PÁGINA
// ------------------------------------------------------------

(async function () {

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
