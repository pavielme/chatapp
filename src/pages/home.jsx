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

    this.state = {
      page: null,
      user: {
        id: 'profile_1',
        name: 'SuperPavve',
        username: 'paviel',
      },
      friends: [],
      messageTarget: false,
      messagesData: [],
    }
  }

  componentDidMount(){
    const { socket } = this.$f7.passedParams;

    socket.emit('connect user', this.state.user.id, (socketid) => {
      console.log(socketid);
    });

    socket.on('receive message', (text) => {
      var messageToReceive = [{
        type: 'received',
        text: text,
        opened: true,
        ts: new Date().getTime()          
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
                newPage = 'Message'
              } else if(state === 'Message') {
                newPage = 'Home';
                const { socket } = this.$f7.passedParams;

                socket.emit('load friends', this.state.user.id, (res) => {
                    this.setState({
                        friends: res
                    });
                });

                socket.emit('leave room', this.state.user.id, this.state.messageTarget.room, (res) => {
                  console.log(res);
                });

                this.setState({
                  messageTarget: false,
                });
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