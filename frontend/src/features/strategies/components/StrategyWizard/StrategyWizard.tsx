import { useState } from "react";
import styles from "./StrategyWizard.module.css";
import {
  CONDITION_OPTIONS,
  CONFIRMATION_TYPES,
  ENTRY_RULE_TYPES,
  INSTRUMENT_OPTIONS,
  MARKET_OPTIONS,
  SESSION_OPTIONS,
  STEPS,
  STOP_LOSS_TYPES,
  TIMEFRAME_OPTIONS,
  TP_TYPES,
} from "../../helpers/constants";
import {
  IStrategy,
  IStrategyWizardProps,
  TStepId,
} from "../../types/strategies.types";

const StrategyWizard = ({
  strategy,
  onSubmit,
  onClose,
}: IStrategyWizardProps) => {
  const [currentStep, setCurrentStep] = useState<TStepId>("basic");
  const [formData, setFormData] = useState<Partial<IStrategy>>({
    name: strategy?.name || "",
    description: strategy?.description || "",
    isActive: strategy?.isActive ?? true,
    markets: strategy?.markets || [],
    instruments: strategy?.instruments || [],
    analysisTimeframe: strategy?.analysisTimeframe || "",
    entryTimeframe: strategy?.entryTimeframe || "",
    conditions: strategy?.conditions || [],
    sessions: strategy?.sessions || [],
    entryRules: strategy?.entryRules || [],
    confirmations: strategy?.confirmations || [],
    riskPercent: strategy?.riskPercent ?? 2,
    maxDailyLoss: strategy?.maxDailyLoss,
    maxDrawdown: strategy?.maxDrawdown,
    maxOpenTrades: strategy?.maxOpenTrades,
    maxDailyTrades: strategy?.maxDailyTrades,
    stopLoss: strategy?.stopLoss || undefined,
    tpTargets: strategy?.tpTargets || [],
    tradeManagement: strategy?.tradeManagement || undefined,
    exitRules: strategy?.exitRules || [],
    newsRules: strategy?.newsRules || undefined,
    checklist: strategy?.checklist || [],
    backtestingMetrics: strategy?.backtestingMetrics || undefined,
    notes: strategy?.notes || "",
  });

  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const isLastStep = currentStep === STEPS[STEPS.length - 1].id;
  const isFirstStep = currentStep === STEPS[0].id;

  const nextStep = () => {
    if (!isLastStep) {
      setCurrentStep(STEPS[stepIndex + 1].id);
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[stepIndex - 1].id);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const updateField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = <T extends string>(
    field: keyof Pick<
      typeof formData,
      "markets" | "instruments" | "conditions" | "sessions"
    >,
    item: T,
  ) => {
    const current = (formData[field] as T[]) || [];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    updateField(field, updated);
  };

  const addEntryRule = () => {
    const newRule = {
      type: "price_action" as const,
      name: "",
      required: false,
    };
    updateField("entryRules", [...(formData.entryRules || []), newRule]);
  };

  const updateEntryRule = (index: number, field: string, value: any) => {
    const rules = [...(formData.entryRules || [])];
    rules[index] = { ...rules[index], [field]: value };
    updateField("entryRules", rules);
  };

  const removeEntryRule = (index: number) => {
    const rules = [...(formData.entryRules || [])];
    rules.splice(index, 1);
    updateField("entryRules", rules);
  };

  const addConfirmation = () => {
    const newConf = { type: "indicator" as const, name: "", required: false };
    updateField("confirmations", [...(formData.confirmations || []), newConf]);
  };

  const updateConfirmation = (index: number, field: string, value: any) => {
    const confs = [...(formData.confirmations || [])];
    confs[index] = { ...confs[index], [field]: value };
    updateField("confirmations", confs);
  };

  const removeConfirmation = (index: number) => {
    const confs = [...(formData.confirmations || [])];
    confs.splice(index, 1);
    updateField("confirmations", confs);
  };

  const addTpTarget = () => {
    const newTp = {
      type: "risk_reward" as const,
      riskReward: 2,
      description: "",
    };
    updateField("tpTargets", [...(formData.tpTargets || []), newTp]);
  };

  const updateTpTarget = (index: number, field: string, value: any) => {
    const tps = [...(formData.tpTargets || [])];
    tps[index] = { ...tps[index], [field]: value };
    updateField("tpTargets", tps);
  };

  const removeTpTarget = (index: number) => {
    const tps = [...(formData.tpTargets || [])];
    tps.splice(index, 1);
    updateField("tpTargets", tps);
  };

  const addChecklistItem = () => {
    const newItem = { name: "", required: false };
    updateField("checklist", [...(formData.checklist || []), newItem]);
  };

  const updateChecklistItem = (index: number, field: string, value: any) => {
    const items = [...(formData.checklist || [])];
    items[index] = { ...items[index], [field]: value };
    updateField("checklist", items);
  };

  const removeChecklistItem = (index: number) => {
    const items = [...(formData.checklist || [])];
    items.splice(index, 1);
    updateField("checklist", items);
  };

  const addExitRule = () => {
    const newRule = { type: "time_based" as const, name: "" };
    updateField("exitRules", [...(formData.exitRules || []), newRule]);
  };

  const updateExitRule = (index: number, field: string, value: any) => {
    const rules = [...(formData.exitRules || [])];
    rules[index] = { ...rules[index], [field]: value };
    updateField("exitRules", rules);
  };

  const removeExitRule = (index: number) => {
    const rules = [...(formData.exitRules || [])];
    rules.splice(index, 1);
    updateField("exitRules", rules);
  };

  return (
    <div className={styles["wizard-overlay"]} onClick={onClose}>
      <div className={styles["wizard-modal"]} onClick={(e) => e.stopPropagation()}>
        <div className={styles["wizard-header"]}>
          <h3>{strategy ? "Edit Strategy" : "Create Strategy"}</h3>
          <button className={styles["btn-close"]} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles["wizard-steps"]}>
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              className={`${styles["wizard-step"]} ${i <= stepIndex ? styles.completed : ""} ${step.id === currentStep ? styles.active : ""}`}
              onClick={() => setCurrentStep(step.id)}
            >
              <span className={styles["step-number"]}>{i + 1}</span>
              <span className={styles["step-label"]}>{step.label}</span>
            </div>
          ))}
        </div>

        <div className={styles["wizard-body"]}>
          {currentStep === "basic" && (
            <div className={styles["form-section"]}>
              <div className={styles["form-group"]}>
                <label>Strategy Name *</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. ICT Silver Bullet"
                  required
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe your strategy approach..."
                  rows={3}
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Notes</label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Additional notes, reminders..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === "markets" && (
            <div className={styles["form-section"]}>
              <div className={styles["form-group"]}>
                <label>Markets *</label>
                <div className={styles["chip-group"]}>
                  {MARKET_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`${styles.chip} ${(formData.markets || []).includes(m) ? styles.active : ""}`}
                      onClick={() => toggleArrayItem("markets", m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles["form-group"]}>
                <label>Instruments</label>
                <div className={styles["chip-group"]}>
                  {INSTRUMENT_OPTIONS.map((inst) => (
                    <button
                      key={inst}
                      type="button"
                      className={`${styles.chip} ${(formData.instruments || []).includes(inst) ? styles.active : ""}`}
                      onClick={() => toggleArrayItem("instruments", inst)}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label>Analysis Timeframe</label>
                  <select
                    value={formData.analysisTimeframe || ""}
                    onChange={(e) =>
                      updateField(
                        "analysisTimeframe",
                        e.target.value || undefined,
                      )
                    }
                  >
                    <option value="">Select...</option>
                    {TIMEFRAME_OPTIONS.map((tf) => (
                      <option key={tf} value={tf}>
                        {tf}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles["form-group"]}>
                  <label>Entry Timeframe</label>
                  <select
                    value={formData.entryTimeframe || ""}
                    onChange={(e) =>
                      updateField("entryTimeframe", e.target.value || undefined)
                    }
                  >
                    <option value="">Select...</option>
                    {TIMEFRAME_OPTIONS.map((tf) => (
                      <option key={tf} value={tf}>
                        {tf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles["form-group"]}>
                <label>Market Conditions</label>
                <div className={styles["chip-group"]}>
                  {CONDITION_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.chip} ${(formData.conditions || []).includes(c) ? styles.active : ""}`}
                      onClick={() => toggleArrayItem("conditions", c)}
                    >
                      {c.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles["form-group"]}>
                <label>Trading Sessions</label>
                <div className={styles["chip-group"]}>
                  {SESSION_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`${styles.chip} ${(formData.sessions || []).includes(s) ? styles.active : ""}`}
                      onClick={() => toggleArrayItem("sessions", s)}
                    >
                      {s.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === "entry" && (
            <div className={styles["form-section"]}>
              <div className={styles["section-header"]}>
                <h4>Entry Rules</h4>
                <button
                  type="button"
                  className={styles["btn-add"]}
                  onClick={addEntryRule}
                >
                  + Add Rule
                </button>
              </div>
              {(formData.entryRules || []).map((rule, i) => (
                <div key={i} className={styles["rule-editor"]}>
                  <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                      <label>Type</label>
                      <select
                        value={rule.type}
                        onChange={(e) =>
                          updateEntryRule(i, "type", e.target.value)
                        }
                      >
                        {ENTRY_RULE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles["form-group"]}>
                      <label>Name</label>
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) =>
                          updateEntryRule(i, "name", e.target.value)
                        }
                        placeholder="Rule name"
                      />
                    </div>
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Description</label>
                    <input
                      type="text"
                      value={rule.description || ""}
                      onChange={(e) =>
                        updateEntryRule(i, "description", e.target.value)
                      }
                      placeholder="Describe the entry condition..."
                    />
                  </div>
                  <div className={styles["form-row"]}>
                    <label className={styles["checkbox-label"]}>
                      <input
                        type="checkbox"
                        checked={rule.required || false}
                        onChange={(e) =>
                          updateEntryRule(i, "required", e.target.checked)
                        }
                      />
                      Required
                    </label>
                    <button
                      type="button"
                      className={styles["btn-remove"]}
                      onClick={() => removeEntryRule(i)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className={styles["section-header"]}>
                <h4>Confirmations</h4>
                <button
                  type="button"
                  className={styles["btn-add"]}
                  onClick={addConfirmation}
                >
                  + Add Confirmation
                </button>
              </div>
              {(formData.confirmations || []).map((conf, i) => (
                <div key={i} className={styles["rule-editor"]}>
                  <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                      <label>Type</label>
                      <select
                        value={conf.type}
                        onChange={(e) =>
                          updateConfirmation(i, "type", e.target.value)
                        }
                      >
                        {CONFIRMATION_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles["form-group"]}>
                      <label>Name</label>
                      <input
                        type="text"
                        value={conf.name}
                        onChange={(e) =>
                          updateConfirmation(i, "name", e.target.value)
                        }
                        placeholder="Confirmation name"
                      />
                    </div>
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Description</label>
                    <input
                      type="text"
                      value={conf.description || ""}
                      onChange={(e) =>
                        updateConfirmation(i, "description", e.target.value)
                      }
                      placeholder="Describe the confirmation..."
                    />
                  </div>
                  <div className={styles["form-row"]}>
                    <label className={styles["checkbox-label"]}>
                      <input
                        type="checkbox"
                        checked={conf.required || false}
                        onChange={(e) =>
                          updateConfirmation(i, "required", e.target.checked)
                        }
                      />
                      Required
                    </label>
                    <button
                      type="button"
                      className={styles["btn-remove"]}
                      onClick={() => removeConfirmation(i)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStep === "risk" && (
            <div className={styles["form-section"]}>
              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label>Risk % per Trade</label>
                  <input
                    type="number"
                    value={formData.riskPercent ?? 2}
                    onChange={(e) =>
                      updateField(
                        "riskPercent",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    min={0.1}
                    max={100}
                    step={0.1}
                  />
                </div>
                <div className={styles["form-group"]}>
                  <label>Max Daily Loss %</label>
                  <input
                    type="number"
                    value={formData.maxDailyLoss || ""}
                    onChange={(e) =>
                      updateField(
                        "maxDailyLoss",
                        e.target.value ? parseFloat(e.target.value) : undefined,
                      )
                    }
                    min={0.1}
                    max={100}
                    step={0.1}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label>Max Drawdown %</label>
                  <input
                    type="number"
                    value={formData.maxDrawdown || ""}
                    onChange={(e) =>
                      updateField(
                        "maxDrawdown",
                        e.target.value ? parseFloat(e.target.value) : undefined,
                      )
                    }
                    min={0.1}
                    max={100}
                    step={0.1}
                    placeholder="Optional"
                  />
                </div>
                <div className={styles["form-group"]}>
                  <label>Max Open Trades</label>
                  <input
                    type="number"
                    value={formData.maxOpenTrades || ""}
                    onChange={(e) =>
                      updateField(
                        "maxOpenTrades",
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                    min={1}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className={styles["form-group"]}>
                <label>Max Daily Trades</label>
                <input
                  type="number"
                  value={formData.maxDailyTrades || ""}
                  onChange={(e) =>
                    updateField(
                      "maxDailyTrades",
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  min={1}
                  placeholder="Optional"
                />
              </div>

              <div className={styles["section-header"]}>
                <h4>Stop Loss</h4>
              </div>
              <div className={styles["rule-editor"]}>
                <div className={styles["form-row"]}>
                  <div className={styles["form-group"]}>
                    <label>Type</label>
                    <select
                      value={formData.stopLoss?.type || "atr"}
                      onChange={(e) =>
                        updateField(
                          "stopLoss",
                          {
                            ...formData.stopLoss,
                            type: e.target.value as any,
                          } || { type: e.target.value as any },
                        )
                      }
                    >
                      {STOP_LOSS_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.stopLoss?.type === "atr" && (
                    <div className={styles["form-group"]}>
                      <label>ATR Multiplier</label>
                      <input
                        type="number"
                        value={formData.stopLoss?.atrMultiplier || ""}
                        onChange={(e) =>
                          updateField("stopLoss", {
                            ...formData.stopLoss,
                            atrMultiplier:
                              parseFloat(e.target.value) || undefined,
                          })
                        }
                        min={0.1}
                        step={0.1}
                        placeholder="e.g. 1.5"
                      />
                    </div>
                  )}
                  {formData.stopLoss?.type === "percentage" && (
                    <div className={styles["form-group"]}>
                      <label>Percentage %</label>
                      <input
                        type="number"
                        value={formData.stopLoss?.percentage || ""}
                        onChange={(e) =>
                          updateField("stopLoss", {
                            ...formData.stopLoss,
                            percentage: parseFloat(e.target.value) || undefined,
                          })
                        }
                        min={0.1}
                        step={0.1}
                        placeholder="e.g. 1"
                      />
                    </div>
                  )}
                  {formData.stopLoss?.type === "fixed_pips" && (
                    <div className={styles["form-group"]}>
                      <label>Fixed Pips</label>
                      <input
                        type="number"
                        value={formData.stopLoss?.fixedPips || ""}
                        onChange={(e) =>
                          updateField("stopLoss", {
                            ...formData.stopLoss,
                            fixedPips: parseInt(e.target.value) || undefined,
                          })
                        }
                        min={1}
                        placeholder="e.g. 10"
                      />
                    </div>
                  )}
                </div>
                <div className={styles["form-group"]}>
                  <label>Description</label>
                  <input
                    type="text"
                    value={formData.stopLoss?.description || ""}
                    onChange={(e) =>
                      updateField("stopLoss", {
                        ...formData.stopLoss,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe stop loss placement..."
                  />
                </div>
              </div>

              <div className={styles["section-header"]}>
                <h4>Take Profit Targets</h4>
                <button type="button" className={styles["btn-add"]} onClick={addTpTarget}>
                  + Add Target
                </button>
              </div>
              {(formData.tpTargets || []).map((tp, i) => (
                <div key={i} className={styles["rule-editor"]}>
                  <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                      <label>Type</label>
                      <select
                        value={tp.type}
                        onChange={(e) =>
                          updateTpTarget(i, "type", e.target.value)
                        }
                      >
                        {TP_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    {tp.type === "risk_reward" && (
                      <div className={styles["form-group"]}>
                        <label>R:R Ratio</label>
                        <input
                          type="number"
                          value={tp.riskReward || 2}
                          onChange={(e) =>
                            updateTpTarget(
                              i,
                              "riskReward",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          min={1}
                          step={0.1}
                        />
                      </div>
                    )}
                    {tp.type === "fixed_pips" && (
                      <div className={styles["form-group"]}>
                        <label>Fixed Pips</label>
                        <input
                          type="number"
                          value={tp.fixedPips || ""}
                          onChange={(e) =>
                            updateTpTarget(
                              i,
                              "fixedPips",
                              parseInt(e.target.value) || undefined,
                            )
                          }
                          min={1}
                        />
                      </div>
                    )}
                    <div className={styles["form-group"]}>
                      <label>Partial %</label>
                      <input
                        type="number"
                        value={tp.partialPercent || ""}
                        onChange={(e) =>
                          updateTpTarget(
                            i,
                            "partialPercent",
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          )
                        }
                        min={0}
                        max={100}
                        placeholder="0 = full"
                      />
                    </div>
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Description</label>
                    <input
                      type="text"
                      value={tp.description || ""}
                      onChange={(e) =>
                        updateTpTarget(i, "description", e.target.value)
                      }
                      placeholder="Describe this target..."
                    />
                  </div>
                  <button
                    type="button"
                    className={styles["btn-remove"]}
                    onClick={() => removeTpTarget(i)}
                  >
                    Remove Target
                  </button>
                </div>
              ))}

              <div className={styles["section-header"]}>
                <h4>Trade Management</h4>
              </div>
              <div className={styles["rule-editor"]}>
                <div className={styles["form-row"]}>
                  <div className={styles["form-group"]}>
                    <label>Breakeven Trigger (pips)</label>
                    <input
                      type="number"
                      value={formData.tradeManagement?.breakevenTrigger || ""}
                      onChange={(e) =>
                        updateField(
                          "tradeManagement",
                          {
                            ...formData.tradeManagement,
                            breakevenTrigger: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          } || {},
                        )
                      }
                      min={1}
                      placeholder="Optional"
                    />
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Max Hold Time (hours)</label>
                    <input
                      type="number"
                      value={formData.tradeManagement?.maxHoldTime || ""}
                      onChange={(e) =>
                        updateField(
                          "tradeManagement",
                          {
                            ...formData.tradeManagement,
                            maxHoldTime: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          } || {},
                        )
                      }
                      min={1}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <label className={styles["checkbox-label"]}>
                  <input
                    type="checkbox"
                    checked={formData.tradeManagement?.trailingStop || false}
                    onChange={(e) =>
                      updateField(
                        "tradeManagement",
                        {
                          ...formData.tradeManagement,
                          trailingStop: e.target.checked,
                        } || { trailingStop: e.target.checked },
                      )
                    }
                  />
                  Enable Trailing Stop
                </label>
                {formData.tradeManagement?.trailingStop && (
                  <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                      <label>Trailing Stop Pips</label>
                      <input
                        type="number"
                        value={formData.tradeManagement?.trailingStopPips || ""}
                        onChange={(e) =>
                          updateField("tradeManagement", {
                            ...formData.tradeManagement,
                            trailingStopPips:
                              parseInt(e.target.value) || undefined,
                          })
                        }
                        min={1}
                      />
                    </div>
                    <div className={styles["form-group"]}>
                      <label>Activate After Pips</label>
                      <input
                        type="number"
                        value={formData.tradeManagement?.trailingStopAt || ""}
                        onChange={(e) =>
                          updateField("tradeManagement", {
                            ...formData.tradeManagement,
                            trailingStopAt:
                              parseInt(e.target.value) || undefined,
                          })
                        }
                        min={1}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className={styles["section-header"]}>
                <h4>News Rules</h4>
              </div>
              <div className={styles["rule-editor"]}>
                <label className={styles["checkbox-label"]}>
                  <input
                    type="checkbox"
                    checked={formData.newsRules?.avoidHighImpact ?? true}
                    onChange={(e) =>
                      updateField(
                        "newsRules",
                        {
                          ...formData.newsRules,
                          avoidHighImpact: e.target.checked,
                        } || { avoidHighImpact: e.target.checked },
                      )
                    }
                  />
                  Avoid High-Impact News
                </label>
                <div className={styles["form-row"]}>
                  <div className={styles["form-group"]}>
                    <label>No Trades Before News (min)</label>
                    <input
                      type="number"
                      value={formData.newsRules?.minutesBefore ?? 30}
                      onChange={(e) =>
                        updateField(
                          "newsRules",
                          {
                            ...formData.newsRules,
                            minutesBefore: parseInt(e.target.value) || 30,
                          } || {
                            minutesBefore: parseInt(e.target.value) || 30,
                          },
                        )
                      }
                      min={0}
                    />
                  </div>
                  <div className={styles["form-group"]}>
                    <label>No Trades After News (min)</label>
                    <input
                      type="number"
                      value={formData.newsRules?.minutesAfter ?? 30}
                      onChange={(e) =>
                        updateField(
                          "newsRules",
                          {
                            ...formData.newsRules,
                            minutesAfter: parseInt(e.target.value) || 30,
                          } || { minutesAfter: parseInt(e.target.value) || 30 },
                        )
                      }
                      min={0}
                    />
                  </div>
                </div>
                <label className={styles["checkbox-label"]}>
                  <input
                    type="checkbox"
                    checked={formData.newsRules?.closeBeforeNews || false}
                    onChange={(e) =>
                      updateField(
                        "newsRules",
                        {
                          ...formData.newsRules,
                          closeBeforeNews: e.target.checked,
                        } || { closeBeforeNews: e.target.checked },
                      )
                    }
                  />
                  Close Positions Before News
                </label>
              </div>
            </div>
          )}

          {currentStep === "exit" && (
            <div className={styles["form-section"]}>
              <div className={styles["section-header"]}>
                <h4>Exit Rules</h4>
                <button type="button" className={styles["btn-add"]} onClick={addExitRule}>
                  + Add Rule
                </button>
              </div>
              {(formData.exitRules || []).map((rule, i) => (
                <div key={i} className={styles["rule-editor"]}>
                  <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                      <label>Type</label>
                      <select
                        value={rule.type}
                        onChange={(e) =>
                          updateExitRule(i, "type", e.target.value)
                        }
                      >
                        {[
                          "time_based",
                          "condition_based",
                          "pattern",
                          "indicator",
                          "custom",
                        ].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles["form-group"]}>
                      <label>Name</label>
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) =>
                          updateExitRule(i, "name", e.target.value)
                        }
                        placeholder="Exit rule name"
                      />
                    </div>
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Description</label>
                    <input
                      type="text"
                      value={rule.description || ""}
                      onChange={(e) =>
                        updateExitRule(i, "description", e.target.value)
                      }
                      placeholder="Describe the exit condition..."
                    />
                  </div>
                  <button
                    type="button"
                    className={styles["btn-remove"]}
                    onClick={() => removeExitRule(i)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {currentStep === "checklist" && (
            <div className={styles["form-section"]}>
              <div className={styles["section-header"]}>
                <h4>Pre-Trade Checklist</h4>
                <button
                  type="button"
                  className={styles["btn-add"]}
                  onClick={addChecklistItem}
                >
                  + Add Item
                </button>
              </div>
              {(formData.checklist || []).map((item, i) => (
                <div key={i} className={styles["rule-editor"]}>
                  <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                      <label>Item Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateChecklistItem(i, "name", e.target.value)
                        }
                        placeholder="Checklist item"
                      />
                    </div>
                    <label className={styles["checkbox-label"]}>
                      <input
                        type="checkbox"
                        checked={item.required || false}
                        onChange={(e) =>
                          updateChecklistItem(i, "required", e.target.checked)
                        }
                      />
                      Required
                    </label>
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Description</label>
                    <input
                      type="text"
                      value={item.description || ""}
                      onChange={(e) =>
                        updateChecklistItem(i, "description", e.target.value)
                      }
                      placeholder="Describe what to check..."
                    />
                  </div>
                  <button
                    type="button"
                    className={styles["btn-remove"]}
                    onClick={() => removeChecklistItem(i)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles["wizard-footer"]}>
          <button className={styles["btn-secondary"]} onClick={onClose}>
            Cancel
          </button>
          {!isFirstStep && (
            <button className={styles["btn-secondary"]} onClick={prevStep}>
              Previous
            </button>
          )}
          {!isLastStep && (
            <button className={styles["btn-primary"]} onClick={nextStep}>
              Next
            </button>
          )}
          {isLastStep && (
            <button className={styles["btn-primary"]} onClick={handleSubmit}>
              {strategy ? "Update Strategy" : "Create Strategy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyWizard;
