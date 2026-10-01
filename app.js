// ============================================================
// THE COW MONEY
// APP PRINCIPAL
// ============================================================

// ============================================================
// SUPABASE
// ============================================================

const supabaseClient = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);


// ============================================================
// VARIABLES
// ============================================================

let usuarioActual = null;
let socios = [];
let aportes = [];

let mesAportesSeleccionado = obtenerMesActual();


// ============================================================
// ELEMENTOS
// ============================================================

const loginScreen =
  document.getElementById("login-screen");

const mainScreen =
  document.getElementById("main-screen");

const loginForm =
  document.getElementById("login-form");

const loginMessage =
  document.getElementById("login-message");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const logoutButton =
  document.getElementById("logout");

const userName =
  document.getElementById("user-name");

const cantidadSocios =
  document.getElementById("cantidad-socios");

const connectionStatus =
  document.getElementById("connection-status");

const sociosLista =
  document.getElementById("socios-lista");

const moduloScreen =
  document.getElementById("modulo-screen");

const moduloContenido =
  document.getElementById("modulo-contenido");

const volverPanel =
  document.getElementById("volver-panel");


// ============================================================
// INICIAR APLICACIÓN
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    configurarEventos();

    try {

      const {
        data,
        error
      } =
        await supabaseClient.auth.getSession();


      if (error) {

        console.error(
          "Error obteniendo sesión:",
          error
        );

        mostrarLogin();

        return;

      }


      if (data.session) {

        usuarioActual =
          data.session.user;

        await mostrarAplicacion();

      }

      else {

        mostrarLogin();

      }


    }

    catch (error) {

      console.error(
        "Error iniciando aplicación:",
        error
      );

      mostrarLogin();

    }

  }
);


// ============================================================
// CONFIGURAR EVENTOS
// ============================================================

function configurarEventos() {

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      iniciarSesion
    );

  }


  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      cerrarSesion
    );

  }


  document
    .querySelectorAll(".menu-card")
    .forEach(
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


  if (volverPanel) {

    volverPanel.addEventListener(
      "click",
      volverAlPanel
    );

  }

}


// ============================================================
// LOGIN
// ============================================================

async function iniciarSesion(event) {

  event.preventDefault();

  loginMessage.textContent =
    "Ingresando...";


  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;


  try {

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
        "Error: " +
        error.message;

      return;

    }


    usuarioActual =
      data.user;

    loginMessage.textContent =
      "";


    await mostrarAplicacion();

  }

  catch (error) {

    console.error(
      "Error en login:",
      error
    );

    loginMessage.textContent =
      "No se pudo iniciar sesión.";

  }

}


// ============================================================
// MOSTRAR APLICACIÓN
// ============================================================

async function mostrarAplicacion() {

  loginScreen.classList.add(
    "hidden"
  );

  mainScreen.classList.remove(
    "hidden"
  );


  if (usuarioActual) {

    userName.textContent =
      usuarioActual.email || "";

  }


  await cargarDatosIniciales();

}


// ============================================================
// MOSTRAR LOGIN
// ============================================================

function mostrarLogin() {

  loginScreen.classList.remove(
    "hidden"
  );

  mainScreen.classList.add(
    "hidden"
  );

}


// ============================================================
// CERRAR SESIÓN
// ============================================================

async function cerrarSesion() {

  try {

    await supabaseClient.auth.signOut();

  }

  catch (error) {

    console.error(
      "Error cerrando sesión:",
      error
    );

  }


  usuarioActual = null;

  mostrarLogin();

}


// ============================================================
// CARGAR DATOS INICIALES
// ============================================================

async function cargarDatosIniciales() {

  connectionStatus.textContent =
    "Conectando con Supabase...";


  try {

    await cargarSocios();

  }

  catch (error) {

    console.error(
      "ERROR REAL AL CARGAR SOCIOS:",
      error
    );

    connectionStatus.textContent =
      "Error al cargar socios: " +
      (
        error.message ||
        error
      );

    return;

  }


  try {

    await cargarAportes();

  }

  catch (error) {

    console.error(
      "ERROR AL CARGAR APORTES:",
      error
    );

    connectionStatus.textContent =
      "Socios cargados correctamente. " +
      "Error al cargar aportes: " +
      (
        error.message ||
        error
      );

    return;

  }


  connectionStatus.textContent =
    "Conexión correcta. Socios encontrados: " +
    socios.length;

}


// ============================================================
// CARGAR SOCIOS
// ============================================================

