import React from 'react';
import { GlobalContext, RtcMessageTypes } from '../Shared/Consts';
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
    private interval: NodeJS.Timeout = {} as NodeJS.Timeout;
    private tankWidth: number = 160;
    private tankHeight: number = 60;
    private bulletWidth: number = 3;
    private bulletHeight: number = 3;
    componentDidMount() {
        this.chatService = this.context.chatService;
        var st = this.state;
        st.canvSize = this.compRef.current.offsetWidth;
        this.setState({
            st
        });
        const img = new Image();
        img.width = this.tankWidth;
        img.height = this.tankHeight;
        const img2 = new Image();
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
            this.renderCanvas();
        }
        img.src = 'tank3.png';
        img2.src = 'tank4.png';
        this.interval = setInterval(() => {

            if (this.state.bullets.length > 0 || this.state.enemyBullets.length > 0) {
                var tempState = this.state;
                var bullets = this.state.bullets.map(s => { return { x: s.x + 2, y: s.y } as CoOrdinate }).filter(s => s.x < this.ctx.canvas.width);
                tempState.bullets = bullets;
                var enemyBullets = this.state.enemyBullets.map(s => { return { x: s.x + 4, y: s.y } as CoOrdinate }).filter(s => s.x < this.ctx.canvas.width);
                tempState.enemyBullets = enemyBullets;
                this.setState({
                    tempState
                });
                this.renderCanvas();
            }
        }, 15);

    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    receiveBulletHandle = (msg: RtcMessage) => {
        var bulletCoord: CoOrdinate = JSON.parse(msg.MessageValue);
    }
    receiveTankCordinateHandle = (msg: RtcMessage) => {
        var tankCoord: CoOrdinate = JSON.parse(msg.MessageValue);
        var s = this.state;
        s.enemyPos = tankCoord;
        this.setState({
            s
        });
        this.renderCanvas();
    }
    renderCanvas = () => {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(this.imageSource, this.state.myPos.x, this.state.myPos.y, this.tankWidth, this.tankHeight);
        this.ctx.drawImage(this.imageSource2, this.ctx.canvas.width - this.tankWidth - this.state.enemyPos.x, this.state.enemyPos.y, this.tankWidth, this.tankHeight);
        this.state.bullets.forEach(s => {
            this.ctx.drawImage(this.imageSource, s.x, s.y, 3, 3);
        });
    }

    render() {
        return (<div ref={this.compRef} style={{ width: '100%' }}><canvas ref='canvas' id="game-canvas" tabIndex={0} onKeyDownCapture={this.keyPressedOnCanvas} height='550' width={this.state.canvSize} onKeyDown={this.keyPressedOnCanvas} style={{ background: 'WHITE' }}>

        </canvas></div>);
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
            var bullets = [...st.bullets, st.myPos];
            st.bullets = bullets;
            this.chatService.publishViaDataChannel({ MessageType: RtcMessageTypes.BULLET_POSITION, MessageValue: JSON.stringify(st.myPos) });
        } else {
            this.chatService.publishViaDataChannel({ MessageType: RtcMessageTypes.TANK_POSITION, MessageValue: JSON.stringify(st.myPos) });
        }
        this.setState({
            st
        });
        this.renderCanvas();
    };
}