class Lobby {
    form;
    room_list;
    constructor() {
        initView();
        this.form = queryForm();
        const supabaseUrl = "https://pvspechosfvvqcgoqxkt.supabase.co";
        const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2c3BlY2hvc2Z2dnFjZ29xeGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxMjI3NjAsImV4cCI6MjAzOTY5ODc2MH0.g6euO8ybVeiDCuGtDX6XjIxzROIM8SeyKR5qIhqykc8";
        window.my_supabase = supabase.createClient(supabaseUrl, supabaseKey);
        this.room_list = {
            array: document.getElementById("room-list"),
            isRefreshable: true
        };
    }
    async loadRooms() {
        if (this.room_list.isRefreshable === false) {
            return;
        }
        const { data, error } = await window.my_supabase.schema("sm_game").from('v_get_room_info')
            .select('*').returns();
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
    async login() {
        const { data, error } = await window.my_supabase.auth.signInWithPassword({
            email: this.form.email.value,
            password: this.form.password.value,
        });
        if (error) {
            window.errorHandle('Error signing in:' + error.message);
            return;
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
    async enterRoom(match_id) {
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
        sessionStorage.setItem("supabase", JSON.stringify(window.my_supabase));
        window.location.href = "room.html";
    }
}
//========================== HELPER FUNCTION ===============================//
async function initView() {
    const response = await fetch('https://raw.githubusercontent.com/trhanhtu/tien-len/v0.2/lobby.html');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const htmlContent = await response.text();
    document.getElementById('app-body').innerHTML = htmlContent;
}
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
