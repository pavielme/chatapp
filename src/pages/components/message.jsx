import React from 'react';
import {
  Tab, Navbar, NavTitle, Messagebar, Link, NavRight, Popover, List, ListItem, ListButton, Icon, Badge, Preloader, Block, PhotoBrowser
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
            lostConnection: false,
            photo: []
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
        const { socket } = this.$f7.passedParams;

        socket.on('disconnect', () => {
            this.setState({
                lostConnection: this.$f7.toast.create({

                    icon: app.theme === 'ios' ? '<i class="f7-icons">wifi_exclamationmark</i>' : '<i class="f7-icons">wifi_exclamationmark</i>',
                    text: ' ',
                    position: 'center',
                    closeTimeout: 2000,
                }),
            });

            this.state.lostConnection.open();

            this.scrollToBottom();
        });

        socket.on('connect', () => {
            this.setState({
                lostConnection: false,
            });
        });
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
                    animation: true,
                    notsended: socket.connected ? false : true
                }
            ];

            if(!socket.connected){
                var queue = {
                    messageTarget: messageTarget,
                    text: text,
                }

                const storage = window.localStorage;
                var qmessage = storage.getItem('queued message');

                if(qmessage){
                    var parseQmessage = JSON.parse(qmessage);
                    parseQmessage.push(queue);
                } else {
                    var parseQmessage = [queue];
                }

                storage.setItem('queued message', JSON.stringify(parseQmessage));

                console.log(storage.getItem('queued message'));


                var snapshot = JSON.parse(storage.getItem('snapshotRoom_' + this.props.appPage.state.messageTarget.room));

                var updatesnapshot = [...snapshot, ...messageToSend]

                storage.setItem('snapshotRoom_' + this.props.appPage.state.messageTarget.room, JSON.stringify(updatesnapshot));
            } else {   
                socket.emit('send message', id, messageTarget, text, (res) => {
                    
                });
            }  
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

    sendImage(img) {
        const { id } = this.props.appPage.state.user;
        const { messageTarget } = this.props.appPage.state;
        const { socket } = this.$f7.passedParams;

            var messageToSend = [
                {
                    type: 'send',
                    image: img,
                    opened: true,
                    ts: new Date().getTime(),
                    animation: true,
                    notsended: socket.connected ? false : true
                }
            ];

            if (!socket.connected) {
                var queue = {
                    messageTarget: messageTarget,
                    image: img,
                }

                const storage = window.localStorage;
                var qmessage = storage.getItem('queued message');

                if (qmessage) {
                    var parseQmessage = JSON.parse(qmessage);
                    parseQmessage.push(queue);
                } else {
                    var parseQmessage = [queue];
                }

                storage.setItem('queued message', JSON.stringify(parseQmessage));

                var snapshot = JSON.parse(storage.getItem('snapshotRoom_' + this.props.appPage.state.messageTarget.room));

                var updatesnapshot = [...snapshot, ...messageToSend]

                storage.setItem('snapshotRoom_' + this.props.appPage.state.messageTarget.room, JSON.stringify(updatesnapshot));
            } else {
                socket.emit('send image', id, messageTarget, img, (res) => {

                });
            }
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

            setTimeout(() => {
                this.scrollToBottom();
            }, 300);

            
   

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

                var message = this.props.appPage.state.messagesData[removeArray[i]];

                if(message.notsended === true){
                    var queue = JSON.parse(window.localStorage.getItem('queued message'));

                    for(var i in queue){
                        if (queue[i].messageTarget.room === this.props.appPage.state.messageTarget.room){
                            if(queue[i].text === message.text){
                                queue.splice(i, 1);
                                break;
                            } else if (queue[i].image === message.image) {
                                queue.splice(i, 1);
                                break;
                            }
                        }
                    }

                    window.localStorage.setItem('queued message', JSON.stringify(queue));
                }
                
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

                window.localStorage.setItem('snapshotRoom_' + this.props.appPage.state.messageTarget.room, JSON.stringify(messages));

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
        }, 300);
        
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
    
    openImage(img, time){
        this.setState({
            photo: [{
                url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ6fEFQ2VOkoj6OT9z6--bmfcPqiGbJWcCJOg&usqp=CAU',
                caption: new Date(time).toLocaleTimeString('sv-SE', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }]
        })

        setTimeout(() => {
            this.standaloneDark.open();
        }, 200);
        
    }
    selectImage() {
        this.props.appPage.setState({
            disableRefresh: true,
        });

        navigator.camera.getPicture((imageData) => {
            var image = "data:image/jpeg;base64," + imageData;

            this.sendImage(image);

            this.props.appPage.setState({
                disableRefresh: false,
            });
        }, (message) => {
                this.props.appPage.setState({
                    disableRefresh: false,
                });
        }, {
            quality: 80,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY, destinationType: Camera.DestinationType.DATA_URL,
            allowEdit: true,
            correctOrientation: true,
        });
    }
    openCamera() {
        this.props.appPage.setState({
            disableRefresh: true,
        });
        navigator.camera.getPicture((imageData) => {
            var image = "data:image/jpeg;base64," + imageData;

            this.sendImage(image);


            this.props.appPage.setState({
                disableRefresh: false,
            });
        }, (message) => {
                this.props.appPage.setState({
                    disableRefresh: false,
                });
        }, {
            quality: 80,
            destinationType: Camera.DestinationType.DATA_URL,
            allowEdit: true,
            correctOrientation: true,
        });


    }    
    attach() {
        this.$f7.actions.create({
            buttons: [
                // First group
                [
                    {
                        text: 'Ta bild',
                        onClick: () => {
                            this.openCamera();
                        }
                    },
                    {
                        text: 'Välj Bild',
                        onClick: () => {
                            this.selectImage();
                        }
                    }
                ],
                // Second group
                [
                    {
                        text: 'Stäng',
                        color: 'red'
                    }
                ]
            ]
        }).open();
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
              <PhotoBrowser
                  photos={this.state.photo}
                  theme="dark"
                  toolbar={false}
                  swipeToClose={false}
                  popupCloseLinkText="Stäng"
                  ref={(el) => { this.standaloneDark = el }}
              />
            <Popover className="popover-menu">
            <List>
                <ListButton onClick={() => this.copyMessage() } color={this.state.marked.length === 1 ? '' : 'gray'} popoverClose={this.state.marked.length === 1 ? true : false } title="Kopiera" />
                      <ListButton onClick={() => this.toggleMark()} color={this.props.appPage.state.messagesData.length > 0 ? '' : 'gray'} popoverClose={this.props.appPage.state.messagesData.length > 0 ? true : false } title={this.state.marked.length === this.props.appPage.state.messagesData.length ? this.props.appPage.state.messagesData.length > 0 ? 'Avmarkera alla' : 'Markera alla' : 'Markera alla' } />
                <ListButton onClick={() => this.removeSelected() } color={this.state.marked.length > 0 ? 'red' : 'gray'} popoverClose={this.state.marked.length > 0 ? true : false } title={`Ta bort / Ångra (${this.state.marked.length})`} />
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
               
                                className={`messagecontainer bubble msg_${index} ${item.animation ? 'animate__animated animate__zoomIn animate__faster' : ''} ${item.image ? 'imagecontainer' : ''} `}>



                                {item.image ? (
                                    <img className="messageImage" src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ6fEFQ2VOkoj6OT9z6--bmfcPqiGbJWcCJOg&usqp=CAU" />
                                        
                                ) : ''}

                                {item.text ? item.text : ''}




                            {!item.notsended ? (
                            <div className="messagetime">{ new Date(item.ts).toLocaleTimeString('sv-SE', {
                                hour12: false,
                                hour: '2-digit',
                                minute: '2-digit'
                            }) } </div>
                            ) : (
                                        <div className="notsended">Köad</div>
                            ) }

                                
                            </div>
                            {item.notsended ? (    
                            <div className="messagesave">
                                <Preloader size="10" color="multi"></Preloader>
                            </div>
                            ) : '' }
                            {/* {item.save ? (
                                <div className={`messagesave`}>Sparad</div>
                            ) : ''}     */}

                            <div className={`messageHandlerBox ${ this.isMarked(index) && this.state.marked.length === 1 ? 'show' : '' }`}>
                                <div className={`messagecontainer copybutton`} onClick={() => !item.image ? this.copyMessage(index) : this.openImage(item.image, item.ts) }>
                                    {!item.image ? (
                                    <Link className="copycustombutton" iconIos="f7:doc_on_doc" iconMd="f7:doc_on_doc" iconSize="18"></Link>
                                    ) : (
                                            <Link className="copycustombutton" iconIos="f7:expand" iconMd="f7:expand" iconSize="18"></Link>  
                                    )}
                                 </div>

                                <div className={`messagecontainer savebutton`} onClick={() => this.togglesave(index)}>
                                    { item.image ? (
                                        <Link className="copycustombutton" iconIos="f7:floppy_disk" iconMd="f7:floppy_disk" iconSize="18"></Link>
                                    ) : ( 
                                    <Link className="copycustombutton" iconIos={item.save ? 'f7:star_fill' : 'f7:star'} iconMd={item.save ? 'f7:star_fill' : 'f7:star'}  iconSize="18"></Link>
                                    )}
                                </div>

                                <div className={`messagecontainer deletebutton`} onClick={() => this.removeSelected()}>
                                    <Link className="removecustombutton" iconIos={this.$f7.passedParams.socket.connected ? 'f7:trash' : 'f7:arrow_counterclockwise'} iconMd={this.$f7.passedParams.socket.connected ? 'f7:trash' : 'f7:arrow_counterclockwise'}iconSize="18"></Link>
                                </div>
                            </div>
                            
                        </div>
                    )) }
                </div>
                {/* { this.$f7.passedParams.socket.connected ? '' : (
                  <Block className="text-align-center">
                          <Preloader color="multi"></Preloader>
                  </Block>
                ) } */}
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
                      onClick={() => this.attach()}
                ></Link>
                <Link
                    iconIos="f7:arrow_up_circle_fill"
                    iconAurora="f7:arrow_up_circle_fill"
                    iconMd="material:send"
                    slot="inner-end"
                    onClick={() => this.sendMessage()}
                ></Link>
            </Messagebar>

              {this.$f7.passedParams.socket.connected ? '' : (
                  <Block className="text-align-center nonetwork">
                      <Icon f7="wifi_exclamationmark"></Icon><br></br>
                      Nätverk saknas
                  </Block>
              )}
        </Tab>
      );
    }
  }

export default Message;