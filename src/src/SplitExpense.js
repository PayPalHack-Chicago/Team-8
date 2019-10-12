import React, { Component } from 'react'
import { getPublicKeyFromPrivate, decryptContent } from 'blockstack'
import { decryptECIES } from 'blockstack/lib/encryption'

class SplitExpense extends Component {
  constructor(props){
    super(props)
    this.loadAESKey = this.loadAESKey.bind(this)
    this.addFriendsExpense = this.addFriendsExpense.bind(this)
    this.getFriendPaidExpense = this.getFriendPaidExpense.bind(this)
    this.userSession = this.props.userSession
    this.userData = this.props.userSession.loadUserData()
    this.aesKey = ''
    this.state = { 
      friends: [],
      username: '',
      transactionName: '',
      amount: '',
      expenses: []
    }
    this.userSession.getFile('friends.json').then(friends => {
      if(friends!=null){          
        this.setState({ friends: JSON.parse(friends)})
        console.log(friends)
      }
    })
  }

  loadAESKey(){
    this.userSession.getFile(`keys/${this.userData.username}`, { decrypt: false, username: this.state.username })
    .then((data) => {
        if(data!=null){
            let encryptedKey = JSON.parse(data)
            console.log(encryptedKey)
            let decryptedKey = decryptECIES(this.userData.appPrivateKey, encryptedKey)   
            console.log(decryptedKey)
            this.aesKey = decryptedKey
        }
    })
  }

  async addFriendsExpense(){
    const transactionName = this.state.transactionName
    const amount = this.state.amount
    this.userSession.getFile(`expenses/${this.state.username}.json`, {decrypt: false})
    .then((data)=> {
      const friendInList = this.state.friends.find((value)=> value.username === this.state.username)
      let expenses = []
      if(data != null){
        data = decryptContent(data, { privateKey: friendInList.key})
        expenses = JSON.parse(data)
      }
      expenses.push({transactionName,amount, date: new Date()})
      console.log(expenses)
      this.userSession.putFile(`expenses/${this.state.username}.json`,  JSON.stringify(expenses), {encrypt: getPublicKeyFromPrivate(friendInList.key)})
    })
  }
  
 async getFriendPaidExpense(){
    await this.loadAESKey()
    this.userSession.getFile(`expenses/${this.userData.username}.json`, {decrypt: false, username: this.state.username})
    .then((data)=> {
      if(data != null){
        data = decryptContent(data, { privateKey: this.aesKey})
        let expenses = JSON.parse(data)
        this.setState({
          expenses
        })
        console.log(expenses)
      }
    })
  }

  expenseList(){
    const expenseList = this.state.expenses.map((expense, index) =>
      <li key={index}>
        <div><span>{expense.transactionName} - {expense.amount}</span></div>
      </li>
    );
    return expenseList
  }

  render() {
    return (
    <div>
      <h1>Split Expense</h1>
      <div>
      <label>Friend id </label>
        <input type="text" value={this.state.username} onChange={(e)=> this.setState({username: e.target.value})}></input>
      </div>
      <div>
        <label>Transaction Name</label>
        <input type="text" value={this.state.transactionName} onChange={(e)=> this.setState({transactionName: e.target.value})}></input>
      </div>
      <div>
        <label>Amount</label>
        <input type="text" value={this.state.amount} onChange={(e)=> this.setState({amount: e.target.value})}></input>
      </div>
      <div>
        <button onClick={this.addFriendsExpense}>
           Add Friend Expense
        </button>
      </div>
      <div>
        <button onClick={this.getFriendPaidExpense}>
          Get Friend Expenses
        </button>
      </div>
      <div>
      <ul>
        {this.expenseList()}
      </ul>
      </div>
    </div>
    );
  }
}

export default SplitExpense
