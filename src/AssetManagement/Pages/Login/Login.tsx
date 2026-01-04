import { useState } from "react";
import "./login.css";
import CustomButton from "../../../core/CustomButton/CustomButton";
import { useNavigate } from "react-router-dom";
import { DisplayContentEnum } from "../../../shared/Constants";
import { UserLoginDTO } from "../../../../server/types";
// import loginService from "../../../services/loginService/loginService";
import { useLoginMutation } from "../../../hooks/mutations/useLoginMutation";

const Login = () => {
  const {createToken} = useLoginMutation();
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
      const response = await createToken.mutateAsync({ data: loginData});

      if (response?.status === "success") {
        sessionStorage.setItem("token", response.token);
        navigate(`${DisplayContentEnum.dashboard}`); // Navigate to the displayContent path
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="login-wrapper" data-testid="login-wrapper">
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
