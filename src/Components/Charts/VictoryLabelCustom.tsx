import * as React from 'react'

class VictoryLabelCustom extends React.Component<any, any> {
  public render() {
    console.log(this.props)
    return (
      <p>
        {this.props.datum.BATCH}
      </p>
    )
  }
}

export default VictoryLabelCustom
