import React, { Component } from 'react'
import {Form} from 'react-bootstrap'
import Modal from './Modal'
import {categories} from './constants'

class AddExpense extends Component {
    constructor(props){
        super(props)
        this.state = {
            transactionName: this.props.transactionName,
            amount: this.props.amount,
            category:this.props.category,
            showProperty:'none'
          }
    }
  
    onSaveExpense(){
      const expense = {
        transactionName: this.state.transactionName,
        amount: this.state.amount,
        category: this.state.category
      }
      this.props.onSaveExpense(expense)
    }  
    
    categoryList(){
        const categoryList = categories.map((category) =>
            <option key={category}>{category}</option>
        );
        return categoryList
    }

    render(){
        return (
        <div>
          <Modal showProperty={this.state.showProperty}  onSave={this.onSaveExpense.bind(this)}  handleClose={this.props.onCloseExpense} >
            <Form>
              <Form.Group controlId="transactionName">
                <Form.Label>Transaction Name</Form.Label>
                <Form.Control value={this.state.transactionName} onChange={(e)=> this.setState({transactionName: e.target.value})} placeholder="Enter Transaction Name" />
              </Form.Group>
              <Form.Group controlId="amount">
                <Form.Label>Amount $</Form.Label>
                <Form.Control value={this.state.amount} onChange={(e)=> this.setState({amount: e.target.value})} type="number" placeholder="Enter Amount" />
              </Form.Group>
              <Form.Group controlId="category">
                <Form.Label>Category</Form.Label>
                  <Form.Control as="select" value={this.state.category} onChange={(e)=> this.setState({category: e.target.value})}>
                    {this.categoryList()}
                    <option>Other</option>
                  </Form.Control>
              </Form.Group>
            </Form>
          </Modal>
        </div>
        )
    }
}

export default AddExpense;