import React, { FunctionComponent, useEffect, useContext } from 'react';
import { MessageItem } from '../Models/dtos';
import ChatService from '../Services/ChatService';
import { GlobalContext, EventNames } from '../Shared/Consts';

interface ContainerState {
    messages: MessageItem[]
}


export class MessageContainer extends React.Component {
    static contextType = GlobalContext;

    state: ContainerState = {
        messages: []
    };
    private chatService: ChatService = {} as ChatService;
    componentDidMount() {
        this.chatService = this.context.chatService;
        this.chatService.bindToEvent(EventNames.MESSAGE_LIST_UPDATED, this.handleMessageUpdate);
        this.setState({
            messages: this.chatService.messages
        });
    }
    componentWillUnmount() {
        this.chatService.unbindFromEvent(EventNames.MESSAGE_LIST_UPDATED, this.handleMessageUpdate);
    }
    handleMessageUpdate = () => {
        this.setState({
            messages: this.chatService.messages
        })
    }
    render() {

        return (
            <div>
                <div className="message-container">
                    {this.state.messages.map(s =>
                        <div className="userchat">
                            <div className={'innter-item ' + (s.IsMine ? 'right' : 'left') + '-float'}>
                                {s.Body}
                            </div>
                        </div>)}
                </div>
            </div>
        )
    }
}
