import React from 'react';
import { GlobalContext, RtcMessageTypes, EventNames } from '../Shared/Consts';
import ChatService from '../Services/ChatService';
import { RtcMessage } from '../Models/dtos';

interface CoOrdinate {
    x: number;
    y: number;
}
interface GameState {
    myPos: CoOrdinate,
    bullets: CoOrdinate[],
    enemyBullets: CoOrdinate[],
    enemyPos: CoOrdinate,
    canvSize: number
}
export class GameCanvas extends React.Component {
    static contextType = GlobalContext;
    private chatService: ChatService = {} as ChatService;
    private compRef: any = {};
    state: GameState = {
        myPos: { x: 0, y: 0 },
        bullets: [],
        enemyBullets: [],
        enemyPos: { x: 0, y: 0 },
        canvSize: 200
    }
    constructor(props: any) {
        super(props);
        this.compRef = React.createRef();
        console.log(this.compRef);
    }
    private ctx: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
    private imageSource: CanvasImageSource = {} as CanvasImageSource;
    private imageSource2: CanvasImageSource = {} as CanvasImageSource;
    private bulletSource1: CanvasImageSource = {} as CanvasImageSource;
    private bulletSource2: CanvasImageSource = {} as CanvasImageSource;
    private interval: NodeJS.Timeout = {} as NodeJS.Timeout;
    private tankWidth: number = 160;
    private tankHeight: number = 60;
    private bulletWidth: number = 6;
    private bulletHeight: number = 6;
    private bulletSpeed: number = 5;
    componentDidMount() {
        this.chatService = this.context.chatService;
        var st = this.state;
        st.canvSize = this.compRef.current.offsetWidth;
        st.enemyPos = { x: st.canvSize - this.tankWidth, y: 0 };
        this.setState({
            st
        });
        const img = new Image();
        img.width = this.tankWidth;
        img.height = this.tankHeight;
        const img2 = new Image();
        const bulletImg1 = new Image();
        const bulletImg2 = new Image();
        const canvRef = this.refs.canvas as HTMLCanvasElement;
        this.ctx = canvRef.getContext('2d') as CanvasRenderingContext2D;
        this.ctx.imageSmoothingEnabled = false;
        img.onload = () => {
            console.log('loaded');
            this.imageSource = img;
        }
        img2.onload = () => {
            console.log('loaded');
            this.imageSource2 = img2;

        }
        bulletImg1.onload = () => {
            console.log('loaded');
            this.bulletSource1 = bulletImg1;
        }
        bulletImg2.onload = () => {
            console.log('loaded');
            this.bulletSource2 = bulletImg2;
            this.renderCanvas();
        }
        img.src = 'tank3.png';
        img2.src = 'tank4.png';
        bulletImg1.src = 'bullet1.png';
        bulletImg2.src = 'bullet2.png';
        this.interval = setInterval(() => {
            if (this.state.bullets.length > 0 || this.state.enemyBullets.length > 0) {
                var tempState = this.state;
                var bullets = this.state.bullets.map(s => {
                    if (this.doesHitTank(this.state.enemyPos, s)) {
                        this.chatService.myScore++;
                        this.chatService.raiseEvent(EventNames.SCORE_UPDATED, null);
                        return { x: this.state.canvSize, y: s.y } as CoOrdinate
                    }
                    return { x: s.x + this.bulletSpeed, y: s.y } as CoOrdinate
                }).filter(s => s.x < this.ctx.canvas.width);
                tempState.bullets = bullets;
                var enemyBullets = this.state.enemyBullets.map(s => {
                    if (this.doesHitTank(this.state.myPos, s)) {
                        this.chatService.opponentScore++;
                        this.chatService.raiseEvent(EventNames.SCORE_UPDATED, null);
                        return { x: 0, y: s.y } as CoOrdinate
                    }
                    return { x: s.x - this.bulletSpeed, y: s.y } as CoOrdinate
                }).filter(s => s.x > 0);
                tempState.enemyBullets = enemyBullets;
                this.setState({
                    tempState
                });
                this.renderCanvas();
            }
        }, 15);
        this.chatService.bindToEvent(EventNames.TANK_POSITION_RECEIVED, this.receiveTankCordinateHandle);
        this.chatService.bindToEvent(EventNames.BULLET_RECEIVED, this.receiveBulletHandle);
    }
    doesHitTank = (tank: CoOrdinate, bullet: CoOrdinate): boolean => {
        var bulletCenter = { x: bullet.x + (this.bulletWidth / 2), y: bullet.y + (this.bulletHeight / 2) } as CoOrdinate;
        return bulletCenter.x > tank.x && bulletCenter.x < tank.x + this.tankWidth && bulletCenter.y > tank.y && bulletCenter.y < tank.y + this.tankHeight;
    }
    componentWillUnmount() {
        clearInterval(this.interval);
        this.chatService.unbindFromEvent(EventNames.TANK_POSITION_RECEIVED, this.receiveTankCordinateHandle);
        this.chatService.unbindFromEvent(EventNames.BULLET_RECEIVED, this.receiveBulletHandle);
    }
    receiveBulletHandle = (msg: RtcMessage) => {
        var bulletCoord: CoOrdinate = JSON.parse(msg.MessageValue);
        var s = this.state;
        s.enemyBullets = [...s.enemyBullets, { x: this.state.canvSize - bulletCoord.x, y: bulletCoord.y }]
        this.setState({
            s
        })
    }
    receiveTankCordinateHandle = (msg: RtcMessage) => {
        var tankCoord: CoOrdinate = JSON.parse(msg.MessageValue);
        var s = this.state;
        s.enemyPos = { x: this.state.canvSize - tankCoord.x - this.tankWidth, y: tankCoord.y } as CoOrdinate;
        this.setState({
            s
        });
        this.renderCanvas();
    }
    renderCanvas = () => {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(this.imageSource, this.state.myPos.x, this.state.myPos.y, this.tankWidth, this.tankHeight);
        this.ctx.drawImage(this.imageSource2, this.state.enemyPos.x, this.state.enemyPos.y, this.tankWidth, this.tankHeight);
        this.state.bullets.forEach(s => {
            this.ctx.drawImage(this.bulletSource1, s.x, s.y, this.bulletWidth, this.bulletHeight);
        });
        this.state.enemyBullets.forEach(s => {
            this.ctx.drawImage(this.bulletSource2, s.x, s.y, this.bulletWidth, this.bulletHeight);
        });
    }

