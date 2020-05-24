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
            this.ctx.drawImage(this.imageSource, this.state.myX, this.state.myY);
        }
        img.src = 'tank1.png';
        this.interval = setInterval(() => {

        }, 30);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    moveBox() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(this.imageSource, this.state.myX, this.state.myY, 20, 10);
    }

    render() {
        return (<canvas ref='canvas' tabIndex={0} onKeyPress={this.keyPressedOnCanvas} onKeyDown={this.keyPressedOnCanvas} style={{ width: '100%', height: '100%', background: 'WHITE' }}>

        </canvas>);
    }
    keyPressedOnCanvas = (evt: React.KeyboardEvent<HTMLCanvasElement>) => {
        var dx = 0;
        var dy = 0;
        var speed = 3;
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
        }
        var st = this.state;
        if (st.myX !== 0 || dx > 0)
            st.myX += dx;
        if (st.myY !== 0 || dy > 0)
            st.myY += dy;
        console.log(evt.keyCode);
        this.setState({
            st
        });
        this.moveBox();
    };
}