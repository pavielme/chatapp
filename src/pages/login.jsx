import React from 'react';
import {
  Page,
  Navbar,
  BlockFooter,
  List,
  ListInput,
  ListButton,
  LoginScreen,
  LoginScreenTitle,
} from 'framework7-react';


import './home.css';


export default class Login extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      username: '',
      password: '',
    };
 
  }

  componentDidMount(){
    const { socket } = this.$f7.passedParams;

    this.$f7ready(() => {
      socket.open();
    });
    
  }

  continue(){
      const $$ = this.$$;

      var id = $$('#id').val();
      var name = $$('#name').val();
      var username = $$('#username').val();

      const storage = window.localStorage;

      storage.setItem('id', id);
      storage.setItem('name', name);
      storage.setItem('username', username);

      window.location.reload();
  }
  render(){
    const storage = window.localStorage;
    
    return (
      <Page name="Login">
        <LoginScreen className="demo-login-screen" opened={true}>
          <Page loginScreen>
            <LoginScreenTitle>Logga in</LoginScreenTitle>
            <List form>
              <ListInput
                label="Användarnamn"
                type="text"
                placeholder="Ditt användarnamn"
                value={this.state.username}
                onInput={(e) => {
                  this.setState({ username: e.target.value});
                }}
              />
              <ListInput
                label="Lösenord"
                type="password"
                placeholder="Ditt lösenord"
                value={this.state.password}
                onInput={(e) => {
                  this.setState({ password: e.target.value});
                }}
              />
            </List>
            <List>
              <ListButton onClick={this.signIn.bind(this)}>Logga in</ListButton>
              <BlockFooter>Some text about login information.<br />Lorem ipsum dolor sit amet, consectetur adipiscing elit.</BlockFooter>
            </List>
          </Page>
        </LoginScreen>
      </Page>
    )
  }
  signIn() {
    const { socket } = this.$f7.passedParams;
    var loading = this.$f7.dialog.preloader('Kontrollerar');

    socket.emit('login', this.state.username, this.state.password, (res) => {
      console.log(res);

      setTimeout(() => {
        loading.close();

        if(!res){
          this.$f7.dialog.alert('Felaktiga inloggnings uppgifter', 'Försök igen');
        } else {
          const storage = window.localStorage;
          
          storage.setItem('loginData', JSON.stringify(res));

          this.$f7.dialog.preloader('Loggar in');

          setTimeout(() => {
            window.location.reload();
          },800);

        }
         
      }, 800);
      
    });
  }
};