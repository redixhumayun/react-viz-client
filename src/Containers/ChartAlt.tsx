import * as React from 'react'
import { VictoryChart, VictoryGroup, VictoryStack, VictoryBar, VictoryTooltip } from 'victory'
import * as moment from 'moment'

// import VictoryLabelCustom from '../Components/Charts/VictoryLabelCustom'

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

class ChartAlt extends React.Component {

  public render() {
    const dummyData = {
      "20180601": [
        {
          "LOCATION": "IDEPL1",
          "BATCH": "BAT1",
          "PRODUCT": "ID12334A",
          "PRDDATE": 20180601,
          "SAMS": 19,
          "PRODQTY": 1800,
          "SAMPRD": 12000,
          "NOFMAC": 120,
          "label": "BAT1, IDEPL1"
        },
        {
          "LOCATION": "IDEPL1",
          "BATCH": "BAT2",
          "PRODUCT": "ID12334A",
          "PRDDATE": 20180601,
          "SAMS": 19,
          "PRODQTY": 1800,
          "SAMPRD": 12000,
          "NOFMAC": 120,
          "label": "BAT2, IDEPL1"
        },
        {
          "LOCATION": "IDEPL1",
          "BATCH": "BAT3",
          "PRODUCT": "ID12212Y",
          "PRDDATE": 20180601,
          "SAMS": 15,
          "PRODQTY": 1650,
          "SAMPRD": 8800,
          "NOFMAC": 120,
          "label": "BAT3, IDEPL1"
        },
        {
          "LOCATION": "IDEPL3",
          "BATCH": "BAT1",
          "PRODUCT": "ID12229X",
          "PRDDATE": 20180601,
          "SAMS": 198,
          "PRODQTY": 1575,
          "SAMPRD": 104475,
          "NOFMAC": 150
        },
        {
          "LOCATION": "IDEPL5",
          "BATCH": "BAT1",
          "PRODUCT": "ID12250Y",
          "PRDDATE": 20180601,
          "SAMS": 18,
          "PRODQTY": 300,
          "SAMPRD": 1900,
          "NOFMAC": 120
        },
        {
          "LOCATION": "IDEPL6",
          "BATCH": "BAT1",
          "PRODUCT": "ID12245A",
          "PRDDATE": 20180601,
          "SAMS": 16,
          "PRODQTY": 732,
          "SAMPRD": 4148,
          "NOFMAC": 120
        }
      ]
    }

    const processedData: object = this.groupBy(dummyData['20180601'], 'LOCATION')
    console.log(processedData)

    return (
      <div style={{
        marginTop: 20
      }}>
        <VictoryChart domainPadding={{ x: 50 }} width={400} height={400}>
          <VictoryGroup offset={20} style={{ data: { width: 15 } }}>
            <VictoryStack colorScale={"red"}>
              {
                Object.keys(processedData).map(locationKey => {
                  return processedData[locationKey].map((data: IData, index: number) => {
                    return (
                      <VictoryBar data={[data]}
                      key={index}
                      labels={(d) => d.SAMS}
                      labelComponent={<VictoryTooltip
                        height={40}
                        text={(d: any) => `BATCH: ${d.BATCH},\n FACTORY: ${d.LOCATION}`} />}
                      x={(d) => moment(d.PRDDATE.toString()).format('MM, DD')}
                      y="SAMS"  />
                    )
                  })
                })
              }
            </VictoryStack>
            <VictoryStack colorScale={"green"}>
              <VictoryBar data={[{ x: moment('20180601').format('MM, DD'), y: 15 }, { x: moment('20180602').format('MM, DD'), y: 11 }, { x: moment('20180603').format('MM, DD'), y: 14 }]} />
              <VictoryBar data={[{ x: moment('20180601').format('MM, DD'), y: 15 }, { x: moment('20180602').format('MM, DD'), y: 12 }, { x: moment('20180603').format('MM, DD'), y: 15 }]} />
              <VictoryBar data={[{ x: moment('20180601').format('MM, DD'), y: 19 }, { x: moment('20180602').format('MM, DD'), y: 13 }, { x: moment('20180603').format('MM, DD'), y: 16 }]} />
            </VictoryStack>
            <VictoryStack colorScale={"blue"}>
              <VictoryBar data={[{ x: moment('20180601').format('MM, DD'), y: 7 }, { x: moment('20180602').format('MM, DD'), y: 5 }, { x: moment('20180603').format('MM, DD'), y: 11 }]} />
              <VictoryBar data={[{ x: moment('20180601').format('MM, DD'), y: 8 }, { x: moment('20180602').format('MM, DD'), y: 6 }, { x: moment('20180603').format('MM, DD'), y: 15 }]} />
              <VictoryBar data={[{ x: moment('20180601').format('MM, DD'), y: 9 }, { x: moment('20180602').format('MM, DD'), y: 12 }, { x: moment('20180603').format('MM, DD'), y: 12 }]} />
            </VictoryStack>
          </VictoryGroup>
        </VictoryChart>
      </div>
    );
  }

  private groupBy = (data: any, key: any) => {
    return data.reduce((acc: any, curr: any) => {
      if (!acc[curr[key]]) { acc[curr[key]] = [] }
      acc[curr[key]].push(curr)
      return acc
    }, {})
  }
}

export default ChartAlt
