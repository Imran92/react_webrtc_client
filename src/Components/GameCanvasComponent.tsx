import React, { useContext, useEffect } from 'react';
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
var state: GameState = {
    myPos: { x: 0, y: 0 },
    bullets: [],
    enemyBullets: [],
    enemyPos: { x: 0, y: 0 },
    canvSize: 200
}
var compRef: any = {};
var gameCanvas: any = {};

var ctx: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
var imageSource: CanvasImageSource = {} as CanvasImageSource;
var imageSource2: CanvasImageSource = {} as CanvasImageSource;
var bulletSource1: CanvasImageSource = {} as CanvasImageSource;
var bulletSource2: CanvasImageSource = {} as CanvasImageSource;
var interval: NodeJS.Timeout = {} as NodeJS.Timeout;
var tankWidth: number = 160;
var tankHeight: number = 60;
var bulletWidth: number = 6;
var bulletHeight: number = 6;
var bulletSpeed: number = 5;
var loadedImageCount: number = 0;
var upPressed: boolean = false;
var downPressed: boolean = false;
var leftPressed: boolean = false;
var rightPressed: boolean = false;
var spacePressed: boolean = false;

const GameCanvas = (props: any) => {
    const context = useContext(GlobalContext);
    const chatService = context.chatService;


    useEffect(() => {
        const canvRef = gameCanvas as HTMLCanvasElement;
        state.canvSize = compRef.offsetWidth;
        canvRef.width = state.canvSize;
        state.enemyPos = { x: state.canvSize - tankWidth, y: 0 };
        ctx = canvRef.getContext('2d') as CanvasRenderingContext2D;
        ctx.imageSmoothingEnabled = false;
        interval = setInterval(() => {
            if (state.bullets.length > 0 || state.enemyBullets.length > 0) {
                var tempState = state;
                var bullets = state.bullets.map(s => {
                    if (doesHitTank(state.enemyPos, s)) {
                        chatService.myScore++;
                        chatService.raiseEvent(EventNames.SCORE_UPDATED, null);
                        return { x: state.canvSize, y: s.y } as CoOrdinate
                    }
                    return { x: s.x + bulletSpeed, y: s.y } as CoOrdinate
                }).filter(s => s.x < ctx.canvas.width);
                tempState.bullets = bullets;
                var enemyBullets = state.enemyBullets.map(s => {
                    if (doesHitTank(state.myPos, s)) {
                        chatService.opponentScore++;
                        chatService.raiseEvent(EventNames.SCORE_UPDATED, null);
                        return { x: 0, y: s.y } as CoOrdinate
                    }
                    return { x: s.x - bulletSpeed, y: s.y } as CoOrdinate
                }).filter(s => s.x > 0);
                tempState.enemyBullets = enemyBullets;
            }
            calculateAllPositions(chatService);
            if (loadedImageCount === 4)
                renderCanvas();
        }, 15);
        chatService.bindToEvent(EventNames.TANK_POSITION_RECEIVED, receiveTankCordinateHandle);
        chatService.bindToEvent(EventNames.BULLET_RECEIVED, receiveBulletHandle);
        const img = new Image();
        const img2 = new Image();
        const bulletImg1 = new Image();
        const bulletImg2 = new Image();
        img.src = 'tank3.png';
        img2.src = 'tank4.png';
        bulletImg1.src = 'bullet1.png';
        bulletImg2.src = 'bullet2.png';
        img.onload = () => {
            imageSource = img;
            loadedImageCount++;
            loadAfterAllImageLoad();
        }
        img2.onload = () => {
            imageSource2 = img2;
            loadedImageCount++;
            loadAfterAllImageLoad();
        }
        bulletImg1.onload = () => {
            bulletSource1 = bulletImg1;
            loadedImageCount++;
            loadAfterAllImageLoad();
        }
        bulletImg2.onload = () => {
            bulletSource2 = bulletImg2;
            loadedImageCount++;
            loadAfterAllImageLoad();
        }
        return () => {
            console.log("returned");
            clearInterval(interval);
            chatService.unbindFromEvent(EventNames.TANK_POSITION_RECEIVED, receiveTankCordinateHandle);
            chatService.unbindFromEvent(EventNames.BULLET_RECEIVED, receiveBulletHandle);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    return (<div ref={(elm) => { compRef = elm; }} style={{ width: '100%' }}>
        <canvas ref={(canv) => { gameCanvas = canv }} id="game-canvas" tabIndex={0} onKeyUp={(evt: any) => { keyPressUnpressHandle(evt, chatService, false); }} onKeyDown={(evt: any) => { keyPressUnpressHandle(evt, chatService, true); }} height='550' width={state.canvSize} style={{ background: 'WHITE' }}>

        </canvas>
    </div>);
}
const keyPressUnpressHandle = (evt: React.KeyboardEvent<HTMLCanvasElement>, chatService: ChatService, isPressed: boolean) => {
    switch (evt.keyCode) {
        case 37:
            leftPressed = isPressed;
            break;
        case 38:
            upPressed = isPressed;
            break;
        case 39:
            rightPressed = isPressed;
            break;
        case 40:
            downPressed = isPressed;
            break;
        case 32:
            spacePressed = isPressed;
            break;
    }
}

const calculateAllPositions = (chatService: ChatService) => {
    var dx = 0;
    var dy = 0;
    var speed = 3;
    var bulletShot = false;
    if (leftPressed)
        dx = - speed;
    if (upPressed)
        dy = - speed;
    if (rightPressed)
        dx = speed;
    if (downPressed)
        dy = speed;
    if (spacePressed)
        bulletShot = true;
    var st = state;
    if ((st.myPos.x <= 0 && dx > 0) || (st.myPos.x + tankWidth >= st.canvSize && dx < 0) || (st.myPos.x > 0 && st.myPos.x + tankWidth < st.canvSize && dx !== 0))
        st.myPos.x += dx;
    if ((st.myPos.y <= 0 && dy > 0) || (st.myPos.y + tankHeight >= ctx.canvas.height && dy < 0) || (st.myPos.y > 0 && st.myPos.y + tankHeight < ctx.canvas.height && dy !== 0))
        st.myPos.y += dy;

    if (bulletShot) {
        var bulletPos = { x: st.myPos.x + tankWidth, y: st.myPos.y + (tankHeight * 0.1) } as CoOrdinate;
        var bullets = [...st.bullets, bulletPos];
        st.bullets = bullets;
        chatService.publishViaDataChannel({ MessageType: RtcMessageTypes.BULLET_POSITION, MessageValue: JSON.stringify(bulletPos) });
    }
    if (dx !== 0 || dy !== 0) {
        chatService.publishViaDataChannel({ MessageType: RtcMessageTypes.TANK_POSITION, MessageValue: JSON.stringify(st.myPos) });
    }
    state = st;
};

const doesHitTank = (tank: CoOrdinate, bullet: CoOrdinate): boolean => {
    var bulletCenter = { x: bullet.x + (bulletWidth / 2), y: bullet.y + (bulletHeight / 2) } as CoOrdinate;
    return bulletCenter.x > tank.x && bulletCenter.x < tank.x + tankWidth && bulletCenter.y > tank.y && bulletCenter.y < tank.y + tankHeight;
}

const renderCanvas = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(imageSource, state.myPos.x, state.myPos.y, tankWidth, tankHeight);
    ctx.drawImage(imageSource2, state.enemyPos.x, state.enemyPos.y, tankWidth, tankHeight);
    state.bullets.forEach(s => {
        ctx.drawImage(bulletSource1, s.x, s.y, bulletWidth, bulletHeight);
    });
    state.enemyBullets.forEach(s => {
        ctx.drawImage(bulletSource2, s.x, s.y, bulletWidth, bulletHeight);
    });
}

const receiveBulletHandle = (msg: RtcMessage) => {
    var bulletCoord: CoOrdinate = JSON.parse(msg.MessageValue);
    var s = state;
    s.enemyBullets = [...s.enemyBullets, { x: state.canvSize - bulletCoord.x, y: bulletCoord.y }]
}
const receiveTankCordinateHandle = (msg: RtcMessage) => {
    var tankCoord: CoOrdinate = JSON.parse(msg.MessageValue);
    var s = state;
    s.enemyPos = { x: state.canvSize - tankCoord.x - tankWidth, y: tankCoord.y } as CoOrdinate;
}
const loadAfterAllImageLoad = () => {
    if (loadedImageCount === 4)
        renderCanvas();
}

export default GameCanvas;