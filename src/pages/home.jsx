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

    const snapshot = storage.getItem('snapshot');

    this.state = {
      page: null,
      user: JSON.parse(storage.getItem('loginData')),
      token: false,
      friends: snapshot ? JSON.parse(snapshot) : [],
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

    socket.open();

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === 'visible') {
          window.location.reload();
        } else {
          document.body.hidden = true;
          socket.close();
        }
    });
    
    socket.on('connect', () => {
      this.initApp();
    });

    

    socket.on('notification id_' + this.state.user.id, (name) => {
      this.loadFriends();

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

  loadFriends(){
    const { socket } = this.$f7.passedParams;

    socket.emit('load friends', this.state.user.id, (res) => {
        const storage = window.localStorage;

        //snapshot
        storage.setItem('snapshot', JSON.stringify(res));

        this.setState({
            friends: res
        });
    });
  }

  initApp(){
    const { socket } = this.$f7.passedParams;

    if(window.plugins){
      window.plugins.PushbotsPlugin.initialize("5f081210e5b4184a2021917b", {"android":{"sender_id":"264040976429"}});
        
      // Only with First time registration
      window.plugins.PushbotsPlugin.on("registered", (token) => {
        console.log("Registration Id:" + token);
      });

      window.plugins.PushbotsPlugin.on("user:ids", (data) => {
        var token = data.token;

          this.setState({
            token: token
          });

          socket.emit('set Token', this.state.user.id, token, (res) => {
            console.log('Token:' + res);
          });
        
      });
    } 
      socket.emit('connect user', this.state.user.id, (socketid) => {
        console.log('Socket ID: ' + socketid);
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

                
              } else if(state === 'Message') {
                newPage = 'Home';
                this.$f7.swiper.get('.pageTabs').allowSlidePrev = false;
                this.$f7.swiper.get('.pageTabs').allowSlideNext = false;

                const { socket } = this.$f7.passedParams;

                socket.emit('leave room', this.state.user.id, this.state.messageTarget.room, (res) => {
                  console.log(res);

                  this.loadFriends();
                });

                setTimeout(() => {
                  this.$f7.messagebar.get('.messageBar').clear();
                  this.$f7.messagebar.get('.messageBar').blur();

                  this.setState({
                    messageTarget: false,
                    messagesData: []
                  });
                }, 300);
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