// import { createClient } from '@supabase/supabase-js';
import { errorHandle } from './errorhandle';
// Rest of your TypeScript code
const supabaseUrl = "https://pvspechosfvvqcgoqxkt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2c3BlY2hvc2Z2dnFjZ29xeGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxMjI3NjAsImV4cCI6MjAzOTY5ODc2MH0.g6euO8ybVeiDCuGtDX6XjIxzROIM8SeyKR5qIhqykc8";
class Lobby {
    form;
    supabase;
    room_list;
    constructor() {
        this.form = queryForm();
        this.supabase = supabase.createClient(supabaseUrl, supabaseKey);
        this.room_list = {
            array: document.getElementById("room-list"),
            isRefreshable: true
        };
    }
    async loadRooms() {
        if (this.room_list.isRefreshable === false) {
            return;
        }
        const { data, error } = await this.supabase.schema("sm_game").from('v_get_room_info')
            .select('*').returns();
        if (error) {
            errorHandle('Error fetching data from view:\n' + JSON.stringify(error));
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
            errorHandle("không tìm thấy ID hoặc email");
            return;
        }
        const { error } = await this.supabase.rpc("sm_Game.func_create_match_if_not_in_any", {
            player_id: user_id,
            player_email: user_email
        });
        if (error) {
            errorHandle('Lỗi khi tạo phòng:\n' + JSON.stringify(error.message));
            return;
        }
        alert("tạo phòng thành công");
    }
    async login() {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: this.form.email.value,
            password: this.form.password.value,
        });
        if (error) {
            errorHandle('Error signing in:' + error.message);
            return;
        }
        const user_id = data.user?.id;
        const user_email = data.user?.email;
        if (!user_id || !user_email) {
            errorHandle("không tìm thấy ID");
            return;
        }
        sessionStorage.setItem("id", user_id);
        sessionStorage.setItem("email", user_email);
        this.loadRooms();
    }
    async enterRoom(match_id) {
        const user_id = sessionStorage.getItem("id");
        const user_email = sessionStorage.getItem("email");
        if (!user_id || !user_email) {
            errorHandle("không tìm thấy ID hoặc email");
            return;
        }
        const { error } = await this.supabase.rpc("sm_game.func_join_match_if_not_in_any", {
            player_id: user_id,
            player_email: user_email,
            match_id: match_id
        });
        if (error) {
            errorHandle("không vào được phòng:\n" + JSON.stringify(error));
            return;
        }
        //-save some infomation
        sessionStorage.setItem("match_id", match_id.toString());
        sessionStorage.setItem("supabase", JSON.stringify(this.supabase));
        window.location.href = "room.html";
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
function constructRoomHTMLElementString(room) {
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
