import axios from 'axios'
import * as React from 'react'
import * as moment from 'moment'

import DatePickerComponent from '../Components/Charts/DatePicker'
import BarChartComponent from '../Components/Charts/BarChartComponent'
import LineChartComponent from '../Components/Charts/LineChartComponent'

enum ChartType {
  Line = "Line",
  Bar = "Bar"
}

interface IBarChartState {
  data: IDataShape[],
  fromDate: moment.Moment,
  toDate: moment.Moment,
  chartType: ChartType
}

interface IDataShape {
  PRDDATE: string | Date,
  EFF: number
}

class BarChart extends React.Component<{}, IBarChartState> {
  constructor(props: any) {
    super(props)
    this.state = {
      data: [],
      fromDate: moment(),
      toDate: moment(),
      chartType: ChartType.Line
    }
  }

  public render() {
    const { chartType } = this.state
    return (
      <div>
        <DatePickerComponent onChange={this.dateChange} />
        {
          chartType === ChartType.Line ? (
            <LineChartComponent data={this.state.data} fetchSingleDataPoint={this.fetchSingleDayData} />
          ) : (
            <BarChartComponent data={this.state.data} fetchSingleFactoryData={this.fetchSingleFactoryData} />
          )
        }
        {/* <BarChartComponent data={this.state.data} /> */}
      </div>
    )
  }

  private dateChange = (fromDate: moment.Moment, toDate: moment.Moment): void => {
    this.setState({
      fromDate,
      toDate
    }, () => {
      this.fetchData()
    })
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

  private fetchData = async (): Promise<void> => {
    const { fromDate, toDate } = this.state
    // const response = await axios.get(`${process.env.REACT_APP_BASEURL}/${fromDate.format('YYYYMMDD')}/${toDate.format('YYYYMMDD')}`)
    // const response = await axios.get('http://localhost:3004/data')
    const response = await axios.get(`${process.env.REACT_APP_BASEURL}/averageEff/${fromDate.format('YYYYMMDD')}/${toDate.format('YYYYMMDD')}`)
    const formattedData = this.orderByDate(this.formatDate(response.data))
    this.setState({
      data: formattedData
    })
  }

  private fetchSingleDayData = async (date: string | Date): Promise<void> => {
    const formattedDate = moment(date).format('YYYYMMDD')
    const response = await axios.get(`${process.env.REACT_APP_BASEURL}/${formattedDate}/${formattedDate}`)
    this.setState({
      data: response.data,
      chartType: ChartType.Bar
    })
  }

  private fetchSingleFactoryData = async (date: string | Date, location: string ): Promise<void> => {
    const formattedDate = moment(date).format('YYYYMMDD')
    const response = await axios.get(`${process.env.REACT_APP_BASEURL}/batchdata/${formattedDate}/${location}`)
    console.log(response.data)
  }
}

export default BarChart
