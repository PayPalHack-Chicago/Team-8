import React, { Component } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { UserSession, getPublicKeyFromPrivate } from 'blockstack'
import EditMe from './EditMe'
import MyExpense from './MyExpense'
// import SplitExpense from './SplitExpense'
// import Friends from './Friends'
import NavBar from './NavBar'
import { appConfig } from './constants'
import './SignedIn.css'


class SignedIn extends Component {

  constructor(props) {
    super(props)
    this.userSession = new UserSession({ appConfig })
    this.signOut = this.signOut.bind(this)
    // this.addPublicKey()
  }

  signOut(e) {
    e.preventDefault()
    this.userSession.signUserOut()
    window.location = '/'
  }
 
  addPublicKey(){
    const userData = this.userSession.loadUserData()
    const publicKey = getPublicKeyFromPrivate(userData.appPrivateKey)
    this.userSession.putFile('key.json', JSON.stringify(publicKey),{ encrypt: false })
  }

  render() {
    const username = this.userSession.loadUserData().username
    const userSession = this.userSession
    if(window.location.pathname === '/') {
      return (
        <Redirect to={`/myexpense`} />
      )
    }

    return (
      <div className="component">
      <NavBar username={username} signOut={this.signOut}/>
      <Switch>
              <Route
                path='/me'
                render={
                  routeProps => <EditMe
                  username={username}
                  userSession={userSession}
                  {...routeProps} />
                }
              />
              <Route
                path={`/myexpense`}
                render={
                  routeProps => <MyExpense
                  protocol={window.location.protocol}
                  userSession={userSession}
                  realm={window.location.origin.split('//')[1]}
                  {...routeProps} />
                }
              />
              {/* <Route
                path={`/splitexpense`}
                render={
                  routeProps => <SplitExpense
                  protocol={window.location.protocol}
                  userSession={userSession}
                  {...routeProps} />
                }
              />
              <Route
                path={`/friends`}
                render={
                  routeProps => <Friends
                  protocol={window.location.protocol}
                  userSession={userSession}
                  {...routeProps} />
                }
              /> */}
      </Switch>
      </div>
    );
  }
}

export default SignedIn
