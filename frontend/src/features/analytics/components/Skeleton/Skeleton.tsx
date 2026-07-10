import styles from './Skeleton.module.scss';

const Skeleton = () => {
  return (
    <div className={styles.analytics}>
      {/* Metrics */}
      <div className={styles.container__grid_repeat}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.card__md}>
            <div className={styles.title} />
            <div className={styles.text} />
          </div>
        ))}
      </div>

      <div className={styles.card__xl}>
        {/* Header */}
        <div className={styles.container}>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div className={styles.title} />
            <div className={styles.text__lg} />
            <div className={styles.title__lg} />
          </div>
          <div className={styles.container}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.button} />
            ))}
          </div>
          <div className={styles.card__md}>
            <div className={styles.title} />
            <div className={styles.text__md} />
          </div>
        </div>

        {/* Summary */}
        <div className={styles.container__grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.title} />
              <div className={styles.text__md} />
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className={styles.card__lg}>
          <div className={styles.zeroLine} />

          <div className={styles.bars}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
