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

    render(){
        return(
            <Page name="settings">
                <Navbar backLink="Tillbaka">
                    <NavTitle>{ this.state.user.name }</NavTitle>
                    <NavRight>
                        <Link onClick={() => this.logout()} iconIos="f7:square_arrow_right" iconAurora="f7:square_arrow_right" iconMd="f7:square_arrow_right"></Link>
                    </NavRight>
                </Navbar>
                <Block className="text-align-center">
                    <img className="profileAvatar" src="https://image.winudf.com/v2/image1/Y29tLmJhYnkueW9kYS5zdGlja2Vycy53YXN0aWNrZXJhcHBzX2ljb25fMTU4MTk5OTgxNV8wMDc/icon.png?w=170&fakeurl=1" width="124" />
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
            </Page>

        )
    }
}

export default settings;