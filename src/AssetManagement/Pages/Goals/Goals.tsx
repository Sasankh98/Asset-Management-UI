import { useState } from "react";
import GoalsCard from "./GoalsCard/GoalsCard";
import {type GoalsDTO } from "../../../../server/types";
import CustomButton from "../../../core/CustomButton/CustomButton";
import GoalsForm from "./GoalsModal/GoalsModal";
import { useGoalsQuery } from "../../../hooks/queries";

const Goals = () => {
  const [goalsOpen, setGoalsOpen] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalsDTO>();
  const [type, setType] = useState<"create" | "edit" | "">("");
  const goalsQuery = useGoalsQuery();

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
        />
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "1rem",
          justifyContent: "center",
        }}
        data-testid="goals-container"
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
        {goalsQuery.data?.map((goal) => (
          <GoalsCard
            key={goal.id}
            goal={goal}
            setGoalsOpen={setGoalsOpen}
            setType={setType}
            setSelectedGoal={setSelectedGoal}
          />
        ))}
      </div>
    </>
  );
};

export default Goals;
