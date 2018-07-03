import axios from 'axios'
import * as React from 'react'
import { VictoryChart, VictoryLine } from 'victory'

interface IChartState {
  data: object
}

interface IData {
  LOCATION: string,
  PRDDATE: number,
  TTLSAMS: number, 
  TTLMAC: number
}

class Chart extends React.Component<{}, IChartState> {
  constructor () {
    super({})
    this.state = {
      data: {}
    }
  }

  public processData = (data: object[]): object => {
    const LOCATION: string = 'LOCATION'
    return data.reduce((acc, curr) => {
      curr[LOCATION] = curr[LOCATION].trim()
      if (!acc[curr[LOCATION]]) { acc[curr[LOCATION]] = [] }
      acc[curr[LOCATION]].push(curr)
      return acc
    }, {})
  }

  public render() {
    const { data } = this.state
    return Object.keys(data).length > 0 && (
      <div className="chart">
        <VictoryChart width={600} height={300} scale={{ x: "time" }}>
          <VictoryLine data={data[`ID1`]}
                      x={(d: IData): any => {
                        const dateNum = d.PRDDATE.toString()
                        const newArr: string[] = []
                        for(let i = 0; i < dateNum.length; i++) {
                          newArr.push(dateNum[i])
                          if (i === 3 || i === 5) {
                            newArr.push('/')
                          }
                        }
                        console.log(new Date(newArr.join('')))
                        return new Date(newArr.join(''))
                      }} 
                      y="TTLSAMS" />
        </VictoryChart>
      </div>
    )
  }

  public async componentDidMount () {
    const response = await axios.get('http://localhost:3004/recordsets')
    const processedData: object = this.processData(response.data)
    this.setState({
      data: processedData
    })
  }
}

export default Chart