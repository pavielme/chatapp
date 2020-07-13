import React from 'react';
import {
  Page,
  Navbar,
  NavTitle,
  List,
  ListInput,
  NavRight,
  Link,
} from 'framework7-react';


import './home.css';


export default class Login extends React.Component {
  constructor(props){
    super(props)

 
  }

  componentDidMount(){
    const { socket } = this.$f7.passedParams;

    this.$f7ready(() => {
        const storage = window.localStorage;
        if(storage.getItem('id')){
            console.log('logged in');
            setTimeout(() => {
                this.$f7router.navigate('/Home');
            },100)
            
        }
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

      this.$f7router.navigate('/Home');
  }
  render(){
    const storage = window.localStorage;
    
    return (
      <Page name="login" pageContent={true}>
        {/* Top Navbar */}
        <Navbar>
            <NavTitle>Logga in</NavTitle>
            <NavRight>
                <Link text="Nästa" onClick={() => this.continue()}></Link>
            </NavRight>
        </Navbar>
        
        <List noHairlinesMd>
        <ListInput
            inputId="id"
            type="text"
            placeholder="ID"
            clearButton
        />

        <ListInput
            inputId="name"
            type="text"
            placeholder="Namn"
            clearButton
        />

        <ListInput
            inputId="username"
            type="text"
            placeholder="Användarnamn"
            clearButton
        />
        </List>
      </Page> 
    )
  }
};