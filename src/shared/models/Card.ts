
export type CardValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'J' | 'Q' | 'K' | 'A';
export enum CardType {
  SPADES = 'SPADES',
  CLUBS = 'CLUBS',
  DIAMONDS = 'DIAMONDS',
  HEARTS = 'HEARTS',
}

export namespace CardType {
  export function cardSymbol(type: CardType) {
      switch (type) {
        case CardType.SPADES: return '♠️';
        case CardType.CLUBS: return '♣️️'
        case CardType.DIAMONDS: return  '♦️';
        case CardType.HEARTS: return '♥️';
      }
  }
}

export class Card {
  constructor(public readonly type: CardType, public readonly value: CardValue) {}

  toString() {
    return `${CardType.cardSymbol(this.type)} (${this.value.toString()})`;
  }
  anotherCardType() {
    return this.type;
  }
}
