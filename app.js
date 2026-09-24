// ============================================================
// THE COW MONEY
// APP PRINCIPAL
// ============================================================

alert("ESTOY EJECUTANDO EL APP.JS NUEVO");


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
// OBTENER SOCIOS DESDE SUPABASE
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


    // Mostrar pantalla del módulo

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

                <h3>
                    Socios registrados
                </h3>

                <div id="lista-socios">
                    Cargando socios...
                </div>

            </div>

        `;


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
// MOSTRAR SOCIOS DENTRO DEL MÓDULO
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


    const socios =
        await obtenerSocios();


    if (socios.length === 0) {

        lista.innerHTML = `
            <p>
                No existen socios registrados.
            </p>
        `;

        return;

    }


    // ========================================================
    // CREAR TABLA
    // ========================================================

    const tabla =
        document.createElement("table");

    tabla.className =
        "tabla-socios";


    tabla.innerHTML = `

        <thead>

            <tr>

                <th>
                    Nombre
                </th>

                <th>
                    Correo
                </th>

                <th>
                    Rol
                </th>

                <th>
                    Estado
                </th>

            </tr>

        </thead>

        <tbody></tbody>

    `;


    const tbody =
        tabla.querySelector("tbody");


    // ========================================================
    // AGREGAR SOCIOS
    // ========================================================

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

            fila.appendChild(rol);

            fila.appendChild(estado);


            tbody.appendChild(fila);

        }
    );


    lista.innerHTML = "";

    lista.appendChild(tabla);

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

    console.log(
        "INICIANDO THE COW MONEY"
    );


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