async function cargarSocios() {

  const resultado =
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


  const data =
    resultado.data;

  const error =
    resultado.error;


  if (error) {

    throw error;

  }


  socios =
    data || [];


  const activos =
    socios.filter(
      function (socio) {

        return socio.estado === "ACTIVO";

      }
    );


  if (cantidadSocios) {

    cantidadSocios.textContent =
      activos.length;

  }


  mostrarSociosInicio(
    activos
  );

}


// ============================================================
// MOSTRAR SOCIOS EN INICIO
// ============================================================

function mostrarSociosInicio(lista) {

  if (!sociosLista) {

    return;

  }


  if (!lista.length) {

    sociosLista.innerHTML =
      "<p>No hay socios registrados.</p>";

    return;

  }


  let html = `

    <div class="tabla-contenedor">

      <table>

        <thead>

          <tr>

            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>

          </tr>

        </thead>

        <tbody>

  `;


  lista.forEach(
    function (socio) {

      html += `

        <tr>

          <td>
            ${escapeHtml(
              socio.nombre ||
              "Sin nombre"
            )}
          </td>

          <td>
            ${
              socio.email
                ? escapeHtml(
                    socio.email
                  )
                : "Sin correo"
            }
          </td>

          <td>
            ${escapeHtml(
              socio.rol ||
              "SOCIO"
            )}
          </td>

          <td>
            ${escapeHtml(
              socio.estado ||
              ""
            )}
          </td>

        </tr>

      `;

    }
  );


  html += `

        </tbody>

      </table>

    </div>

  `;


  sociosLista.innerHTML =
    html;

}


// ============================================================
// CARGAR APORTES
// ============================================================

