import * as React from 'react'

class VictoryLabelCustom extends React.Component<any, any> {
  public render() {
    console.log(this.props)
    return (
      <text>
        {this.props.datum.BATCH}
      </text>
    )
  }
}

export default VictoryLabelCustom
