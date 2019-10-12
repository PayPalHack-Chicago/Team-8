import React, { Component } from 'react'
import {Form, Row, Col, ListGroup} from 'react-bootstrap'
import {RadialChart, LabelSeries} from 'react-vis'
import AddExpense from './AddExpense'
import './MyExpense.css'

const LABEL_STYLE = {
  fontSize: '18px',
  textAnchor: 'middle'
}

class MyExpense extends Component {
  constructor(props){
    super(props)
    this.addExpense = this.addExpense.bind(this)
    this.onCloseExpense = this.onCloseExpense.bind(this)
    this.userSession = this.props.userSession
    this.userData = this.props.userSession.loadUserData()
    this.aesKey = ''
    this.state = {
      transactionName: '',
      amount: '',
      date:'',
      category:'Other',
      expenses: [],
      pieData:[],
      value: false,
      month: '',
      total: '',
      showModal: false
    }
    this.allMonths = []
    this.getExpense()
  }

  componentDidMount(){
    let queryStr = this.props.location
    let queryParams = this.props.location.search.slice(1,queryStr.length).split('&')
    let paramData = {}
    queryParams.forEach((param)=>{
      let splitData = param.split('=')
      paramData[splitData[0]] = splitData[1]
    })
    if(paramData.amount!==undefined && paramData.transactionName!==undefined){
      this.addExpense(paramData,true)
    }
  }
  
  addExpense(expense , fromQuery){
    const transactionName = expense.transactionName
    const amount = expense.amount
    const category = expense.category
    if(transactionName !== '' && amount !== ''){
      this.userSession.getFile('expense.json')
      .then((data)=> {
        let expenses = []
        if(data != null){
          expenses = JSON.parse(data)
        }
        if(this.isEdit===true){
          const date = this.state.date
          for(let i = 0; i<expenses.length; i++){
            if(date === expenses[i].date){
              expenses[i] = {transactionName, amount, category, date }
            }
          }
          this.isEdit = false
        } else {
          expenses.push({transactionName, amount, category, date: new Date()})
        }
        this.userSession.putFile('expense.json', JSON.stringify(expenses)).then(()=>{
          if(fromQuery){
            this.props.history.push('/myexpense')
          }
        })
        expenses.reverse()
        this.allMonths = this.getMonths(expenses)
        this.onMonthChange(this.allMonths[0], expenses)
        this.setState({
          expenses,
          showModal: false,
          transactionName: '',
          amount: '',
          category:'Other',

        })
      }) 
    }
  }

  getExpense(){
    this.userSession.getFile('expense.json')
    .then((data)=> {
      if(data != null){
        const expenses = JSON.parse(data)
        expenses.reverse()
        this.allMonths = this.getMonths(expenses)
        this.onMonthChange(this.allMonths[0], expenses)
        this.setState({
          expenses
        })
      }
    })
  }

  onAddExpense(){
    this.setState({
      showModal: true,
      transactionName: '',
      amount: '',
      category: 'Other',
    })
  }

  onEditExpense(expense){
    this.isEdit = true
    this.setState({
      ...expense,
      showModal: true
    })
  }

  onCloseExpense(){
    this.setState({ 
      showModal: false
    })
  }

  toShortFormat(date){
    const dateObj = new Date(date)
    const month_names =["Jan","Feb","Mar",
                      "Apr","May","Jun",
                      "Jul","Aug","Sep",
                      "Oct","Nov","Dec"]
    return dateObj.getDate() + " " + month_names[dateObj.getMonth()] + " " + dateObj.getFullYear()
  }

