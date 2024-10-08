import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

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

interface ChatElement {
    input: HTMLInputElement,
    textArea: HTMLIFrameElement
}

interface Layout {
    player_emails: HTMLElement[],
    player_cards_amount: HTMLElement[],
    player_avatars: HTMLImageElement[]
}

class Room {
    supabase: SupabaseClient
    my_id: string
    my_email: string
    my_position: number
    my_layout!: Layout
    room_id_value: number = -1;
    channel!: RealtimeChannel
    room_door_event!: RealtimeChannel;
    room_chat_event!: RealtimeChannel;
    chat_box!: ChatElement;
    constructor(supabase_: SupabaseClient) {

        this.supabase = supabase_;
        //get email
        this.my_email = window.checkNullAndGet<string>(sessionStorage.getItem("email"), "không tìm thấy email");
        sessionStorage.removeItem("email");
        // get id
        this.my_id = window.checkNullAndGet<string>(sessionStorage.getItem("id"), "không tìm thấy id");
        sessionStorage.removeItem("id");

        this.room_id_value = window.checkNullAndGet<number>(Number(sessionStorage.getItem("match_id")), "không tìm thấy id");
        sessionStorage.removeItem("match_id");

        this.my_position = -1;

        this.init();

    }
    init(): void {
        // get template for room
        const roomTemplate = window.checkNullAndGet<HTMLTemplateElement>(document.getElementById("room-html") as HTMLTemplateElement, "không tải được room-html");
        // attach lobby-html into main
        const main_body = window.checkNullAndGet<HTMLElement>(document.getElementById('main-body'), "không tìm thấy main-body tag");
        main_body.innerText = "";
        main_body.appendChild(roomTemplate.content.cloneNode(true));

        this.chat_box = {
            input: window.checkNullAndGet<HTMLInputElement>(document.getElementById("input-box") as HTMLInputElement, "không tìm thấy tag input"),
            textArea: window.checkNullAndGet<HTMLIFrameElement>(document.getElementById("text-area") as HTMLIFrameElement, "không tìm thấy tag text-area"),
        }

        this.resetRotate();
        this.addRealTime();
        this.constructView();
    }
    async addRealTime(): Promise<void> {

        // listen to player in/out room
        this.room_door_event = this.supabase.channel(
            this.room_id_value.toString()+"p",
            {
                config: {
                    presence: {
                        key: this.my_email,
                    },
                },
            }
        )
        this.room_door_event.on
            (
                'presence', {
                event: 'sync'
            }, () => {
                console.log(JSON.stringify(this.room_door_event.presenceState()))
                const players_email_array = Object.keys(this.room_door_event.presenceState());
                this.my_layout.player_emails.forEach((element, index) => {
                    element.innerText = players_email_array[index] || "";
                });
                this.DrawPlayerOnScreen(players_email_array);
            }

            )
            .subscribe(
                async (status) => {
                    if (status !== 'SUBSCRIBED') { return }

                    this.room_door_event.track({})
                })

        window.addEventListener('beforeunload', () => {
            if (!this.room_door_event) {
                return;
            }
            this.room_door_event.untrack();
            this.supabase.removeAllChannels();
        })

        // listen to player message chat
        this.room_chat_event = this.supabase.channel(
            this.room_id_value.toString()+"b"
        );

        this.room_chat_event.on(

            'broadcast',
            { event: 'test' },
            (payload) => this.receiveMessage(payload)
        )
            .subscribe()

    }

    receiveMessage(a: any) {
        const [sender,text] = (a.payload.message as string).split(":",2);
        this.chat_box.textArea.srcdoc += 
        `
        <p>
        <b style="color:red;">${sender}:</b>
        ${text}
        </p>`
        ;
    }

    handleEventEnterLeaveRoom() {
        if (!this.room_door_event.presenceState()) {
            return;
        }
        const players_email_array: string[] = Object.keys(this.room_door_event.presenceState());
        this.DrawPlayerOnScreen(players_email_array);
    }

