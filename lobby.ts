import { SupabaseClient } from '@supabase/supabase-js';
declare global {
    interface Window {
        my_supabase: SupabaseClient; // Use the correct type for your Supabase client
    }

}
declare const supabase: {
    createClient: (supabaseUrl: string, supabaseKey: string) => SupabaseClient;
};
interface FormElement {
    email: HTMLInputElement,
    password: HTMLInputElement,
}

interface RoomList {
    array: HTMLElement,
    isRefreshable: boolean
}

interface RoomInfo {
    match_id: number,
    email: string,
    player_count: number
}
class Lobby {
    form!: FormElement
    room_list!: RoomList
    user_id: string
    constructor() {
        this.initView();
        const supabaseUrl = "https://pvspechosfvvqcgoqxkt.supabase.co";
        const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2c3BlY2hvc2Z2dnFjZ29xeGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxMjI3NjAsImV4cCI6MjAzOTY5ODc2MH0.g6euO8ybVeiDCuGtDX6XjIxzROIM8SeyKR5qIhqykc8";
        window.my_supabase = supabase.createClient(supabaseUrl, supabaseKey);
        this.user_id = "";
    }

    async loadRooms(): Promise<void> {
        if (this.room_list.isRefreshable === false) {
            return;
        }
        const { data, error } = await window.my_supabase.schema("sm_game").from('v_get_room_info')
            .select('*').returns<RoomInfo[]>();
        if (error) {
            window.errorHandle('Error fetching data from view:\n' + JSON.stringify(error));
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
            window.errorHandle("không tìm thấy ID hoặc email");
            return;
        }
        const { error } = await window.my_supabase.schema("sm_game").rpc("func_create_match_if_not_in_any", {
            player_id: user_id,
            player_email: user_email
        });
        if (error) {
            window.errorHandle('Lỗi khi tạo phòng:\n' + JSON.stringify(error.message));
            return;
        }

        alert("tạo phòng thành công");

    }
    async login(): Promise<void> {
        const { data, error } = await window.my_supabase.auth.signInWithPassword({
            email: this.form.email.value,
            password: this.form.password.value,
        });

        if (error) {
            window.errorHandle('Error signing in:' + error.message);
            return
        }
        const user_id = data.user?.id;
        const user_email = data.user?.email;
        if (!user_id || !user_email) {
            window.errorHandle("không tìm thấy ID");
            return;
        }
        sessionStorage.setItem("id", user_id);
        sessionStorage.setItem("email", user_email);
        this.loadRooms();
    }
    async enterRoom(match_id: number) {
        const user_id = sessionStorage.getItem("id");
        const user_email = sessionStorage.getItem("email");
        if (!user_id || !user_email) {
            window.errorHandle("không tìm thấy ID hoặc email");
            return;
        }
        const { error } = await window.my_supabase.schema("sm_game").rpc("func_join_match_if_not_in_any", {
            player_id: user_id,
            player_email: user_email,
            _match_id: match_id
        });
        if (error) {
            window.errorHandle("không vào được phòng:\n" + JSON.stringify(error));
            return;
        }
        //-save some infomation
        sessionStorage.setItem("match_id", match_id.toString());
        window.location.href = "room.html";
    }
    async initView(): Promise<void> {
        // get template for lobby
        const lobbyTemplate = window.checkNullAndGet<HTMLTemplateElement>(document.getElementById("lobby-html") as HTMLTemplateElement, "không tải được lobby-html");
        // attach lobby-html into main
        document.getElementById('main-body')!.appendChild(lobbyTemplate.content.cloneNode(true));
        // init view binding
        this.form = queryForm();
        this.room_list = {
            array: document.getElementById("room-list")!,
            isRefreshable: true
        };
    }
}
//========================== HELPER FUNCTION ===============================//


function queryForm(): FormElement {
    const email_input = document.getElementById("email-input")! as HTMLInputElement;
    const password_input = document.getElementById("password-input")! as HTMLInputElement;

    return { email: email_input, password: password_input };
}

function constructRoomHTMLElementString(room: RoomInfo): string {
    return `
    <tr>
        <td colspan="3">
            <button class="button-room"  onclick="userEnterRoom(${room.match_id});">
                <p id="captain-name-${room.match_id}" style="text-align: center;">${room.email}</p>
                <p id="amount-${room.match_id}" style="text-align: center;">${room.player_count}/4</p>
                <p style="text-align: center;">tiến lên</p>
            </button>
        </td>
    </tr>
    `;
}
