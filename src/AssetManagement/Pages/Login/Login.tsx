import { useState } from "react";
import "./login.css";
import CustomButton from "../../../core/CustomButton/CustomButton";
import { callAPI } from "../../../services/apiServices";
import { useNavigate } from "react-router-dom";
import { ConfigMethod, ConfigUrl } from "../../../config/ConfigAPI";
import { DisplayContentEnum } from "../../../shared/Constants";
// import { useAssetManagementContext } from "../../ContextProvider/ContextProvider";

const Login = () => {
  type LoginDataProps = {
    email: string;
    password: string;
  };

  const [loginData, setLoginData] = useState<LoginDataProps>({
    email: "",
    password: "",
  });
  // const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  type HandleLoginEvent = React.ChangeEvent<HTMLInputElement>;

  // interface HandleLoginEvent extends React.ChangeEvent<HTMLInputElement> {}
  // const { displayContent } = useAssetManagementContext();
  const handleLogin = (e: HandleLoginEvent): void => {
    const { name, value } = e.target;
    setLoginData((prevLoginData: LoginDataProps) => ({
      ...prevLoginData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await callAPI(
        ConfigUrl.login,
        ConfigMethod.postMethod,
        loginData
      );

      if (response.status === "success") {
        sessionStorage.setItem("token", response.token);
        navigate(`/${DisplayContentEnum.dashboard}`); // Navigate to the displayContent path
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="login-wrapper">
      <div className="login-header">Asset Management Application</div>
      <input placeholder="Enter Email" onChange={handleLogin} name="email" />
      <input
        type="password"
        placeholder="Enter Password"
        onChange={handleLogin}
        name="password"
      />
      <CustomButton
        text={"Login"}
        customClass={"login-btn"}
        handleClick={handleSubmit}
      />
    </div>
  );
};

export default Login;
