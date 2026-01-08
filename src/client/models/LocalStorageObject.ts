


export class LocalStorageObject<T> {
  private _value?: T
  constructor(public readonly key: string, private defaultValue?: T) {
    this._value = defaultValue || undefined;
  }


  load() {
    try {
      const item = localStorage.getItem(this.key);
      if (item) {
        this._value = JSON.parse(item!)
      }
    } catch (err) {
      console.error('LocalStorageObject','Failed to load key', this.key, 'as', typeof this._value, err);
    }
  }
  save() {
    try {
      const str = JSON.stringify(this._value)
      localStorage.setItem(this.key, str)
    } catch (err) {
      console.error('LocalStorageObject','Failed to save key', this.key, 'as', typeof this._value, err);
    }
  }
  del() {
    localStorage.removeItem(this.key)
  }

  set value(value: T) {
    this._value = value;
  }
  get value(): T | undefined {
    return this._value;
  }
}
