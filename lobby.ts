import { SupabaseClient } from '@supabase/supabase-js';

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
    supabase: SupabaseClient;
    constructor(supabase_ : SupabaseClient) {
        this.initView();
        this.supabase = supabase_;
        this.user_id = "";
        supabase_.auth.getUser().then((data)=> data.data.user?.id || data.data.user?.email)
    }

    async loadRooms(): Promise<void> {
        if (this.room_list.isRefreshable === false) {
            return;
        }
        const { data, error } = await this.supabase.schema("sm_game").from('v_get_room_info')
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
        const { error } = await this.supabase.schema("sm_game").rpc("func_create_match_if_not_in_any", {
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
        const { data, error } = await this.supabase.auth.signInWithPassword({
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
        const { error } = await this.supabase.schema("sm_game").rpc("func_join_match_if_not_in_any", {
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
    }
    async initView(): Promise<void> {
        // get template for lobby
        const lobbyTemplate = window.checkNullAndGet<HTMLTemplateElement>(document.getElementById("lobby-html") as HTMLTemplateElement, "không tải được lobby-html");
        // attach lobby-html into main
        const main_body = window.checkNullAndGet<HTMLElement>( document.getElementById('main-body') , "không tìm thấy main-body tag");
        main_body.innerText = "";
        main_body.appendChild(lobbyTemplate.content.cloneNode(true));
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
