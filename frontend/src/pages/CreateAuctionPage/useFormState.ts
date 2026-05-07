// useFormState.ts — form reducer, types, setField helper, and isValid for CreateAuctionPage
import { useReducer, useMemo, useCallback } from 'react';
import type { AuctionCategory, AuctionDuration, ConditionGrade } from '../../types/auction';

export type FormState = {
  title: string;
  description: string;
  category: AuctionCategory;
  provenance: string;
  reservePrice: number | '';
  startingBid: number | '';
  duration: AuctionDuration;
  startDate: string;
  conditionGrade: ConditionGrade;
  location: string;
};

type Action = { type: 'SET_FIELD'; field: keyof FormState; value: FormState[keyof FormState] };

const INITIAL: FormState = {
  title: '',
  description: '',
  category: 'Timepieces',
  provenance: '',
  reservePrice: '',
  startingBid: '',
  duration: '7 Days',
  startDate: '',
  conditionGrade: 'Excellent',
  location: '',
};

function reducer(state: FormState, action: Action): FormState {
  return { ...state, [action.field]: action.value };
}

export function useFormState() {
  const [form, dispatch] = useReducer(reducer, INITIAL);

  const setField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) =>
      dispatch({ type: 'SET_FIELD', field, value }),
    [],
  );

  const isValid = useMemo(
    () =>
      form.title.trim() !== '' &&
      form.description.trim() !== '' &&
      form.startingBid !== '' &&
      Number(form.startingBid) > 0 &&
      form.startDate !== '',
    [form.title, form.description, form.startingBid, form.startDate],
  );

  return { form, setField, isValid };
}
