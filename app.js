const loginScreen=document.getElementById('login-screen');const mainScreen=document.getElementById('main-screen');const loginForm=document.getElementById('login-form');const loginMessage=document.getElementById('login-message');const userName=document.getElementById('user-name');const logout=document.getElementById('logout');const connectionStatus=document.getElementById('connection-status');

let supabaseClient=null;
if(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && !window.SUPABASE_URL.startsWith('PEGA_')){
  supabaseClient=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
  connectionStatus.textContent='Conexión con Supabase configurada.';
}

function showMain(user){loginScreen.classList.add('hidden');mainScreen.classList.remove('hidden');if(user)userName.textContent=user.email||'';}
function showLogin(){mainScreen.classList.add('hidden');loginScreen.classList.remove('hidden');}

loginForm.addEventListener('submit',async(e)=>{e.preventDefault();loginMessage.textContent='';if(!supabaseClient){loginMessage.textContent='Falta configurar Supabase en config.js.';return;}const email=document.getElementById('email').value.trim();const password=document.getElementById('password').value;const{data,error}=await supabaseClient.auth.signInWithPassword({email,password});if(error){loginMessage.textContent=error.message;return;}showMain(data.user);});

logout.addEventListener('click',async()=>{if(supabaseClient)await supabaseClient.auth.signOut();showLogin();});

(async()=>{if(!supabaseClient)return;const{data}=await supabaseClient.auth.getSession();if(data.session)showMain(data.session.user);})();
