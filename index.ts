import { SupabaseClient } from "@supabase/supabase-js";
declare global {
    class Lobby {
        constructor(_supabse: SupabaseClient);
        enterRoom(match_id: number):Promise<void>;
    }
    class Room {
        constructor(_supabse: SupabaseClient)
    }

};
declare const supabase: {
    createClient: (supabaseUrl: string, supabaseKey: string) => SupabaseClient;
};

var page: Lobby | Room | null = null;
var my_supabase: SupabaseClient | null = null;

document.addEventListener('DOMContentLoaded', function () {
    const supabaseUrl = "https://pvspechosfvvqcgoqxkt.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2c3BlY2hvc2Z2dnFjZ29xeGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxMjI3NjAsImV4cCI6MjAzOTY5ODc2MH0.g6euO8ybVeiDCuGtDX6XjIxzROIM8SeyKR5qIhqykc8";
    my_supabase = supabase.createClient(supabaseUrl, supabaseKey);
    page = new Lobby(my_supabase);
});

async function exitRoom() {
    if (!my_supabase) {
        return;
    }

    const match_id = sessionStorage.getItem("match_id");
    if (!match_id) {
        return;
    }

    const {data} = await my_supabase.auth.getUser();

    const { error } = await my_supabase.schema("sm_game").rpc("func_exit_match_if_in_any", {
        _match_id: match_id,
        player_id: data.user?.id,
        player_email: data.user?.email,
    });
    // window.close();
}

async function userEnterRoom(room_id:number) :Promise<void>{
    await (page as Lobby).enterRoom(room_id);
    page = new Room(my_supabase!);
}
