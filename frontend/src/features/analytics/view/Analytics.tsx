import { ErrorGuard } from '@/features/Guard/Guard.js';
import { useMemo, useState } from 'react';
import Metrics from '../components/Metrics/Metrics.js';
import PnlChart from '../components/PnlChart/PnlChart.js';
import PnlHeader from '../components/PnlHeader/PnlHeader.js';
import PnlSummary from '../components/PnlSummary/PnlSummary.js';
import Skeleton from '../components/Skeleton/Skeleton.js';
import { pnlRanges } from '../helpers/contants.js';
import { buildPnlSeries } from '../helpers/utils.js';
import { useAccountMetrics, useDailyPnL } from '../hooks/useAnalytics.js';
import { IAnalyticsProps } from '../types/analytics.types.js';
import styles from './Analytics.module.scss';

const Analytics = ({ accountId }: IAnalyticsProps) => {
  const [selectedRange, setSelectedRange] = useState<
    (typeof pnlRanges)[number]
  >(pnlRanges[2]);
  const { data: metrics, isLoading: metricsLoading } =
    useAccountMetrics(accountId);
  const { data: dailyPnLData, isLoading: pnlLoading } = useDailyPnL(
    accountId,
    selectedRange.days,
  );

  const handleRangeChange = (range: (typeof pnlRanges)[number]) =>
    setSelectedRange(range);

  const dailyPnL = useMemo(
    () =>
      dailyPnLData ? buildPnlSeries(dailyPnLData, selectedRange.days) : [],
    [dailyPnLData, selectedRange.days],
  );

  const pnlStats = useMemo(() => {
    const total = dailyPnL.reduce((sum, day) => sum + day.pnl, 0);

    return {
      total,
      positiveDays: dailyPnL.filter((d) => d.pnl > 0).length,
      negativeDays: dailyPnL.filter((d) => d.pnl < 0).length,
      bestDay: dailyPnL.reduce(
        (best, day) => (day.pnl > best.pnl ? day : best),
        dailyPnL[0],
      ),
      worstDay: dailyPnL.reduce(
        (worst, day) => (day.pnl < worst.pnl ? day : worst),
        dailyPnL[0],
      ),
      maxPnL: Math.max(...dailyPnL.map((d) => Math.abs(d.pnl)), 1),
    };
  }, [dailyPnL]);

  const chartData = useMemo(
    () =>
      dailyPnL.map((day) => ({
        ...day,
        label: new Date(day.date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
      })),
    [dailyPnL],
  );

  if (true) return <Skeleton />;
  if (metricsLoading || pnlLoading) return <Skeleton />;

  if (!metrics || !dailyPnLData)
    return (
      <ErrorGuard text="Failed to load analytics data. Please try again later." />
    );

  return (
    <div className={styles['strategy-performance']}>
      <Metrics metrics={metrics} />
      <div className={styles['pnl-history']}>
        <PnlHeader
          selectedRange={selectedRange}
          pnlStats={pnlStats}
          handleRangeChange={handleRangeChange}
        />
        <PnlSummary pnlStats={pnlStats} />
        <PnlChart chartData={chartData} pnlStats={pnlStats} />
      </div>
    </div>
  );
};

export default Analytics;
