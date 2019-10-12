import React, { Component } from 'react'
import Button from 'react-bootstrap/Button';

class EditMe extends Component {
  constructor(props){
    super(props)
    this.resetAccount = this.resetAccount.bind(this)
    this.userSession = this.props.userSession
  }
  resetAccount(){
    // this.userSession.deleteFile('friends.json')
    // this.userSession.deleteFile('expenses/')
    // this.userSession.deleteFile('keys/')
    this.userSession.deleteFile('expense.json')
  }
  render() {

    return (
      <div className="p-2">
        <h4>Setting</h4>
        <div>
            <Button onClick={this.resetAccount} variant="outline-danger">
              Reset Account
            </Button>
        </div>
      </div>
    );
  }
}


export default EditMe
