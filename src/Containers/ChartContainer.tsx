import axios from 'axios'
import * as React from 'react'
import * as moment from 'moment'

import BarChartComponent from '../Components/Charts/BarChartComponent'
import LineChartComponent from '../Components/Charts/LineChartComponent'
import DateRangeSelector from '../Components/DateRangeSelector/DateRangeSelector'

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
  currentComponent: ComponentType,
  dateRange: number
}

interface IDataShape {
  PRDDATE: Date,
  EFF: number
}

class ChartContainer extends React.Component<{}, IBarChartState> {
  constructor(props: object) {
    super(props)
    this.state = {
      prevState: [],
      data: [],
      currentComponent: ComponentType.Line,
      dateRange: 1
    }
  }

  public getComponentToRender() {
    const { currentComponent, data } = this.state
    switch(currentComponent) {
      case ComponentType.Line:
        return <LineChartComponent
                data={data}
                fetchSingleDataPoint={this.fetchSingleDayData} />
      case ComponentType.BarFactory:
        return <BarChartComponent
                detail='Factory'
                data={data}
                fetchSingleFactoryData={this.fetchSingleFactoryData}
                renderPrevChart={this.renderPrevChart} />
      case ComponentType.BarBatch:
        return <BarChartComponent
                detail='Batch'
                data={data}
                fetchSingleFactoryData={this.fetchSingleFactoryData}
                renderPrevChart={this.renderPrevChart} />
      default:
        return null
    }
  }

  public render() {
    return (
      <div style={{
        backgroundColor: '#FFFF',
        height: '100%'
      }}>
        {this.getComponentToRender()}
        {
          //  Render this component only if the line chart is drawn
          this.state.currentComponent === ComponentType.Line ? (
            <DateRangeSelector handleClick={this.setDateRange}
              dateRange={this.state.dateRange} />
          ) : (null)
        }
      </div>
    )
  }

  public async componentDidMount() {
    const toDate = moment().format('YYYYMMDD')
    const fromDate = moment().subtract(1, 'months').format('YYYYMMDD')
    this.fetchData(fromDate, toDate)
  }

  private setDateRange = (dateRange: number) => {
    const toDate = moment().format('YYYYMMDD')
    const fromDate = moment().subtract(dateRange, 'months').format('YYYYMMDD')

    //  Setting the state of date range so DateRangeSelector will update
    this.setState({
      dateRange
    })

    //  Fetch the data after setting the dateRange state
    this.fetchData(fromDate, toDate)
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

  private filterDataForNullValues = (data: IDataShape[]): IDataShape[] => {
    return data.filter((datum: IDataShape): boolean => {
      return datum.EFF !== null
    })
  }

  /**
   * Fetch the average efficiency for the business for the given time range
   */
  private fetchData = async (fromDate: string, toDate: string) => {
    const response = await axios.get(`${process.env.REACT_APP_BASEURL}/averageEff/${fromDate}/${toDate}`)
    const formattedData = this.filterDataForNullValues(this.orderByDate(this.formatDate(response.data)))
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
    response.data[0].FACTORY = location  //  update the response data to include the factory associated with this data
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
