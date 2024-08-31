import { createClient, PostgrestSingleResponse } from '@supabase/supabase-js';

type CardIndex = number;

interface Card {
  value: number,
  model: Class,
  symbol: string,
}

interface TypeInfo {
  typeName: string,
  score: number
}

enum Class {
  Back = 0,
  Spades = 1,
  Clubs = 2,
  Diamonds = 4,
  Hearts = 8,
}

class ReadyCards {
  positions: Card[];
  length: number;
  defaultValue: Card;
  constructor(SIZE: number, defaultValue: Card) {
    this.length = 0;
    this.defaultValue = defaultValue;
    this.positions = Array<Card>(SIZE).fill(defaultValue);
  }
  push(value: Card): void {
    if (this.length + 1 > this.positions.length) {
      return;
    }

    this.positions[this.length] = value;
    this.length += 1;
    this.positions.sort((a, b) => (a.value * 10 + a.model) - (b.value * 10 + b.model));
  }
  remove(value: Card): void {
    const index: number = this.positions.indexOf(value);
    if (index < 0) {
      return;
    }
    this.positions[index] = this.defaultValue;
    this.positions.sort((a, b) => (a.value * 10 + a.model) - (b.value * 10 + b.model));
    this.length -= 1;
  }
  last(): Card {
    return this.positions[this.length - 1];
  }
  clear(): void {
    for (let i = 0; i < this.length; ++i) {
      this.positions[i] = { ...this.defaultValue };
    }
    this.length = 0;
  }
}
class IndexLookupTableArray {
  positions: CardIndex[];
  length: number;
  defaultValue: CardIndex;
  constructor(SIZE: number, defaultValue: CardIndex) {
    this.length = 0;
    this.defaultValue = defaultValue;
    this.positions = Array<CardIndex>(SIZE).fill(defaultValue);
  }
  push(value: CardIndex): void {
    if (this.length + 1 > this.positions.length) {
      return;
    }

    this.positions[this.length] = value;
    this.length += 1;
  }
  pushArray(values: CardIndex[]): void {
    const new_length = this.length + values.length;
    if (new_length > this.positions.length) {
      return;
    }
    this.positions.push(...values);
    for (let i = this.length; i < new_length; ++i) {
      this.positions[i] = values[i];
    }
    this.length = new_length;
  }
  removeArray(indexes: number[]): void {
    for (let i = 0; i < indexes.length; ++i) {
      this.positions[i] = this.defaultValue;
    }
    this.length -= indexes.length;
  }
  remove(value: CardIndex): void {
    const index: number = this.positions.indexOf(value);
    if (index < 0) {
      return;
    }
    this.positions[index] = this.defaultValue;
    this.length -= 1;
  }
  last(): CardIndex {
    return this.positions[this.length - 1];
  }
  clear(): void {
    for (let card of this.positions) {
      card = this.defaultValue;
    }
    this.length = 0;
  }
  updateNewValues(values: CardIndex[]) {
    if (values.length <= this.positions.length) {
      for (let i = 0; i < values.length; ++i) {
        this.positions[i] = values[i];
      }
      if (values.length > this.length) {
        this.length = values.length;
      }
    }

  }
}
class App {
  lookupTable: Card[] = [
    // Hearts
    { value: 300, model: Class.Hearts, symbol: "🂳" }, // 3 of Hearts
    { value: 400, model: Class.Hearts, symbol: "🂴" }, // 4 of Hearts
    { value: 500, model: Class.Hearts, symbol: "🂵" }, // 5 of Hearts
    { value: 600, model: Class.Hearts, symbol: "🂶" }, // 6 of Hearts
    { value: 700, model: Class.Hearts, symbol: "🂷" }, // 7 of Hearts
    { value: 800, model: Class.Hearts, symbol: "🂸" }, // 8 of Hearts
    { value: 900, model: Class.Hearts, symbol: "🂹" }, // 9 of Hearts
    { value: 1000, model: Class.Hearts, symbol: "🂺" }, // 10 of Hearts
    { value: 1100, model: Class.Hearts, symbol: "🂻" }, // Jack of Hearts
    { value: 1200, model: Class.Hearts, symbol: "🂽" }, // Queen of Hearts
    { value: 1300, model: Class.Hearts, symbol: "🂾" }, // King of Hearts
    { value: 1400, model: Class.Hearts, symbol: "🂱" }, // Ace of Hearts
    { value: 1500, model: Class.Hearts, symbol: "🂲" }, // 2 of Hearts
    // Diamonds
    { value: 300, model: Class.Diamonds, symbol: "🃃" }, // 3 of Diamonds
    { value: 400, model: Class.Diamonds, symbol: "🃄" }, // 4 of Diamonds
    { value: 500, model: Class.Diamonds, symbol: "🃅" }, // 5 of Diamonds
    { value: 600, model: Class.Diamonds, symbol: "🃆" }, // 6 of Diamonds
    { value: 700, model: Class.Diamonds, symbol: "🃇" }, // 7 of Diamonds
    { value: 800, model: Class.Diamonds, symbol: "🃈" }, // 8 of Diamonds
    { value: 900, model: Class.Diamonds, symbol: "🃉" }, // 9 of Diamonds
    { value: 1000, model: Class.Diamonds, symbol: "🃊" }, // 10 of Diamonds
    { value: 1100, model: Class.Diamonds, symbol: "🃋" }, // Jack of Diamonds
    { value: 1200, model: Class.Diamonds, symbol: "🃍" }, // Queen of Diamonds
    { value: 1300, model: Class.Diamonds, symbol: "🃎" }, // King of Diamonds
    { value: 1400, model: Class.Diamonds, symbol: "🃁" }, // Ace of Diamonds
    { value: 1500, model: Class.Diamonds, symbol: "🃂" }, // 2 of Diamonds
    // Clubs
    { value: 300, model: Class.Clubs, symbol: "🃓" }, // 3 of Clubs
    { value: 400, model: Class.Clubs, symbol: "🃔" }, // 4 of Clubs
    { value: 500, model: Class.Clubs, symbol: "🃕" }, // 5 of Clubs
    { value: 600, model: Class.Clubs, symbol: "🃖" }, // 6 of Clubs
    { value: 700, model: Class.Clubs, symbol: "🃗" }, // 7 of Clubs
    { value: 800, model: Class.Clubs, symbol: "🃘" }, // 8 of Clubs
    { value: 900, model: Class.Clubs, symbol: "🃙" }, // 9 of Clubs
    { value: 1000, model: Class.Clubs, symbol: "🃚" }, // 10 of Clubs
    { value: 1100, model: Class.Clubs, symbol: "🃛" }, // Jack of Clubs
    { value: 1200, model: Class.Clubs, symbol: "🃝" }, // Queen of Clubs
    { value: 1300, model: Class.Clubs, symbol: "🃞" }, // King of Clubs
    { value: 1400, model: Class.Clubs, symbol: "🃑" }, // Ace of Clubs
    { value: 1500, model: Class.Clubs, symbol: "🃒" }, // 2 of Clubs
    // Spades
    { value: 300, model: Class.Spades, symbol: "🂣" }, // 3 of Spades
    { value: 400, model: Class.Spades, symbol: "🂤" }, // 4 of Spades
    { value: 500, model: Class.Spades, symbol: "🂥" }, // 5 of Spades
    { value: 600, model: Class.Spades, symbol: "🂦" }, // 6 of Spades
    { value: 700, model: Class.Spades, symbol: "🂧" }, // 7 of Spades
    { value: 800, model: Class.Spades, symbol: "🂨" }, // 8 of Spades
    { value: 900, model: Class.Spades, symbol: "🂩" }, // 9 of Spades
    { value: 1000, model: Class.Spades, symbol: "🂪" }, // 10 of Spades
    { value: 1100, model: Class.Spades, symbol: "🂫" }, // Jack of Spades
    { value: 1200, model: Class.Spades, symbol: "🂭" }, // Queen of Spades
    { value: 1300, model: Class.Spades, symbol: "🂮" }, // King of Spades
    { value: 1400, model: Class.Spades, symbol: "🂡" }, // Ace of Spades
    { value: 1500, model: Class.Spades, symbol: "🂢" }, // 2 of Spades

    { value: -1, model: Class.Back, symbol: "🂠" },
  ];

