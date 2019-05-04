import axios from 'axios'
import * as React from 'react'
import * as moment from 'moment'

import DatePickerComponent from '../Components/Charts/DatePicker'
import BarChartComponent from '../Components/Charts/BarChartComponent'
import LineChartComponent from '../Components/Charts/LineChartComponent'

enum ComponentType {
  Line = "Line",
  BarFactory = "BarFactory",
  BarBatch = "BarBatch"
}

interface IPrevState {
  component: ComponentType,
  data: IDataShape[]
}

interface IBarChartState {
  prevState: IPrevState[],
  data: IDataShape[],
  currentComponent: ComponentType
}

interface IDataShape {
  PRDDATE: string | Date,
  EFF: number
}

class ChartContainer extends React.Component<{}, IBarChartState> {
  constructor(props: any) {
    super(props)
    this.state = {
      prevState: [],
      data: [],
      currentComponent: ComponentType.Line
    }
  }

  public getComponentToRender() {
    const { currentComponent, data } = this.state
    switch(currentComponent) {
      case ComponentType.Line:
        return <LineChartComponent data={data} fetchSingleDataPoint={this.fetchSingleDayData} />
      case ComponentType.BarFactory:
        return <BarChartComponent data={data} fetchSingleFactoryData={this.fetchSingleFactoryData} renderPrevChart={this.renderPrevChart} />
      case ComponentType.BarBatch:
        return <BarChartComponent data={data} fetchSingleFactoryData={this.fetchSingleFactoryData} renderPrevChart={this.renderPrevChart} />
      default:
        return null
    }
  }

  public render() {
    return (
      <div>
        <DatePickerComponent onChange={this.fetchData} />
        {this.getComponentToRender()}
      </div>
    )
  }

  private formatDate = (data: IDataShape[]): IDataShape[] => {
    return data.reduce((acc: IDataShape[], curr: IDataShape): IDataShape[] => {
      const formattedCurr = Object.assign(
        {},
        { ...curr },
        { PRDDATE: moment(curr.PRDDATE).toDate() }
      )
      acc.push(formattedCurr)
      return acc
    }, [])
  }

  private orderByDate = (data: IDataShape[]): IDataShape[] => {
    return data.sort((a: IDataShape, b: IDataShape) => {
      if (a.PRDDATE instanceof Date && b.PRDDATE instanceof Date) { //  check if we are actually getting date objects
        if (a.PRDDATE.getTime() <= b.PRDDATE.getTime()) {
          return -1
        } else {
          return 1
        }
      }else {
        return 0
      }
    })
  }

  /**
   * Fetch the average eff data averaged for all factories ranging from fromDate to toDate
   */
  private fetchData = async (fromDate: moment.Moment, toDate: moment.Moment): Promise<void> => {
    const response = await axios.get(`${process.env.REACT_APP_BASEURL}/averageEff/${fromDate.format('YYYYMMDD')}/${toDate.format('YYYYMMDD')}`)
    const formattedData = this.orderByDate(this.formatDate(response.data))
    this.setState({
      data: formattedData
    })
  }

  /**
   * Fetch the data for all factories on a single day
   */
  private fetchSingleDayData = async (date: string | Date): Promise<void> => {
    const formattedDate = moment(date).format('YYYYMMDD')
    const response = await axios.get(`${process.env.REACT_APP_BASEURL}/${formattedDate}/${formattedDate}`)
    const updatedPrevState = this.updatePrevStateWithCurrentState()
    this.setState({
      prevState: updatedPrevState,
      data: response.data,
      currentComponent: ComponentType.BarFactory
    })
  }

  /**
   * Fetch the data for a single factory on a single day
   */
  private fetchSingleFactoryData = async (date: string | Date, location: string ): Promise<void> => {
    const formattedDate = moment(date).format('YYYYMMDD')
    const response = await axios.get(`${process.env.REACT_APP_BASEURL}/batchdata/${formattedDate}/${location}`)
    const updatedPrevState = this.updatePrevStateWithCurrentState()
    this.setState({
      prevState: updatedPrevState,
      data: response.data,
      currentComponent: ComponentType.BarBatch
    })
  }

  /**
   * Function that is called when a new chart is going to be rendered. Function will store the current state as part of the
   * prevState stack
   */
  private updatePrevStateWithCurrentState = (): IPrevState[] => {
    const { data, prevState, currentComponent } = this.state
    prevState.push({ component: currentComponent, data })
    return prevState
  }

  private renderPrevChart = () => {
    const { prevState } = this.state
    const lastElement = prevState.pop()
    if (lastElement !== undefined) {
      const { component, data } = lastElement
      this.setState({
        prevState,
        currentComponent: component,
        data
      })
    }
  }
}

export default ChartContainer
