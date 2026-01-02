import { Rectangle } from 'pixi.js';
import {Grid} from '../models/data/Grid';



describe('Grid Unit Tests', () => {
  const grid = new Grid(25, 25, new Rectangle(0, 0, 250, 250), { width: 250, height: 250 });
  test('testing grid id generation', () => {
      expect(grid.tileIdByIndex(0)).toEqual('0x0');
  })
})
