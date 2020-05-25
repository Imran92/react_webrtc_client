import { RtcMessageTypes } from "../Shared/Consts";

export interface MessageItem {
    IsMine: boolean;
    Body: string;
}
export interface RtcMessage {
    MessageType: RtcMessageTypes,
    MessageValue: string
}