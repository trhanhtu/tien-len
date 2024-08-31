const supabaseUrl = "https://pvspechosfvvqcgoqxkt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2c3BlY2hvc2Z2dnFjZ29xeGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxMjI3NjAsImV4cCI6MjAzOTY5ODc2MH0.g6euO8ybVeiDCuGtDX6XjIxzROIM8SeyKR5qIhqykc8";
class Lobby {
    form;
    supabase;
    constructor() {
        this.form = queryForm();
        this.supabase = supabase.createClient(supabaseUrl, supabaseKey);
    }
    loadRooms() {
    }
    createRoom() {
    }
    async login() {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: this.form.email.value,
            password: this.form.password.value,
        });
        if (error) {
            console.error('Error signing in:', error.message);
        }
        alert('User logged in:' + data.user?.id);
    }
    enterRoom() {
    }
}
//========================== MAIN HERE ======================================//
const app_lobby = new Lobby();
//========================== HELPER FUNCTION ===============================//
function queryForm() {
    const email_input = document.getElementById("email-input");
    const password_input = document.getElementById("password-input");
    return { email: email_input, password: password_input };
}
