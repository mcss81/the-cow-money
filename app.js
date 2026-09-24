const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const userName = document.getElementById('user-name');
const logout = document.getElementById('logout');
const connectionStatus = document.getElementById('connection-status');

let supabaseClient = null;

if (
  window.SUPABASE_URL &&
  window.SUPABASE_ANON_KEY &&
  !window.SUPABASE_URL.startsWith('PEGA_')
) {
  supabaseClient = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
  );

  connectionStatus.textContent = 'Conexión con Supabase configurada.';
}

function showMain(user) {
  loginScreen.classList.add('hidden');
  mainScreen.classList.remove('hidden');

  if (user) {
    userName.textContent = user.email || '';
  }

  cargarSocios();
}

function showLogin() {
  mainScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
}

/* =====================================================
   PRUEBA: LEER SOCIOS DESDE SUPABASE
   ===================================================== */

async function cargarSocios() {
  if (!supabaseClient) {
    connectionStatus.textContent =
      'No hay conexión con Supabase.';
    return;
  }

  connectionStatus.textContent =
    'Consultando socios...';

  const { data, error } = await supabaseClient
    .from('socios')
    .select('id,nombre,email,rol,estado')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error consultando socios:', error);

    connectionStatus.textContent =
      'Error al consultar socios: ' + error.message;

    return;
  }

  console.log('Socios recibidos desde Supabase:', data);

  connectionStatus.textContent =
    'Conexión correcta. Socios encontrados: ' + data.length;

  let lista = document.getElementById('lista-socios');

  if (!lista) {
    lista = document.createElement('div');
    lista.id = 'lista-socios';
    lista.className = 'panel';

    mainScreen
      .querySelector('.container')
      .appendChild(lista);
  }

  lista.innerHTML = `
    <h3>Socios registrados</h3>
    <div class="socios-lista">
      ${data.map(socio => `
        <div class="socio-item">
          <strong>${socio.nombre}</strong>
          <span>${socio.email || 'Sin correo'}</span>
          <span>${socio.rol}</span>
          <span>${socio.estado}</span>
        </div>
      `).join('')}
    </div>
  `;
}

/* =====================================================
   LOGIN
   ===================================================== */

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  loginMessage.textContent = '';

  if (!supabaseClient) {
    loginMessage.textContent =
      'Falta configurar Supabase en config.js.';
    return;
  }

  const email =
    document.getElementById('email').value.trim();

  const password =
    document.getElementById('password').value;

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    loginMessage.textContent = error.message;
    return;
  }

  showMain(data.user);
});

/* =====================================================
   CERRAR SESIÓN
   ===================================================== */

logout.addEventListener('click', async () => {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }

  showLogin();
});

/* =====================================================
   COMPROBAR SESIÓN EXISTENTE
   ===================================================== */

(async () => {
  if (!supabaseClient) return;

  const { data } =
    await supabaseClient.auth.getSession();

  if (data.session) {
    showMain(data.session.user);
  }
})();
