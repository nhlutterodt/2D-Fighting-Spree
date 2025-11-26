import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const FlowContext = createContext(null);

/**
 * FlowProvider centralizes navigation and shared data for the multi-screen UI.
 * It enables modular screens to query and mutate shared state without
 * depending on parent wiring, making the flow extensible.
 */
export const FlowProvider = ({ steps, initialData, initialStep, children }) => {
  const startingStep = initialStep || steps[0]?.id;
  const [currentId, setCurrentId] = useState(startingStep);
  const [history, setHistory] = useState(startingStep ? [startingStep] : []);
  const [data, setData] = useState(initialData);

  const goTo = useCallback((id, { replace = false, resetHistory = false } = {}) => {
    setCurrentId(id);
    setHistory((prev) => {
      if (resetHistory || prev.length === 0) return [id];
      if (replace) return [...prev.slice(0, -1), id];
      return [...prev, id];
    });
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev;
      const nextHistory = prev.slice(0, -1);
      setCurrentId(nextHistory[nextHistory.length - 1]);
      return nextHistory;
    });
  }, []);

  const goNext = useCallback(() => {
    setCurrentId((prev) => {
      const idx = steps.findIndex((step) => step.id === prev);
      const next = steps[idx + 1]?.id || prev;
      setHistory((historyState) =>
        historyState[historyState.length - 1] === next
          ? historyState
          : [...historyState, next]
      );
      return next;
    });
  }, [steps]);

  const resetTo = useCallback((id, nextData = {}) => {
    setCurrentId(id);
    setHistory([id]);
    setData((prev) => ({ ...prev, ...nextData }));
  }, []);

  const updateData = useCallback((updater) => {
    setData((prev) =>
      typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    );
  }, []);

  const value = useMemo(
    () => ({
      steps,
      currentId,
      currentStep: steps.find((step) => step.id === currentId),
      history,
      goTo,
      goBack,
      goNext,
      resetTo,
      data,
      updateData,
    }),
    [currentId, data, goBack, goNext, goTo, resetTo, steps, updateData, history]
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};

FlowProvider.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      component: PropTypes.elementType.isRequired,
    })
  ).isRequired,
  initialData: PropTypes.object.isRequired,
  initialStep: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export const useFlow = () => {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error('useFlow must be used within a FlowProvider');
  return ctx;
};

export const FlowStepRenderer = () => {
  const { currentStep, currentId } = useFlow();
  if (!currentStep) return null;
  const StepComponent = currentStep.component;
  return <StepComponent key={currentId} />;
};

export default FlowProvider;
