import React from 'react';
import {
  Tab, Navbar, NavTitle, List, ListItem, NavRight, Link, Searchbar, Subnavbar, NavLeft
} from 'framework7-react';

class Friends extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            touchstart: false
        }
    }

    componentDidMount(){
        const loader = this.$f7.dialog.preloader('Uppdaterar');

        this.loadFriends(loader);
    }

    loadFriends(loader){
        const { socket } = this.$f7.passedParams;
    
        socket.emit('load friends', this.props.appPage.state.user.id, (res) => {
            const storage = window.localStorage;
    
            //snapshot
            storage.setItem('snapshot', JSON.stringify(res));
    
            this.props.appPage.setState({
                friends: res
            });

            loader.close();
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

        if(state){
            if(!this.state.touchstart){
                this.setState({
                    touchstart: new Date().getTime()
                });
            }
        } else if(!state){
            if(this.state.touchstart) {
                var duration = new Date().getTime() - this.state.touchstart;
                
                this.setState({
                    touchstart: false
                });

                if(duration < 300) {
                    this.$f7.tab.show('#tab-1');
                } else {
                    setTimeout(() => {
                        if(this.props.appPage.state.page === 'Home'){
                            const { socket } = this.$f7.passedParams;
                            socket.emit('leave room', this.props.appPage.state.user.id, this.props.appPage.state.messageTarget.room, (res) => {
                                console.log(res);
                            });
            
                            this.props.appPage.setState({
                                messageTarget: false,
                                messagesData: []
                            });
                        }
                    }, 300);
                }
            }
        }


        this.$f7.swiper.get('.pageTabs').allowSlidePrev = state;

        const self = this.props.appPage;
        const { socket } = this.$f7.passedParams;

        if(state){
            this.props.appPage.setState({
                messageTarget: friend
            });

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
        <div className={`connection ${this.$f7.passedParams.socket.connected ? 'con-online' : 'con-offline'}`}></div>
        
        <Navbar
            noShadow={true}
            noHairline={true}
        >
          <NavLeft>
              <Link href="/Settings" transition="f7-push" iconIos="f7:gear_alt" iconAurora="f7:gear_alt" iconMd="f7:gear_alt"></Link>
          </NavLeft>
          <NavTitle>Chat</NavTitle>
          <NavRight>
              <Link iconIos="f7:person_badge_plus" iconAurora="f7:person_badge_plus" iconMd="f7:person_badge_plus"></Link>
          </NavRight>
     
        </Navbar>
        <List inset mediaList noHairlines noHairlinesBetween className="friendsList">
        { friends.map((item, index) => (
            <span 
                key={index} 
                onTouchStart={() => this.allowSlide(true, item)}
                onTouchEnd={() => this.allowSlide(false, item)}
                className={`friend`}
            >
            <ListItem
                title={item.user.name}
                subtitle={`@${item.user.username}`}
                badge={item.message.new}
                badgeColor="red"

                after={this.timestampString(item.message.last)}        
                
            >
                <img slot="media" className="listAvatar" src="https://image.winudf.com/v2/image1/Y29tLmJhYnkueW9kYS5zdGlja2Vycy53YXN0aWNrZXJhcHBzX2ljb25fMTU4MTk5OTgxNV8wMDc/icon.png?w=170&fakeurl=1" width="44" />
            </ListItem>
            </span>
        )) }
        </List>
        </Tab>
      );
    }
  }

export default Friends;