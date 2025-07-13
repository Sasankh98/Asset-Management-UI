import "./customButton.css";

type CustomButtonProps = {
  text: string,
  customClass: string,
  handleClick?: ()=>void,
  // type:string,
  // ifTrue : boolean,
  // title:string
};

const CustomButton = ({
  text,
  customClass,
  handleClick,
  // type,
  // ifTrue,
  // title,
}: CustomButtonProps) => {
  return (
    <div>
      <button
        className={"common-btn " + customClass}
        onClick={handleClick}
        // disabled={ifTrue ? true : false}
      >
        {text}{" "}
      </button>
    </div>
  );
};

export default CustomButton;
