import React from "react";
import ChatService from "../Services/ChatService";

class ConfigSettings {
    static readonly IceServers: RTCIceServer[] = [
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        { urls: "stun:stun01.sipphone.com" },
        { urls: "stun:stun.ekiga.net" },
        { urls: "stun:stun.fwdnet.net" },
        { urls: "stun:stun.ideasip.com" },
        { urls: "stun:stun.iptel.org" },
        { urls: "stun:stun.rixtelecom.se" },
        { urls: "stun:stun.schlund.de" },
        { urls: "stun:stunserver.org" },
        { urls: "stun:stun.softjoys.com" },
        { urls: "stun:stun.voiparound.com" },
        { urls: "stun:stun.voipbuster.com" },
        { urls: "stun:stun.voipstunt.com" },
        { urls: "stun:stun.voxgratia.org" },
        { urls: "stun:stun.xten.com" },
        {
            urls: "turn:51.79.160.57:3478",
            credential: "imran920zx",
            username: "imran",
        },
    ];
}
export class EventNames {
    static readonly USER_CONNECTED: string = 'USER_CONNECTED';
    static readonly MESSAGE_LIST_UPDATED: string = 'MESSAGE_LIST_UPDATED';
    static readonly LOGIN_SUCCESS: string = 'LOGIN_SUCCESS';
    static readonly BULLET_RECEIVED: string = 'BULLET_RECEIVED';
    static readonly DIMENSION_RECEIVED: string = 'DIMENSION_RECEIVED';
    static readonly TANK_POSITION_RECEIVED: string = 'TANK_POSITION_RECEIVED';
    static readonly SCREEN_DIMENSION_RECEIVED: string = 'SCREEN_DIMENSION_RECEIVED';
}
export interface Services {
    chatService: ChatService
}
export enum RtcMessageTypes {
    CHAT_MESSAGE = 0,
    BULLET_POSITION,
    TANK_POSITION,
    SCREEN_DIMENSION
}
export const GlobalContext = React.createContext<Services>({} as Services);

export default ConfigSettings;