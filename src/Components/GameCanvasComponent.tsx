import React from 'react';

interface bullet {
    x: number;
    y: number;
}
interface GameState {
    myX: number,
    myY: number,
    bullets: bullet[]
}
export class GameCanvas extends React.Component {

    state: GameState = {
        myX: 0,
        myY: 0,
        bullets: []
    }
    private ctx: CanvasRenderingContext2D = {} as CanvasRenderingContext2D;
    private imageSource: CanvasImageSource = {} as CanvasImageSource;
    private interval: NodeJS.Timeout = {} as NodeJS.Timeout;
    componentDidMount() {
        const img = new Image();
        const canvRef = this.refs.canvas as HTMLCanvasElement;
        this.ctx = canvRef.getContext('2d') as CanvasRenderingContext2D;
        img.onload = () => {
            console.log('loaded');
            this.imageSource = img;
            this.ctx.drawImage(this.imageSource, this.state.myX, this.state.myY, 28, 10);
        }
        img.src = 'tank3.png';
        this.interval = setInterval(() => {

            if (this.state.bullets.length > 0) {
                var tempState = this.state;
                var bullets = this.state.bullets.map(s => { return { x: s.x + 1, y: s.y } as bullet }).filter(s => s.x < this.ctx.canvas.width);
                tempState.bullets = bullets;
                this.setState({
                    tempState
                });
                this.renderCanvas();
            }
        }, 30);

    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    renderCanvas = () => {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(this.imageSource, this.state.myX, this.state.myY, 28, 10);
        this.state.bullets.forEach(s => {
            this.ctx.drawImage(this.imageSource, s.x, s.y, 3, 3);
        });
    }

    render() {
        return (<canvas ref='canvas' tabIndex={0} onKeyDownCapture={this.keyPressedOnCanvas} onKeyDown={this.keyPressedOnCanvas} style={{ width: '100%', height: '100%', background: 'WHITE' }}>

        </canvas>);
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
        if (st.myX !== 0 || dx > 0)
            st.myX += dx;
        if (st.myY !== 0 || dy > 0)
            st.myY += dy;
        console.log(evt.keyCode);

        if (bulletShot) {
            var bullets = [...st.bullets, { x: st.myX, y: st.myY }];
            st.bullets = bullets;
        }
        this.setState({
            st
        });
        this.renderCanvas();
    };
}