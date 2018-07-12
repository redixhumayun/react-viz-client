/*tslint:disable:only-arrow-functions no-bitwise*/

import axios from 'axios'
import * as moment from 'moment'
import * as React from 'react'
import { VictoryChart, VictoryLine, createContainer, VictoryAxis, VictoryLegend } from 'victory'

import DatePickerComponent from '../Components/Charts/DatePicker'
import ChartToggle from '../Components/Charts/ChartToggle'

interface IChartState {
  data: object,
  locations: string[],
  colors: string[],
  legendData: object[],
  checkedOptions: string[],
  fromDate: string,
  toDate: string
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
        "ID1",
        "IDEPL1",
        "IDEPL3",
        "IDEPL4",
        "IDEPL5",
        "IDEPL6",
        "IDEPL7",
        "IDEPL8",
        "NJKBPT",
        "IDU10",
        "NJKP1",
        "NJKP2",
        "NJKP3",
        "NJKU3",
        "IDU9P2"
      ],
      colors: [
        'red',
        'green',
        'orange',
        'blue',
        'black',
        'violet',
        'indigo',
        'maroon',
        'cyan',
        'darkgoldenrod',
        'crimson',
        'darksalmon',
        'darkturquoise',
        'fuchsia',
        'ivory',
        'lightblue',
        'linen',
        'mediumslateblue'
      ],
      legendData: [],
      checkedOptions: [],
      fromDate: '',
      toDate: ''
    }
  }

  public render() {
    const VictoryZoomVoronoiContainer = createContainer('zoom', 'voronoi')
    const { data, locations, colors, legendData, checkedOptions } = this.state
    return (
      <div>
        <DatePickerComponent onChange={this.dateChange} />
        {
          Object.keys(data).length > 0 && (
            <VictoryChart width={window.innerWidth + 200}
            height={window.innerHeight - 200}
            scale={{ x: 'time' }}
            containerComponent={
              <VictoryZoomVoronoiContainer labels={(d: any) => {
                return `Date: ${d._x.format('MMMM DD')}, TTLSAMS: ${d._y}, LOCATION: ${d.LOCATION}`
              }} />
            }>
              <VictoryAxis dependentAxis={true}
                tickFormat={(t) => {
                  return t
                }} />
              <VictoryAxis dependentAxis={false} />
              {
                checkedOptions.map((location: string, index: number) => (
                  <VictoryLine
                    key={`${location}_line`}
                    data={data[location]}
                    x="PRDDATE"
                    y="TTLSAMS"
                    animate={{
                      duration: 2000,
                      onLoad: { duration: 1000 }
                    }}
                    style={{
                      data: { stroke: colors[index] }
                    }} />
                ))
              }
              <VictoryLegend y={20} title="Legend" centerTitle={true} orientation="horizontal"
              data={legendData} />
            </VictoryChart>
          )
        }
        <ChartToggle locations={locations} onChange={this.updateCheckedOptions} />
      </div>
    )
  }

  public async componentDidMount() {
    const response = await axios.get('http://localhost:3004/recordsets')
    const processedData = this.formatDate(this.processData(response.data))
    const legendData = this.generateLegendData(processedData)
    this.setState({
      data: processedData,
      legendData
    })
  }

  private generateLegendData = (data: object) => {
    const { locations, colors } = this.state
    const legends: object[] = []
    for(let i = 0; i < locations.length; i++) {
      legends.push({ name: locations[i], symbol: { fill: colors[i] } })
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

  private dateChange = (date: string, target: string) => {
    if (target === 'from') {
      this.setState({
        fromDate: date
      }, () => {
        if (this.state.fromDate !== '' && this.state.toDate !== '') {
          this.fetchData()
        }
      })
    } else if (target === 'to') {
      this.setState({
        toDate: date
      }, () => {
        if (this.state.fromDate !== '' && this.state.toDate !== '') {
          this.fetchData()
        }
      })
    }
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
        for(let i = 0; i < currDate.length; i++) {
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

  private updateCheckedOptions = (option: string, checked: boolean): void => {
    if(checked) {
      this.setState({
        checkedOptions: [...this.state.checkedOptions, option]
      })
    } else {
      const { checkedOptions } = this.state
      const index = checkedOptions.findIndex((value: string) => value === option)
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
