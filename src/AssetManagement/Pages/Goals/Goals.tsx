import { useCallback, useState } from "react";
import GoalsCard from "./GoalsCard/GoalsCard";
import { type GoalsDTO } from "../../../../server/types";
import CustomButton from "../../../core/CustomButton/CustomButton";
import GoalsForm from "./GoalsModal/GoalsModal";
import { useGoalsQuery } from "../../../hooks/queries";
import { useDialog } from "../../ContextProvider/DialogContextProvider";
import GoalFormTitle from "./GoalsTitle";
import GoalsActions from "./GoalsActions";
import { ModalTypes } from "../../../shared/Constants";

const Goals = () => {
  const [goalsOpen, setGoalsOpen] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalsDTO>();
  const { onOpenChange, onTitleChange, onBodyChange, onActionsChange } =
    useDialog();
  const goalsQuery = useGoalsQuery();

  const handleOpenDialogue = useCallback(
    (modalType: ModalTypes, selectedGoal?: GoalsDTO) => {
      onTitleChange(<GoalFormTitle modalType={modalType} />);
      onBodyChange(
        <GoalsForm
          modalType={modalType}
          open={goalsOpen}
          handleClose={() => handleCloseGoalsForm()}
          goals={selectedGoal}
        />
      );
      onActionsChange(
        <GoalsActions
          modalType={modalType}
          handleClose={() => handleCloseGoalsForm()}
        />
      );
      onOpenChange(true);
    },
    [
      onOpenChange,
      onBodyChange,
      onTitleChange,
      goalsOpen,
      onActionsChange,
    ]
  );
  const handleCloseGoalsForm = () => {
    setGoalsOpen(false);
    onOpenChange(false);
  };

  return (
    <>
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
          handleClick={() => handleOpenDialogue(ModalTypes.create, selectedGoal)}
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
        {goalsQuery.data?.data.map((goal: GoalsDTO) => (
          <GoalsCard
            key={goal.id}
            goal={goal}
            setGoalsOpen={setGoalsOpen}
            setSelectedGoal={setSelectedGoal}
            handleOpenDialogue={handleOpenDialogue}
          />
        ))}
      </div>
    </>
  );
};

export default Goals;
