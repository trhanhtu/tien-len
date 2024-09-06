class Room {
    supabase;
    my_id;
    my_email;
    my_position;
    my_layout;
    constructor() {
        // get supabase
        const supabase_str = window.checkNullAndGet(sessionStorage.getItem("supabase"), "khởi động thất bại: không kết nối được với supabase");
        this.supabase = JSON.parse(supabase_str);
        //get email
        this.my_email = window.checkNullAndGet(sessionStorage.getItem("email"), "không tìm thấy email");
        // get id
        this.my_id = window.checkNullAndGet(sessionStorage.getItem("id"), "không tìm thấy id");
        this.my_position = -1;
        const directions = ["current", "right", "top", "left"];
        this.my_layout = {
            player_emails: Array.from({ length: 4 }, (_, index) => window.checkNullAndGet(document.getElementById(directions[index] + "-player-name"), "không tìm thấy tag tên người chơi")),
            player_cards_amount: Array.from({ length: 4 }, (_, index) => window.checkNullAndGet(document.getElementById(directions[index] + "-player-cards-amount"), "không tìm thấy tag bài người chơi"))
        };
    }
    init() {
        this.constructView();
    }
    async constructView() {
        // get my name
        const my_name = window.checkNullAndGet(document.getElementById("current-player-name"), "không tìm thấy tag id = my-name");
        my_name.innerText = this.my_email;
        // get room id
        const room_id_tag = window.checkNullAndGet(document.getElementById("match-id"), "không tìm thấy tag id = match-id");
        room_id_tag.innerText = window.checkNullAndGet(sessionStorage.getItem("match_id"), "không tìm thấy match id");
        // get players in room
        const { data, error } = await supabase.schema("sm_game").from("tb_match").select("*").eq("sm_game.tb_match.match_id", room_id_tag.innerText).limit(1);
        if (error) {
            window.errorHandle("lỗi khi tìm player khác:\n" + JSON.stringify(error, null, 2));
            return;
        }
        // assign seat for players
        this.DrawPlayerOnScreen(data);
    }
    DrawPlayerOnScreen(match) {
        this.my_position = match.players_email_array.indexOf(this.my_email);
        if (this.my_position === -1) {
            window.errorHandle("vị trí của người chơi trong mảng không hợp lệ");
            return;
        }
        // shift right layout so that current player view is bottom
        if (this.my_position === 0) {
            // no need to shift because it already in bottom
            return;
        }
        rotateArray(this.my_layout.player_cards_amount, 4 - this.my_position);
        rotateArray(this.my_layout.player_emails, 4 - this.my_position);
    }
}
//========================== MAIN HERE ======================================//
const app = new Room();
app.init();
//========================== HELPER FUNCTION ===============================//
function rotateArray(arr, k) {
    arr.concat(arr).slice(k, k + arr.length);
}
