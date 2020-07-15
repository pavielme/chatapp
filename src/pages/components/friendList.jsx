import React from 'react';
import {
  Tab, Navbar, NavTitle, List, ListItem, NavRight, Link, Searchbar, Subnavbar, NavLeft, Preloader, Block, Icon
} from 'framework7-react';

class Friends extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            touchstart: false,
            connect: false,
        }
    }

    componentDidMount(){
        var connect = this.$f7.toast.create({
            text: 'Ansluter',
            closeButton: true,
            closeButtonText: 'Stäng',
            closeButtonColor: 'red',
        });

        connect.open();

        this.loadFriends(connect);

        const { socket } = this.$f7.passedParams;

        socket.on('disconnect', () => {
            this.setState({
                connect: false
            });
        });

        socket.on('connect', () => {
            this.setState({
                connect: true
            });
        });

    }

    loadFriends(connect){
        const { socket } = this.$f7.passedParams;
    
        socket.emit('load friends', this.props.appPage.state.user.id, (res) => {
            const storage = window.localStorage;
    
            //snapshot
            storage.setItem('snapshot', JSON.stringify(res));
    
            this.props.appPage.setState({
                friends: res
            });

            connect.close();
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

                if(duration < 500) {
                    this.$f7.swiper.get('.pageTabs').allowSlidePrev = true;
                    this.$f7.tab.show('#tab-1');
                    this.$f7.swiper.get('.pageTabs').allowSlidePrev = false;
                } else {
                    setTimeout(() => {
                        if(this.props.appPage.state.page === 'Home'){
                            const { socket } = this.$f7.passedParams;
                            socket.emit('leave room', this.props.appPage.state.user.id, this.props.appPage.state.messageTarget.room, (res) => {
                                console.log(res);
                            });
                            
                            window.localStorage.setItem('snapshotRoom_' + this.props.appPage.state.messageTarget.room, JSON.stringify(this.props.appPage.state.messagesData));

                            this.props.appPage.setState({
                                messageTarget: false,
                                messagesData: []
                            });

                            this.$$('.Custom-MessageContent').removeClass('showContent');
                        }
                    }, 300);
                }
            }
        }


        this.$f7.swiper.get('.pageTabs').allowSlidePrev = state;

        const self = this.props.appPage;
        const { socket } = this.$f7.passedParams;
        const storage = window.localStorage;

        if(state){
            var snapshotRoom = storage.getItem('snapshotRoom_' + friend.room);

            this.$$('.Custom-MessageContent').removeClass('showContent');

            this.props.appPage.setState({
                messageTarget: friend,
                messagesData: snapshotRoom ? JSON.parse(snapshotRoom) : [],
            });
            setTimeout(() => {
                this.scrollToBottom(); 
                this.$$('.Custom-MessageContent').addClass('showContent');
            }, 15);
            

            socket.emit('load messages', self.state.user.id, friend.room, (res) => {
                storage.setItem('snapshotRoom_' + friend.room, JSON.stringify(res));

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
          <NavTitle>Direkt chat</NavTitle>
          <NavRight>
              <Link onClick={
                  () => {
                      window.navigator.splashscreen.show();

                      setTimeout(() => {
                          window.navigator.splashscreen.hide();
                      }, 2000);
                  }
              } iconIos="f7:person_badge_plus" iconAurora="f7:person_badge_plus" iconMd="f7:person_badge_plus"></Link>
          </NavRight>
     
        </Navbar>
              {this.$f7.passedParams.socket.connected ? '' : (
                  <Block className="text-align-center">
                      <Preloader color="multi"></Preloader>
                  </Block>
              )}

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
                <img slot="media" className="listAvatar" src={item.user.avatar} width="44" />
            </ListItem>
            </span>
        )) }
        </List>

              {this.$f7.passedParams.socket.connected ? '' : (
                  <Block className="text-align-center nonetwork">
                      <Icon f7="wifi_exclamationmark"></Icon><br />
                      Nätverk saknas
                  </Block>
              )}
        
        </Tab>
      );
    }
  }

export default Friends;