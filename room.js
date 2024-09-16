class Room {
    supabase;
    my_id;
    my_email;
    my_position;
    my_layout;
    match_data;
    room_door_event;
    room_chat_event;
    chat_box;
    constructor(supabase_) {
        this.supabase = supabase_;
        //get email
        this.my_email = window.checkNullAndGet(sessionStorage.getItem("email"), "không tìm thấy email");
        sessionStorage.removeItem("email");
        // get id
        this.my_id = window.checkNullAndGet(sessionStorage.getItem("id"), "không tìm thấy id");
        sessionStorage.removeItem("id");
        this.match_data = { room_id_value: -1, players_email_array: ["", "", "", ""] };
        this.match_data.room_id_value = window.checkNullAndGet(Number(sessionStorage.getItem("match_id")), "không tìm thấy id");
        sessionStorage.removeItem("match_id");
        this.my_position = -1;
        this.init();
    }
    init() {
        // get template for room
        const roomTemplate = window.checkNullAndGet(document.getElementById("room-html"), "không tải được room-html");
        // attach lobby-html into main
        const main_body = window.checkNullAndGet(document.getElementById('main-body'), "không tìm thấy main-body tag");
        main_body.innerText = "";
        main_body.appendChild(roomTemplate.content.cloneNode(true));
        this.chat_box = {
            input: window.checkNullAndGet(document.getElementById("input-box"), "không tìm thấy tag input"),
            textArea: window.checkNullAndGet(document.getElementById("text-area"), "không tìm thấy tag text-area"),
        };
        this.resetRotate();
        this.addRealTime();
        this.constructView();
    }
    async addRealTime() {
        // listen to player in/out room
        this.room_door_event = this.supabase.channel(this.match_data.room_id_value.toString() + "p", {
            config: {
                presence: {
                    key: this.my_email,
                },
            },
        });
        this.room_door_event.on('presence', {
            event: 'sync'
        }, () => {
            console.log(JSON.stringify(this.room_door_event.presenceState()));
            this.match_data.players_email_array = Object.keys(this.room_door_event.presenceState());
            this.my_layout.player_emails.forEach((element, index) => {
                element.innerText = this.match_data.players_email_array[index] || "";
            });
            this.DrawPlayerOnScreen();
        })
            .subscribe(async (status) => {
            if (status !== 'SUBSCRIBED') {
                return;
            }
            this.room_door_event.track({});
        });
        window.addEventListener('beforeunload', () => {
            if (!this.room_door_event) {
                return;
            }
            this.room_door_event.untrack();
            this.supabase.removeAllChannels();
        });
        // listen to player message chat
        this.room_chat_event = this.supabase.channel(this.match_data.room_id_value.toString() + "b");
        this.room_chat_event.on('broadcast', { event: 'test' }, (payload) => this.receiveMessage(payload))
            .subscribe();
    }
    receiveMessage(a) {
        const [sender, text] = a.payload.message.split(":", 2);
        const color = ["red", "violet", "black", "cornflower"];
        const index = this.match_data.players_email_array.indexOf(sender);
        this.chat_box.textArea.srcdoc +=
            `
        <p>
        <b style="color:${color.at(index)};">${sender}:</b>
        ${text}
        </p>`;
    }
    handleEventEnterLeaveRoom() {
        if (!this.room_door_event.presenceState()) {
            return;
        }
        this.match_data.players_email_array = Object.keys(this.room_door_event.presenceState());
        this.DrawPlayerOnScreen();
    }
    async sendMessage(btn) {
        try {
            // Disable the button to prevent multiple sends
            btn.disabled = true;
            // Send the message using Supabase Realtime's broadcast channel
            await this.supabase.channel(this.match_data.room_id_value.toString() + "b").send({
                type: 'broadcast',
                event: 'test',
                payload: { message: this.my_email + ": " + this.chat_box.input.value }
            });
            // Clear the input field after sending the message
            this.chat_box.input.value = "";
        }
        catch (error) {
            console.error("Error sending message:", error);
            // Optionally, provide user feedback if there's an error
        }
        finally {
            // Re-enable the button after message is sent (or on error)
            btn.disabled = false;
        }
    }
    async constructView() {
        // get my name
        const my_name = window.checkNullAndGet(document.getElementById("current-player-name"), "không tìm thấy tag id = my-name");
        my_name.innerText = this.my_email;
        // get room id
        const room_id_tag = window.checkNullAndGet(document.getElementById("match-id"), "không tìm thấy tag id = match-id");
        room_id_tag.innerText += this.match_data.room_id_value;
        // get players in room
        const { data, error } = await this.supabase.schema("sm_game").from("tb_match").select("*").eq("match_id", this.match_data.room_id_value).single();
        if (error) {
            window.errorHandle("lỗi khi tìm player khác:\n" + JSON.stringify(error, null, 2));
            return;
        }
    }
    resetRotate() {
        const directions = ["current", "right", "top", "left"];
        this.my_layout = {
            player_emails: Array.from({ length: 4 }, (_, index) => window.checkNullAndGet(document.getElementById(directions[index] + "-player-name"), "không tìm thấy tag tên người chơi")),
            player_cards_amount: Array.from({ length: 4 }, (_, index) => window.checkNullAndGet(document.getElementById(directions[index] + "-player-cards-amount"), "không tìm thấy tag bài người chơi")),
            player_avatars: Array.from({ length: 4 }, (_, index) => window.checkNullAndGet(document.getElementById(directions[index] + "-player-image"), "không tìm thấy tag ảnh"))
        };
    }
    DrawPlayerOnScreen() {
        this.my_position = this.match_data.players_email_array.indexOf(this.my_email);
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
        const image_links = [
            "https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/batman_hero_avatar_comics-512.png",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcST5bhx9oyu60ySLgmORN2Nkz41qfkykg-5wgk6WlTWPDMgJbwawyLT62EQC56pA2BvOgE&usqp=CAU",
            "https://img.favpng.com/11/7/0/q-version-avatar-soldier-blog-military-png-favpng-Sgyu8XK29KqhCDwSgjb5WnScm_t.jpg",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTHMIMgh7UO8i9sKBCdM86d1ATU1_RdDPZ_A&s"
        ];
        for (let i = 0; i < 4; i++) {
            this.my_layout.player_avatars[i].src = image_links[i];
            if (i < this.match_data.players_email_array.length) {
                this.my_layout.player_avatars[i].style.display = "block";
                this.my_layout.player_emails[i].innerText = this.match_data.players_email_array[i];
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
function rotateArray(arr, k) {
    const rotate_array = arr.concat(arr).slice(k, k + arr.length);
    return rotate_array;
}
