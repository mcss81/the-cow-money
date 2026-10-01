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

// ID del aporte que estamos editando
let aporteEditandoId = null;


// ============================================================
// ELEMENTOS
// ============================================================

const loginScreen = document.getElementById("login-screen");
const mainScreen = document.getElementById("main-screen");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const logoutButton = document.getElementById("logout");

const userName = document.getElementById("user-name");

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

document.addEventListener("DOMContentLoaded", async function () {

  configurarEventos();

  try {

    const {
      data,
      error
    } = await supabaseClient.auth.getSession();

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

    } else {

      mostrarLogin();

    }

  } catch (error) {

    console.error(
      "Error iniciando aplicación:",
      error
    );

    mostrarLogin();

  }

});


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
    .forEach(function (boton) {

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

    });


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
        "Error: " + error.message;

      return;

    }


    usuarioActual =
      data.user;

    loginMessage.textContent = "";


    await mostrarAplicacion();


  } catch (error) {

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

  loginScreen.classList.add("hidden");

  mainScreen.classList.remove("hidden");


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

  } catch (error) {

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

  } catch (error) {

    console.error(
      "ERROR REAL AL CARGAR SOCIOS:",
      error
    );

    connectionStatus.textContent =
      "Error al cargar socios: " +
      (error.message || error);

    return;

  }


  try {

    await cargarAportes();

  } catch (error) {

    console.error(
      "ERROR AL CARGAR APORTES:",
      error
    );

    connectionStatus.textContent =
      "Socios cargados correctamente. " +
      "Error al cargar aportes: " +
      (error.message || error);

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
    socios.filter(function (socio) {

      return socio.estado === "ACTIVO";

    });


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


  lista.forEach(function (socio) {

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

  });


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

  } catch (error) {

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
    socios.filter(function (socio) {

      return socio.estado === "ACTIVO";

    });


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

  `;


  activos.forEach(function (socio) {

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

  });


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

  // Al abrir el módulo comenzamos mostrando todos
  aporteEditandoId = null;


  const resumen =
    calcularResumenAportes(aportes);


  const html = `

    <div class="modulo-header">

      <h2>
        💵 Aportes
      </h2>

      <p>
        Control de aportes mensuales y multas.
      </p>

    </div>


    <!-- =====================================================
         RESUMEN
         ===================================================== -->

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


    <!-- =====================================================
         REGISTRAR / EDITAR PAGO
         ===================================================== -->

    <div class="panel">

      <h3 id="titulo-formulario-pago">
        Registrar pago
      </h3>

      <p id="texto-formulario-pago">
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


      <button
        id="btn-cancelar-edicion"
        class="secondary"
        type="button"
        style="display:none;"
      >

        Cancelar edición

      </button>


      <p
        id="mensaje-pago"
        class="message"
      ></p>

    </div>


    <!-- =====================================================
         FILTROS
         ===================================================== -->

    <div class="panel">

      <h3>
        📅 Reporte mensual
      </h3>

      <div class="form-grid">

        <div>

          <label>
            Mes
          </label>

          <select id="filtro-mes">

            <option value="TODOS">
              Todos los meses
            </option>

            ${generarOpcionesMeses()}

          </select>

        </div>


        <div>

          <label>
            Buscar socio
          </label>

          <select id="filtro-socio">

            <option value="TODOS">
              Todos los socios
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
            Estado
          </label>

          <select id="filtro-estado">

            <option value="TODOS">
              Todos
            </option>

            <option value="PAGADO">
              Pagados
            </option>

            <option value="PENDIENTE">
              Pendientes
            </option>

            <option value="ATRASADO">
              Atrasados
            </option>

          </select>

        </div>

      </div>


      <br>

      <button
        id="btn-exportar-excel"
        class="primary"
        type="button"
      >

        📊 Exportar a Excel

      </button>

    </div>


    <!-- =====================================================
         REGISTRO
         ===================================================== -->

    <div class="panel">

      <h3>
        Registro de aportes
      </h3>


      <div
        id="contador-reporte"
      ></div>


      <div class="tabla-contenedor">

        <table>

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

              <th>
                Acción
              </th>

            </tr>

          </thead>

          <tbody id="tabla-aportes-body">

          </tbody>

        </table>

      </div>

    </div>

  `;


  moduloContenido.innerHTML =
    html;


  configurarFormularioPago();

  configurarFiltrosAportes();

  actualizarTablaAportes();

}


// ============================================================
// GENERAR OPCIONES DE MESES
// ============================================================

function generarOpcionesMeses() {

  const meses =
    {};

  aportes.forEach(function (aporte) {

    if (!aporte.fecha_vencimiento) {
      return;
    }

    const mes =
      aporte.fecha_vencimiento.substring(
        0,
        7
      );

    meses[mes] = true;

  });


  return Object.keys(meses)
    .sort()
    .reverse()
    .map(function (mes) {

      const partes =
        mes.split("-");

      const año =
        partes[0];

      const numeroMes =
        Number(partes[1]);

      const nombresMeses = [

        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"

      ];

      return `

        <option value="${mes}">

          ${nombresMeses[numeroMes - 1]}
          ${año}

        </option>

      `;

    })
    .join("");

}


// ============================================================
// CONFIGURAR FILTROS
// ============================================================

function configurarFiltrosAportes() {

  const filtroMes =
    document.getElementById(
      "filtro-mes"
    );

  const filtroSocio =
    document.getElementById(
      "filtro-socio"
    );

  const filtroEstado =
    document.getElementById(
      "filtro-estado"
    );

  const botonExcel =
    document.getElementById(
      "btn-exportar-excel"
    );


  if (filtroMes) {

    filtroMes.addEventListener(
      "change",
      actualizarTablaAportes
    );

  }


  if (filtroSocio) {

    filtroSocio.addEventListener(
      "change",
      actualizarTablaAportes
    );

  }


  if (filtroEstado) {

    filtroEstado.addEventListener(
      "change",
      actualizarTablaAportes
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
// OBTENER APORTES FILTRADOS
// ============================================================

function obtenerAportesFiltrados() {

  const filtroMes =
    document.getElementById(
      "filtro-mes"
    );

  const filtroSocio =
    document.getElementById(
      "filtro-socio"
    );

  const filtroEstado =
    document.getElementById(
      "filtro-estado"
    );


  const mes =
    filtroMes
      ? filtroMes.value
      : "TODOS";


  const socio =
    filtroSocio
      ? filtroSocio.value
      : "TODOS";


  const estado =
    filtroEstado
      ? filtroEstado.value
      : "TODOS";


  return aportes.filter(
    function (aporte) {

      if (
        mes !== "TODOS" &&
        !aporte.fecha_vencimiento.startsWith(
          mes
        )
      ) {

        return false;

      }


      if (
        socio !== "TODOS" &&
        aporte.socio_id !== socio
      ) {

        return false;

      }


      if (
        estado !== "TODOS" &&
        aporte.estado !== estado
      ) {

        return false;

      }


      return true;

    }
  );

}


// ============================================================
// ACTUALIZAR TABLA
// ============================================================

function actualizarTablaAportes() {

  const lista =
    obtenerAportesFiltrados();


  const cuerpo =
    document.getElementById(
      "tabla-aportes-body"
    );


  const contador =
    document.getElementById(
      "contador-reporte"
    );


  if (!cuerpo) {
    return;
  }


  if (contador) {

    contador.innerHTML = `

      <p>

        Mostrando
        <strong>
          ${lista.length}
        </strong>
        registros.

      </p>

    `;

  }


  cuerpo.innerHTML =
    generarFilasAportes(
      lista
    );

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


  lista.forEach(function (aporte) {

    const valor =
      Number(
        aporte.valor_aporte || 0
      );

    const multa =
      Number(
        aporte.multa || 0
      );


    if (aporte.estado === "PAGADO") {

      pagados++;

    }

    else if (
      aporte.estado === "ATRASADO"
    ) {

      atrasados++;

      pendiente +=
        valor + multa;

    }

    else {

      pendientes++;

      pendiente +=
        valor + multa;

    }


    multas +=
      multa;

  });


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
// GENERAR FILAS APORTES
// ============================================================

function generarFilasAportes(lista = aportes) {

  if (!lista.length) {

    return `

      <tr>

        <td colspan="8">

          No hay registros para este filtro.

        </td>

      </tr>

    `;

  }


  return lista
    .map(function (aporte) {

      const socio =
        socios.find(
          function (s) {
            return s.id === aporte.socio_id;
          }
        );


      const nombre =
        socio
          ? socio.nombre
          : "Socio desconocido";


      return `

        <tr>

          <td>
            ${escapeHtml(nombre)}
          </td>

          <td>
            ${formatearFecha(
              aporte.fecha_vencimiento
            )}
          </td>

          <td>
            $ ${Number(
              aporte.valor_aporte || 0
            ).toFixed(2)}
          </td>

          <td>
            $ ${Number(
              aporte.multa || 0
            ).toFixed(2)}
          </td>

          <td>
            $ ${Number(
              aporte.total_pagado || 0
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
              aporte.estado || ""
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

    })
    .join("");

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

  const cancelar =
    document.getElementById(
      "btn-cancelar-edicion"
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
          return a.id === aporteId;
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
            aporte.valor_aporte || 0
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
            return a.id === aporteId;
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
          aporte.valor_aporte || 0
        ) +
        calculo.multa;


      boton.disabled =
        true;


      boton.textContent =
        aporteEditandoId
          ? "Actualizando..."
          : "Registrando...";


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
          aporteEditandoId
            ? "Pago actualizado correctamente."
            : "Pago registrado correctamente.";


        aporteEditandoId =
          null;


        await cargarAportes();

        mostrarModuloAportes();


      } catch (error) {

        console.error(
          "Error guardando pago:",
          error
        );


        mensaje.textContent =
          "Error al guardar el pago: " +
          error.message;

      }


      boton.disabled =
        false;

      boton.textContent =
        "Registrar pago";

    }
  );


  if (cancelar) {

    cancelar.addEventListener(
      "click",
      cancelarEdicionAporte
    );

  }

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
          aporte.socio_id === socioId &&
          aporte.estado !== "PAGADO"
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
        .map(function (aporte) {

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
                aporte.valor_aporte || 0
              ).toFixed(2)}

            </option>

          `;

        })
        .join("")
    }

  `;

}


