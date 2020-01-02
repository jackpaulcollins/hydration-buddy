import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import ProgressBar from 'react-bootstrap/ProgressBar'
import { withFirebase } from './Firebase';

class HydrationMeter extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.firebase.auth.currentUser.uid,
      userName: '',
      dailyHydration: 0
    };
    this.updateUserOunces = this.updateUserOunces.bind(this);
  }

  componentDidMount(){
    this.updateUserOunces();
    this.updateUserName();
  }

 updateUserOunces = async function asyncCall() {
    var sum = await this.getUsersHydration();
    this.setState({ dailyHydration: sum })
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

  getUsersHydration(){
    const todaysDate = this.getDateAsString()
    return new Promise (resolve => {
      const ref = this.props.firebase.db.ref(this.state.user)
      ref.on("value", function(snapshot) {
        const userObject = (snapshot.val());
        console.log(userObject)
        //pull ounces out of object and checks if the entry was made today
        const dailyOunces = []
        for (const key in userObject) {
          let currentVal = userObject[key].time
          if (currentVal === todaysDate) {
            dailyOunces.push(userObject[key].ounces)
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

  getDateAsString(){
    var date = new Date();
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();
  
    return [date.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('');
    }

  addHydrationToFirebase(user, ounces){
    this.props.firebase.db.ref(user).push({
      ounces: ounces,
      time: this.getDateAsString()
    }, function(error){
      if (error) {
        alert ('There was an error')
      } 
    });
    this.updateUserOunces();
  }
  
  render(){
    const progress = ((this.state.dailyHydration / 64) * 100)
    const currentOuncesOfWater = (this.state.dailyHydration || this.state.dailyHydration === 0)  ? this.state.dailyHydration : '...loading'
    const currentUser = this.state.userName ? this.state.userName : '...loading'
    console.log(currentUser)
    return(
      <div>
        <div>
          <h1>Hey {currentUser}, you've had {currentOuncesOfWater} of Ounces of H20 Today</h1>
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