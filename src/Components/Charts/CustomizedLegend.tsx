import * as React from 'react'

interface IEntry {
  color: string,
  dataKey: string,
  inactive: boolean,
  payload: object,
  type: string,
  value: string
}

class CustomizedLegend extends React.Component<any, any> {
  public render() {
    const { payload } = this.props
    return (
      <ul>
        {
          payload.map((entry: IEntry, index: number) => {
            const splitValue = entry.value.split('_')
            return (
              <li key={`item-${index}`} style={{ color: entry.color, display: 'inline-block', marginRight: '15px' }}>
                {splitValue[0]}
              </li>
            )
          })
        }
      </ul>
    );
  }
}

export default CustomizedLegend
