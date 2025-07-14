import { FC } from 'react'
import './dashboard.css'
// import PieActiveArc from '../../Core/PieChart/PieChart'

const Dashboard:FC = () => {
  return (
    <div className='dashboard-container' data-testid="dashboard-container">
     <div className="dashboard-wrapper">
          <div className="dashboard-headers">
            <h4>Current Net Worth</h4>
            <div>111</div>
          </div>
          <div className="dashboard-headers">
            <h4>Actual Net Worth</h4>
            <div>111</div>
          </div>
        </div>
    {/* <PieActiveArc/> */}
    </div>
  )
}

export default Dashboard