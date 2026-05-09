import { useCallback, useState, useRef, useEffect } from "react";
import Button from "@mui/material/Button";
import GoalsCard from "./GoalsCard/GoalsCard";
import { type GoalsDTO } from "../../../../server/types";
import GoalsForm, { type GoalsFormRef } from "./GoalsModal/GoalsModal";
import PageActionBar from "../../../components/PageActionBar/PageActionBar";
import { useGoalsQuery } from "../../../hooks/queries";
import { useDialog } from "../../ContextProvider/DialogContextProvider";
import GoalFormTitle from "./GoalsTitle";
import GoalsActions from "./GoalsActions";
import { ModalTypes } from "../../../shared/Constants";
import { useGoalsMutation } from "../../../hooks/mutations/useGoalsMutation";
import ErrorBoundary from "../../../components/ErrorBoundary/ErrorBoundary";
import { FeatureErrorFallback } from "../../../components/ErrorBoundary/FeatureErrorFallback";
import { useAssetManagementContext } from "../../ContextProvider/ContextProvider";
import CustomSnackbar from "../../../components/SnackBar/Snackbar";

const Goals = () => {
  const [goalsOpen, setGoalsOpen] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalsDTO>();
  const [modalType, setModalType] = useState<ModalTypes>(ModalTypes.create);
  const formRef = useRef<GoalsFormRef>(null);
  const modalTypeRef = useRef<ModalTypes>(ModalTypes.create);
  const selectedGoalRef = useRef<GoalsDTO>();
  const { onOpenChange, onTitleChange, onBodyChange, onActionsChange } =
    useDialog();
  const { snackBarOptions, showSnackbar } = useAssetManagementContext();
  const goalsQuery = useGoalsQuery();
  const { createGoal, updateGoal, deleteGoal } = useGoalsMutation();

  // Sync refs with state to break circular dependency
  useEffect(() => {
    modalTypeRef.current = modalType;
    selectedGoalRef.current = selectedGoal;
  }, [modalType, selectedGoal]);

  const handleCloseGoalsForm = useCallback(() => {
    setGoalsOpen(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleGoals = useCallback(async () => {
    try {
      if (!formRef.current) {
        console.error("Form ref is not available");
        return;
      }
      const goalsData = formRef.current.getFormData();

      if (modalTypeRef.current === ModalTypes.create) {
        await createGoal.mutateAsync({ data: goalsData });
        showSnackbar("Goal created successfully.", "success");
      } else if (
        modalTypeRef.current === ModalTypes.edit &&
        selectedGoalRef.current
      ) {
        await updateGoal.mutateAsync({
          id: selectedGoalRef.current.id,
          data: goalsData,
        });
        showSnackbar("Goal updated successfully.", "success");
      }
      handleCloseGoalsForm();
    } catch (error) {
      console.error("Error handling goal:", error);
    }
  }, [createGoal, updateGoal, handleCloseGoalsForm, showSnackbar]);

  const handleDeleteGoal = useCallback(
    async (id: number) => {
      try {
        await deleteGoal.mutateAsync({ id });
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    },
    [deleteGoal]
  );

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
      {snackBarOptions.open && <CustomSnackbar />}
      <div data-testid="goals-container">
        <PageActionBar>
          <Button
            variant="contained"
            onClick={() => handleOpenDialogue(ModalTypes.create, undefined)}
          >
            Add Goal
          </Button>
        </PageActionBar>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "2rem",
          justifyContent: "center",
          maxWidth: "1080px",
          width: "100%",
          margin: "1rem auto",
        }}
      >
        {goalsQuery?.data?.map((goal: GoalsDTO) => (
          <GoalsCard
            key={goal.id}
            goal={goal}
            setGoalsOpen={setGoalsOpen}
            setSelectedGoal={setSelectedGoal}
            handleOpenDialogue={handleOpenDialogue}
            handleDeleteGoal={handleDeleteGoal}
          />
        ))}
      </div>
    </ErrorBoundary>
  );
};

export default Goals;
