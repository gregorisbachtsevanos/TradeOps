interface TradingViewChartProps {
  params: URLSearchParams;
}

function TradingViewChart({ params }: TradingViewChartProps) {
  return (
    <section className="tradingview-panel embedded">
      <iframe
        title="TradingView advanced chart"
        src={`https://s.tradingview.com/widgetembed/?${params.toString()}`}
        className="tradingview-frame"
        allowFullScreen
      />
    </section>
  );
}

export default TradingViewChart;
