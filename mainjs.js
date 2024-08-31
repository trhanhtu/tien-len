"use strict"
import {MODEL} from "contant.js"
var Class

;(function(Class) {
  Class[(Class["Back"] = 0)] = "Back"
  Class[(Class["Spades"] = 1)] = "Spades"
  Class[(Class["Clubs"] = 2)] = "Clubs"
  Class[(Class["Diamonds"] = 4)] = "Diamonds"
  Class[(Class["Hearts"] = 8)] = "Hearts"
})(Class || (Class = {}))

class ReadyCards {
  constructor(SIZE, defaultValue) {
    this.length = 0
    this.defaultValue = defaultValue
    this.positions = Array(SIZE).fill(defaultValue)
  }
  push(value) {
    if (this.length + 1 > this.positions.length) {
      return
    }

    this.positions[this.length] = value
    this.length += 1
    this.positions.sort(
      (a, b) => a.value * 10 + a.model - (b.value * 10 + b.model)
    )
  }
  remove(value) {
    const index = this.positions.indexOf(value)
    if (index < 0) {
      return
    }
    this.positions[index] = this.defaultValue
    this.positions.sort(
      (a, b) => a.value * 10 + a.model - (b.value * 10 + b.model)
    )
    this.length -= 1
  }
  last() {
    return this.positions[this.length - 1]
  }
  clear() {
    for (let card of this.positions) {
      card = this.defaultValue
    }
    this.length = 0
  }
}
class IndexLookupTableArray {
  constructor(SIZE, defaultValue) {
    this.length = 0
    this.defaultValue = defaultValue
    this.positions = Array(SIZE).fill(defaultValue)
  }
  push(value) {
    if (this.length + 1 > this.positions.length) {
      return
    }

    this.positions[this.length] = value
    this.length += 1
    this.positions.sort((a, b) => a - b)
  }
  pushArray(values) {
    const new_length = this.length + values.length
    if (new_length > this.positions.length) {
      return
    }
    this.positions.push(...values)
    for (let i = this.length; i < new_length; ++i) {
      this.positions[i] = values[i]
    }
    this.length = new_length
  }
  removeArray(indexes) {
    for (let i = 0; i < indexes.length; ++i) {
      this.positions[i] = this.defaultValue
    }
    this.positions.sort((a, b) => a - b)
    this.length -= indexes.length
  }
  remove(value) {
    const index = this.positions.indexOf(value)
    if (index < 0) {
      return
    }
    this.positions[index] = this.defaultValue
    this.positions.sort((a, b) => a - b)
    this.length -= 1
  }
  last() {
    return this.positions[this.length - 1]
  }
  clear() {
    for (let card of this.positions) {
      card = this.defaultValue
    }
    this.length = 0
  }
  updateNewValues(values) {
    if (values.length <= this.positions.length) {
      for (let i = 0; i < values.length; ++i) {
        this.positions[i] = values[i]
      }
      if (values.length > this.length) {
        this.length = values.length
      }
    }
  }
}
class App {
  lookupTable = [
    // Hearts
    { value: 300, model: MODEL.HEARTS, symbol: "🂳" }, // 3 of Hearts
    { value: 400, model: MODEL.HEARTS, symbol: "🂴" }, // 4 of Hearts
    { value: 500, model: MODEL.HEARTS, symbol: "🂵" }, // 5 of Hearts
    { value: 600, model: MODEL.HEARTS, symbol: "🂶" }, // 6 of Hearts
    { value: 700, model: MODEL.HEARTS, symbol: "🂷" }, // 7 of Hearts
    { value: 800, model: MODEL.HEARTS, symbol: "🂸" }, // 8 of Hearts
    { value: 900, model: MODEL.HEARTS, symbol: "🂹" }, // 9 of Hearts
    { value: 1000, model: MODEL.HEARTS, symbol: "🂺" }, // 10 of Hearts
    { value: 1100, model: MODEL.HEARTS, symbol: "🂻" }, // Jack of Hearts
    { value: 1200, model: MODEL.HEARTS, symbol: "🂽" }, // Queen of Hearts
    { value: 1300, model: MODEL.HEARTS, symbol: "🂾" }, // King of Hearts
    { value: 1400, model: MODEL.HEARTS, symbol: "🂱" }, // Ace of Hearts
    { value: 1500, model: MODEL.HEARTS, symbol: "🂲" }, // 2 of Hearts
    // Diamonds
    { value: 300, model: MODEL.DIAMONDS, symbol: "🃃" }, // 3 of Diamonds
    { value: 400, model: MODEL.DIAMONDS, symbol: "🃄" }, // 4 of Diamonds
    { value: 500, model: MODEL.DIAMONDS, symbol: "🃅" }, // 5 of Diamonds
    { value: 600, model: MODEL.DIAMONDS, symbol: "🃆" }, // 6 of Diamonds
    { value: 700, model: MODEL.DIAMONDS, symbol: "🃇" }, // 7 of Diamonds
    { value: 800, model: MODEL.DIAMONDS, symbol: "🃈" }, // 8 of Diamonds
    { value: 900, model: MODEL.DIAMONDS, symbol: "🃉" }, // 9 of Diamonds
    { value: 1000, model: MODEL.DIAMONDS, symbol: "🃊" }, // 10 of Diamonds
    { value: 1100, model: MODEL.DIAMONDS, symbol: "🃋" }, // Jack of Diamonds
    { value: 1200, model: MODEL.DIAMONDS, symbol: "🃍" }, // Queen of Diamonds
    { value: 1300, model: MODEL.DIAMONDS, symbol: "🃎" }, // King of Diamonds
    { value: 1400, model: MODEL.DIAMONDS, symbol: "🃁" }, // Ace of Diamonds
    { value: 1500, model: MODEL.DIAMONDS, symbol: "🃂" }, // 2 of Diamonds
    // Clubs
    { value: 300, model: MODEL.CLUBS, symbol: "🃓" }, // 3 of Clubs
    { value: 400, model: MODEL.CLUBS, symbol: "🃔" }, // 4 of Clubs
    { value: 500, model: MODEL.CLUBS, symbol: "🃕" }, // 5 of Clubs
    { value: 600, model: MODEL.CLUBS, symbol: "🃖" }, // 6 of Clubs
    { value: 700, model: MODEL.CLUBS, symbol: "🃗" }, // 7 of Clubs
    { value: 800, model: MODEL.CLUBS, symbol: "🃘" }, // 8 of Clubs
    { value: 900, model: MODEL.CLUBS, symbol: "🃙" }, // 9 of Clubs
    { value: 1000, model: MODEL.CLUBS, symbol: "🃚" }, // 10 of Clubs
    { value: 1100, model: MODEL.CLUBS, symbol: "🃛" }, // Jack of Clubs
    { value: 1200, model: MODEL.CLUBS, symbol: "🃝" }, // Queen of Clubs
    { value: 1300, model: MODEL.CLUBS, symbol: "🃞" }, // King of Clubs
    { value: 1400, model: MODEL.CLUBS, symbol: "🃑" }, // Ace of Clubs
    { value: 1500, model: MODEL.CLUBS, symbol: "🃒" }, // 2 of Clubs
    // Spades
    { value: 300, model: MODEL.SPADES, symbol: "🂣" }, // 3 of Spades
    { value: 400, model: MODEL.SPADES, symbol: "🂤" }, // 4 of Spades
    { value: 500, model: MODEL.SPADES, symbol: "🂥" }, // 5 of Spades
    { value: 600, model: MODEL.SPADES, symbol: "🂦" }, // 6 of Spades
    { value: 700, model: MODEL.SPADES, symbol: "🂧" }, // 7 of Spades
    { value: 800, model: MODEL.SPADES, symbol: "🂨" }, // 8 of Spades
    { value: 900, model: MODEL.SPADES, symbol: "🂩" }, // 9 of Spades
    { value: 1000, model: MODEL.SPADES, symbol: "🂪" }, // 10 of Spades
    { value: 1100, model: MODEL.SPADES, symbol: "🂫" }, // Jack of Spades
    { value: 1200, model: MODEL.SPADES, symbol: "🂭" }, // Queen of Spades
    { value: 1300, model: MODEL.SPADES, symbol: "🂮" }, // King of Spades
    { value: 1400, model: MODEL.SPADES, symbol: "🂡" }, // Ace of Spades
    { value: 1500, model: MODEL.SPADES, symbol: "🂢" }, // 2 of Spades

    { value: 999999, model: MODEL.BACK, symbol: "🂠" }
  ]

