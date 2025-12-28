import sharedLib from '../shared';
import { Card, CardType } from '../shared/models/Card';


const clientSideCode = () => console.log('ClientSide Code');
clientSideCode();

sharedLib()



console.log(`${new Card(CardType.CLUBS, 'A')}`)

const cards: Card[] = [
  new Card(CardType.CLUBS, 'A'),
]


console.log(cards);
console.log('samer');

