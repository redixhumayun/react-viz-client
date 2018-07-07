/*tslint:disable:only-arrow-functions no-bitwise no-unused variable*/

import axios from 'axios'
import * as moment from 'moment'
import * as React from 'react'
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import CustomizedLegend from '../Components/Charts/CustomizedLegend'
import DatePickerComponent from '../Components/Charts/DatePicker'

interface IChartState {
  data: object[],
  locations: string[]
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
        "NJKBPT",
        "NJKU3",
        "IDU9P2",
        "IDU10"
      ]
    }
  }

  public render() {
    const { data, locations } = this.state
    return Object.keys(data).length > 0 && (
      <div className="chart" style={{
        height: '100%',
        position: 'absolute',
        width: '100%',
      }}>
        <DatePickerComponent />
        <ResponsiveContainer width="80%" height="80%">
          <LineChart data={data}>
            <XAxis dataKey={'PRDDATE'} />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} content={<CustomizedLegend external={external} />} />
            {
              locations.map((loc) => {
                return (
                  <Line type='monotone' stroke={this.generateRandomColor()} key={`line_${loc}`} dataKey={`${loc}_TTLSAMS`} />
                )
              })
            }
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  public async componentDidMount() {
    const response = await axios.get('http://localhost:3004/recordsets')
    const grouped = this.groupBy(response.data, (data: any) => data.PRDDATE)
    const processedData = this.formatDate(this.processData(grouped))
    this.setState({
      data: processedData
    })
  }

  private groupBy = (list: any, keyGetter: any) => {
    const map = new Map()
    list.sort((a: IData, b: IData) => {
      if (a.PRDDATE < b.PRDDATE) {
        return -1
      } else if (a.PRDDATE > b.PRDDATE) {
        return 1
      }
      return 0
    }).forEach((item: any) => {
      const key = keyGetter(item)
      const collection = map.get(key)
      if (!collection) {
        map.set(key, [item])
      } else {
        collection.push(item)
      }
    })
    return map
  }

  private processData = (data: Map<number, object[]>): Map<number, object[]> => {
    const LOCATION = 'LOCATION'
    data.forEach((value, key) => {
      const updatedValue = value.map((obj: IData) => {
        const primaryKey = obj[LOCATION].trim()
        const newObj = {}
        newObj[LOCATION] = primaryKey
        Object.keys(obj).reduce((a, c) => {
          if (c !== LOCATION) {
            const newKey = `${primaryKey}_${c}`
            newObj[newKey] = obj[c]
          }
          return a
        }, {})
        return newObj
      }).reduce((acc: any, curr: IData) => {
        return Object.assign({}, ...acc, curr)
      }, {})
      data.set(key, updatedValue)
    })
    return data
  }

  private formatDate = (data: Map<number, object[]>): object[] => {
    const array: object[] = []
    data.forEach((value, key) => {
      const newDate: string[] = []
      const keyString: string = key.toString()
      for (let i = 0; i < keyString.length; i++) {
        newDate.push(keyString[i])
        if (i === 3 || i === 5) {
          newDate.push('/')
        }
      }
      const momentDate = moment(new Date(newDate.join('')).getTime()).format('MMMM, DD')
      array.push({ PRDDATE: momentDate, ...value })
    })
    return array
  }

  private generateRandomColor = () => {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
  }
}

export default Chart
