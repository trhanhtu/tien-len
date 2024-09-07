import { SupabaseClient } from "@supabase/supabase-js";

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
    my_layout!: Layout
    constructor(supabase_: SupabaseClient) {

        this.supabase = supabase_;
        //get email
        this.my_email = window.checkNullAndGet<string>(sessionStorage.getItem("email"), "không tìm thấy email");
        // get id
        this.my_id = window.checkNullAndGet<string>(sessionStorage.getItem("id"), "không tìm thấy id");
        this.my_position = -1;
        this.init();
        
    }
    init(): void {
        // get template for room
        const roomTemplate = window.checkNullAndGet<HTMLTemplateElement>(document.getElementById("room-html") as HTMLTemplateElement, "không tải được room-html");
        // attach lobby-html into main
        const main_body = window.checkNullAndGet<HTMLElement>( document.getElementById('main-body') , "không tìm thấy main-body tag");
        main_body.innerText = "";
        main_body.appendChild(roomTemplate.content.cloneNode(true));

        const directions: string[] = ["current", "right", "top", "left"];
        this.my_layout = {
            player_emails:
                Array.from({ length: 4 }, (_, index) =>
                    window.checkNullAndGet<HTMLElement>(document.getElementById(directions[index] + "-player-name"), "không tìm thấy tag tên người chơi"))
            , player_cards_amount:
                Array.from({ length: 4 }, (_, index) =>
                    window.checkNullAndGet<HTMLElement>(document.getElementById(directions[index] + "-player-cards-amount"), "không tìm thấy tag bài người chơi"))

        }

        this.constructView();
    }
    async constructView() {
        // get my name
        const my_name = window.checkNullAndGet<HTMLElement>(document.getElementById("current-player-name"), "không tìm thấy tag id = my-name");
        my_name.innerText = this.my_email
        // get room id
        const room_id_tag = window.checkNullAndGet<HTMLElement>(document.getElementById("match-id"), "không tìm thấy tag id = match-id")
        room_id_tag.innerText = window.checkNullAndGet<string>(sessionStorage.getItem("match_id"), "không tìm thấy match id");

        // get players in room
        const { data, error } = await this.supabase.from("sm_game.tb_match").select("*").eq("sm_game.tb_match.match_id", room_id_tag.innerText).single<MatchInfo>();
        if (error) {
            window.errorHandle("lỗi khi tìm player khác:\n" + JSON.stringify(error, null, 2));
            return;
        }
        // assign seat for players
        this.DrawPlayerOnScreen(data);

    }
    DrawPlayerOnScreen(match: MatchInfo) {
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
        this.my_layout.player_cards_amount = rotateArray(this.my_layout.player_cards_amount, 4 - this.my_position);
        this.my_layout.player_emails = rotateArray(this.my_layout.player_emails, 4 - this.my_position);
    }
}


//========================== HELPER FUNCTION ===============================//
function rotateArray(arr: any[], k: number): any[] {
    const rotate_array = arr.concat(arr).slice(k, k + arr.length);
    return rotate_array;
}