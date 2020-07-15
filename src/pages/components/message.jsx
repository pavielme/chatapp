import React from 'react';
import {
  Tab, Navbar, NavTitle, Messagebar, Link, NavRight, Popover, List, ListItem, ListButton, Icon, Badge, Preloader, Block
} from 'framework7-react';

class Message extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            timer: false,
            marked: [],
            inRoom: false,
            targetTyping: false,
            messageHeight: document.body.clientHeight,
            keyboardHeight: false,
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

    componentDidMount(){
       
    }
    messageHandler(state, index){
        if(state === 'start'){
                const actionHandler = () => {


                         var isMarked = false;
                         for (var i in this.state.marked) {
                             if (this.state.marked[i] === index) {
                                 isMarked = i;
                             }
                         }

                        if (isMarked) {
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
                    
                }

                actionHandler();
                
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
                
            });

            var last = this.props.appPage.state.messagesData.length;

            this.props.appPage.setState({
                messagesData: [...this.props.appPage.state.messagesData, ...messageToSend],
            });

            setTimeout(() => {
                
                var removeani = this.props.appPage.state.messagesData;

                removeani[last].animation = false;

                this.props.appPage.setState({
                    messagesData: removeani,
                });
            }, 500);

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
        if(this.props.appPage.state.messagesData.length > 0){
        const { messageTarget } = this.props.appPage.state;
        const { socket } = this.$f7.passedParams;

        socket.emit('clear room', this.props.appPage.state.user.id, messageTarget.room);

        var removeLoader = this.$f7.dialog.preloader('Tar bort ' + this.props.appPage.state.messagesData.length + ' meddelande');
        setTimeout(() => {
                this.props.appPage.setState({
                    messagesData: []
                });
        
                this.setState({
                    marked: []
                })

                removeLoader.close();
        },1000);
        } else {
            this.$f7.dialog.alert('Inga meddelande att ta bort')
        }
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

    toggleMark(){
        if(this.state.marked.length === this.props.appPage.state.messagesData.length) {
            var all = this.props.appPage.state.messagesData;

            var mark = [];

            for(var i in all){
                this.$$('.msg_' + i).removeClass('marked');
            }

            this.setState({
                marked: mark,
            });
        } else {
            var all = this.props.appPage.state.messagesData;

            var mark = [];

            for(var i in all){
                this.$$('.msg_' + i).addClass('marked');
                mark.push(parseInt(i));
            }

            this.$$('.msg_' + i).addClass('marked');
            this.setState({
                marked: mark,
            });
        }
    }

    removeSelected(){
        if(this.state.marked.length > 0){
            var removeArray = this.state.marked.sort((a,b) => {
                return a - b;
            });

            for (var i in removeArray) {
                this.$$('.msg_' + removeArray[i]).removeClass('marked');
                
            }

            this.setState({
                marked: [],
            });    


            setTimeout(() => {
                var messages = this.props.appPage.state.messagesData;

                for (var i = removeArray.length - 1; i >= 0; i--) {
                    messages.splice(removeArray[i], 1);
                }

                this.props.appPage.setState({
                    messagesData: messages
                });
            }, 500);
            

        }
           
    }
    copyMessage(index = false){
        var marked = this.state.marked;

        if(marked.length === 1) {
            var text = this.props.appPage.state.messagesData[marked[0]].text;

            console.log(text);

            this.$f7.toast.create({
                icon: app.theme === 'ios' ? '<i class="f7-icons">doc_on_doc</i>' : '<i class="f7-icons">doc_on_doc</i>',
                text: 'Kopierat',
                position: 'center',
                closeTimeout: 2000,
            }).open();

            this.$$('.msg_' + marked[0]).addClass('copy');

            setTimeout(() => {
                this.$$('.msg_' + marked[0]).removeClass('copy'); 
            }, 400)
        } else if (index.toString() !== 'false') {
            var text = this.props.appPage.state.messagesData[index].text;

            console.log(text);

            this.$f7.toast.create({
                icon: app.theme === 'ios' ? '<i class="f7-icons">doc_on_doc</i>' : '<i class="f7-icons">doc_on_doc</i>',
                text: 'Kopierat',
                position: 'center',
                closeTimeout: 2000,
            }).open();

            this.$$('.msg_' + index.toString()).addClass('copy');

            setTimeout(() => {
                this.$$('.msg_' + index.toString()).removeClass('copy');
            }, 400)
        }
    }

    KeyboardShow(){
        // var client = this.state.messageHeight;

        // var keyboardHeight = client - document.body.clientHeight + 200;

        // this.setState({
        //     keyboardHeight: keyboardHeight,
        // })

        // var container = this.$$('.Custom-MessageContent');
        // container[0].scrollBy(0, keyboardHeight)

        setTimeout(() => {
            this.scrollToBottom();
        }, 100);
        
    }

    KeyboardHide(){
        // var keyboardHeight = this.state.keyboardHeight;

        
        // var container = this.$$('.Custom-MessageContent');
        // var bottomPos = container.scrollTop();
        // var scrollHeight = container[0].scrollHeight;

        // container[0].scrollBy(0, -keyboardHeight)
    }

    isMarked(index){
        var marked = this.state.marked;

        var state = false;

        for(var i in marked){
            if(marked[i] === index){
                state = true
                break;
            }
        }

        return state;
    }

    togglesave(index){
        // const { socket } = this.$f7.passedParams;

        // socket.emit('togglesave messages', this.props.appPage.state.user.id, this.props.appPage.state.messageTarget.room, index, (res) => {
        //     var messages = this.props.appPage.state.messagesData;

        //     messages[index].save = res;

        //     this.props.appPage.setState({
        //         messagesData: messages,
        //     });
        // });
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
                    <Link popoverOpen=".popover-menu" iconOnly>
                        <Icon ios="f7:ellipsis" aurora="f7:ellipsis" md="f7:ellipsis">
                            { this.state.marked.length > 0 ? ( 
                                <Badge color="red">{ this.state.marked.length }</Badge> 
                            ) : '' } 
                        </Icon>
                    </Link>
                    <Link onClick={() => this.closeChat()} iconIos="f7:chevron_right" iconMd="f7:chevron_right"></Link>
                </NavRight>
            </Navbar>
            <Popover className="popover-menu">
            <List>
                <ListButton onClick={() => this.copyMessage() } color={this.state.marked.length === 1 ? '' : 'gray'} popoverClose={this.state.marked.length === 1 ? true : false } title="Kopiera" />
                      <ListButton onClick={() => this.toggleMark()} color={this.props.appPage.state.messagesData.length > 0 ? '' : 'gray'} popoverClose={this.props.appPage.state.messagesData.length > 0 ? true : false } title={this.state.marked.length === this.props.appPage.state.messagesData.length ? this.props.appPage.state.messagesData.length > 0 ? 'Avmarkera alla' : 'Markera alla' : 'Markera alla' } />
                <ListButton onClick={() => this.removeSelected() } color={this.state.marked.length > 0 ? 'red' : 'gray'} popoverClose={this.state.marked.length > 0 ? true : false } title={`Ta bort (${this.state.marked.length})`} />
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
                            
                            <div className={`messagename`}>{ this.showName(item, index, messageTarget ? messageTarget.user.name : false) }</div>
                            <div 
                            onClick={() => this.messageHandler('start', index) }
               
                                className={`messagecontainer bubble msg_${index} ${item.animation ? 'animate__animated animate__zoomIn animate__faster' : ''}`}>
                                    {item.text}
                            <div className="messagetime">{ new Date(item.ts).toLocaleTimeString('sv-SE', {
                                hour12: false,
                                hour: '2-digit',
                                minute: '2-digit'
                            }) } </div>
                            </div>

                            {/* {item.save ? (
                                <div className={`messagesave`}>Sparad</div>
                            ) : ''}     */}

                            <div className={`messageHandlerBox ${ this.isMarked(index) && this.state.marked.length === 1 ? 'show' : '' }`}>
                                <div className={`messagecontainer copybutton`} onClick={() => this.copyMessage(index)}>
                                    <Link className="copycustombutton" iconIos="f7:doc_on_doc" iconMd="f7:doc_on_doc" iconSize="18"></Link>
                                    
                                 </div>

                                <div className={`messagecontainer savebutton`} onClick={() => this.togglesave(index)}>
                                    <Link className="copycustombutton" iconIos={item.save ? 'f7:star_fill' : 'f7:star'} iconMd={item.save ? 'f7:star_fill' : 'f7:star'}  iconSize="18"></Link>

                                </div>

                                <div className={`messagecontainer deletebutton`} onClick={() => this.removeSelected()}>
                                    <Link className="removecustombutton" iconIos="f7:trash" iconMd="f7:trash" iconSize="18"></Link>
                                </div>
                            </div>
                            
                        </div>
                    )) }
                </div>
                { this.$f7.passedParams.socket.connected ? '' : (
                  <Block className="text-align-center">
                      <Preloader color="multi"></Preloader>
                  </Block>
                ) }
                </div>
    
                <img className={`inRoom ${this.state.inRoom ? 'isTrue' : ''} ${this.state.targetTyping ? 'isTyping' : ''} animate__animated animate__pulse animate__infinite`} src={this.props.appPage.state.messageTarget ? this.props.appPage.state.messageTarget.user.avatar : ''} width="44"></img>
               
            <Messagebar
                noShadow={true}
                noHairline={true}
                className="messageBar"
                placeholder="Meddelande"
                onInput={() => this.isTypingHandler() }
                  onFocus={() => this.KeyboardShow()}
                onBlur={() => this.KeyboardHide() }
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