  constructor() {
    this.cards_on_main_desk = new IndexLookupTableArray(13, 999999);
    document.createElement()
    this.cards_in_current_player_hand = new IndexLookupTableArray(13, 999999);
    this.current_player_selected_cards = new IndexLookupTableArray(13, 999999);
    this.main_desk_type_info = { typeName: "Không gì cả", score: 0 };
    this.current_player_type_info = { typeName: "Không gì cả", score: 0 };
    this.splittingTheDeck();
  }

  shuffleCardsDeck() {
    const cards_deck = Array.from({ length: 52 }, (_, index) => index);
    this.current_player_selected_cards.clear();
    let currentIndex = 52;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      ;[cards_deck[currentIndex], cards_deck[randomIndex]] = [
        cards_deck[randomIndex],
        cards_deck[currentIndex]
      ]
    }
    return cards_deck;
  }
  sortCards() {
    this.cards_in_current_player_hand.positions.sort(
      (left, right) =>
        this.lookupTable[left].value +
        this.lookupTable[left].model -
        (this.lookupTable[right].value + this.lookupTable[right].model)
    )
  }
  splittingTheDeck() {
    const temp_cards = this.shuffleCardsDeck();
    this.cards_in_current_player_hand.updateNewValues(temp_cards.slice(0, 13));
    
  }
  updateCardsInReadyHand(current_card, index) {
    if (current_card.style.backgroundColor === "green") {
      current_card.style.backgroundColor = "transparent"
      this.current_player_selected_cards.remove(
        this.cards_in_current_player_hand.positions[index]
      )
    } else {
      current_card.style.backgroundColor = "green"

      this.current_player_selected_cards.push(
        this.cards_in_current_player_hand.positions[index]
      )
    }
    console.log("ready: ", this.current_player_selected_cards.positions)
    this.calcuteTypeAndScore()
  }
  calcuteTypeAndScore() {
    switch (this.current_player_selected_cards.length) {
      case 0:
        this.current_player_type_info = { typeName: "không gì cả", score: 0 }
        return
      case 1:
        this.current_player_type_info = this.validateSingle()
        return
      case 2:
        this.current_player_type_info = this.validatePair()
        return
    }
    this.current_player_type_info = this.validateStraight()
    if (this.current_player_type_info.score !== 0) {
      return
    }
    switch (this.current_player_selected_cards.length) {
      case 3:
        this.current_player_type_info = this.validateTriple()
        return
      case 4:
        this.current_player_type_info = this.validateFourOfAKind()
        return
      case 6:
      case 8:
      case 10:
        this.current_player_type_info = this.validateDoubleStraight()
        return
    }
    this.current_player_type_info = { typeName: "không gì cả", score: 0 }
  }
  validateSingle() {
    const card = this.lookupTable[
      this.current_player_selected_cards.positions[0]
    ]
    return { typeName: "đơn", score: card.value + card.model }
  }
  validatePair() {
    const card_0 = this.lookupTable[
      this.current_player_selected_cards.positions[0]
    ]
    const card_1 = this.lookupTable[
      this.current_player_selected_cards.positions[1]
    ]
    if (card_0.value === card_1.value) {
      return {
        typeName: "đôi",
        score: card_1.value + card_1.model
      }
    }
    return { typeName: "không gì cả", score: 0 }
  }
  validateTriple() {
    const cards = Array.from(
      { length: 3 },
      (_, index) =>
        this.lookupTable[this.current_player_selected_cards.positions[index]]
    )
    if (
      cards[0].value === cards[1].value &&
      cards[1].value === cards[2].value
    ) {
      return {
        typeName: "ba con",
        score: cards[0].value
      }
    }
    return { typeName: "không gì cả", score: 0 }
  }
  validateStraight() {
    let index = this.current_player_selected_cards.last()
    const last_card = this.lookupTable[index]
    if (last_card.value === 1500) {
      return { typeName: "không gì cả", score: 0 }
    }
    let length = this.current_player_selected_cards.length - 1
    for (let i = 0; i < length; ++i) {
      index = this.current_player_selected_cards.positions[i]
      let next_index = this.current_player_selected_cards.positions[i + 1]
      if (
        this.lookupTable[index].value + 100 !==
        this.lookupTable[next_index].value
      ) {
        return { typeName: "không gì cả", score: 0 }
      }
    }

    let sum =
      this.current_player_selected_cards.length * 10000 +
      last_card.value +
      last_card.model
    return { typeName: "sảnh", score: sum }
  }
  validateFourOfAKind() {
    const cards = Array.from(
      { length: 4 },
      (_, index) =>
        this.lookupTable[this.current_player_selected_cards.positions[index]]
    )
    if (
      cards[0].value === cards[1].value &&
      cards[1].value === cards[2].value &&
      cards[2].value === cards[3].value
    ) {
      return {
        typeName: "tứ quý",
        score: cards[0].value
      }
    }
    return { typeName: "không gì cả", score: 0 }
  }
  validateDoubleStraight() {
    let last_index = this.current_player_selected_cards.last()
    const last_card = this.lookupTable[last_index]
    if (last_card.value === 1500) {
      return { typeName: "không gì cả", score: 0 }
    }
    let length = this.current_player_selected_cards.length - 2
    const cards = Array.from(
      { length: this.current_player_selected_cards.length },
      (_, index) =>
        this.lookupTable[this.current_player_selected_cards.positions[index]]
    )
    for (let i = 0; i < length; i += 2) {
      if (
        cards[i].value + 100 !== cards[i + 2].value ||
        cards[i + 1].value + 100 !== cards[i + 3].value
      ) {
        return { typeName: "không gì cả", score: 0 }
      }
    }
    let sum = length * 10000 + last_card.value + last_card.model
    return { typeName: "đôi thông", score: sum + last_card.model }
  }
  lauchAttack() {
    if (this.main_desk_type_info.score === 0) {
      this.cards_on_main_desk.positions = [
        ...this.current_player_selected_cards.positions
      ]
      this.cards_on_main_desk.length = this.current_player_selected_cards.length
      this.main_desk_type_info = { ...this.current_player_type_info }
      this.current_player_selected_cards.clear()

      console.log(
        "on desk",
        this.cards_on_main_desk.positions,
        "\non hand",
        this.current_player_selected_cards.positions
      )

      return
    }
  }
}

//========================== MAIN HERE ======================================//
var app = new App()