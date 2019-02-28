import PropTypes from 'prop-types'
import createReducer, { createResource } from 'lessdux'

import * as tcrConstants from '../constants/tcr'

// Common Shapes
export const _badgeShape = PropTypes.shape({
  address: PropTypes.string.isRequired,
  numberOfRequests: PropTypes.number.isRequired,
  status: PropTypes.oneOf(tcrConstants.IN_CONTRACT_STATUS_ENUM.indexes)
    .isRequired,
  latestRequest: PropTypes.shape({
    disputed: PropTypes.bool.isRequired,
    disputeID: PropTypes.number.isRequired,
    submissionTime: PropTypes.number.isRequired,
    challengerDepositTime: PropTypes.number.isRequired,
    challengeRewardBalance: PropTypes.string.isRequired,
    numberOfRounds: PropTypes.number.isRequired,
    parties: PropTypes.arrayOf(PropTypes.string).isRequired,
    dispute: PropTypes.shape({
      arbitrated: PropTypes.string.isRequired,
      choices: PropTypes.string.isRequired,
      fee: PropTypes.string.isRequired,
      ruling: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired
    }),
    latestRound: PropTypes.shape({
      appealed: PropTypes.bool.isRequired,
      requiredForSide: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
      paidFees: PropTypes.arrayOf(PropTypes.shape({})).isRequired
    })
  }).isRequired
})
export const _badgesShape = PropTypes.arrayOf(_badgeShape.isRequired)

// Shapes
const { shape: badgesShape, initialState: badgesInitialState } = createResource(
  _badgesShape
)
const { shape: badgeShape, initialState: badgeInitialState } = createResource(
  _badgeShape,
  { withCreate: true, withUpdate: true }
)
export { badgesShape, badgeShape }

// Reducer
export default createReducer({
  badges: badgesInitialState,
  badge: badgeInitialState
})

// Selectors
export const getBadges = state => state.badge.badges.data
export const getBadgeDisputeID = state =>
  state.badge.badge.data && state.badge.badge.data.disputeID
export const getBadgeAppealCost = state =>
  state.badge.badge.data && state.badge.badge.data.appealCost
