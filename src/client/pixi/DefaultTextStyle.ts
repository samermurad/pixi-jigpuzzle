import { TextStyle } from 'pixi.js';


const DefaultTextStyle: TextStyle = new TextStyle(
  {
    fontSize: 12,
    fontFamily: ['Luckiest Guy RUS-BEL-UKR', 'sans-serif'],
    fontStyle: 'normal',
    // fontWeight: 'bold',
    align: 'center',
    fill: 0xffffff,
    stroke: {color: '#000000', width: 2, join: 'round'},
    dropShadow: {
      color: '#000000',
      blur: 1,
      distance: 1,
    }
  }
);

export default DefaultTextStyle;
