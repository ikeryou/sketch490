import { Bodies, Body, Composite, Engine, Events, Render, Runner } from 'matter-js';
import { Conf } from '../core/conf';
import { Func } from '../core/func';
import { MouseMgr } from '../core/mouseMgr';
import { MyDisplay } from '../core/myDisplay';
import { Tween } from '../core/tween';
import { DisplayConstructor } from '../libs/display';
import { Point } from '../libs/point';
import { Util } from '../libs/util';
import { Rect } from '../libs/rect';
import { Color } from 'three';

export class Swiper extends MyDisplay {
  private _tg: HTMLElement;
  private _isTouch: boolean = false;
  private _pA: Point = new Point();
  private _pB: Point = new Point();
  private _move: number = 0;
  private _startPos: Point = new Point();
  private _nowPos: Point = new Point();
  private _follow: Point = new Point();
  private _min: Point = new Point();
  private _max: Point = new Point();
  private _items: Array<SwiperItem> = [];
  private _boxScale: number = 0.5;
  private _indicator: HTMLElement;
  private _indicatorItems: Array<HTMLElement> = [];

  private _engine: Engine;
  private _render: Render;
  private _fixItems: Array<Array<Body>> = [];
  private _downItems: Array<Body> = [];
  private _downElItems: Array<HTMLElement> = [];
  private _downItemSize: Array<Rect> = [];

  private _runner: Runner;

  constructor(opt: DisplayConstructor) {
    super(opt);

    this._indicator = document.querySelector('.l-indicator') as HTMLElement;

    this._tg = this.qs('.js-swiper-tg');
    this.useGPU(this._tg)

    MouseMgr.instance.usePreventDefault = true;

    // アイテム複製
    const org = document.querySelector('.js-copy') as HTMLElement;
    for(let i = 0; i < Conf.ITEM_NUM; i++) {
      const el = org.cloneNode(true) as HTMLElement;
      el.classList.remove('js-copy');
      this._tg.appendChild(el);

      Tween.set(el.querySelector('.frame'), {
        scale: this._boxScale,
      })
    }

    this.qsAll('.js-swiper-item').forEach((el,i) => {
      this._items.push(
        new SwiperItem({
          el: el,
          dispId: i,
        }),
      );

      const indi = document.createElement('div');
      this._indicator.appendChild(indi);
      this._indicatorItems.push(indi);
    });

    if (Conf.IS_TOUCH_DEVICE) {
      this._tg.addEventListener('touchstart', () => {
        this._eTouchStart();
      });
      MouseMgr.instance.onTouchEnd.push(() => {
        this._eTouchEnd();
      });
    } else {
      this._tg.addEventListener('mousedown', () => {
        this._eTouchStart();
      });
      MouseMgr.instance.onMouseUp.push(() => {
        this._eTouchEnd();
      });
    }

    // matter.jsセットアップ

    // エンジン
    this._engine = Engine.create();
    this._engine.gravity.y = 0.5;
    // this._engine.velocityIterations = 3;
    // this._engine.positionIterations = 3;

    // レンダラー
    this._render = Render.create({
      element: document.body,
      engine: this._engine,
      options: {
        width: Func.sw(),
        height: Func.sh(),
        showAngleIndicator: true,
        showCollisions: true,
        showVelocity: true,
        pixelRatio:Conf.FLG_SHOW_MATTERJS ? 1 : 0.1,
      }
    });
    this._render.canvas.classList.add('js-matter')
    if(!Conf.FLG_SHOW_MATTERJS) {
      this._render.canvas.classList.add('-hide')
    }

    const maskA = 0x0001;
    const maskB = 0x0002; 

    // カルーセルアイテム反映用Body
    const kake = this._boxScale;
    // const itemSize = this._items[0].el.offsetWidth;
    const itemSize = Func.sw() * 0.6;
    const w = itemSize * kake;
    const h = 20
    const amari = h
    this._items.forEach((_item, i) => {
      const opt = {
        isStatic:true, 
        density: 2,
        friction:0.9,
        // restitution: 0.9,
        render:{visible: Conf.FLG_SHOW_MATTERJS},
        collisionFilter: {
          category: maskA,
        }
      }

      // 上
      const bodyTop = Bodies.rectangle(itemSize * i, 0, w + amari * 2, h * 0, opt);

      // 右
      const bodyRight = Bodies.rectangle(itemSize * i + w, 0, w, w * 0.5, opt);

      // 下
      const bodyBtm = Bodies.rectangle(itemSize * i, w, w * 2 + amari * 2, h, opt);

      // 左
      const bodyLeft = Bodies.rectangle(itemSize * i, 0, h, 0 , opt);

      Composite.add(this._engine.world, [bodyTop, bodyRight, bodyBtm, bodyLeft]);
      this._fixItems.push([bodyTop, bodyRight, bodyBtm, bodyLeft]);
    })

    // 雨のように落ちるアイテム
    const downArea = document.querySelector('.l-downArea') as HTMLElement;
    const num = 600
    for (let i = 0; i < num; i++) {
      const dw = Util.hit(5) ? 30 : 15;
      const dh = dw;
      // const key = i % this._items.length;
      const x = Util.random(0, Func.sw());
      const y = Util.random(Func.sh(), Func.sh() * 2);
      const downItem = Bodies.rectangle(x, y, dw, dh, {
        isStatic: false,
        // density: 0.001,
        // density: Util.random(0.1, 10),
        angle: Util.range(1),
        // mass: 0.2,
        // friction: 0.01,
        // restitution: 0.01,
        render:{visible: Conf.FLG_SHOW_MATTERJS},
        collisionFilter: {
          category: maskB,
          // mask: maskA,
        }
      });
      this._downItems.push(downItem);
      Composite.add(this._engine.world, [downItem]);

      const downEl = document.createElement('div');
      downEl.classList.add('js-downItem');
      downArea.appendChild(downEl);
      this._downElItems.push(downEl);
      Tween.set(downEl, {
        y: -100,
        width: dw,
        height: dw,
        scale: 0.9,
        backgroundColor: new Color(0x000000).offsetHSL(Util.random(0,1), 1, 0.5).getStyle()
      })
      this.useGPU(downEl)

      this._downItemSize.push(new Rect(0, 0, dw, dh));
    }

    Render.run(this._render);
    this._runner = Runner.create();
    // this._runner.delta = 1000 / 30;
    Runner.run(this._runner, this._engine);
    
    Events.on(this._render, 'afterRender', () => {
      // this._eAfterRender();
    })
  }

