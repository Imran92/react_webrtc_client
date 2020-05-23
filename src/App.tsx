import React from 'react';
import './App.css';
import { MessageItem } from './Models/dtos';
import TextInputWithButtonContainer from './Components/MessageInputContainerComponent';
import ChatService from './Services/ChatService';
import { GlobalContext, EventNames } from './Shared/Consts';
import { MessageContainer } from './Components/MessageContainerComponent';

interface props {

}
class App extends React.Component<props, {}> {
  state = {};
  chatService: ChatService = {} as ChatService;
  constructor(props: props) {
    super(props);
    console.log('Cons called');
  }
  componentWillMount() {
    console.log('Will mount called');
    this.chatService = new ChatService();
  }
  componentDidMount() {
    console.log('Did mount called');
    this.chatService.bindToEvent(EventNames.LOGIN_SUCCESS, this.handleLogin);
    this.chatService.bindToEvent(EventNames.USER_CONNECTED, this.handleLogin);
  }
  componentWillUnmount() {
    console.log('Will unmount called');
    this.chatService.unbindFromEvent(EventNames.LOGIN_SUCCESS, this.handleLogin);
    this.chatService.unbindFromEvent(EventNames.USER_CONNECTED, this.handleLogin);
  }
  handleLogin = () => {
    console.log('login handle called');
    console.log(this.chatService.connectedUser);
    this.setState({});
  }
  private headerTag: string = 'Fao Chat 0.1';
  render() {

    return (
      <GlobalContext.Provider value={{ chatService: this.chatService }}>
        <div className="App">
          <div className="container pt-3 border main-body">
            <h2 className="header">{this.headerTag}</h2>
            <h5 className="header">{(this.chatService.myName ?? '') + (this.chatService.connectedUser === '' ? '' : (' and ' + this.chatService.connectedUser))}</h5>
            <MessageContainer></MessageContainer>
            <TextInputWithButtonContainer callbackFunction={(callbackValue: string) => { this.chatService.sendRtcMessage(callbackValue); }}
              buttonContent={<i className="fa fa-paper-plane" style={{ margin: "auto" }}></i>}
              inputWidth="95%"
              buttonWidth="5%"></TextInputWithButtonContainer>
            <TextInputWithButtonContainer width="60%" callbackFunction={(callbackValue: string) => { this.chatService.sendLoginRequest(callbackValue); }}
              inputWidth="65%"
              buttonWidth="35%"
              buttonClass="btn-success"
              clearAfterCallback={false}
              buttonContent={<span style={{ margin: "auto" }}><strong>Login</strong></span>}></TextInputWithButtonContainer>
            <TextInputWithButtonContainer width="60%" callbackFunction={(callbackValue: string) => { this.chatService.sendOfferToUser(callbackValue); }}
              inputWidth="65%"
              buttonWidth="35%"
              buttonClass="btn-info"
              clearAfterCallback={false}
              buttonContent={<span style={{ margin: "auto" }}><strong>Connect</strong></span>}></TextInputWithButtonContainer>
          </div>
        </div>
      </GlobalContext.Provider>
    )
  };
}

export default App;
