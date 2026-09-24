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

    if (moduloScreen) {
        moduloScreen.classList.add("hidden");
    }

    if (sociosInicio) {
        sociosInicio.classList.remove("hidden");
    }

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
// CARGAR SOCIOS PARA EL PANEL PRINCIPAL
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

            if (connectionStatus) {

                connectionStatus.textContent =
                    "Error al consultar los socios: " +
                    error.message;

            }

            return;

        }


        const socios =
            data || [];


        // ====================================================
        // CANTIDAD DE SOCIOS ACTIVOS
        // ====================================================

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


        // ====================================================
        // ESTADO DE CONEXIÓN
        // ====================================================

        if (connectionStatus) {

            connectionStatus.textContent =
                "Conexión correcta. Socios encontrados: " +
                socios.length;

        }


        // ====================================================
        // LISTA DE SOCIOS EN EL PANEL PRINCIPAL
        // ====================================================

        if (!sociosLista) {
            return;
        }


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

        if (connectionStatus) {

            connectionStatus.textContent =
                "Error inesperado al cargar socios.";

        }

    }

}


// ============================================================
// CARGAR SOCIOS DENTRO DEL MÓDULO SOCIOS
// ============================================================

async function cargarSociosModulo() {

    const lista =
        document.getElementById(
            "lista-socios-modulo"
        );


    if (!lista) {

        console.error(
            "No existe lista-socios-modulo"
        );

        return;

    }


    if (!supabaseClient) {

        lista.innerHTML = `
            <div class="modulo-info">
                ❌ No hay conexión con Supabase.
            </div>
        `;

        return;

    }


    lista.innerHTML = `
        <div class="modulo-info">
            Cargando socios desde Supabase...
        </div>
    `;


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
                "Error cargando socios del módulo:",
                error
            );


            lista.innerHTML = `
                <div class="modulo-info">
                    ❌ Error al cargar los socios:
                    ${error.message}
                </div>
            `;

            return;

        }


        const socios =
            data || [];


        if (socios.length === 0) {

            lista.innerHTML = `
                <div class="modulo-info">
                    No existen socios registrados.
                </div>
            `;

            return;

        }


        // ====================================================
        // ENCABEZADO
        // ====================================================

        const contenedor =
            document.createElement("div");

        contenedor.className =
            "tabla-contenedor";


        const titulo =
            document.createElement("p");

        titulo.innerHTML =
            `<strong>${socios.length}</strong> socios registrados`;

        contenedor.appendChild(titulo);


        // ====================================================
        // TABLA
        // ====================================================

        const tabla =
            document.createElement("table");

        tabla.className =
            "tabla-socios";


        const thead =
            document.createElement("thead");

        thead.innerHTML = `
            <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
            </tr>
        `;


        const tbody =
            document.createElement("tbody");


        // ====================================================
        // AGREGAR SOCIOS
        // ====================================================

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


        tabla.appendChild(thead);
        tabla.appendChild(tbody);

        contenedor.appendChild(tabla);

        lista.innerHTML = "";

        lista.appendChild(contenedor);


    } catch (error) {

        console.error(
            "Error inesperado:",
            error
        );


        lista.innerHTML = `
            <div class="modulo-info">
                ❌ Error inesperado al cargar los socios.
            </div>
        `;

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

async function abrirModulo(modulo) {

    console.log(
        "Abriendo módulo:",
        modulo
    );


    // ========================================================
    // OCULTAR PANEL INICIAL
    // ========================================================

    if (sociosInicio) {

        sociosInicio.classList.add(
            "hidden"
        );

    }


    // ========================================================
    // MOSTRAR PANTALLA DEL MÓDULO
    // ========================================================

    if (moduloScreen) {

        moduloScreen.classList.remove(
            "hidden"
        );

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

                <div id="lista-socios-modulo">
                    Cargando socios...
                </div>

            </div>

        `;


        await cargarSociosModulo();

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


                    abrirModulo(
                        modulo
                    );

                }
            );

        }
    );

}


// ============================================================
// BOTÓN VOLVER AL PANEL
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
    // CONFIGURAR BOTONES
    // --------------------------------------------------------

    configurarMenu();


    // --------------------------------------------------------
    // SI SUPABASE NO ESTÁ CONFIGURADO
    // --------------------------------------------------------

    if (!supabaseClient) {

        return;

    }


    // --------------------------------------------------------
    // COMPROBAR SESIÓN ACTUAL
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
