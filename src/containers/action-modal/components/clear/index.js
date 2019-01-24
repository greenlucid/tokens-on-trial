import React from 'react'
import PropTypes from 'prop-types'

import * as arbitrableTokenListSelectors from '../../../../reducers/arbitrable-token-list'
import * as tokenSelectors from '../../../../reducers/token'
import { web3 } from '../../../../bootstrap/dapp-api'
import Button from '../../../../components/button'
import './clear.css'

const Clear = ({
  arbitrableTokenListData,
  closeActionModal,
  clearToken,
  item
}) => (
  <div>
    <h3 className="Modal-title">
      {item ? `Clear ${item.name}` : 'Remove badge'}
    </h3>
    <hr />
    <div className="Clear-stake">
      <h4>
        <strong>Stake:</strong>
      </h4>
      <span>
        {`${String(
          web3.utils.fromWei(
            String(
              web3.utils.toBN(arbitrableTokenListData.data.challengeReward)
            )
          )
        )} ETH`}
      </span>
    </div>
    <br />
    <div className="Modal-actions">
      <Button
        className="Clear-return"
        onClick={closeActionModal}
        type="secondary"
      >
        Return
      </Button>
      <Button className="Clear-request" onClick={clearToken} type="primary">
        Request Clearing
      </Button>
    </div>
  </div>
)

Clear.propTypes = {
  // State
  arbitrableTokenListData:
    arbitrableTokenListSelectors.arbitrableTokenListDataShape.isRequired,
  item: tokenSelectors.tokenShape,

  // Action Dispatchers
  closeActionModal: PropTypes.func.isRequired,
  clearToken: PropTypes.func.isRequired
}

Clear.defaultProps = {
  item: null
}

export default Clear
