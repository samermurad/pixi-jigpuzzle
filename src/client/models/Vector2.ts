import { PointData } from 'pixi.js';



export type V2 = (
  { x: number; y: number }
  & PointData
  );
export type V2Array = [number] | [number, number];

export class Vector2 implements V2 {

  public static readonly ONE = new Vector2(1, 1);
  public static ZERO = new Vector2();

  public readonly x: number;
  public readonly y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  // static fromPointData({ x, y }): Vector2 {
  //   return new Vector2(x, y);
  // }

  static fromNumber(num: number): Vector2 {
    return new Vector2(num, num);
  }

  static fromObject(v: V2): Vector2 {
    return new Vector2(v.x, v.y);
  }

  static fromArray([x, y]: V2Array): Vector2 {
    return new Vector2(x, y);
  }

  toObject(): V2 {
    return { ...this };
  }
  toArray(): V2Array {
    return [this.x, this.y];
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  sum(another: V2): Vector2 {
    return Vector2.fromObject(Vector2.sum(this, another));
  }

  sumXY(x: number = 0, y: number = 0): Vector2 {
    return Vector2.fromObject(Vector2.sum(this, Vector2.fromArray([x, y])));
  }

  sub(another: V2): Vector2 {
    return Vector2.fromObject(Vector2.sub(this, another));
  }

  subXY(x: number = 0, y: number = 0): Vector2 {
    return Vector2.fromObject(Vector2.sub(this, Vector2.fromArray([x, y])));
  }

  multiplyN(value: number): Vector2 {
    return new Vector2(this.x * value, this.y * value);
  }

  equals(other: V2): boolean {
    return Vector2.equals(this, other);
  }

  dot(b: V2): number {
    return Vector2.dot(this, b);
  }

  normalized(): Vector2 {
    return Vector2.fromObject(Vector2.normalize(this));
  }

  abs(): Vector2 {
    return Vector2.fromObject(Vector2.abs(this));
  }

  lerp(to: V2, t: number): Vector2 {
    return Vector2.fromObject(Vector2.lerp(this, to, t));
  }

  length(): number {
    return Math.hypot(this.x, this.y);
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  rotate(rad: number): Vector2 {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return new Vector2(
      this.x * c - this.y * s,
      this.x * s + this.y * c
    );
  }

  rad2deg(): V2 {
    const k = 180 / Math.PI;
    return { x: this.x * k, y: this.y * k };
  }

  static sum(lhs: V2, rhs: V2): V2 {
    return {
      x: lhs.x + rhs.x,
      y: lhs.y + rhs.y
    };
  }

  static sub(lhs: V2, rhs: V2): V2 {
    return {
      x: lhs.x - rhs.x,
      y: lhs.y - rhs.y
    };
  }

  static normalize(v: V2): V2 {
    const l = Math.hypot(v.x, v.y) || 1;
    return { x: v.x / l, y: v.y / l };
  }

  static equals(lhs: V2, rhs: V2): boolean {
    return lhs.x === rhs.x && lhs.y === rhs.y;
  }

  static dot(lhs: V2, rhs: V2): number {
    return lhs.x * rhs.x + lhs.y * rhs.y;
  }

  static abs(v2: V2): V2 {
    return new Vector2(Math.abs(v2.x), Math.abs(v2.y));
  }

  static lerp(from: V2, to: V2, t: number): V2 {
    return {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t
    };
  }

  setX(newX: number): Vector2 {
    return new Vector2(newX, this.y);
  }

  setY(newY: number): Vector2 {
    return new Vector2(this.x, newY);
  }

  set(newX: number | null = null, newY: number | null = null): Vector2 {
    return new Vector2(
      newX ?? this.x,
      newY ?? this.y
    );
  }
}