async function cargarAportes() {

  const resultado =
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
        observacion
      `)
      .order(
        "fecha_vencimiento",
        {
          ascending: false
        }
      );


  const data =
    resultado.data;

  const error =
    resultado.error;


  if (error) {

    throw error;

  }


  aportes =
    data || [];

}


// ============================================================
// ABRIR MÓDULO
// ============================================================

async function abrirModulo(modulo) {

  moduloScreen.classList.remove(
    "hidden"
  );


  moduloContenido.innerHTML =
    "<p>Cargando...</p>";


  try {

    if (modulo === "socios") {

      if (!socios.length) {

        await cargarSocios();

      }

      mostrarModuloSocios();

      return;

    }


    if (modulo === "aportes") {

      await cargarAportes();

      mostrarModuloAportes();

      return;

    }


    if (modulo === "prestamos") {

      mostrarModuloPrestamos();

      return;

    }


    if (modulo === "caja") {

      mostrarModuloCaja();

      return;

    }

  }

  catch (error) {

    console.error(
      "Error abriendo módulo:",
      error
    );


    moduloContenido.innerHTML = `

      <div class="panel">

        <h3>
          ⚠️ Error
        </h3>

        <p>
          ${escapeHtml(
            error.message ||
            "Error desconocido"
          )}
        </p>

      </div>

    `;

  }

}


// ============================================================
// VOLVER AL PANEL
// ============================================================

function volverAlPanel() {

  moduloScreen.classList.add(
    "hidden"
  );

  moduloContenido.innerHTML =
    "";

}


// ============================================================
// MÓDULO SOCIOS
// ============================================================

function mostrarModuloSocios() {

  const activos =
    socios.filter(
      function (socio) {

        return socio.estado === "ACTIVO";

      }
    );


  let html = `

    <div class="modulo-header">

      <h2>
        👥 Socios
      </h2>

      <p>
        Administración de los socios
        de The Cow Money.
      </p>

    </div>


    <div class="panel">

      <h3>
        Socios registrados
      </h3>

      <p>

        <strong>
          ${activos.length}
        </strong>

        socios activos

      </p>


      <div class="tabla-contenedor">

        <table>

          <thead>

            <tr>

              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>

            </tr>

          </thead>

          <tbody>

  `;


  activos.forEach(
    function (socio) {

      html += `

        <tr>

          <td>
            ${escapeHtml(
              socio.nombre ||
              "Sin nombre"
            )}
          </td>

          <td>
            ${
              socio.email
                ? escapeHtml(
                    socio.email
                  )
                : "Sin correo"
            }
          </td>

          <td>
            ${escapeHtml(
              socio.rol ||
              "SOCIO"
            )}
          </td>

          <td>
            ${escapeHtml(
              socio.estado ||
              ""
            )}
          </td>

        </tr>

      `;

    }
  );


  html += `

          </tbody>

        </table>

      </div>

    </div>

  `;


  moduloContenido.innerHTML =
    html;

}


// ============================================================
// MÓDULO APORTES
// ============================================================

function mostrarModuloAportes() {

  const resumen =
    calcularResumenAportes(
      obtenerAportesDelMes()
    );


  const html = `

    <div class="modulo-header">

      <h2>
        💵 Aportes
      </h2>

      <p>
        Control de aportes mensuales y multas.
      </p>

    </div>


    <div class="resumen-aportes">

      <div class="resumen-card">

        <strong>
          ${resumen.total}
        </strong>

        <span>
          Total registros
        </span>

      </div>


      <div class="resumen-card">

        <strong>
          ${resumen.pagados}
        </strong>

        <span>
          Pagados
        </span>

      </div>


      <div class="resumen-card">

        <strong>
          ${resumen.pendientes}
        </strong>

        <span>
          Pendientes
        </span>

      </div>


      <div class="resumen-card">

        <strong>
          ${resumen.atrasados}
        </strong>

        <span>
          Atrasados
        </span>

      </div>


      <div class="resumen-card">

        <strong>
          $ ${resumen.multas.toFixed(2)}
        </strong>

        <span>
          Multas
        </span>

      </div>


      <div class="resumen-card">

        <strong>
          $ ${resumen.pendiente.toFixed(2)}
        </strong>

        <span>
          Total pendiente
        </span>

      </div>

    </div>


    <div class="panel">

      <h3>
        Registrar pago
      </h3>

      <p>
        Selecciona el socio, el aporte
        y la fecha real en que realizó
        el pago.
      </p>


      <div class="form-grid">

        <div>

          <label>
            Socio
          </label>

          <select id="pago-socio">

            <option value="">
              Seleccionar socio
            </option>

            ${socios
              .filter(
                function (s) {

                  return s.estado === "ACTIVO";

                }
              )
              .sort(
                function (a, b) {

                  return a.nombre.localeCompare(
                    b.nombre
                  );

                }
              )
              .map(
                function (s) {

                  return `

                    <option
                      value="${s.id}"
                    >
                      ${escapeHtml(
                        s.nombre
                      )}
                    </option>

                  `;

                }
              )
              .join("")}

          </select>

        </div>


        <div>

          <label>
            Aporte
          </label>

          <select id="pago-aporte">

            <option value="">
              Primero selecciona un socio
            </option>

          </select>

        </div>


        <div>

          <label>
            Fecha de pago
          </label>

          <input
            id="pago-fecha"
            type="date"
            value="${obtenerFechaLocal()}"
          />

        </div>

      </div>


      <div
        id="calculo-pago"
        class="calculo-pago"
      >

        Selecciona un aporte
        para calcular el pago.

      </div>


      <button
        id="btn-registrar-pago"
        class="primary"
        type="button"
      >

        Registrar pago

      </button>


      <p
        id="mensaje-pago"
        class="message"
      ></p>

    </div>


    <div class="panel">

      <div class="registro-header">

        <div>

          <h3>
            Registro de aportes
          </h3>

          <p>
            Consulta los aportes por mes.
          </p>

        </div>


        <div class="filtros-aportes">

          <div>

            <label>
              Mes
            </label>

            <input
              id="filtro-mes-aportes"
              type="month"
              value="${mesAportesSeleccionado}"
            />

          </div>


          <button
            id="btn-exportar-excel"
            class="secondary"
            type="button"
          >
            📊 Exportar Excel
          </button>

        </div>

      </div>


      <div
        id="tabla-aportes-mes"
      >

        ${generarTablaAportesMes()}

      </div>

    </div>

  `;


  moduloContenido.innerHTML =
    html;


  configurarFormularioPago();

  configurarFiltroMes();

}


// ============================================================
// CONFIGURAR FILTRO DE MES
// ============================================================

function configurarFiltroMes() {

  const filtro =
    document.getElementById(
      "filtro-mes-aportes"
    );


  const botonExcel =
    document.getElementById(
      "btn-exportar-excel"
    );


  if (filtro) {

    filtro.addEventListener(
      "change",
      function () {

        mesAportesSeleccionado =
          filtro.value ||
          obtenerMesActual();


        actualizarVistaAportesMes();

      }
    );

  }


  if (botonExcel) {

    botonExcel.addEventListener(
      "click",
      exportarAportesExcel
    );

  }

}


// ============================================================
// ACTUALIZAR VISTA DEL MES
// ============================================================

function actualizarVistaAportesMes() {

  const contenedor =
    document.getElementById(
      "tabla-aportes-mes"
    );


  if (!contenedor) {

    return;

  }


  const aportesMes =
    obtenerAportesDelMes();


  const resumen =
    calcularResumenAportes(
      aportesMes
    );


  contenedor.innerHTML =
    generarTablaAportesMes();


  const tarjetas =
    document.querySelectorAll(
      ".resumen-aportes .resumen-card strong"
    );


  if (tarjetas.length >= 6) {

    tarjetas[0].textContent =
      resumen.total;

    tarjetas[1].textContent =
      resumen.pagados;

    tarjetas[2].textContent =
      resumen.pendientes;

    tarjetas[3].textContent =
      resumen.atrasados;

    tarjetas[4].textContent =
      "$ " +
      resumen.multas.toFixed(2);

    tarjetas[5].textContent =
      "$ " +
      resumen.pendiente.toFixed(2);

  }

}


// ============================================================
// OBTENER APORTES DEL MES
// ============================================================

function obtenerAportesDelMes() {

  if (!mesAportesSeleccionado) {

    return aportes;

  }


  return aportes.filter(
    function (aporte) {

      if (!aporte.fecha_vencimiento) {

        return false;

      }


      return (
        aporte.fecha_vencimiento.substring(
          0,
          7
        ) ===
        mesAportesSeleccionado
      );

    }
  );

}


// ============================================================
// GENERAR TABLA DEL MES
// ============================================================

function generarTablaAportesMes() {

  const aportesMes =
    obtenerAportesDelMes();


  if (!aportesMes.length) {

    return `

      <div class="tabla-contenedor">

        <table>

          <thead>

            <tr>

              <th>Socio</th>
              <th>Vencimiento</th>
              <th>Aporte</th>
              <th>Multa</th>
              <th>Total pagado</th>
              <th>Fecha pago</th>
              <th>Estado</th>
              <th>Observación</th>

            </tr>

          </thead>

          <tbody>

            <tr>

              <td colspan="8">

                No hay aportes registrados
                para este mes.

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    `;

  }


  return `

    <div class="tabla-contenedor">

      <table>

        <thead>

          <tr>

            <th>Socio</th>
            <th>Vencimiento</th>
            <th>Aporte</th>
            <th>Multa</th>
            <th>Total pagado</th>
            <th>Fecha pago</th>
            <th>Estado</th>
            <th>Observación</th>
            <th>Acción</th>

          </tr>

        </thead>

        <tbody>

          ${aportesMes
            .map(
              function (aporte) {

                const socio =
                  socios.find(
                    function (s) {

                      return (
                        s.id ===
                        aporte.socio_id
                      );

                    }
                  );


                const nombre =
                  socio
                    ? socio.nombre
                    : "Socio desconocido";


                return `

                  <tr>

                    <td>
                      ${escapeHtml(
                        nombre
                      )}
                    </td>

                    <td>
                      ${formatearFecha(
                        aporte.fecha_vencimiento
                      )}
                    </td>

                    <td>
                      $ ${Number(
                        aporte.valor_aporte ||
                        0
                      ).toFixed(2)}
                    </td>

                    <td>
                      $ ${Number(
                        aporte.multa ||
                        0
                      ).toFixed(2)}
                    </td>

                    <td>
                      $ ${Number(
                        aporte.total_pagado ||
                        0
                      ).toFixed(2)}
                    </td>

                    <td>
                      ${
                        aporte.fecha_pago
                          ? formatearFecha(
                              aporte.fecha_pago
                            )
                          : "-"
                      }
                    </td>

                    <td>
                      ${escapeHtml(
                        aporte.estado ||
                        ""
                      )}
                    </td>

                    <td>
                      ${escapeHtml(
                        aporte.observacion ||
                        ""
                      )}
                    </td>

                    <td>

                      <button
                        type="button"
                        class="secondary"
                        onclick="editarAporte('${aporte.id}')"
                      >
                        ✏️ Editar
                      </button>

                    </td>

                  </tr>

                `;

              }
            )
            .join("")}

        </tbody>

      </table>

    </div>

  `;

}


// ============================================================
// RESUMEN APORTES
// ============================================================

function calcularResumenAportes(lista) {

  let pagados = 0;

  let pendientes = 0;

  let atrasados = 0;

  let multas = 0;

  let pendiente = 0;


  lista.forEach(
    function (aporte) {

      const valor =
        Number(
          aporte.valor_aporte ||
          0
        );


      const multa =
        Number(
          aporte.multa ||
          0
        );


      if (
        aporte.estado ===
        "PAGADO"
      ) {

        pagados++;

      }

      else if (
        aporte.estado ===
        "ATRASADO"
      ) {

        atrasados++;

        pendiente +=
          valor +
          multa;

      }

      else {

        pendientes++;

        pendiente +=
          valor +
          multa;

      }


      multas +=
        multa;

    }
  );


  return {

    total:
      lista.length,

    pagados:
      pagados,

    pendientes:
      pendientes,

    atrasados:
      atrasados,

    multas:
      multas,

    pendiente:
      pendiente

  };

}


// ============================================================
// EDITAR APORTE
// ============================================================

async function editarAporte(
  aporteId
) {

  const aporte =
    aportes.find(
      function (a) {

        return a.id ===
          aporteId;

      }
    );


  if (!aporte) {

    alert(
      "No se encontró el aporte."
    );

    return;

  }


  const fechaPagoActual =
    aporte.fecha_pago ||
    "";


  const fechaPago =
    prompt(
      "Fecha real de pago (AAAA-MM-DD):",
      fechaPagoActual
    );


  if (fechaPago === null) {

    return;

  }


  const estado =
    prompt(
      "Estado: PAGADO, PENDIENTE o ATRASADO",
      aporte.estado ||
      "PAGADO"
    );


  if (estado === null) {

    return;

  }


  const observacion =
    prompt(
      "Observación:",
      aporte.observacion ||
      ""
    );


  if (observacion === null) {

    return;

  }


  let multa =
    Number(
      aporte.multa ||
      0
    );


  let total =
    Number(
      aporte.total_pagado ||
      0
    );


  if (
    fechaPago &&
    estado.toUpperCase() ===
    "PAGADO"
  ) {

    const calculo =
      calcularMulta(
        aporte.fecha_vencimiento,
        fechaPago
      );


    multa =
      calculo.multa;


    total =
      Number(
        aporte.valor_aporte ||
        0
      ) +
      multa;

  }


  try {

    const {
      error
    } =
      await supabaseClient
        .from("aportes")
        .update({

          fecha_pago:
            fechaPago ||
            null,

          estado:
            estado.toUpperCase(),

          multa:
            multa,

          total_pagado:
            total,

          observacion:
            observacion ||
            null

        })
        .eq(
          "id",
          aporteId
        );


    if (error) {

      throw error;

    }


    await cargarAportes();

    mostrarModuloAportes();

  }

  catch (error) {

    console.error(
      "Error editando aporte:",
      error
    );


    alert(
      "No se pudo editar el aporte:\n" +
      error.message
    );

  }

}


// ============================================================
// FORMULARIO DE PAGO
// ============================================================

function configurarFormularioPago() {

  const socioSelect =
    document.getElementById(
      "pago-socio"
    );

  const aporteSelect =
    document.getElementById(
      "pago-aporte"
    );

  const fechaInput =
    document.getElementById(
      "pago-fecha"
    );

  const calcularDiv =
    document.getElementById(
      "calculo-pago"
    );

  const boton =
    document.getElementById(
      "btn-registrar-pago"
    );

  const mensaje =
    document.getElementById(
      "mensaje-pago"
    );


  if (
    !socioSelect ||
    !aporteSelect ||
    !fechaInput ||
    !boton
  ) {

    return;

  }


  socioSelect.addEventListener(
    "change",
    function () {

      cargarAportesSocio(
        socioSelect.value,
        aporteSelect
      );


      calcularDiv.innerHTML =
        "Selecciona un aporte.";

    }
  );


  function actualizarCalculo() {

    const aporteId =
      aporteSelect.value;

    const fechaPago =
      fechaInput.value;


    if (
      !aporteId ||
      !fechaPago
    ) {

      calcularDiv.innerHTML =
        "Selecciona un aporte y una fecha de pago.";

      return;

    }


    const aporte =
      aportes.find(
        function (a) {

          return a.id ===
            aporteId;

        }
      );


    if (!aporte) {

      return;

    }


    const calculo =
      calcularMulta(
        aporte.fecha_vencimiento,
        fechaPago
      );


    calcularDiv.innerHTML = `

      <strong>
        Cálculo del pago
      </strong>

      <br><br>

      Vencimiento:
      <strong>
        ${formatearFecha(
          aporte.fecha_vencimiento
        )}
      </strong>

      <br>

      Fecha de pago:
      <strong>
        ${formatearFecha(
          fechaPago
        )}
      </strong>

      <br>

      Días de atraso:
      <strong>
        ${calculo.diasAtraso}
      </strong>

      <br>

      Multa:
      <strong>
        $ ${calculo.multa.toFixed(2)}
      </strong>

      <br>

      Total:
      <strong>
        $ ${(
          Number(
            aporte.valor_aporte ||
            0
          ) +
          calculo.multa
        ).toFixed(2)}
      </strong>

    `;

  }


  aporteSelect.addEventListener(
    "change",
    actualizarCalculo
  );


  fechaInput.addEventListener(
    "change",
    actualizarCalculo
  );


  boton.addEventListener(
    "click",
    async function () {

      mensaje.textContent =
        "";


      const socioId =
        socioSelect.value;

      const aporteId =
        aporteSelect.value;

      const fechaPago =
        fechaInput.value;


      if (!socioId) {

        mensaje.textContent =
          "Selecciona un socio.";

        return;

      }


      if (!aporteId) {

        mensaje.textContent =
          "Selecciona un aporte.";

        return;

      }


      if (!fechaPago) {

        mensaje.textContent =
          "Selecciona la fecha de pago.";

        return;

      }


      const aporte =
        aportes.find(
          function (a) {

            return a.id ===
              aporteId;

          }
        );


      if (!aporte) {

        mensaje.textContent =
          "No se encontró el aporte.";

        return;

      }


      const calculo =
        calcularMulta(
          aporte.fecha_vencimiento,
          fechaPago
        );


      const total =
        Number(
          aporte.valor_aporte ||
          0
        ) +
        calculo.multa;


      boton.disabled =
        true;

      boton.textContent =
        "Registrando...";


      try {

        const {
          error
        } =
          await supabaseClient
            .from("aportes")
            .update({

              fecha_pago:
                fechaPago,

              estado:
                "PAGADO",

              multa:
                calculo.multa,

              total_pagado:
                total

            })
            .eq(
              "id",
              aporteId
            );


        if (error) {

          throw error;

        }


        mensaje.textContent =
          "Pago registrado correctamente.";


        await cargarAportes();

        mostrarModuloAportes();

      }

      catch (error) {

        console.error(
          "Error registrando pago:",
          error
        );


        mensaje.textContent =
          "Error al registrar el pago: " +
          error.message;

      }


      boton.disabled =
        false;

      boton.textContent =
        "Registrar pago";

    }
  );

}


// ============================================================
// CARGAR APORTES DEL SOCIO
// ============================================================

function cargarAportesSocio(
  socioId,
  select
) {

  if (!socioId) {

    select.innerHTML = `

      <option value="">
        Primero selecciona un socio
      </option>

    `;

    return;

  }


  const disponibles =
    aportes.filter(
      function (aporte) {

        return (
          aporte.socio_id ===
          socioId &&
          aporte.estado !==
          "PAGADO"
        );

      }
    );


  if (!disponibles.length) {

    select.innerHTML = `

      <option value="">
        No tiene aportes pendientes
      </option>

    `;

    return;

  }


  select.innerHTML = `

    <option value="">
      Seleccionar aporte
    </option>

    ${
      disponibles
        .map(
          function (aporte) {

            return `

              <option
                value="${aporte.id}"
              >

                ${formatearFecha(
                  aporte.fecha_vencimiento
                )}

                -
                $

                ${Number(
                  aporte.valor_aporte ||
                  0
                ).toFixed(2)}

              </option>

            `;

          }
        )
        .join("")
    }

  `;

}


// ============================================================
// CALCULAR MULTA
// ============================================================

function calcularMulta(
  fechaVencimiento,
  fechaPago
) {

  const vencimiento =
    convertirFechaUTC(
      fechaVencimiento
    );


  const pago =
    convertirFechaUTC(
      fechaPago
    );


  const diferencia =
    pago.getTime() -
    vencimiento.getTime();


  const diasAtraso =
    Math.max(
      0,
      Math.floor(
        diferencia /
        (
          1000 *
          60 *
          60 *
          24
        )
      )
    );


  let multa = 0;


  if (diasAtraso <= 0) {

    multa = 0;

  }

  else if (diasAtraso <= 7) {

    multa = 4;

  }

  else if (diasAtraso <= 14) {

    multa = 5;

  }

  else if (diasAtraso <= 21) {

    multa = 6;

  }

  else {

    multa = 7;

  }


  return {

    diasAtraso:
      diasAtraso,

    multa:
      multa

  };

}


// ============================================================
// EXPORTAR APORTES A EXCEL
// ============================================================
//
// IMPORTANTE:
//
// Esta función exporta TODOS los aportes disponibles,
// no solamente el mes seleccionado.
//
// El Excel será un XLSX real.
//
// Además:
// - Todos los socios aparecen.
// - Los aportes quedan separados por columnas.
// - Se agrega filtro automático.
// - Se congela la fila de encabezados.
// - Se agregan formatos de moneda.
// - Se agregan dos hojas:
//      1. Aportes
//      2. Socios
//
// ============================================================

async function exportarAportesExcel() {

  try {

    if (
      typeof XLSX ===
      "undefined"
    ) {

      alert(
        "La librería de Excel no está cargada.\n\n" +
        "Verifica que el HTML tenga incluida la librería XLSX."
      );

      return;

    }


    // ========================================================
    // ASEGURAR DATOS ACTUALIZADOS
    // ========================================================

    await cargarSocios();

    await cargarAportes();


    // ========================================================
    // CREAR FILAS DEL EXCEL
    // ========================================================

    const filas = [];


    // Todos los socios activos
    const sociosActivos =
      socios
        .filter(
          function (socio) {

            return socio.estado ===
              "ACTIVO";

          }
        )
        .sort(
          function (a, b) {

            return a.nombre.localeCompare(
              b.nombre
            );

          }
        );


    // ========================================================
    // CREAR UNA FILA POR CADA APORTE
    // ========================================================

    sociosActivos.forEach(
      function (socio) {

        const registros =
          aportes.filter(
            function (aporte) {

              return (
                aporte.socio_id ===
                socio.id
              );

            }
          );


        // ----------------------------------------------------
        // SI EL SOCIO NO TIENE NINGÚN APORTE
        // ----------------------------------------------------

        if (!registros.length) {

          filas.push({

            "Socio":
              socio.nombre ||
              "",

            "Vencimiento":
              "",

            "Aporte":
              0,

            "Multa":
              0,

            "Total Pagado":
              0,

            "Fecha Pago":
              "",

            "Estado":
              "SIN REGISTRO",

            "Observación":
              ""

          });

          return;

        }


        // ----------------------------------------------------
        // CREAR FILA POR CADA APORTE
        // ----------------------------------------------------

        registros.forEach(
          function (aporte) {

            filas.push({

              "Socio":
                socio.nombre ||
                "",

              "Vencimiento":
                aporte.fecha_vencimiento
                  ? formatearFecha(
                      aporte.fecha_vencimiento
                    )
                  : "",

              "Aporte":
                Number(
                  aporte.valor_aporte ||
                  0
                ),

              "Multa":
                Number(
                  aporte.multa ||
                  0
                ),

              "Total Pagado":
                Number(
                  aporte.total_pagado ||
                  0
                ),

              "Fecha Pago":
                aporte.fecha_pago
                  ? formatearFecha(
                      aporte.fecha_pago
                    )
                  : "",

              "Estado":
                aporte.estado ||
                "",

              "Observación":
                aporte.observacion ||
                ""

            });

          }
        );

      }
    );


    // ========================================================
    // CREAR HOJA APORTES
    // ========================================================

    const worksheet =
      XLSX.utils.json_to_sheet(
        filas
      );


    // ========================================================
    // ANCHOS DE COLUMNAS
    // ========================================================

    worksheet["!cols"] = [

      {
        wch: 22
      },

      {
        wch: 16
      },

      {
        wch: 13
      },

      {
        wch: 13
      },

      {
        wch: 16
      },

      {
        wch: 16
      },

      {
        wch: 18
      },

      {
        wch: 35
      }

    ];


    // ========================================================
    // FORMATO DE MONEDA
    // ========================================================

    const rango =
      XLSX.utils.decode_range(
        worksheet["!ref"]
      );


    for (
      let fila = 1;
      fila <= rango.e.r;
      fila++
    ) {

      // Columna C = Aporte
      const celdaAporte =
        worksheet[
          XLSX.utils.encode_cell({
            r: fila,
            c: 2
          })
        ];


      if (celdaAporte) {

        celdaAporte.z =
          '$#,##0.00';

      }


      // Columna D = Multa
      const celdaMulta =
        worksheet[
          XLSX.utils.encode_cell({
            r: fila,
            c: 3
          })
        ];


      if (celdaMulta) {

        celdaMulta.z =
          '$#,##0.00';

      }


      // Columna E = Total Pagado
      const celdaTotal =
        worksheet[
          XLSX.utils.encode_cell({
            r: fila,
            c: 4
          })
        ];


      if (celdaTotal) {

        celdaTotal.z =
          '$#,##0.00';

      }

    }


    // ========================================================
    // ACTIVAR FILTRO EN EXCEL
    // ========================================================

    if (worksheet["!ref"]) {

      worksheet["!autofilter"] = {

        ref:
          worksheet["!ref"]

      };

    }


    // ========================================================
    // CONGELAR ENCABEZADOS
    // ========================================================

    worksheet["!freeze"] = {

      xSplit: 0,

      ySplit: 1

    };


    // ========================================================
    // CREAR HOJA DE SOCIOS
    // ========================================================

    const filasSocios =
      sociosActivos.map(
        function (socio) {

          return {

            "Socio":
              socio.nombre ||
              "",

            "Correo":
              socio.email ||
              "",

            "Rol":
              socio.rol ||
              "SOCIO",

            "Estado":
              socio.estado ||
              ""

          };

        }
      );


    const worksheetSocios =
      XLSX.utils.json_to_sheet(
        filasSocios
      );


    worksheetSocios["!cols"] = [

      {
        wch: 25
      },

      {
        wch: 35
      },

      {
        wch: 15
      },

      {
        wch: 15
      }

    ];


    if (worksheetSocios["!ref"]) {

      worksheetSocios["!autofilter"] = {

        ref:
          worksheetSocios["!ref"]

      };

    }


    worksheetSocios["!freeze"] = {

      xSplit: 0,

      ySplit: 1

    };


    // ========================================================
    // CREAR LIBRO EXCEL
    // ========================================================

    const workbook =
      XLSX.utils.book_new();


    // Hoja principal
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Aportes"
    );


    // Hoja de socios
    XLSX.utils.book_append_sheet(
      workbook,
      worksheetSocios,
      "Socios"
    );


    // ========================================================
    // NOMBRE DEL ARCHIVO
    // ========================================================

    const fechaArchivo =
      obtenerFechaLocal();


    const nombreArchivo =
      "The_Cow_Money_Aportes_" +
      fechaArchivo +
      ".xlsx";


    // ========================================================
    // DESCARGAR EXCEL
    // ========================================================

    XLSX.writeFile(
      workbook,
      nombreArchivo
    );


  }

  catch (error) {

    console.error(
      "Error exportando Excel:",
      error
    );


    alert(
      "No se pudo generar el Excel:\n\n" +
      error.message
    );

  }

}


// ============================================================
// PRÉSTAMOS
// ============================================================

function mostrarModuloPrestamos() {

  moduloContenido.innerHTML = `

    <div class="modulo-header">

      <h2>
        🏦 Préstamos
      </h2>

      <p>
        Solicitudes, cuotas y renovaciones.
      </p>

    </div>


    <div class="panel">

      <h3>
        Módulo de préstamos
      </h3>

      <p>
        Aquí construiremos el control de
        préstamos, intereses, pagos y vencimientos.
      </p>

    </div>

  `;

}


// ============================================================
// CAJA
// ============================================================

function mostrarModuloCaja() {

  moduloContenido.innerHTML = `

    <div class="modulo-header">

      <h2>
        📒 Caja
      </h2>

      <p>
        Ingresos y movimientos.
      </p>

    </div>


    <div class="panel">

      <h3>
        Módulo de caja
      </h3>

      <p>
        Aquí construiremos el control de
        ingresos, egresos y saldo disponible.
      </p>

    </div>

  `;

}


// ============================================================
// OBTENER MES ACTUAL
// ============================================================

function obtenerMesActual() {

  const ahora =
    new Date();


  const year =
    ahora.getFullYear();


  const month =
    String(
      ahora.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  return (
    year +
    "-" +
    month
  );

}


// ============================================================
// FECHA LOCAL
// ============================================================

function obtenerFechaLocal() {

  const ahora =
    new Date();


  const year =
    ahora.getFullYear();


  const month =
    String(
      ahora.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      ahora.getDate()
    ).padStart(
      2,
      "0"
    );


  return (
    year +
    "-" +
    month +
    "-" +
    day
  );

}


// ============================================================
// CONVERTIR FECHA A UTC
// ============================================================

function convertirFechaUTC(
  fecha
) {

  const partes =
    fecha.split("-");


  return new Date(
    Date.UTC(

      Number(
        partes[0]
      ),

      Number(
        partes[1]
      ) - 1,

      Number(
        partes[2]
      )

    )
  );

}


// ============================================================
// FORMATEAR FECHA
// ============================================================

function formatearFecha(
  fecha
) {

  if (!fecha) {

    return "-";

  }


  const partes =
    fecha.split("-");


  if (
    partes.length !== 3
  ) {

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
// SEGURIDAD HTML
// ============================================================

function escapeHtml(
  texto
) {

  if (
    texto === null ||
    texto === undefined
  ) {

    return "";

  }


  return String(texto)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}