  private supabaseUrl: string;
  private supabaseKey: string;
  private supabase: any;


  current_user_id: string;
  cards_on_main_desk: Array<HTMLElement>;
  cards_in_current_player_hand: Array<HTMLElement>;
  current_player_selected_cards: ReadyCards;
  match_info: Array<TypeInfo>;

  constructor() {

    this.current_user_id = ""

    this.supabaseUrl = "https://pvspechosfvvqcgoqxkt.supabase.co";
    this.supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2c3BlY2hvc2Z2dnFjZ29xeGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxMjI3NjAsImV4cCI6MjAzOTY5ODc2MH0.g6euO8ybVeiDCuGtDX6XjIxzROIM8SeyKR5qIhqykc8";
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);

    this.cards_on_main_desk = queryCardsOnMainDesk();
    this.cards_in_current_player_hand = queryCardsOnCurrentPlayer();
    this.current_player_selected_cards = new ReadyCards(13, this.lookupTable[52]);
    this.match_info = [{ typeName: "Không gì cả", score: 0 }, { typeName: "Không gì cả", score: 0 }];
  }
  shuffleCardsDeck(): CardIndex[] {
    const cards_deck: CardIndex[] = Array.from({ length: 52 }, (_, index) => index);
    this.current_player_selected_cards.clear();
    let currentIndex = 52;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [cards_deck[currentIndex], cards_deck[randomIndex]] = [
        cards_deck[randomIndex], cards_deck[currentIndex]];
    }
    return cards_deck;
  }

   splittingTheDeck(): void {
    this.supabase.from("player_cards")
    const indexes: CardIndex[] = this.shuffleCardsDeck().slice(0, 13);
    indexes.sort((left, right) => (this.lookupTable[left].value + this.lookupTable[left].model) - (this.lookupTable[right].value + this.lookupTable[right].model));
    // indexes.forEach(a => console.log(this.lookupTable[a]));
    for (let i = 0; i < 13; ++i) {
      if (indexes[i] < 26) {
        this.cards_in_current_player_hand[i].style.color = "red";
      }
      this.cards_in_current_player_hand[i].innerHTML = this.lookupTable[indexes[i]].symbol;
      this.cards_in_current_player_hand[i].id = indexes[i].toString();
    }

  }
  updateCardsInReadyHand(index: number) {

    if (this.cards_in_current_player_hand[index].dataset.selected === "F") {
      this.cards_in_current_player_hand[index].style.backgroundColor = "aliceblue";
      this.cards_in_current_player_hand[index].dataset.selected = "T";
      this.current_player_selected_cards.push(this.lookupTable[Number(this.cards_in_current_player_hand[index].id)]);

    }
    else {
      this.cards_in_current_player_hand[index].dataset.selected = "F";
      this.cards_in_current_player_hand[index].style.backgroundColor = "transparent";
      this.current_player_selected_cards.remove(this.lookupTable[Number(this.cards_in_current_player_hand[index].id)]);
    }

  }

  lauchAttack() {
    // kiểm tra các kiểu
    // console.log("lau");
    console.log("sort", this.current_player_selected_cards.positions);

    this.calcuteTypeAndScore();
    console.log(this.match_info);

    if (this.match_info[1].score === 0) {
      return;
    }
    this.match_info[0] = { ...this.match_info[1] };
    for (let i = 0; i < 13; ++i) {
      if (this.cards_in_current_player_hand[i].dataset.selected === "T") {
        this.cards_in_current_player_hand[i].id += "x";
        this.cards_in_current_player_hand[i].style.display = "none";
        this.updateCardsInReadyHand(i);

        this.cards_on_main_desk[i].style.display = "block";
        this.cards_on_main_desk[i].style.color = this.cards_in_current_player_hand[i].style.color;
        this.cards_on_main_desk[i].innerText = this.cards_in_current_player_hand[i].innerText;
      }
      else {

        this.cards_on_main_desk[i].style.display = "none";
      }
    }
    this.current_player_selected_cards.clear();
  }

  calcuteTypeAndScore(): void {
    switch (this.current_player_selected_cards.length) {
      case 0:
        this.match_info[1] = { typeName: "Không gì cả", score: 0 };
        return;
      case 1: this.match_info[1] = this.validateSingle(); return;
      case 2: this.match_info[1] = this.validatePair(); return;
    }
    this.match_info[1] = this.validateStraight();
    if (this.match_info[1].score !== 0) {
      return;
    }
    switch (this.current_player_selected_cards.length) {
      case 3: this.match_info[1] = this.validateTriple(); return;
      case 4: this.match_info[1] = this.validateFourOfAKind(); return;
      case 6:
      case 8:
      case 10: this.match_info[1] = this.validateDoubleStraight(); return;

    }
    this.match_info[1] = { typeName: "Không gì cả", score: 0 };
  }

  validateSingle(): TypeInfo {
    const card: Card = this.current_player_selected_cards.positions[0];
    return { typeName: "đơn", score: card.value + card.model };
  }

  validatePair(): TypeInfo {
    const card_0: Card = this.current_player_selected_cards.positions[0];
    const card_1: Card = this.current_player_selected_cards.positions[1];
    if (card_0.value === card_1.value) {
      return { typeName: "đôi", score: (card_1.value + card_1.model) };
    }
    return { typeName: "Không gì cả", score: 0 };
  }

  validateTriple(): TypeInfo {
    if (this.current_player_selected_cards.positions[0].value === this.current_player_selected_cards.positions[1].value
      && this.current_player_selected_cards.positions[1].value === this.current_player_selected_cards.positions[2].value) {
      return { typeName: "ba", score: this.current_player_selected_cards.positions[0].value };
    }
    return { typeName: "Không gì cả", score: 0 };
  }
  validateFourOfAKind(): TypeInfo {
    if (this.current_player_selected_cards.positions[0].value === this.current_player_selected_cards.positions[1].value
      && this.current_player_selected_cards.positions[1].value === this.current_player_selected_cards.positions[2].value
      && this.current_player_selected_cards.positions[2].value === this.current_player_selected_cards.positions[3].value) {
      return { typeName: "tứ quý", score: this.current_player_selected_cards.positions[0].value };
    }

    return { typeName: "Không gì cả", score: 0 };
  }

  validateStraight(): TypeInfo {
    // this.current_player_selected_cards.positions.forEach(a => console.log(this.lookupTable[a]));
    const last_card: Card = this.current_player_selected_cards.last();
    if (last_card.value === 1500) {
      return { typeName: "Không gì cả", score: 0 };
    }
    let length: number = this.current_player_selected_cards.length - 1;
    for (let i = 0; i < length; ++i) {


      if (this.current_player_selected_cards.positions[i].value + 100 !== this.current_player_selected_cards.positions[i + 1].value) {
        // console.log(this.lookupTable[index].value, this.lookupTable[next_index].value);
        return { typeName: "Không gì cả", score: 0 };
      }
    }

    let sum: number = this.current_player_selected_cards.length * 1000 + last_card.value + last_card.model;
    return { typeName: "sảnh", score: sum };


  }

  validateDoubleStraight(): TypeInfo {
    const last_card: Card = this.current_player_selected_cards.last();
    if (last_card.value === 1500) {
      return { typeName: "Không gì cả", score: 0 };
    }
    let length: number = this.current_player_selected_cards.length - 2;
    for (let i = 0; i < length; i += 2) {
      if (this.current_player_selected_cards.positions[i].value + 100 !== this.current_player_selected_cards.positions[i + 2].value
        || this.current_player_selected_cards.positions[i + 1].value + 100 !== this.current_player_selected_cards.positions[i + 3].value) {
        return { typeName: "Không gì cả", score: 0 };
      }
    }
    let sum: number = length * 1000 + last_card.value + last_card.model;
    return { typeName: "đôi thông", score: sum };
  }
  login() {
    const my_name = document.getElementById("my-name");
    const my_id = document.getElementById("my-id") as HTMLInputElement;
    if (!my_name || !my_id) {
      return;
    }
    
    this.setPlayerName(my_id.value, my_name);
  }
  async setPlayerName(my_id: string, my_name: HTMLElement) {
    this.supabase.from("player").select("username").eq("id", my_id).single().then(({ data, error }: PostgrestSingleResponse<any>) => {
      if (error) {
        console.error('Error fetching player name:', error);
        return;
      }
      if (data) {
        my_name.innerText = data.username;
        this.current_user_id = my_id;
      }
    })
      .catch((error: any) => {
        console.error('Error:', error);
      });
  }
}



//========================== MAIN HERE ======================================//
const app = new App();
//========================== HELPER FUNCTION ===============================//
function queryCardsOnMainDesk(): Array<HTMLElement> {
  return Array.from(document.body.querySelectorAll(".card-on-main-desk"));
}
function queryCardsOnCurrentPlayer(): Array<HTMLElement> {
  return Array.from(document.body.querySelectorAll(".current-player-card"));
}
function queryInfoAboutMatch(): Array<HTMLElement> {
  return Array.from(document.body.querySelectorAll(".type-info"));
}