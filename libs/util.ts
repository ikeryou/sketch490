import device from 'current-device';

export class Util {
  private constructor() {}

  // ランダムな数(float)
  // -----------------------------------
  // @min : 最小値(float)
  // @max : 最大値(float)
  // return : min(含む)からmax(含む)までのランダムな数(float)
  // -----------------------------------
  public static random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
  public static random2(min: number, max: number): number {
    let r: number = Math.random() * (max - min) + min;
    if (this.hit(2)) {
      r *= -1;
    }
    return r;
  }

  // ランダムな数(int)
  // -----------------------------------
  // @min : 最小値(int)
  // @max : 最大値(int)
  // return : min(含む)からmax(含む)までのランダムな数(int)
  // -----------------------------------
  public static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 1/@rangeの確率でtrueを取得
  // -----------------------------------
  // @range : 2以上の分母(int)
  // return : true or false(boolean)
  // -----------------------------------
  public static hit(range: number = 0): boolean {
    if (range < 2) range = 2;
    return this.randomInt(0, range - 1) == 0;
  }

  // 配列内の値をランダムに取得
  // -----------------------------------
  public static randomArr(arr: Array<any>): any {
    return arr[this.randomInt(0, arr.length - 1)];
  }

  // -指定値から指定値までのランダムな数(float)
  // -----------------------------------
  // @val : 指定値(float)
  // return : -@valから@valまでのランダムな数(float)
  // -----------------------------------
  public static range(val: number): number {
    return this.random(-val, val);
  }

  // 値を範囲内におさめる
  // -----------------------------------
  // @val : 値
  // @min : 最小値
  // @max : 最大値
  // -----------------------------------
  public static clamp(val: number, min: number, max: number): number {
    return Math.min(max, Math.max(val, min));
  }

  // 値のマッピング
  // -----------------------------------
  // @num     : マッピングする値
  // @toMin   : 変換後の最小値
  // @toMax   : 変換後の最大値
  // @fromMin : 変換前の最小値
  // @fromMax : 変換前の最大値
  // -----------------------------------
  public static map(num: number, toMin: number, toMax: number, fromMin: number, fromMax: number): number {
    if (num <= fromMin) return toMin;
    if (num >= fromMax) return toMax;

    const p = (toMax - toMin) / (fromMax - fromMin);
    return (num - fromMin) * p + toMin;
  }

  // 線形補完
  // -----------------------------------
  public static mix(x: number, y: number, a: number): number {
    return x * (1 - a) + y * a;
  }

  // ラジアンに変換
  // -----------------------------------
  public static radian(degree: number): number {
    return (degree * Math.PI) / 180;
  }

  // 角度に変換
  // -----------------------------------
  public static degree(radian: number): number {
    return (radian * 180) / Math.PI;
  }

  // 配列をランダムに並べ替え
  // -----------------------------------
  public static shuffle(arr: Array<any>): void {
    let i = arr.length;
    while (--i) {
      const j = Math.floor(Math.random() * (i + 1));
      if (i == j) continue;
      const k = arr[i];
      arr[i] = arr[j];
      arr[j] = k;
    }
  }

  // 文字列の全置換
  // -----------------------------------
  public static replaceAll(val: string, org: string, dest: string): string {
    return val.split(org).join(dest);
  }

  // 配列内のパラメータを比較してソート
  // -----------------------------------
  // @arr  : 配列
  // @para : パラメーター名
  // @desc : 降順かどうか(boolean) デフォルトは昇順
  // -----------------------------------
  public static sort(arr: Array<any>, para: string, desc: boolean = true): void {
    if (desc) {
      arr.sort((a: any, b: any) => {
        return b[para] - a[para];
      });
    } else {
      arr.sort((a: any, b: any) => {
        return a[para] - b[para];
      });
    }
  }

