import React from 'react';
import {
  Tab, Navbar, NavTitle, Messagebar, Link, NavRight,
} from 'framework7-react';

class Message extends React.Component {
    constructor(props){
        super(props);
    }

    allowSlide(state){
        this.$f7.swiper.get('.pageTabs').allowSlideNext = state;
    }

    closeChat(){
        this.$f7.swiper.get('.pageTabs').allowSlideNext = true;
        this.$f7.tab.show('#tab-2');
        this.$f7.swiper.get('.pageTabs').allowSlideNext = false;
    }

    scrollToBottom(){
        var container = this.$$('.Custom-MessageContent');
        container.scrollTop(container[0].scrollHeight);
    }

    showName(item, index, target){
        if(target){
            if(index === 0){
                if(item.type === 'send'){
                    return 'JAG';
                } else {
                    return target.toUpperCase();
                }
            } else {
                var prevtype = this.props.appPage.state.messagesData[index - 1].type;
                if(item.type === prevtype){
                    return '';
                } else {
                    if(item.type === 'send'){
                        return 'JAG';
                    } else {
                        return target.toUpperCase();
                    }
                }
            }
        } else {
            return '';
        }
    }

    sendMessage() {
        var messagebar = this.$f7.messagebar.get('.messageBar');
        var text = messagebar.getValue().replace(/\n/g, '\n').trim();

        const { id } = this.props.appPage.state.user;
        const { messageTarget } = this.props.appPage.state;
        const { socket } = this.$f7.passedParams;

        if(text.length > 0){
            var messageToSend = [
                {
                    type: 'send',
                    text: text,
                    animation: true
                }
            ];

            socket.emit('send message', id, messageTarget, text, (res) => {
                console.log(res);
            });

            this.props.appPage.setState({
                messagesData: [...this.props.appPage.state.messagesData, ...messageToSend],
            });

            messagebar.clear();
            messagebar.focus();

            this.scrollToBottom();
        }
        
    }

    clearChat(){
        const { messageTarget } = this.props.appPage.state;
        const { socket } = this.$f7.passedParams;

        socket.emit('clear room', this.props.appPage.state.user.id, messageTarget.room);

        this.props.appPage.setState({
            messagesData: []
        });
    }

    render() {
      const { messageTarget, messagesData } = this.props.appPage.state;

      return (
        <Tab id="tab-1">
            <Navbar
                noShadow={true}
                noHairline={true}
            >
                <NavTitle>{ messageTarget ? messageTarget.user.name : '' }</NavTitle>
                <NavRight>
                    <Link onClick={() => this.clearChat()} color="red" iconIos="f7:trash" iconMd="f7:trash"></Link>
                    <Link onClick={() => this.closeChat()} iconIos="f7:chevron_right" iconMd="f7:chevron_right"></Link>
                </NavRight>
            </Navbar>
            <div
                onTouchStart={() => this.allowSlide(true)}
                onTouchEnd={() => this.allowSlide(false)}
                className="Custom-MessageContent page-content"
            >
                <div className="list-messages">
                    { messagesData.map((item, index) => (
                        <div key={index} className={`messagebox ${index === 0 ? 'firstmessage' : index === messagesData.length - 1 ? 'lastmessage' : ''} ${item.type === 'send' ? 'messageTypeSend' : 'messageTypeReceived'}`}>
                            <div className="messagename">{ this.showName(item, index, messageTarget ? messageTarget.user.name : false) }</div>
                            <div className={`messagecontainer`}>
                                <div className={item.animation ? 'animate__animated animate__fadeIn animate__faster' : ''}>{item.text}</div>
                            </div>
                        </div>
                    )) }
                </div>
            </div>
            <Messagebar
                noShadow={true}
                noHairline={true}
                className="messageBar"
                placeholder="Meddelande"
            >
                <Link
                    iconIos="f7:camera_fill"
                    iconAurora="f7:camera_fill"
                    iconMd="material:camera_alt"
                    slot="inner-start"
                ></Link>
                <Link
                    iconIos="f7:arrow_up_circle_fill"
                    iconAurora="f7:arrow_up_circle_fill"
                    iconMd="material:send"
                    slot="inner-end"
                    onClick={() => this.sendMessage()}
                ></Link>
            </Messagebar>
        </Tab>
      );
    }
  }

export default Message;