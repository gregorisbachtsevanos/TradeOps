import ChartWorkspace from "../components/ChartWorkspace";
import Equity from "../components/Equity/Equity";
import RiskPanel from "../components/RiskPanel/RiskPanel";
import { IOverviewProps } from "../types/overview.types";
import styles from "../../Dashboard/view/Dashboard.module.scss";

const Overview = ({ theme, selectedAccountId }: IOverviewProps) => {
  return (
    <>
      <ChartWorkspace accountId={selectedAccountId} theme={theme} />
      <div className={styles["overview-grid"]}>
        <Equity accountId={selectedAccountId} />
        <RiskPanel accountId={selectedAccountId} />
      </div>
    </>
  );
};

export default Overview;
