/*tslint:disable:only-arrow-functions no-bitwise*/

import axios from 'axios'
import { Row, Col } from 'antd'
import * as moment from 'moment'
import * as React from 'react'
import { VictoryChart, VictoryLine, createContainer, VictoryAxis, VictoryLegend } from 'victory'

import DatePickerComponent from '../Components/Charts/DatePicker'
import ChartToggle from '../Components/Charts/ChartToggle'

interface ILocations {
  location: string,
  color: string
}

interface IChartState {
  data: object,
  locations: ILocations[],
  legendData: object[],
  checkedOptions: ILocations[],
  fromDate: moment.Moment,
  toDate: moment.Moment
}

interface IData {
  LOCATION: string,
  PRDDATE: number,
  TTLSAMS: number,
  TTLMAC: number
}

class Chart extends React.Component<{}, IChartState> {
  constructor() {
    super({})
    this.state = {
      data: [],
      locations: [
        { location: "ID1", color: "red" },
        { location: "IDEPL1", color: "green" },
        { location: "IDEPL3", color: "orange" },
        { location: "IDEPL4", color: "blue" },
        { location: "IDEPL5", color: "black" },
        { location: "IDEPL6", color: "violet" },
        { location: "IDEPL7", color: "indigo" },
        { location: "IDEPL8", color: "maroon" },
        { location: "NJKBPT", color: "cyan" },
        { location: "IDU10", color: "darkgoldenrod" },
        { location: "NJKP1", color: "crimson" },
        { location: "NJKP2", color: "darksalmon" },
        { location: "NJKP3", color: "darkturquoise" },
        { location: "NJKU3", color: "fuschia" },
        { location: "IDU9P2", color: "magenta" }
      ],
      legendData: [],
      checkedOptions: [],
      fromDate: moment(),
      toDate: moment()
    }
  }

  public render() {
    const VictoryZoomVoronoiContainer = createContainer('zoom', 'voronoi')
    const { data, locations, legendData, checkedOptions } = this.state
    return (
      <div>
        <Row>
          <Col span={6}>Navigation Menu</Col>
          <Col span={18}>
            <DatePickerComponent onChange={this.dateChange} />
            {
              Object.keys(data).length > 0 && (
                <VictoryChart width={window.innerWidth + 200}
                  height={window.innerHeight}
                  scale={{ x: 'time' }}
                  containerComponent={
                    <VictoryZoomVoronoiContainer labels={(d: any) => {
                      return `Date: ${d._x.format('MMMM DD')}, SEW_EFF: ${d._y}, LOCATION: ${d.LOCATION}`
                    }} />
                  }>
                  <VictoryAxis dependentAxis={true}
                    tickFormat={(t) => {
                      return t
                    }} />
                  <VictoryAxis dependentAxis={false} />
                  {
                    checkedOptions.map((obj: ILocations) => {
                      return (
                        <VictoryLine
                          key={`${obj.location}_line`}
                          data={data[obj.location]}
                          x="PRDDATE"
                          y="SEW_EFF"
                          animate={{
                            duration: 2000,
                            onLoad: { duration: 1000 }
                          }}
                          style={{
                            data: { stroke: obj.color }
                          }} />
                      )
                    })
                  }
                  <VictoryLegend x={800} title="Legend" centerTitle={true} orientation="horizontal"
                    data={legendData} itemsPerRow={4} />
                </VictoryChart>
              )
            }
            <ChartToggle locations={locations} onChange={this.updateCheckedOptions} /></Col>
        </Row>
      </div>
    )
  }

  public async componentDidMount() {
    const response = await axios.get('http://localhost:3004/recordsets')
    const processedData = this.formatDate(this.processData(response.data))
    const legendData = this.generateLegendData()
    this.setState({
      data: processedData,
      legendData
    })
  }

  private generateLegendData = (): object[] => {
    const { locations } = this.state
    const legends: object[] = []
    for (const obj of locations) {
      legends.push({ name: obj.location, symbol: { fill: obj.color } })
    }
    return legends
  }

  private fetchData = async (): Promise<void> => {
    const { fromDate, toDate } = this.state
    const response = await axios.get(`${process.env.REACT_APP_BASEURL}/${fromDate}/${toDate}`)
    const processedData = this.formatDate(this.processData(response.data.recordset))
    this.setState({
      data: processedData
    })
  }

  private dateChange = (fromDate: moment.Moment, toDate: moment.Moment): void => {
    this.setState({
      fromDate,
      toDate
    }, () => {
      this.fetchData()
    })
  }

  private processData = (data: object[]): object => {
    const LOCATION = 'LOCATION'
    return data.reduce((acc, curr) => {
      curr[LOCATION] = curr[LOCATION].trim()
      if (!acc[curr[LOCATION]]) { acc[curr[LOCATION]] = [] }
      acc[curr[LOCATION]].push(curr)
      return acc
    }, {})
  }

  private formatDate = (data: object): object => {
    return Object.keys(data).reduce((acc, curr) => {
      acc[curr] = data[curr].map((datum: IData) => {
        const newDate: string[] = []
        const currDate: string = datum.PRDDATE.toString()
        for (let i = 0; i < currDate.length; i++) {
          newDate.push(currDate[i])
          if (i === 3 || i === 5) {
            newDate.push('/')
          }
        }
        const momentDate = moment(new Date(newDate.join('')))
        return { ...datum, PRDDATE: momentDate }
      })
      return acc
    }, {})
  }

  private updateCheckedOptions = (option: ILocations, checked: boolean): void => {
    if (checked) {
      this.setState({
        checkedOptions: [...this.state.checkedOptions, option]
      })
    } else {
      const { checkedOptions } = this.state
      const index = checkedOptions.findIndex((value: ILocations) => value === option)
      if (index !== -1) {
        checkedOptions.splice(index, 1)
        this.setState({
          checkedOptions
        })
      }
    }
  }
}

export default Chart
