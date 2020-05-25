import ConfigSettings, { EventNames, RtcMessageTypes } from "../Shared/Consts";
import { EventEmitter } from "events";
import { MessageItem, RtcMessage } from "../Models/dtos";

class ChatService {
    connection: WebSocket;
    private rtcConnection: RTCPeerConnection | null;
    private dataChannel: RTCDataChannel | undefined;
    private eventEmitter = {} as EventEmitter;
    messages: MessageItem[] = [];
    connectedUser: string;
    myName: string = '';
    isOfferer: boolean = true;
    constructor() {
        this.connection = new WebSocket("ws://demeterwel.com/faochatws");
        this.connection.onopen = () => {
            this.connection.onmessage = (msg: any) => { this.onConnectionMessage(msg) };
        };
        this.rtcConnection = null;
        this.connectedUser = "";
        this.dataChannel = undefined;
        this.eventEmitter = new EventEmitter();
        console.log(this.eventEmitter);
    }

    onConnectionMessage(message: any) {
        console.log(message);
        var data = JSON.parse(message.data);
        switch (data.messageType) {
            case "login":
                if (data.success) {
                    this.eventEmitter.emit(EventNames.LOGIN_SUCCESS);
                    var configuration: RTCConfiguration = {
                        iceServers: ConfigSettings.IceServers,
                    };

                    this.rtcConnection = new RTCPeerConnection(configuration);
                    this.rtcConnection.onicecandidate = (event) => {
                        if (event.candidate) {
                            console.log("local ice candidate received");
                            console.log(event);
                            this.send({
                                messageType: "candidate",
                                candidate: event.candidate,
                            });
                        }
                    };
                    this.rtcConnection.ondatachannel = (event) => {
                        this.dataChannel = event.channel;
                        this.subscribeToDataChannel();
                    };
                }
                break;
            case "offer":
                console.log("offer received");
                this.onOffer(data);
                console.log(message);
                this.isOfferer = false;
                break;
            case "answer":
                console.log("answer received");
                this.onAnswer(data);
                console.log(message);
                break;
            case "candidate":
                console.log("candidate received from other user");
                this.onCandidate(data);
                console.log(message);
                break;
        }
    }
    onOffer = (data: any) => {
        if (!this.rtcConnection)
            return;

        this.connectedUser = data.name;
        this.eventEmitter.emit(EventNames.USER_CONNECTED);
        this.rtcConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        this.rtcConnection.createAnswer(
        ).then((answer: RTCSessionDescriptionInit | void) => {
            if (answer) {
                this.rtcConnection?.setLocalDescription(answer);
                this.send({
                    messageType: "answer",
                    answer: answer,
                });
            }
        }).catch((error: any) => {
            alert("oops...error " + error);
        });
    }
    onAnswer(data: any) {
        this.rtcConnection?.setRemoteDescription(new RTCSessionDescription(data.answer));
        this.eventEmitter.emit(EventNames.USER_CONNECTED);
    }
    onCandidate(data: any) {
        this.rtcConnection?.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
    send(message: any) {
        if (this.connectedUser) {
            message.name = this.connectedUser;
        }
        this.connection.send(JSON.stringify(message));
    }
    openDataChannel() {
        this.dataChannel = this.rtcConnection?.createDataChannel(
            "myDataChannel"
        );
        this.subscribeToDataChannel();
    }
    subscribeToDataChannel() {
        if (!this.dataChannel)
            return
        this.dataChannel.onerror = (error) => {
            console.log("Error:", error);
        };

        this.dataChannel.onmessage = (event) => {
            console.log("Got message:", event.data);
            var msg: RtcMessage = JSON.parse(event.data);
            switch (msg.MessageType) {
                case RtcMessageTypes.CHAT_MESSAGE:
                    this.addMsg(msg.MessageValue, false);
                    this.beep();
                    break;
                case RtcMessageTypes.SCREEN_DIMENSION:
                    this.eventEmitter.emit(EventNames.SCREEN_DIMENSION_RECEIVED);
                    break;
                case RtcMessageTypes.BULLET_POSITION:
                    this.eventEmitter.emit(EventNames.BULLET_RECEIVED, msg);
                    break;
                case RtcMessageTypes.TANK_POSITION:
                    this.eventEmitter.emit(EventNames.TANK_POSITION_RECEIVED, msg);
                    break;
            }
        };
    }
    sendRtcMessage = (body: string) => {
        this.publishViaDataChannel({ MessageType: RtcMessageTypes.CHAT_MESSAGE, MessageValue: body })
        this.addMsg(body, true);
    }
    publishViaDataChannel = (msg: RtcMessage) => {
        this.dataChannel?.send(JSON.stringify(msg));
    }
    addMsg(msg: string, isMe: boolean) {
        this.messages.push({ Body: msg, IsMine: isMe });
        this.eventEmitter.emit(EventNames.MESSAGE_LIST_UPDATED);
    }
    sendLoginRequest(myName: string) {
        this.myName = myName;
        this.send({ messageType: 'login', name: this.myName });
    }
    sendOfferToUser(userName: string) {
        this.connectedUser = userName;
        this.openDataChannel();
        this.rtcConnection?.createOffer().then((offer: RTCSessionDescriptionInit) => {
            this.send({ messageType: 'offer', offer: offer });
            this.rtcConnection?.setLocalDescription(offer);
        });
    }
    bindToEvent(eventName: string, func: (val: any) => void) {
        this.eventEmitter.on(eventName, func);
    }
    unbindFromEvent(eventName: string, func: (val: any) => void) {
        this.eventEmitter.removeListener(eventName, func);
    }
    beep() {
        var snd = new Audio(
            "data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU="
        );
        snd.play();
    }
}

export default ChatService;