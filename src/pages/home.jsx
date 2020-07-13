import React from 'react';
import {
  Page,
  Navbar,
  NavTitle,
  NavTitleLarge,
  Block,
  Tabs,
  Tab
} from 'framework7-react';


import './home.css';
import Friends from './components/friendList';
import Message from './components/message';

export default class AppPage extends React.Component {
  constructor(props){
    super(props)

    const storage = window.localStorage;

    this.state = {
      page: null,
      user: {
        id: storage.getItem('id'),
        name: storage.getItem('name'),
        username: storage.getItem('paviel'),
      },
      friends: [],
      messageTarget: false,
      messagesData: [],
    }
  }

  notification(name) {

    var notificationFull = this.$f7.notification.create({
      title: 'Chat',
      titleRightText: 'nyss',
      subtitle: 'Från',
      text: name,
      closeTimeout: 3000,
    });

    notificationFull.open();
  }

  componentDidMount(){
    const { socket } = this.$f7.passedParams;

    if(window.plugins){
      window.plugins.PushbotsPlugin.initialize("5f081210e5b4184a2021917b", {"android":{"sender_id":"264040976429"}});
        
      // Only with First time registration
      window.plugins.PushbotsPlugin.on("registered", (token) => {
        console.log("Registration Id:" + token);
      });

      window.plugins.PushbotsPlugin.on("user:ids", (data) => {
        var token = data.token;

        if(this.state.user.id){
          socket.emit('connect user', this.state.user.id, token, (socketid) => {
            console.log(socketid);
          });
        }
      });
    } else {
      socket.emit('connect user', this.state.user.id, false, (socketid) => {
        console.log(socketid);
      });
    }

    socket.on('notification id_' + this.state.user.id, (name) => {
      socket.emit('load friends', this.state.user.id, (res) => {
          this.setState({
              friends: res
          });
      });

      this.notification(name);
    });

    socket.on('receive message', (text) => {
      var messageToReceive = [{
        type: 'received',
        text: text,
        opened: true,
        ts: new Date().getTime(),
        animation: true,          
      }];
      
      this.setState({
        messagesData: [...this.state.messagesData, ...messageToReceive]
      });

      this.scrollToBottom();
    });
  }

  scrollToBottom(){
    var container = this.$$('.Custom-MessageContent');
    container.scrollTop(container[0].scrollHeight);
  }

  render(){
    
    return (
      <Page name="home" pageContent={false}>
        {/* Top Navbar */}
        
        <Tabs className="pageTabs" swipeable swiperParams={{
          allowSlidePrev: false,
          allowSlideNext: false,
          on: {
            slideChange: () => {
              var state = this.state.page;
              var newPage;

              if(state === 'Home'){
                newPage = 'Message';

                setTimeout(() => {
                  this.$f7.messagebar.get('.messageBar').focus();
                }, 100);
                
              } else if(state === 'Message') {
                newPage = 'Home';
                const { socket } = this.$f7.passedParams;

                socket.emit('leave room', this.state.user.id, this.state.messageTarget.room, (res) => {
                  console.log(res);

                  socket.emit('load friends', this.state.user.id, (res) => {
                      this.setState({
                          friends: res
                      });
                  });
                });

                this.setState({
                  messageTarget: false,
                  messagesData: []
                });

                setTimeout(() => {
                  this.$f7.messagebar.get('.messageBar').clear();
                  this.$f7.messagebar.get('.messageBar').blur();
                }, 100);
              } else {
                newPage = 'Home'
              }

              this.setState({
                page: newPage,
              });
            }
          }
        }} >
      
            
          <Message appPage={this}></Message>
          <Friends appPage={this}></Friends>
      
        </Tabs>
        
      </Page> 
    )
  }
};