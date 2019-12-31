import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import ProgressBar from 'react-bootstrap/ProgressBar'

class HydrationMeter extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      dailyHydration: 0
    };
    this.selectOunces = this.selectOunces.bind(this);
  }

  selectOunces(ounces){
    this.setState({
      dailyHydration: (this.state.dailyHydration + ounces)
    })
  }
  
  render(){
    const progress = ((this.state.dailyHydration / 64) * 100)
    return(
      <div>
        <div>
          <h1>Ounces of H20 Today: {this.state.dailyHydration}</h1>
          <h1>Add Some Hydration:</h1>
          <h1>{this.state.ounces}</h1>
        </div>
        <div>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Ounces
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={()=> this.selectOunces(4)}>4</Dropdown.Item>
              <Dropdown.Item onClick={()=> this.selectOunces(8)}>8</Dropdown.Item>
              <Dropdown.Item onClick={()=> this.selectOunces(12)}>12</Dropdown.Item>
              <Dropdown.Item onClick={()=> this.selectOunces(16)}>16</Dropdown.Item>
              <Dropdown.Item onClick={()=> this.selectOunces(24)}>24</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="hydration-meter">
          Hydration Situation:
          <ProgressBar animated now={progress} />
        </div>
      </div>
    )
  }
}

export default HydrationMeter;