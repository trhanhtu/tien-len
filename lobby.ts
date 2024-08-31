import { createClient, SupabaseClient } from '@supabase/supabase-js';



// Rest of your TypeScript code

const supabaseUrl = "https://pvspechosfvvqcgoqxkt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2c3BlY2hvc2Z2dnFjZ29xeGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxMjI3NjAsImV4cCI6MjAzOTY5ODc2MH0.g6euO8ybVeiDCuGtDX6XjIxzROIM8SeyKR5qIhqykc8";


interface FormElement {
    email: HTMLInputElement,
    password: HTMLInputElement,
}

class Lobby {
    form: FormElement
    supabase: SupabaseClient
    constructor() {
        this.form = queryForm();
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }
    loadRooms() {
        this.supabase.from("match").select()
    }
    createRoom() {

    }
    async login(): Promise<void> {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: this.form.email.value,
            password: this.form.password.value,
        });

        if (error) {
            console.error('Error signing in:', error.message);
        }
        const user_id = data.user?.id;
        if(!user_id){
            alert("không tìm thấy ID");
            return;
        }
        sessionStorage.setItem("id",user_id);
        this.loadRooms();
    }
    enterRoom() {

    }
    async checkIfLoggedIn() {
        const { data, error } = await this.supabase.auth.getSession()
    
        if (error) {
            console.error('Error getting session:', error)
            return;
        }
    
        if (data.session) {
            console.log('User is logged in:', data.session.user)
        } else {
            console.log('User is not logged in.')
        }
    }
}

//========================== MAIN HERE ======================================//
const app_lobby = new Lobby();
//========================== HELPER FUNCTION ===============================//
function queryForm(): FormElement {
    const email_input = document.getElementById("email-input")! as HTMLInputElement;
    const password_input = document.getElementById("password-input")! as HTMLInputElement;

    return { email: email_input, password: password_input };
}