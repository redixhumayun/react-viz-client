import axios from 'axios'
import * as React from 'react'
import { VictoryChart, VictoryGroup, VictoryStack, VictoryBar, VictoryTooltip } from 'victory'
import * as moment from 'moment'
const testData = require('../data.json')

import DatePickerComponent from '../Components/Charts/DatePicker'


interface IData {
  BATCH: string,
  LOCATION: string,
  NOFMAC: number,
  PRDDATE: number,
  PRDQTY: number,
  PRODUCT: string,
  SAMPRD: number,
  SAMS: number
}

interface IBarChartState {
  data: object,
  colors: any,
  fromDate: moment.Moment,
  toDate: moment.Moment
}

class BarChart extends React.Component<{}, IBarChartState> {
  constructor() {
    super({})
    this.state = {
      data: {},
      colors: ['red', 'green'],
      fromDate: moment(),
      toDate: moment()
    }
  }

  public render() {
    // const { data } = this.state
    const { colors } = this.state
    return (
      <div style={{
        marginTop: 20
      }}>
        <DatePickerComponent onChange={this.dateChange} />
        <VictoryChart domainPadding={{ x: 10 }} width={400} height={250}>
          <VictoryGroup offset={5} style={{ data: { width: 5 } }}>
            {
              Object.keys(testData).map((dateKey) => {
                console.log(testData[dateKey])
                return Object.keys(testData[dateKey]).map((factoryKey, index) => {
                  return (
                    <VictoryStack key={index}
                      colorScale={colors[index]}>
                      {
                        testData[dateKey][factoryKey].map((data: IData, i: number) => {
                          return (
                            <VictoryBar data={[data]}
                              key={index}
                              labels={(d) => d.SAMS}
                              labelComponent={<VictoryTooltip
                                height={40}
                                text={(d: any) => `BATCH: ${d.BATCH}\n FACTORY: ${d.LOCATION}\n SAMS: ${d.SAMS}\n DATE: ${d.PRDDATE}`} />}
                              x="PRDDATE"
                              y="SAMS" />
                          )
                        })
                      }
                    </VictoryStack>
                  )
                })
              })
            }
          </VictoryGroup>
        </VictoryChart>
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

  private fetchData = async (): Promise<void> => {
    const { fromDate, toDate } = this.state
    const response = await axios.get(`${process.env.REACT_APP_BASEURL}/batchdata/` +
      `${fromDate.format('YYYYMMDD')}/${toDate.format('YYYYMMDD')}`)
    this.setState({
      data: response.data
    })
  }
}

export default BarChart
