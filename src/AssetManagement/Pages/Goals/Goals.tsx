import { useEffect, useState } from "react";
import GoalsCard from "./GoalsCard/GoalsCard";
import GoalsService from "../../../services/GoalsService/GoalsService";
import { Goals as GoalsType } from "../../../../server/types";
import CustomButton from "../../../core/CustomButton/CustomButton";
import GoalsForm from "./GoalsModal/GoalsModal";
import { useAssetManagementContext } from "../../ContextProvider/ContextProvider";

const Goals = () => {
  const { refreshData, setRefreshData } = useAssetManagementContext();
  const [goals, setGoals] = useState<GoalsType[]>([]);
  const [goalsOpen, setGoalsOpen] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalsType>();
  const [loading, setLoading] = useState<boolean>(false);
  const [type, setType] = useState<"create" | "edit" | "">("");
  useEffect(() => {
    setLoading(true);
    GoalsService()
      .getGoalsDetails()
      .then((response) => {
        if (response && response.data) {
          setGoals(response.data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching goals details:", error);
      });
  }, [refreshData]);

  const handleOpenGoalsCreate = () => {
    setGoalsOpen(true);
    setType("create");
  };
  const handleCloseGoalsForm = () => {
    setGoalsOpen(false);
  };

  return (
    <>
      {goalsOpen && (
        <GoalsForm
          type={type}
          open={goalsOpen}
          handleClose={() => handleCloseGoalsForm()}
          goals={selectedGoal}
          setRefreshData={setRefreshData}
        />
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "1rem",
          justifyContent: "center",
        }}
      >
        <CustomButton
          handleClick={() => handleOpenGoalsCreate()}
          text="Add Goal"
          customClass=""
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "2rem",
          justifyContent: "center", // centers the grid inside its wrapper
          maxWidth: "1080px", // adjust as needed for your page
          width: "100%",
          margin: "1rem auto", // center at page level if needed
        }}
      >
        {goals.map((goal) => (
          <GoalsCard
            key={goal.id}
            goal={goal}
            setGoalsOpen={setGoalsOpen}
            setType={setType}
            setSelectedGoal={setSelectedGoal}
            loading={loading}
          />
        ))}
      </div>
    </>
  );
};

export default Goals;
