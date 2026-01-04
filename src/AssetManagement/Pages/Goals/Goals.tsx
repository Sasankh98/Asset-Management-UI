import { useCallback, useState, useRef, useEffect } from "react";
import GoalsCard from "./GoalsCard/GoalsCard";
import { type GoalsDTO } from "../../../../server/types";
import CustomButton from "../../../core/CustomButton/CustomButton";
import GoalsForm, { type GoalsFormRef } from "./GoalsModal/GoalsModal";
import { useGoalsQuery } from "../../../hooks/queries";
import { useDialog } from "../../ContextProvider/DialogContextProvider";
import GoalFormTitle from "./GoalsTitle";
import GoalsActions from "./GoalsActions";
import { ModalTypes } from "../../../shared/Constants";
import { useGoalsMutation } from "../../../hooks/mutations/useGoalsMutation";
import ErrorBoundary from "../../../components/ErrorBoundary/ErrorBoundary";
import { FeatureErrorFallback } from "../../../components/ErrorBoundary/FeatureErrorFallback";

const Goals = () => {
  const [goalsOpen, setGoalsOpen] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalsDTO>();
  const [modalType, setModalType] = useState<ModalTypes>(ModalTypes.create);
  const formRef = useRef<GoalsFormRef>(null);
  const modalTypeRef = useRef<ModalTypes>(ModalTypes.create);
  const selectedGoalRef = useRef<GoalsDTO>();
  const { onOpenChange, onTitleChange, onBodyChange, onActionsChange } =
    useDialog();
  const goalsQuery = useGoalsQuery();
  const { createGoal, updateGoal } = useGoalsMutation();

  // Sync refs with state to break circular dependency
  useEffect(() => {
    modalTypeRef.current = modalType;
    selectedGoalRef.current = selectedGoal;
  }, [modalType, selectedGoal]);

  const handleCloseGoalsForm = useCallback(() => {
    setGoalsOpen(false);
    onOpenChange(false);
  }, [onOpenChange]);
console.log({goalsQuery})
  const handleGoals = useCallback(async () => {
    try {
      if (!formRef.current) {
        console.error("Form ref is not available");
        return;
      }

      const goalsData = formRef.current.getFormData();
      console.log("Form data:", goalsData);

      // Use refs instead of state to avoid circular dependencies
      if (modalTypeRef.current === ModalTypes.create) {
        await createGoal.mutateAsync({ data: goalsData });
      } else if (
        modalTypeRef.current === ModalTypes.edit &&
        selectedGoalRef.current
      ) {
        await updateGoal.mutateAsync({
          id: selectedGoalRef.current.id,
          data: goalsData,
        });
      }
      handleCloseGoalsForm();
    } catch (error) {
      console.error("Error handling goal:", error);
    }
  }, [createGoal, updateGoal, handleCloseGoalsForm]);

  const handleOpenDialogue = useCallback(
    (newModalType: ModalTypes, newSelectedGoal?: GoalsDTO) => {
      setModalType(newModalType);
      setSelectedGoal(newSelectedGoal);

      onTitleChange(<GoalFormTitle modalType={newModalType} />);
      onBodyChange(
        <GoalsForm
          ref={formRef}
          modalType={newModalType}
          open={goalsOpen}
          handleClose={handleCloseGoalsForm}
          goals={newSelectedGoal}
        />
      );
      onActionsChange(
        <GoalsActions
          modalType={newModalType}
          handleClose={handleCloseGoalsForm}
          handleGoals={handleGoals}
          isLoading={
            newModalType === ModalTypes.create
              ? createGoal.isPending
              : updateGoal.isPending
          }
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
      createGoal.isPending,
      updateGoal.isPending,
      handleCloseGoalsForm,
      handleGoals,
    ]
  );

  return (
    <ErrorBoundary
      level="feature"
      fallback={
        <FeatureErrorFallback
          featureName="Goals"
          error={null}
          onReset={() => window.location.reload()}
        />
      }
    >
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
          handleClick={() =>
            handleOpenDialogue(ModalTypes.create, selectedGoal)
          }
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
        {goalsQuery?.data?.map((goal: GoalsDTO) => (
          <GoalsCard
            key={goal.id}
            goal={goal}
            setGoalsOpen={setGoalsOpen}
            setSelectedGoal={setSelectedGoal}
            handleOpenDialogue={handleOpenDialogue}
          />
        ))}
      </div>
    </ErrorBoundary>
  );
};

export default Goals;
