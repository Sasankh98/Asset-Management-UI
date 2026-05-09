import { useState } from "react";
import "./login.css";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { DisplayContentEnum } from "../../../shared/Constants";
import { UserLoginDTO } from "../../../../server/types";
import { useLoginMutation } from "../../../hooks/mutations/useLoginMutation";
import { useAssetManagementContext } from "../../ContextProvider/ContextProvider";
import CustomSnackbar from "../../../components/SnackBar/Snackbar";

const Login = () => {
  const { createToken } = useLoginMutation();
  const { showSnackbar, snackBarOptions } = useAssetManagementContext();
  const [loginData, setLoginData] = useState<UserLoginDTO>({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  type HandleLoginEvent = React.ChangeEvent<HTMLInputElement>;

  const handleLogin = (e: HandleLoginEvent): void => {
    const { name, value } = e.target;
    setLoginData((prevLoginData: UserLoginDTO) => ({
      ...prevLoginData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await createToken.mutateAsync({ data: loginData });

      if (response?.status === "success") {
        sessionStorage.setItem("token", response.token);
        navigate(`${DisplayContentEnum.dashboard}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      showSnackbar("Invalid email or password. Please try again.", "error");
    }
  };

  return (
    <div className="login-wrapper" data-testid="login-wrapper">
      {snackBarOptions.open && <CustomSnackbar />}
      <div className="login-header">Asset Management Application</div>
      <input placeholder="Enter Email" onChange={handleLogin} name="email" />
      <input
        type="password"
        placeholder="Enter Password"
        onChange={handleLogin}
        name="password"
      />
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={createToken.isPending}
        className="login-btn"
      >
        {createToken.isPending ? "Logging in..." : "Login"}
      </Button>
    </div>
  );
};

export default Login;
