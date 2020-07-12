import React from 'react';
import {
  Tab, Navbar, NavTitle, List, ListItem, NavTitleLarge,
} from 'framework7-react';

class Friends extends React.Component {
    constructor(props){
        super(props);

    }

    componentDidMount(){
        const { id } = this.props.appPage.state.user;

        const { socket } = this.$f7.passedParams;

        socket.emit('load friends', id, (res) => {
            this.props.appPage.setState({
                friends: res
            });
        });
    }

    timestampString(ts){
        var d = new Date(ts);
        var currentDate = new Date().toLocaleDateString()

        if(currentDate === d.toLocaleDateString()){
            return d.toLocaleTimeString('sv-SE', { 
                hour12: false,
                hour: '2-digit', 
                minute: '2-digit'
            });
        } else {
            return d.toLocaleDateString();
        }
    }

    allowSlide(state, friend){
        if(!state){
            this.$f7.tab.show('#tab-1');
        }


        this.$f7.swiper.get('.pageTabs').allowSlidePrev = state;

        const self = this.props.appPage;
        const { socket } = this.$f7.passedParams;

        if(state){
            socket.emit('load messages', self.state.user.id, friend.room, (res) => {
                this.props.appPage.setState({
                    messageTarget: friend,
                    messagesData: res,
                });
                
                console.log('joined ' + friend.room);
                this.scrollToBottom();
            });
        }
    }

    scrollToBottom(){
        var container = this.$$('.Custom-MessageContent');
        container.scrollTop(container[0].scrollHeight);
    }

    render() {
      const { friends } = this.props.appPage.state;

      return (
        <Tab id="tab-2" tabActive className="page-content">
        <Navbar>
          <NavTitle>Chat</NavTitle>
        </Navbar>
        <List inset mediaList noHairlines noHairlinesBetween className="friendsList">
        { friends.map((item, index) => (
            <span 
                key={index} 
                onTouchStart={() => this.allowSlide(true, item)}
                onTouchEnd={() => this.allowSlide(false, item)}
                className={`friend ${item.message.new ? 'newMessage' : ''}`}
            >
            <ListItem
                link
                title={item.user.name}
                subtitle={`@${item.user.username}`}
                after={this.timestampString(item.message.last)}
                
            >
                <img slot="media" className="listAvatar" src="https://www.legatowebtech.com/wp-content/uploads/2019/01/avatar-372-456324.png" width="44" />
            </ListItem>
            </span>
        )) }
        </List>
        </Tab>
      );
    }
  }

export default Friends;