// ============================================================
// EDITAR APORTE
// ============================================================

async function editarAporte(aporteId) {

  const aporte =
    aportes.find(
      function (a) {
        return a.id === aporteId;
      }
    );


  if (!aporte) {

    alert(
      "No se encontró el aporte."
    );

    return;

  }


  aporteEditandoId =
    aporteId;


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

  const boton =
    document.getElementById(
      "btn-registrar-pago"
    );

  const cancelar =
    document.getElementById(
      "btn-cancelar-edicion"
    );

  const titulo =
    document.getElementById(
      "titulo-formulario-pago"
    );

  const texto =
    document.getElementById(
      "texto-formulario-pago"
    );


  if (!socioSelect) {

    return;

  }


  socioSelect.value =
    aporte.socio_id;


  // En edición mostramos el aporte,
  // aunque ya esté PAGADO.
  aporteSelect.innerHTML = `

    <option value="${aporte.id}">

      ${formatearFecha(
        aporte.fecha_vencimiento
      )}
      -
      $
      ${Number(
        aporte.valor_aporte || 0
      ).toFixed(2)}

    </option>

  `;


  aporteSelect.value =
    aporte.id;


  fechaInput.value =
    aporte.fecha_pago ||
    obtenerFechaLocal();


  titulo.textContent =
    "✏️ Editar pago";


  texto.textContent =
    "Modifica la fecha de pago. La multa se recalculará automáticamente.";


  boton.textContent =
    "Actualizar pago";


  if (cancelar) {

    cancelar.style.display =
      "inline-block";

  }


  // Mostrar cálculo
  const calculo =
    calcularMulta(
      aporte.fecha_vencimiento,
      fechaInput.value
    );


  const calcularDiv =
    document.getElementById(
      "calculo-pago"
    );


  if (calcularDiv) {

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
          fechaInput.value
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
            aporte.valor_aporte || 0
          ) +
          calculo.multa
        ).toFixed(2)}
      </strong>

    `;

  }


  // Subir al formulario
  const formulario =
    document.getElementById(
      "titulo-formulario-pago"
    );


  if (formulario) {

    formulario.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }

}


// ============================================================
// CANCELAR EDICIÓN
// ============================================================

function cancelarEdicionAporte() {

  aporteEditandoId =
    null;


  mostrarModuloAportes();

}


// ============================================================
// CALCULAR MULTA
// ============================================================
//
// 0 días       = $0
// 1 a 7        = $4
// 8 a 14       = $5
// 15 a 21      = $6
// 22 o más     = $7
//
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
// EXPORTAR A EXCEL
// ============================================================

function exportarAportesExcel() {

  const lista =
    obtenerAportesFiltrados();


  if (!lista.length) {

    alert(
      "No hay registros para exportar."
    );

    return;

  }


  let csv = "";


  csv +=
    "Socio," +
    "Vencimiento," +
    "Aporte," +
    "Multa," +
    "Total Pagado," +
    "Fecha Pago," +
    "Estado," +
    "Observación\n";


  lista.forEach(
    function (aporte) {

      const socio =
        socios.find(
          function (s) {
            return s.id === aporte.socio_id;
          }
        );


      const nombre =
        socio
          ? socio.nombre
          : "Socio desconocido";


      const fila = [

        nombre,

        formatearFecha(
          aporte.fecha_vencimiento
        ),

        Number(
          aporte.valor_aporte || 0
        ).toFixed(2),

        Number(
          aporte.multa || 0
        ).toFixed(2),

        Number(
          aporte.total_pagado || 0
        ).toFixed(2),

        aporte.fecha_pago
          ? formatearFecha(
              aporte.fecha_pago
            )
          : "",

        aporte.estado || "",

        aporte.observacion || ""

      ];


      csv +=
        fila
          .map(
            function (valor) {

              return '"' +
                String(valor)
                  .replaceAll(
                    '"',
                    '""'
                  ) +
                '"';

            }
          )
          .join(",") +
        "\n";

    }
  );


  // BOM para que Excel reconozca correctamente
  // tildes y caracteres especiales.
  const BOM =
    "\uFEFF";


  const blob =
    new Blob(
      [
        BOM +
        csv
      ],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const enlace =
    document.createElement(
      "a"
    );


  enlace.href =
    url;


  const filtroMes =
    document.getElementById(
      "filtro-mes"
    );


  let nombreArchivo =
    "The_Cow_Money_Aportes";


  if (
    filtroMes &&
    filtroMes.value !== "TODOS"
  ) {

    nombreArchivo +=
      "_" +
      filtroMes.value;

  }


  nombreArchivo +=
    ".csv";


  enlace.download =
    nombreArchivo;


  document.body.appendChild(
    enlace
  );


  enlace.click();


  document.body.removeChild(
    enlace
  );


  URL.revokeObjectURL(
    url
  );

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

      Number(partes[0]),

      Number(partes[1]) - 1,

      Number(partes[2])

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
