import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import CustomButton from "../../../core/CustomButton/CustomButton";
import MutualFundCard from "./Components/MutualFundCards";
import { cardDetails } from "./cardDetails";
import CenterTabs from "./Components/MutualFundTabs";
import MutualFundTable from "./Components/MutualFundTable";
import { MutualFund } from "../../../../server/types";
import MutualFundsService from "../../../services/MutualFunds/MutualFundsService";
import "./MutualFunds.css";

const MutualFunds = () => {
  const [value, setValue] = useState(0);
  const [mutualFundDetails, setMutualFundDetails] = useState<MutualFund[]>([]);
  useEffect(() => {
    MutualFundsService()
      .getMutualFundsDetails()
      .then((res) => {
        if (res && res.data) {
          setMutualFundDetails(res.data);
        }
      });
  }, []);

  return (
    <div className="MutualFundsWrapper" data-testid="mutual-funds-wrapper">
      <div className="MutualFundsHeader">
        <div>
          <Typography variant="h4" className="mutualFundsTitle">
            Mutual Fund Portfolio Dashboard
          </Typography>
          <Typography variant="body1" className="mutualFundsSubTitle">
            Track and manage your mutual fund investments with ease.
          </Typography>
        </div>
        <div className="MutualFundsButton">
          <CustomButton
            //   handleClick={() => handleOpenGoalsCreate()}
            text="+ Add Fund"
            customClass=""
          />
        </div>
      </div>
      <div className="MutualFundsCardsWrapper">
        {cardDetails.map((card) => (
          <MutualFundCard
            key={card.header}
            header={card.header}
            value={card.value}
            content={card.content}
            icon={card.icon}
          />
        ))}
      </div>
      <div>
        <CenterTabs setValue={setValue} value={value} />
      </div>
      {value === 0 && (
        <div className="MutualFundsTableWrapper">
          <Typography variant="h6">My Mutual Funds</Typography>
          <MutualFundTable mutualFundDetails={mutualFundDetails} />
        </div>
      )}
    </div>
  );
};

export default MutualFunds;
