import { createClient, SupabaseClient } from '@supabase/supabase-js';



// Rest of your TypeScript code

const supabaseUrl = "https://pvspechosfvvqcgoqxkt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2c3BlY2hvc2Z2dnFjZ29xeGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxMjI3NjAsImV4cCI6MjAzOTY5ODc2MH0.g6euO8ybVeiDCuGtDX6XjIxzROIM8SeyKR5qIhqykc8";


interface FormElement {
    email: HTMLInputElement,
    password: HTMLInputElement,
}

interface RoomList {
    array:  HTMLElement,
    isRefreshable: boolean
}

interface RoomInfo {
    match_id: number,
    email: string,
    player_count: number
}

class Lobby {
    form: FormElement
    supabase: SupabaseClient
    room_list: RoomList
    constructor() {
        this.form = queryForm();
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.room_list = {
            array: document.getElementById("room-list")!,
            isRefreshable: true
        };
    }
    async loadRooms(): Promise<void> {
        if (this.room_list.isRefreshable === false) {
            return;
        }
        const { data, error } = await this.supabase.schema("sm_game").from('v_get_room_info')
            .select('*').returns<RoomInfo[]>();
        if (error) {
            console.error('Error fetching data from view:', error);
        } else {
            console.log('Data from view:', data);
        }
        if (!data) {
            return;
        }
        for (let r of data) {
            this.room_list.array.innerHTML += constructRoomHTMLElementString(r);

        }
    }
    async createRoom() {
        const user_id = sessionStorage.getItem("id");
        const user_email = sessionStorage.getItem("email");
        if (!user_id || !user_email) {
            alert("không tìm thấy ID hoặc email");
            return;
        }
        const { error } = await this.supabase.rpc("sm_Game.func_create_match_if_not_in_any", {
            player_id: user_id,
            player_email: user_email
        });
        if (error) {
            alert('Lỗi khi tạo phòng:' + error.message);
            return;
        }
        alert("tạo phòng thành công");

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
        const user_email = data.user?.email;
        if (!user_id || !user_email) {
            alert("không tìm thấy ID");
            return;
        }
        sessionStorage.setItem("id", user_id);
        sessionStorage.setItem("email", user_email);
        this.loadRooms();
    }
    enterRoom(match_id:number) {
        window.location.href = "room.html";
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

function constructRoomHTMLElementString(room:RoomInfo): string {
    return `
    <tr>
        <td colspan="3">
            <button class="button-room"  onclick="app_lobby.enterRoom(${room.match_id})">
                <p id="captain-name-${room.match_id}" style="text-align: center;">${room.email}</p>
                <p id="amount-${room.match_id}" style="text-align: center;">${room.player_count}/4</p>
                <p style="text-align: center;">tiến lên</p>
            </button>
        </td>
    </tr>
    `;
}
