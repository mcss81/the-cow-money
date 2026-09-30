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


        if (cantidadSocios) {

            cantidadSocios.textContent =
                sociosActivos.length;

        }


        connectionStatus.textContent =
            "Conexión correcta. Socios encontrados: " +
            socios.length;


        if (sociosLista) {

            sociosLista.innerHTML = "";

        }


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
            Cargando información de aportes...
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
        // CALCULAMOS RESUMEN
        // ====================================================

        const totalRegistros =
            aportes.length;


        const totalPagados =
            aportes.filter(
                function (aporte) {

                    return aporte.estado === "PAGADO";

                }
            ).length;


        const totalAtrasados =
            aportes.filter(
                function (aporte) {

                    return aporte.estado === "ATRASADO";

                }
            ).length;


        const totalPendientes =
            aportes.filter(
                function (aporte) {

                    return aporte.estado === "PENDIENTE";

                }
            ).length;


        const valorAportes =
            aportes.reduce(
                function (total, aporte) {

                    return total +
                        Number(
                            aporte.valor_aporte || 0
                        );

                },
                0
            );


        const totalMultas =
            aportes.reduce(
                function (total, aporte) {

                    return total +
                        Number(
                            aporte.multa || 0
                        );

                },
                0
            );


        const totalPagado =
            aportes.reduce(
                function (total, aporte) {

                    return total +
                        Number(
                            aporte.total_pagado || 0
                        );

                },
                0
            );


        // ====================================================
        // FORMATO MONEDA
        // ====================================================

        function dinero(valor) {

            return "$" +
                Number(valor || 0)
                    .toFixed(2);

        }


        // ====================================================
        // FORMATO FECHA
        // ====================================================

        function fecha(valor) {

            if (!valor) {

                return "-";

            }

            const partes =
                valor.split("-");

            if (partes.length !== 3) {

                return valor;

            }

            return (
                partes[2] +
                "/" +
                partes[1] +
                "/" +
                partes[0]
            );

        }


        // ====================================================
        // CREAR TABLA
        // ====================================================

        let filas = "";


        aportes.forEach(
            function (aporte) {

                const nombreSocio =
                    aporte.socios &&
                    aporte.socios.nombre
                        ? aporte.socios.nombre
                        : "Socio no encontrado";


                filas += `

                    <tr>

                        <td>
                            ${nombreSocio}
                        </td>

                        <td>
                            ${fecha(
                                aporte.fecha_vencimiento
                            )}
                        </td>

                        <td>
                            ${dinero(
                                aporte.valor_aporte
                            )}
                        </td>

                        <td>
                            ${dinero(
                                aporte.multa
                            )}
                        </td>

                        <td>
                            ${dinero(
                                aporte.total_pagado
                            )}
                        </td>

                        <td>
                            ${fecha(
                                aporte.fecha_pago
                            )}
                        </td>

                        <td>

                            <strong>
                                ${aporte.estado || "-"}
                            </strong>

                        </td>

                    </tr>

                `;

            }
        );


        // ====================================================
        // MOSTRAR PANTALLA
        // ====================================================

        moduloContenido.innerHTML = `

            <h2>💵 Aportes</h2>

            <p>
                Control de aportes mensuales y multas.
            </p>


            <div class="modulo-info">

                <h3>
                    Resumen de aportes
                </h3>


                <div class="resumen-aportes">

                    <div class="resumen-item">

                        <strong>
                            ${totalRegistros}
                        </strong>

                        <span>
                            Registros
                        </span>

                    </div>


                    <div class="resumen-item">

                        <strong>
                            ${totalPagados}
                        </strong>

                        <span>
                            Pagados
                        </span>

                    </div>


                    <div class="resumen-item">

                        <strong>
                            ${totalPendientes}
                        </strong>

                        <span>
                            Pendientes
                        </span>

                    </div>


                    <div class="resumen-item">

                        <strong>
                            ${totalAtrasados}
                        </strong>

                        <span>
                            Atrasados
                        </span>

                    </div>


                    <div class="resumen-item">

                        <strong>
                            ${dinero(
                                valorAportes
                            )}
                        </strong>

                        <span>
                            Valor aportes
                        </span>

                    </div>


                    <div class="resumen-item">

                        <strong>
                            ${dinero(
                                totalPagado
                            )}
                        </strong>

                        <span>
                            Total pagado
                        </span>

                    </div>


                    <div class="resumen-item">

                        <strong>
                            ${dinero(
                                totalMultas
                            )}
                        </strong>

                        <span>
                            Total multas
                        </span>

                    </div>

                </div>

            </div>


            <div class="modulo-info">

                <h3>
                    Detalle de aportes
                </h3>


                <div class="tabla-contenedor">

                    <table class="tabla-aportes">

                        <thead>

                            <tr>

                                <th>
                                    Socio
                                </th>

                                <th>
                                    Vencimiento
                                </th>

                                <th>
                                    Aporte
                                </th>

                                <th>
                                    Multa
                                </th>

                                <th>
                                    Total pagado
                                </th>

                                <th>
                                    Fecha pago
                                </th>

                                <th>
                                    Estado
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${filas}

                        </tbody>

                    </table>

                </div>

            </div>

        `;


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
                    No se pudieron cargar los aportes.
                </p>

            </div>

        `;

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
                Cargando socios...
            </h3>

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
                            ${socio.nombre || "-"}
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

                        <tbody>

                            ${filas}

                        </tbody>

                    </table>

                </div>

            </div>

        `;


    } catch (error) {

        console.error(
            "Error cargando módulo socios:",
            error
        );

    }

}


// ============================================================
// CONFIGURAR BOTONES
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
// BOTÓN VOLVER
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

    if (!supabaseClient) {

        return;

    }

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
