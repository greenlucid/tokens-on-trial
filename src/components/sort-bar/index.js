import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Dropdown from '../dropdown'
import * as filterConstants from '../../constants/filter'
import * as filterActions from '../../actions/filter'
import * as tokenActions from '../../actions/token'
import * as tokenSelectors from '../../reducers/token'
import * as filterSelectors from '../../reducers/filter'
import { filterToContractParam } from '../../utils/filter'

import './sort-bar.css'

class SortBar extends PureComponent {
  static propTypes = {
    // Redux State
    tokens: tokenSelectors.tokensShape.isRequired,
    oldestFirst: filterSelectors.oldestFirstShape.isRequired,

    // Action Dispatchers
    setOldestFirst: PropTypes.func.isRequired,
    fetchTokens: PropTypes.func.isRequired
  }

  handleSortChange = oldestFirst => {
    const { setOldestFirst, fetchTokens, tokens } = this.props
    setOldestFirst(oldestFirst)
    const filterValue = filterToContractParam({
      'Challenged Clearing Requests': true,
      'Challenged Registration Requests': true,
      Cleared: true,
      'Clearing Requests': true,
      'My Challenges': true,
      'My Submissions': true,
      Registered: true,
      'Registration Requests': true
    })

    if (!tokens.loading) fetchTokens('0x00', 10, filterValue, oldestFirst)
  }

  render() {
    const { tokens, oldestFirst } = this.props
    return (
      <div className="SortBar">
        <div className="SortBar-count">
          {tokens ? tokens.length : 'Loading'} submissions
        </div>
        <div className="SortBar-sort">
          <Dropdown
            value={oldestFirst || 0}
            type="radio"
            label="Sort order"
            options={filterConstants.SORT_OPTIONS_ENUM.values}
            onChange={this.handleSortChange}
            className="SortBar-dropdowns-dropdown"
          />
        </div>
      </div>
    )
  }
}

export default connect(
  state => ({
    tokens: state.token.tokens.data,
    oldestFirst: state.filter.oldestFirst
  }),
  {
    setOldestFirst: filterActions.setOldestFirst,
    fetchTokens: tokenActions.fetchTokens
  }
)(SortBar)