    render() {
        return (<div ref={this.compRef} style={{ width: '100%' }}>
            <canvas ref='canvas' id="game-canvas" tabIndex={0} onKeyDownCapture={this.keyPressedOnCanvas} height='550' width={this.state.canvSize} onKeyDown={this.keyPressedOnCanvas} style={{ background: 'WHITE' }}>

            </canvas>
        </div>);
    }
    keyPressedOnCanvas = (evt: React.KeyboardEvent<HTMLCanvasElement>) => {
        var dx = 0;
        var dy = 0;
        var speed = 3;
        var bulletShot = false;
        switch (evt.keyCode) {
            case 37:
                dx = - speed;
                break;
            case 38:
                dy = - speed;
                break;
            case 39:
                dx = speed;
                break;
            case 40:
                dy = speed;
                break;
            case 32:
                bulletShot = true;
                break;
        }
        var st = this.state;
        if (st.myPos.x !== 0 || dx > 0)
            st.myPos.x += dx;
        if (st.myPos.y !== 0 || dy > 0)
            st.myPos.y += dy;
        console.log(evt.keyCode);

        if (bulletShot) {
            var bulletPos = { x: st.myPos.x + this.tankWidth, y: st.myPos.y + (this.tankHeight * 0.1) } as CoOrdinate;
            var bullets = [...st.bullets, bulletPos];
            st.bullets = bullets;
            this.chatService.publishViaDataChannel({ MessageType: RtcMessageTypes.BULLET_POSITION, MessageValue: JSON.stringify(bulletPos) });
        } else {
            this.chatService.publishViaDataChannel({ MessageType: RtcMessageTypes.TANK_POSITION, MessageValue: JSON.stringify(st.myPos) });
        }
        this.setState({
            st
        });
        this.renderCanvas();
    };
}