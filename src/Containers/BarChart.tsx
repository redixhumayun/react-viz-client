import axios from 'axios'
import * as React from 'react'
import * as moment from 'moment'

import BarChartComponent from '../Components/Charts/BarChartComponent'

interface IBarChartState {
  data: object[],
  fromDate: moment.Moment,
  toDate: moment.Moment
}

class BarChart extends React.Component<{}, IBarChartState> {
  constructor(props: any) {
    super(props)
    this.state = {
      data: [],
      fromDate: moment(),
      toDate: moment()
    }
  }

  public render() {
    return (
      <BarChartComponent data={this.state.data} dateChange={this.dateChange} />
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

  private fetchData = async (): Promise<void> => {
    const { fromDate, toDate } = this.state
    const response = await axios.get(`${process.env.REACT_APP_BASEURL}/${fromDate.format('YYYYMMDD')}/${toDate.format('YYYYMMDD')}`)
    console.log(response.data)
    this.setState({
      data: response.data
    })
  }
}

export default BarChart
