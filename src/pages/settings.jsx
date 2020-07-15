import React from 'react';
import {
  Page,
  Navbar,
  NavTitle,
  NavRight,
  Link,
  Block,
  List,
  ListItem,
  Toggle,
  ListButton
} from 'framework7-react';


import './settings.css';

class settings extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            user: JSON.parse(window.localStorage.getItem('loginData')),
        }
    }

    logout(){
        const storage = window.localStorage;

        storage.removeItem('snapshot');
        storage.removeItem('loginData');

        window.location.reload();
    }

    changeAvatar(){
        this.$f7.dialog.prompt('Ange URL', 'Ändra avatar', (url) => {
            console.log(url);
            const updateUser = this.state.user;

            updateUser.avatar = url;

            window.localStorage.setItem('loginData', JSON.stringify(updateUser));

            this.setState({
                user: updateUser
            });

            const { socket } = this.$f7.passedParams;

            socket.emit('change avatar', this.state.user.id, url);
        });
    }
    render(){
        return(
            <Page name="settings" pageContent={false}>
                <div className={`connection ${this.$f7.passedParams.socket.connected ? 'con-online' : 'con-offline'}`}></div>
        
                <Navbar backLink="Tillbaka" noShadow={true}
                    noHairline={true}>
                    <NavTitle>{ this.state.user.name }</NavTitle>
                    <NavRight>
                        <Link onClick={() => this.logout()} iconIos="f7:square_arrow_right" iconAurora="f7:square_arrow_right" iconMd="f7:square_arrow_right"></Link>
                    </NavRight>
                </Navbar>
                <div className="page-content text-align-center">
                   <Block>
                        <img onClick={() => this.changeAvatar() } className="profileAvatar" src={ this.state.user.avatar } width="124" />
                    <div className="profileName">{ this.state.user.name }</div>
                    <div className="profileUsername">@{ this.state.user.username }</div>
                    </Block>
                <List simpleList inset>
                <ListItem>
                    <span>Avisering</span>
                    <Toggle defaultChecked />
                </ListItem>
                </List>

                <List inset>
                    <ListButton title="Ändra profil"></ListButton>
                    <ListButton title="Ändra lösenord"></ListButton>
                </List>
                </div>
            </Page>

        )
    }
}

export default settings;