  // ２点間の距離
  // -----------------------------------
  public static distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // 数値を文字列に変換
  // -----------------------------------
  // @num  : 数値
  // @keta : 桁数
  // -----------------------------------
  public static numStr(num: number, keta: number): string {
    let str = String(num);
    if (str.length >= keta) return str;

    const len = keta - str.length;
    let i = 0;
    while (i < len) {
      str = '0' + str;
      i++;
    }

    return str;
  }

  // IEかどうか Edge含む
  // -----------------------------------
  public static isIE(): boolean {
    const ua = window.navigator.userAgent.toLowerCase();
    return ua.indexOf('msie') != -1 || ua.indexOf('trident/7') != -1 || ua.indexOf('edge') != -1;
  }

  // IEかどうか Edge含まない
  // -----------------------------------
  public static isIE2(): boolean {
    const ua = window.navigator.userAgent.toLowerCase();
    return ua.indexOf('msie') != -1 || ua.indexOf('trident/7') != -1;
  }

  // WINかどうか
  // -----------------------------------
  public static isWin(): boolean {
    return window.navigator.platform.indexOf('Win') != -1;
  }

  // googleChromeかどうか
  // -----------------------------------
  public static isChrome(): boolean {
    return window.navigator.userAgent.toLowerCase().indexOf('chrome') != -1;
  }

  // FireFoxかどうか
  // -----------------------------------
  public static isFF(): boolean {
    return window.navigator.userAgent.toLowerCase().indexOf('firefox') != -1;
  }

  // Safariかどうか
  // -----------------------------------
  public static isSafari(): boolean {
    return window.navigator.userAgent.toLowerCase().indexOf('safari') != -1 && !this.isChrome();
  }

  // -----------------------------------
  // webGL使えるか
  // -----------------------------------
  public static useWebGL(): boolean {
    try {
      const c = document.createElement('canvas');
      const w: any = c.getContext('webgl') || c.getContext('experimental-webgl');
      return !!(window.WebGLRenderingContext && w && w.getShaderPrecisionFormat);
    } catch (e) {
      return false;
    }
  }

  // クエリ抜き出し
  // -----------------------------------
  // @key : 抜き出すパラメータ名(String)
  // -----------------------------------
  public static getQuery(key: string): string {
    key = key.replace(/[€[]/, '€€€[').replace(/[€]]/, '€€€]');
    const regex = new RegExp('[€€?&]' + key + '=([^&//]*)');
    const qs = regex.exec(window.location.href);
    if (qs == null) {
      return '';
    } else {
      return qs[1];
    }
  }

  // -----------------------------------
  // タッチデバイスかどうか
  // -----------------------------------
  public static isTouchDevice(): boolean {
    const isTouch = !!('ontouchstart' in window || (navigator != undefined && navigator.maxTouchPoints > 0));
    return isTouch;
  }

  // -----------------------------------
  // PCかどうか
  // -----------------------------------
  public static isPc(): boolean {
    return device.mobile() == false;
  }

  // -----------------------------------
  // スマホかどうか
  // -----------------------------------
  public static isSp(): boolean {
    return device.mobile();
  }

  // -----------------------------------
  // Androidかどうか
  // -----------------------------------
  public static isAod(): boolean {
    return device.android();
  }

  // -----------------------------------
  // iPhoneかどうか
  // -----------------------------------
  public static isIPhone(): boolean {
    return device.iphone();
  }

  // -----------------------------------
  // iPadかどうか
  // -----------------------------------
  public static isIPad(): boolean {
    return device.tablet();
  }

  // -----------------------------------
  // webp使えるかどうか
  // -----------------------------------
  public static useWebp(callback: any): void {
    if (!self.createImageBitmap) callback(false);
    const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';

    fetch(webpData)
      .then(function (response) {
        return response.blob();
      })
      .then(function (blob) {
        createImageBitmap(blob).then(
          function () {
            callback(true);
          },
          function () {
            callback(false);
          },
        );
      });
  }
}
