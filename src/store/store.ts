import { createStore } from 'redux'

const ADD_CHART_TO_STACK = 'ADD_CHART_TO_STACK'
const POP_CHART_FROM_STACK = 'POP_CHART_FROM_STACK'

enum ComponentType {
  Line = "Line",
  BarFactory = "BarFactory",
  BarBatch = "BarBatch"
}

interface IStackObject {
  type: ComponentType,
  data: object[]
}

interface IChartReducerState {
  stack: IStackObject[]
}

const initialState: IChartReducerState = {
  stack: []
}

export function addChartToStack(data: any) {
  return {
    type: ADD_CHART_TO_STACK,
    data
  }
}

export function popChartFromStack() {
  return {
    type: POP_CHART_FROM_STACK
  }
}

function ChartReducer(state: IChartReducerState = initialState, action: any) {
  switch(action.type) {
    case ADD_CHART_TO_STACK:
      return Object.assign(
        {},
        { ...state },
        { ...action.data }
      )
    case POP_CHART_FROM_STACK:
      return Object.assign(
        {},
        { state: state.stack.slice(0, state.stack.length - 1) }
      )
  }
}

const store = createStore(ChartReducer)

export default store
