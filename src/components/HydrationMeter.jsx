import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { withFirebase } from './Firebase';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class HydrationMeter extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.firebase.auth.currentUser.uid,
      userName: '',
      dailyHydration: 0,
      date: this.findDayByMils(Date.now()),
      dateToDisplay: new Date()
    };
    this.updateUserOunces = this.updateUserOunces.bind(this);
    this.findDayByMils = this.findDayByMils.bind(this);
    this.checkIfEntryFromDateToQuery= this.checkIfEntryFromDateToQuery.bind(this);
  }

  componentDidMount(){
    this.updateUserOunces();
    this.updateUserName();
  }

 updateUserOunces = async function asyncCall() {
    var sum = await this.getUsersHydration();
    this.setState({ dailyHydration: sum })
  }

  findDayByMils(givenDate){
    //takes in the miliseconds and converts to num representing date
    const date = new Date(givenDate)
    const year = date.getFullYear().toString()
    const day = date.getDate().toString()
    const month = date.getMonth().toString()
    const combinedDate = (day + year + month)
    return combinedDate
  }

  findDayByDatePicker(givenDate){
    const year = givenDate.getFullYear().toString()
    const day = givenDate.getDate().toString()
    const month = givenDate.getMonth().toString()
    const combinedDate = (day + year + month)
    return combinedDate
  }

  checkIfEntryFromDateToQuery(milsToEvaluate, dateToCompare){
    const dayOfEntry = this.findDayByMils(milsToEvaluate)
    if (dayOfEntry === dateToCompare) {
      return true
    } else {
      return false
    }
  }

  updateUserName = async function asyncCall() {
    const name = await this.getUsersName();
    const nameSplit = name.split(" ")
    const firstName = nameSplit[0]
    this.setState({userName: firstName}) 
  }

  getUsersName(){
    return new Promise (resolve => {
      const ref = this.props.firebase.db.ref('users/' + this.state.user)
      ref.on("value", function(snapshot) {
        const user = (snapshot.val());
        const userName = user.username
        resolve(userName)
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
    })
  }

  handleChange = selectedDate => {
    const date = this.findDayByDatePicker(selectedDate)
    this.setState({
      date: date,
      dateToDisplay: selectedDate
    },() => this.updateUserOunces())
  };

  getUsersHydration(){
    const dateToEvaluate = this.state.date
    return new Promise (resolve => {
      const ref = this.props.firebase.db.ref(this.state.user)
      ref.on("value", snapshot => {
        const userObject = (snapshot.val());
        //pull ounces out of object and checks if the entry was made today
        const dailyOunces = []
        for (const key in userObject) {
          let currentVal = userObject[key].ounces
          let dateOfEntry = userObject[key].date
          if (this.checkIfEntryFromDateToQuery(dateOfEntry, dateToEvaluate)){
            dailyOunces.push(currentVal)
          }
        }
        //sums the total ounces 
        const sum = dailyOunces.reduce(function(a, b) { return a + b; }, 0)
        resolve(sum)
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
    })
  }

  addHydrationToFirebase(user, ounces){
    this.props.firebase.db.ref(user).push({
      ounces: ounces,
      date: Date.now()
    }, function(error){
      if (error) {
        alert ('There was an error')
      } 
    });
    this.updateUserOunces();
  }

  formatStringToDisplayToUser(){
   const date = this.state.dateToDisplay
   console.log((date < new Date()))
   if (date < new Date()){
     return ('had ' + this.formatOuncesToDisplay().toString() + ' ounces of water on ' + date.toString())
   } else {
     return ('have had ' + this.formatOuncesToDisplay().toString() + ' ounces of so far')
   }
  }

  formatOuncesToDisplay(){
    const currentOuncesOfWater = (this.state.dailyHydration || this.state.dailyHydration === 0)  ? this.state.dailyHydration : '...loading'
    return currentOuncesOfWater
  }
  
  render(){
    const progress = ((this.state.dailyHydration / 64) * 100)
    const currentUser = this.state.userName ? this.state.userName : '...loading'
    const contentToDisplay = this.formatStringToDisplayToUser()
    return(
      <div>
        <div className="date-picker">
          <h6>Pick a date to checkout:</h6>
         <DatePicker 
            onChange={this.handleChange}
          />
        </div>
        <div>
          <h1>Hey {currentUser}, you {contentToDisplay}</h1>
        </div>
        <div className="water-data">
          <h3>Add Some Hydration:</h3>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Ounces
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={()=> this.addHydrationToFirebase(this.state.user, 4)}>4</Dropdown.Item>
              <Dropdown.Item onClick={()=> this.addHydrationToFirebase(this.state.user, 8)}>8</Dropdown.Item>
              <Dropdown.Item onClick={()=> this.addHydrationToFirebase(this.state.user, 12)}>12</Dropdown.Item>
              <Dropdown.Item onClick={()=> this.addHydrationToFirebase(this.state.user, 16)}>16</Dropdown.Item>
              <Dropdown.Item onClick={()=> this.addHydrationToFirebase(this.state.user, 24)}>24</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <div className="hydration-meter">
          Hydration Situation:
          <ProgressBar animated now={progress} />
          </div>
        </div>
      </div>
    )
  }
}

export default withFirebase(HydrationMeter);