    async sendMessage(btn:HTMLButtonElement) {
        try {
            // Disable the button to prevent multiple sends
            btn.disabled = true;
    
            // Send the message using Supabase Realtime's broadcast channel
            await this.supabase.channel(this.room_id_value.toString() + "b").send({
                type: 'broadcast',
                event: 'test',
                payload: { message: this.my_email + ": " + this.chat_box.input.value }
            });
    
            // Clear the input field after sending the message
            this.chat_box.input.value = "";
        } catch (error) {
            console.error("Error sending message:", error);
            // Optionally, provide user feedback if there's an error
        } finally {
            // Re-enable the button after message is sent (or on error)
            btn.disabled = false;
        }
    }

    async constructView() {
        // get my name
        const my_name = window.checkNullAndGet<HTMLElement>(document.getElementById("current-player-name"), "không tìm thấy tag id = my-name");
        my_name.innerText = this.my_email
        // get room id
        const room_id_tag = window.checkNullAndGet<HTMLElement>(document.getElementById("match-id"), "không tìm thấy tag id = match-id")
        room_id_tag.innerText += this.room_id_value;

        // get players in room
        const { data, error } = await this.supabase.schema("sm_game").from("tb_match").select("*").eq("match_id", this.room_id_value).single<MatchInfo>();
        if (error) {
            window.errorHandle("lỗi khi tìm player khác:\n" + JSON.stringify(error, null, 2));
            return;
        }


    }
    resetRotate() {
        const directions: string[] = ["current", "right", "top", "left"];

        this.my_layout = {
            player_emails:
                Array.from({ length: 4 }, (_, index) =>
                    window.checkNullAndGet<HTMLElement>(document.getElementById(directions[index] + "-player-name"), "không tìm thấy tag tên người chơi"))
            , player_cards_amount:
                Array.from({ length: 4 }, (_, index) =>
                    window.checkNullAndGet<HTMLElement>(document.getElementById(directions[index] + "-player-cards-amount"), "không tìm thấy tag bài người chơi"))
            , player_avatars:
                Array.from({ length: 4 }, (_, index) =>
                    window.checkNullAndGet<HTMLImageElement>(document.getElementById(directions[index] + "-player-image") as HTMLImageElement, "không tìm thấy tag ảnh"))
        }
    }
    DrawPlayerOnScreen(players_email: string[]) {
        this.my_position = players_email.indexOf(this.my_email);
        if (this.my_position === -1) {
            // window.errorHandle("vị trí của người chơi trong mảng không hợp lệ");
            return;
        }
        // shift right layout so that current player view is bottom
        if (this.my_position !== 0) {
            this.resetRotate();
            this.my_layout.player_cards_amount = rotateArray(this.my_layout.player_cards_amount, 4 - this.my_position);
            this.my_layout.player_emails = rotateArray(this.my_layout.player_emails, 4 - this.my_position);
            this.my_layout.player_avatars = rotateArray(this.my_layout.player_avatars, 4 - this.my_position);
        }

        const image_links: string[] = [
            "https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/batman_hero_avatar_comics-512.png",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcST5bhx9oyu60ySLgmORN2Nkz41qfkykg-5wgk6WlTWPDMgJbwawyLT62EQC56pA2BvOgE&usqp=CAU",
            "https://img.favpng.com/11/7/0/q-version-avatar-soldier-blog-military-png-favpng-Sgyu8XK29KqhCDwSgjb5WnScm_t.jpg",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTHMIMgh7UO8i9sKBCdM86d1ATU1_RdDPZ_A&s"
        ];
        for (let i = 0; i < 4; i++) {
            this.my_layout.player_avatars[i].src = image_links[i];
            if (i < players_email.length) {
                this.my_layout.player_avatars[i].style.display = "block";
                this.my_layout.player_emails[i].innerText = players_email[i];
            }
            else {
                this.my_layout.player_avatars[i].style.display = "none";
                this.my_layout.player_emails[i].innerText = "";
            }
            // if (match.players_cards_array[i] > 0) {
            //     this.my_layout.player_cards_amount[i].innerText = "🂠 × " + match.players_cards_array[i]
            // }
            // else {
            //     this.my_layout.player_cards_amount[i].innerText = "";
            // }
        }


    }
}


//========================== HELPER FUNCTION ===============================//
function rotateArray(arr: any[], k: number): any[] {

    const rotate_array = arr.concat(arr).slice(k, k + arr.length);

    return rotate_array;
}