  private _eAfterRender(): void {
    // 中心に近いitemを探す
    const testX = Func.sw() * 0.5;
    let m = 9999;
    let id = 0;

    // 物理演算結果をパーツに反映
    const sh = Func.sh();
    const itemWidth = this._items[0].el.offsetWidth;
    this._fixItems.forEach((arr, i) => {
      const x = itemWidth * i + this._nowPos.x + itemWidth * 0.5
      const w = itemWidth * this._boxScale;
      // const h = 10;
      arr.forEach((val, j) => {
        Body.setPosition(val, {
          x: [x, x + w * 0, x, x - w * 0.5][j], 
          y: sh * 0.5 + [0, w * 0.5, w * 1.5, w * 0.5][j] - w * 0.5,
        });
      })
      

      const test = x - testX;
      if (Math.abs(test) < m) {
        m = Math.abs(test);
        id = i;
      }
    })

    // this._runner.delta
    // Engine.update(this._engine, this._runner.delta);

    this._indicatorItems.forEach((el, i) => {
      if (i == id) {
        el.classList.add('-current');
      } else {
        el.classList.remove('-current');
      }
    })

    this._downItems.forEach((val,i) => {
      if(val.position.y > sh) {
        this._resetDownItem(val);
      }

      const downEl = this._downElItems[i];
      Tween.set(downEl, {
        x: val.position.x - this._downItemSize[i].width * 0.5,
        y: val.position.y - this._downItemSize[i].height * 0.5,
        rotationZ: Util.degree(val.angle),
      })
    })
  }

  private _resetDownItem(item: Body): void {
    Body.setPosition(item, {
      x: Util.random(0, Func.sw()), 
      y: Util.random(-Func.sh() * 0.1, -Func.sh() * 0.5),
    });
  }

  private _eTouchStart(): void {
    this._move = 0;
    this._isTouch = true;

    this._pA.set(MouseMgr.instance.x, MouseMgr.instance.y);

    this._startPos.x = this._nowPos.x;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grab';
  }

  private _eTouchEnd(): void {
    if (!this._isTouch) return;
    this._isTouch = false;

    this._startPos.x = this._nowPos.x;

    // ドラッグ後のフォロー値
    this._follow.x = MouseMgr.instance.d.x * -2;

    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }

  // 更新
  protected _update(): void {
    super._update();

    this._eAfterRender();

    const marginX = 0
    const itemWidth = this._items[0].el.offsetWidth;
    this._min.x = this._items[this._items.length - 1].el.offsetLeft * -1 - itemWidth + Func.sw() - marginX;
    this._max.x = marginX;

    if (this._isTouch) {
      this._pB.set(MouseMgr.instance.x, MouseMgr.instance.y);
      if (Conf.IS_TOUCH_DEVICE) {
        this._pA = MouseMgr.instance.tStartVal[0];
      }
      this._move = (this._pA.x - this._pB.x) * -1;
      let tgX = this._startPos.x + this._move;
      
      if (tgX > this._max.x) tgX = this._max.x + (tgX - this._max.x) * 0.5;
      if (tgX < this._min.x) tgX = this._min.x + (tgX - this._min.x) * 0.5;
      this._nowPos.x = tgX;
    } else {
      this._follow.x += (0 - this._follow.x) * 0.1;
      this._startPos.x += this._follow.x;
      const tgX = this._startPos.x + this._follow.x;

      const be = 0.2;
      if (tgX > this._max.x) {
        this._nowPos.x += (this._max.x - this._nowPos.x) * be;
      } else if (tgX < this._min.x) {
        this._nowPos.x += (this._min.x - this._nowPos.x) * be;
      } else {
        this._nowPos.x = Util.clamp(tgX, this._min.x, this._max.x);
      }
    }

    Tween.set(this._tg, {
      x: this._nowPos.x,
    });
  }
}

export class SwiperItem extends MyDisplay {

  constructor(opt: DisplayConstructor) {
    super(opt);

    const frame = this.qs('.frame');
    frame.innerHTML = 'link ' + Util.numStr((opt.dispId as number) + 1, 3)

    Tween.set(frame, {
      color: new Color(0x000000).offsetHSL(Util.map(opt.dispId || 0, 0, 1, 0, Conf.ITEM_NUM - 1), 1, 0.5).getStyle()
    })
  }

  // 更新
  protected _update(): void {
    super._update();
  }
}
