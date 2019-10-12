import React, { Component } from 'react'
import { makeECPrivateKey } from 'blockstack'
import { encryptECIES } from 'blockstack/lib/encryption'
import AsyncSelect from 'react-select/async';

class Friends extends Component {
  constructor(props){
    super(props)
    this.setupKey = this.setupKey.bind(this)
    this.addFriend = this.addFriend.bind(this)
    this.promiseOptions = this.promiseOptions.bind(this)
    this.onFriendSelect = this.onFriendSelect.bind(this)
    this.userSession = this.props.userSession
    this.userData = this.props.userSession.loadUserData()
    this.state = { 
      friends: [],
      inputValue: '',
    }
    
    this.username = ''
    this.user = {}
    this.userSession.getFile('friends.json').then(friends => {
      if(friends!=null){          
        this.setState({ friends: JSON.parse(friends)})
        console.log(friends)
      }
    })
  }

  setupKey(user){
    const aesKey = makeECPrivateKey()
    let encryptedAesKey = encryptECIES(user.publicKey, aesKey)
    this.userSession.putFile(`keys/${this.username}`, JSON.stringify(encryptedAesKey), { encrypt: false })
    return aesKey
  }

  addFriend() {
    const newFriend = this.username
    if(this.userData.username !== newFriend){
      this.userSession.getFile('key.json', {
        username: newFriend,
        decrypt: false
      }).then(keyData => {
          const friends = this.state.friends
          const friendInList = friends.find((value) => (value.username === newFriend))
          if(friendInList === undefined){ 
            const user = {username: newFriend, publicKey: JSON.parse(keyData)}
            const aesKey = this.setupKey(user)
            user['key'] =  aesKey
            friends.push(user)
            this.setState({friends})
            this.persistfriends()
          }
      })
      .catch(e => {
          console.log(e);
      })
    }
  }

  persistfriends() {
    this.userSession.putFile('friends.json', JSON.stringify(this.state.friends))
        .then(() => console.log('submitted friends.json'))
        .catch(e => console.dir(e))
  }

  friendList(){
    const friendList = this.state.friends.map((friend) =>
      <li key={friend.publicKey}>
        {friend.username}
      </li>
    );
    return friendList
  }

  promiseOptions(inputValue){
    return fetch(`https://core.blockstack.org/v1/search?query=${inputValue}`)
    .then(response => response.json().then((data)=> {
      return (data.results.map((value) => ({label:value.username, value: value})))
    }))
  }

  onFriendSelect(selectedFriend){
    const user = selectedFriend.value
    this.user = user
    this.username = user.username
  }
  
  render() {
    return (
    <div>
      <h1>Friends</h1>
      <div>
      {/* <div>
      <label>Friend id </label>
        <input type="text" value={this.username} onChange={(e)=> this.setState({username: e.target.value})}></input>
      </div> */}
      <div>
        <AsyncSelect
            cacheOptions
            loadOptions={this.promiseOptions}
            onChange = {this.onFriendSelect}
        />
      </div>
        <button onClick={this.addFriend}>
          Add friend
        </button>
      </div>
      <div>
      <ul>
        {this.friendList()}
      </ul>
      </div>
    </div>
    );
  }
}

export default Friends
