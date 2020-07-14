import React from 'react';
import {
  Tab, Navbar, NavTitle, Messagebar, Link, NavRight, Popover, List, ListItem, ListButton
} from 'framework7-react';

class Message extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            timer: false,
            marked: [],
            inRoom: false,
            targetTyping: false,
        }

        const { socket } = this.$f7.passedParams;

        socket.on('joined', () => {
            this.setState({
                inRoom: true
            });
        });

        socket.on('left', () => {
            this.setState({
                inRoom: false
            });
        });

        socket.on('typing', (state) => {
            this.setState({
                targetTyping: state,
            });
        });
    }

    messageHandler(state, index){
        if(state === 'start'){
            if(!this.state.timer){
                this.setState({
                    timer: new Date().getTime()
                });

                setTimeout(() => {
                    if(this.state.timer){
                        var isMarked = false;
                        for(var i in this.state.marked){
                            if(this.state.marked[i] === index){
                                isMarked = i;
                            }
                        }

                        if(isMarked) {
                            var marked = this.state.marked;
                            marked.splice(isMarked, 1);
                            this.setState({
                               marked: marked,
                            });

                            this.$$('.msg_' + index).removeClass('marked');
                        } else {
                            var marked = this.state.marked;
                            marked.push(index);
                            this.setState({
                                marked: marked,
                            });

                            this.$$('.msg_' + index).addClass('marked');
                        }

                        console.log(this.state.marked)

                        this.setState({
                            timer: false
                        });
                    }
                },400);
            }
        } else if(state === 'release'){
            if(this.state.timer){
                this.setState({
                    timer: false
                });
            }
        }
    }

    allowSlide(state){
        this.$f7.swiper.get('.pageTabs').allowSlideNext = state;

        if(this.props.appPage.state.page === 'Home'){
            this.setState({
                marked: []
            });
        }
    }

    closeChat(){
        this.$f7.swiper.get('.pageTabs').allowSlideNext = true;
        this.$f7.tab.show('#tab-2');
        this.$f7.swiper.get('.pageTabs').allowSlideNext = false;
        this.setState({
            marked: []
        });
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
        var text = messagebar.getValue().replace(/\n/g, '/n').trim();

        const { id } = this.props.appPage.state.user;
        const { messageTarget } = this.props.appPage.state;
        const { socket } = this.$f7.passedParams;

        if(text.length > 0){
            var messageToSend = [
                {
                    type: 'send',
                    text: text,
                    opened: true,
                    ts: new Date().getTime(),
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

    isTypingHandler(){
        var messagebar = this.$f7.messagebar.get('.messageBar');
        var text = messagebar.getValue().replace(/\n/g, '/n').trim();

        var state = text.length > 0 ? true : false;

        const { socket } = this.$f7.passedParams;

        socket.emit('typing', this.props.appPage.state.messageTarget.room, state);
    }

    clearChat(){
        const { messageTarget } = this.props.appPage.state;
        const { socket } = this.$f7.passedParams;

        socket.emit('clear room', this.props.appPage.state.user.id, messageTarget.room);

        this.props.appPage.setState({
            messagesData: []
        });

        this.setState({
            marked: []
        })
    }
    isToday(ts){
        var today = new Date().toLocaleDateString('sv-SE', { weekday: 'long', month: 'long', day: 'numeric' })
        var current = new Date(ts).toLocaleDateString('sv-SE', { weekday: 'long', month: 'long', day: 'numeric' })
        
        if(today === current){
            return 'idag';
        } else {
            return current;
        }
    }

    isPrevDate(i,item) {
        if(i === 0) {
            return false;
        } else {
            var prevdate = this.props.appPage.state.messagesData[i - 1].ts;
            var prevtostring = new Date(prevdate).toLocaleDateString();
            var currenttostring = new Date(item.ts).toLocaleDateString();

            if(prevtostring === currenttostring){
                return true;
            } else {
                return false;
            }
        }
    }

    render() {
      const { messageTarget, messagesData } = this.props.appPage.state;

      return (
        <Tab id="tab-1">
            <div className={`connection ${this.$f7.passedParams.socket.connected ? 'con-online' : 'con-offline'}`}></div>
        
            <Navbar
                noShadow={true}
                noHairline={true}
            >
                <NavTitle>{ messageTarget ? messageTarget.user.name : '' }</NavTitle>
                <NavRight>
                    <Link popoverOpen=".popover-menu" iconIos="f7:ellipsis" iconMd="f7:ellipsis"></Link>
                    <Link onClick={() => this.closeChat()} iconIos="f7:chevron_right" iconMd="f7:chevron_right"></Link>
                </NavRight>
            </Navbar>
            <Popover className="popover-menu">
            <List>
                <ListButton color={this.state.marked.length === 1 ? '' : 'gray'} popoverClose={this.state.marked.length === 1 ? true : false } title="Kopiera" />
                <ListButton popoverClose title="Markera alla" />
                <ListButton color={this.state.marked.length > 0 ? 'red' : 'gray'} popoverClose={this.state.marked.length > 0 ? true : false } title={`Ta bort (${this.state.marked.length})`} />
                <ListButton onClick={() => this.clearChat() } color="red" popoverClose title="Rensa" />
            </List>
            </Popover>
            <div
                onTouchStart={() => this.allowSlide(true)}
                onTouchEnd={() => this.allowSlide(false)}
                className="Custom-MessageContent page-content"
            >
                <div className="list-messages">
                    { messagesData.map((item, index) => (
                        <div key={index} className={`messagebox ${index === 0 ? 'firstmessage' : index === messagesData.length - 1 ? 'lastmessage' : ''} ${item.type === 'send' ? 'messageTypeSend' : 'messageTypeReceived'}`}>
                            <div className={`messagedate ${this.isPrevDate(index, item) ? 'hide' : 'show'}`}>{ this.isToday(item.ts) }</div>
                            <div className={`messagename ${item.animation ? 'animate__animated animate__fadeIn animate__faster' : 'animate__animated animate__fadeIn animate__faster'}`}>{ this.showName(item, index, messageTarget ? messageTarget.user.name : false) }</div>
                            <div 
                            onTouchStart={() => this.messageHandler('start', index) }
                            onTouchEnd={() => this.messageHandler('release', index) }
                            className={`messagecontainer msg_${index} ${item.animation ? 'animate__animated animate__zoomIn animate__faster' : 'animate__animated animate__fadeIn animate__faster'}`}>
                                    {item.text}
                                
                            <div className="messagetime">{ new Date(item.ts).toLocaleTimeString('sv-SE', {
                                hour12: false,
                                hour: '2-digit',
                                minute: '2-digit'
                            }) }</div>
                            </div>
                            
                        </div>
                    )) }
                </div>

                </div>
                
                <img className={`inRoom ${this.state.inRoom ? 'isTrue' : ''} ${this.state.targetTyping ? 'isTyping' : ''} animate__animated animate__pulse animate__infinite`} src="https://image.winudf.com/v2/image1/Y29tLmJhYnkueW9kYS5zdGlja2Vycy53YXN0aWNrZXJhcHBzX2ljb25fMTU4MTk5OTgxNV8wMDc/icon.png?w=170&fakeurl=1" width="44"></img>
               
            <Messagebar
                noShadow={true}
                noHairline={true}
                className="messageBar"
                placeholder="Meddelande"
                onInput={() => this.isTypingHandler() }
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