  expenseList(){
    const expenses = this.state.expenses
    let currentDate = new Date(1970)
    const expenseList =[]
    this.monthList()
    expenses.forEach((expense, index) =>
    {
      const expenseDateObj = new Date(expense.date)
      const expenseDate = expenseDateObj.setHours(0,0,0,0)
      if(expenseDate !== currentDate){
        currentDate = expenseDate
        const shortdate = this.toShortFormat(currentDate)
        expenseList.push(<ListGroup.Item style={{padding: '10px'}} variant="dark" key={shortdate}>{shortdate}</ListGroup.Item>)
      }
      expenseList.push(
      <ListGroup.Item className="list-item" key={index} onClick={()=>{this.onEditExpense(expense)}}>
        {expense.transactionName}: ${expense.amount}
      </ListGroup.Item>)
    })
    return expenseList
  }

  monthList(){
    const monthList = []
    this.allMonths.forEach((month)=>{
      monthList.push(<option key={month}>{month}</option>)
    })
    return monthList
  }

  getMonths(expenses){
    const allMonths = new Set()
    expenses.forEach((expense)=>{
      const shortdate = this.toShortFormat(new Date(expense.date)).split(" ")
      allMonths.add(shortdate[1]+' '+shortdate[2])
    })
    return [...allMonths]
  }

  onMonthChange(month, expenses){
    if(expenses===undefined){
      expenses = this.state.expenses
    }
    const categoryDistribution = {}
    let monthlySpend = 0
    expenses.forEach((expense)=>{
      const shortdate = this.toShortFormat(new Date(expense.date)).split(" ")
      if((shortdate[1]+' '+shortdate[2])===month){
        const amount = parseInt(expense.amount)
        monthlySpend += amount
        if(categoryDistribution[expense.category]!== undefined){
          categoryDistribution[expense.category]+= amount
        } else{
          categoryDistribution[expense.category] = amount
        }
      }
    })
    const pieData = []
    for ( var key in categoryDistribution){
      pieData.push({category:key, spend:categoryDistribution[key]})
    }
    const total = '$'+ monthlySpend.toString()
    this.setState({
      expenses,
      month,
      pieData,
      total
    })
  }

  render() {
    const {value} = this.state
    return (
    <div className="p-3">
    <div>
      <button className="btn btn-primary" onClick={this.onAddExpense.bind(this)}>
        Add Expense
      </button>
    </div>
      {this.state.showModal? 
      <AddExpense 
        transactionName={this.state.transactionName} 
        amount={this.state.amount}
        category={this.state.category}
        onSaveExpense={this.addExpense}
        onCloseExpense={this.onCloseExpense}
      >
      </AddExpense>: '' }
      {this.state.expenses.length===0? <h4 className="p-2 font-weight-light text-center">No expenses yet!</h4>: 
        <Row>
          <Col className="pt-3 col-xs col-md-6">
            <h5>Transactions</h5>
            <ListGroup className="border" style={{maxHeight: '450px', overflowY:'scroll'}}>
              {this.expenseList()}
            </ListGroup>
          </Col>
          <Col className="pt-3 col-xs col-md-3">
            <h5>Insights(Monthly)</h5>
            <div style={{paddingTop: '5px'}}>
              <Row>
                <Col>
                  <Form as="select" value={this.state.month} onChange={(e)=>this.onMonthChange(e.target.value)}>
                      {this.monthList()}
                  </Form>
                </Col>
                <Col>
                  <span>
                    Total: {this.state.total}
                  </span>
                </Col>
              </Row>
              <RadialChart
                colorType="linear"
                colorDomain={[0, 12]}
                colorRange={["grey","black"]}
                innerRadius={100}
                radius={170}
                getAngle={d => d.spend}
                data={this.state.pieData}
                onValueMouseOver={v => this.setState({value: v})}
                onSeriesMouseOut={v => this.setState({value: false})}
                width={350}
                height={400}
                padAngle={0.04}
              >
                {value && 
                <LabelSeries
                data={[{x: 0, y: 0, label: value.category+': $'+ value.spend, style: LABEL_STYLE}]}
              />}
              </RadialChart>
            </div>
          </Col>
        </Row>
      }
    </div>
    );
  }
}

export default MyExpense
