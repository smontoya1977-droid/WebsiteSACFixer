const CLIENT_ID = '665577493392-hp7j4aqmr1tcv20mkf7t33vjeati497q.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBJNtFwqFiH4TkI1T99DUN0oEtB7GGdEpo';
const SPREADSHEET_ID = '15L1JUTDiN-rvO9-1qM0peQNI1UV5PY0K';
const RANGE = 'Claves!A:D';

let gapiInited = false;
let tokenClient;

window.onload = () => {
    setTimeout(() => {
        speak("Bienvenido al web Site de Fixer");
        transitionToLogin();
    },2000);
};

// Text-to-Speech
function speak(text){
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    speechSynthesis.speak(utter);
}

// Intro → Login
function transitionToLogin(){
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

// Google API
function gapiLoaded(){
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient(){
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs:["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    });
    gapiInited = true;

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        callback: '', 
    });
    console.log("Google API cargada");
}

// Prueba de conexión local
document.getElementById('test-conn-btn').addEventListener('click', ()=>{
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if(user==='Sergio' && pass==='SmAdmin'){
        document.getElementById('login-message').innerText="Conexión exitosa!";
        speak("Conexión exitosa");
    } else{
        document.getElementById('login-message').innerText="Usuario o contraseña incorrectos!";
        speak("Usuario o contraseña incorrectos");
    }
});

// Login con Google Sheets
document.getElementById('login-btn').addEventListener('click', async ()=>{
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if(!gapiInited){
        document.getElementById('login-message').innerText="API no cargada";
        return;
    }

    tokenClient.callback = async(resp)=>{
        if(resp.error !== undefined){
            document.getElementById('login-message').innerText="Error de autenticación";
            speak("Error de autenticación");
            return;
        }

        try{
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: RANGE
            });
            const rows = response.result.values;
            const found = rows.find(r => r[0]===user && r[1]===pass);

            if(found){
                document.getElementById('login-screen').classList.add('hidden');
                document.getElementById('main-screen').classList.remove('hidden');
                document.getElementById('user-name').innerText=found[2];
                speak(`Bienvenido ${found[2]}`);
            } else{
                document.getElementById('login-message').innerText="Usuario o contraseña incorrectos!";
                speak("Usuario o contraseña incorrectos");
            }

        } catch(err){
            console.error(err);
            document.getElementById('login-message').innerText="Error de conexión a Sheets";
            speak("Error de conexión a Sheets");
        }
    };

    tokenClient.requestAccessToken();
});
