import { SupabaseClient } from "@supabase/supabase-js";
import { checkNullAndGet, errorHandle } from "./errorhandle";

interface MatchInfo {
    match_id: number,
    attack_type: number,
    score: number,
    who_turn: number,
    players_id_array: string[],
    players_email_array: string[],
    players_cards_array: number[],
    players_state_array: string[]
}

interface Layout {
    player_emails: HTMLElement[],
    player_cards_amount: HTMLElement[],
}

class Room {
    supabase: SupabaseClient
    my_id: string
    my_email: string
    my_position: number
    my_layout: Layout
    constructor() {
        // get supabase
        const supabase_str = checkNullAndGet<string>(
            sessionStorage.getItem("supabase"),
            "khởi động thất bại: không kết nối được với supabase"
        );
        this.supabase = JSON.parse(supabase_str);

        //get email
        this.my_email = checkNullAndGet<string>(sessionStorage.getItem("email"), "không tìm thấy email");
        // get id
        this.my_id = checkNullAndGet<string>(sessionStorage.getItem("id"), "không tìm thấy id");
        this.my_position = -1;

        const directions: string[] = ["current", "right", "top", "left"];
        this.my_layout = {
            player_emails:
                Array.from({ length: 4 }, (_, index) =>
                    checkNullAndGet<HTMLElement>(document.getElementById(directions[index] + "-player-name"), "không tìm thấy tag tên người chơi"))
            , player_cards_amount:
                Array.from({ length: 4 }, (_, index) =>
                    checkNullAndGet<HTMLElement>(document.getElementById(directions[index] + "-player-cards-amount"), "không tìm thấy tag bài người chơi"))

        }
    }
    init(): void {
        this.constructView();
    }
    async constructView() {
        // get my name
        const my_name = checkNullAndGet<HTMLElement>(document.getElementById("current-player-name"), "không tìm thấy tag id = my-name");
        my_name.innerText = this.my_email
        // get room id
        const room_id_tag = checkNullAndGet<HTMLElement>(document.getElementById("match-id"), "không tìm thấy tag id = match-id")
        room_id_tag.innerText = checkNullAndGet<string>(sessionStorage.getItem("match_id"), "không tìm thấy match id");

        // get players in room
        const { data, error } = await this.supabase.from("sm_Game.tb_match").select("*").eq("match_id", room_id_tag.innerText).single<MatchInfo>();
        if (error) {
            errorHandle("lỗi khi tìm player khác:\n" + JSON.stringify(error));
            return;
        }
        // assign seat for players
        this.DrawPlayerOnScreen(data);

    }
    DrawPlayerOnScreen(match: MatchInfo) {
        this.my_position = match.players_email_array.indexOf(this.my_email);
        if (this.my_position === -1) {
            errorHandle("vị trí của người chơi trong mảng không hợp lệ");
            return;
        }
        // shift right layout so that current player view is bottom
        if (this.my_position === 0) {
            // no need to shift because it already in bottom
            return;
        }
        rotateArray(this.my_layout.player_cards_amount,4 - this.my_position);
        rotateArray(this.my_layout.player_emails,4 - this.my_position);
        

    }
}

//========================== MAIN HERE ======================================//
const app = new Room();
app.init();
//========================== HELPER FUNCTION ===============================//
function rotateArray(arr: any[], k: number): void {
    arr.concat(arr).slice(k, k + arr.length);
}