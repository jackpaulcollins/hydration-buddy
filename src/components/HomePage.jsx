import React from 'react';
import '../App.css';
import HydrationMeter from './HydrationMeter'
import { withAuthorization } from './Session';

class HomePage extends React.Component{
  render(){
    return(
      <div className="main-page-content">
        <HydrationMeter/>
      </div>
    )
  }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(HomePage);