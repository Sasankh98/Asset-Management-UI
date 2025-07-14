import { useEffect, useState } from 'react'
import GoalsCard from './GoalsCard/GoalsCard'
import GoalsService from '../../../services/GoalsService/GoalsService'
import { Goals as GoalsType } from '../../../../server/types';

const Goals = () => {
    const [goals, setGoals] = useState<GoalsType[]>([]);
    useEffect(() => {
        GoalsService().getGoalsDetails()
        .then((response) => {
            console.log("Goals Details:", response);
            if (response && response.data) {
                setGoals(response.data);
            }
        })
        .catch((error) => {
            console.error("Error fetching goals details:", error);
        });
    },[])
  return (
    <div style={{marginLeft: '1rem',marginTop: '1rem'}}>
        {goals.map((goal) => (
          <GoalsCard key={goal.id} goal={goal} />
        ))}
    </div>
  )
}

export default Goals