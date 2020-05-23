import React from 'react';

interface Props {
    width?: string;
    inputWidth?: string;
    buttonWidth?: string;
    callbackFunction: (val: string) => void;
    buttonContent?: JSX.Element;
    clearAfterCallback?: boolean;
    buttonClass?: string;
}
interface State {
    inputText: string;
}
export default class TextInputWithButtonContainer extends React.Component<Props> {
    state: State = {
        inputText: ""
    }
    btnClass: string = this.props.buttonClass == null ? "btn-primary" : this.props.buttonClass;
    constructor(props: Props) {
        super(props);
        this.state = {
            inputText: ""
        }
    }
    render() {
        return (
            <div>
                <div className="input-group mb-3" style={{ width: this.props.width }}>
                    <input type="text"
                        className="message-data from-control"
                        onKeyUp={(evt) => { this.keyPressed(evt); }}
                        onChange={evt => this.textChanged(evt)}
                        value={this.state.inputText}
                        style={{ width: this.props.inputWidth }}
                    >
                    </input>
                    <button
                        className={"btn " + this.btnClass + " input-group-append send-msg-btn"} onClick={(evt) => { this.sendValueToCallbackAndClear(); }}
                        style={{ width: this.props.buttonWidth }}>
                        {this.props.buttonContent}
                    </button>
                </div>
            </div>
        );
    }

    keyPressed(inputValue: React.KeyboardEvent<HTMLInputElement>): void {
        if (inputValue.keyCode === 13) {
            console.log("pressed enter");
            this.sendValueToCallbackAndClear();
        }
    }
    sendValueToCallbackAndClear() {
        if (this.props.callbackFunction != null) {
            this.props.callbackFunction(this.state.inputText);
        }
        if (this.props.clearAfterCallback == null || this.props.clearAfterCallback)
            this.setState({
                inputText: ""
            });
    }
    textChanged(inputValue: React.ChangeEvent<HTMLInputElement>): void {
        this.setState({
            inputText: inputValue.target.value
        });
    }
}