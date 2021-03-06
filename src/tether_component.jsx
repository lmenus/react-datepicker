import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Tether from 'tether'

const childrenPropType = ({ children }, propName, componentName) => {
  const childCount = React.Children.count(children)

  if (childCount <= 0) {
    return new Error(`${componentName} expects at least one child to use as the target element.`)
  }
  else if (childCount > 2) {
    return new Error(`Only a max of two children allowed in ${componentName}.`)
  }
}

const attachmentPositions = [
  'top left',
  'top center',
  'top right',
  'middle left',
  'middle center',
  'middle right',
  'bottom left',
  'bottom center',
  'bottom right'
]

class TetherComponent extends Component {
  constructor(props) {
    super(props)

    this._destroy = this._destroy.bind(this)
    this._update = this._update.bind(this)
    this._updateTether = this._updateTether.bind(this)
    this.disable = this.disable.bind(this)
    this.enable = this.enable.bind(this)
    this.position = this.position.bind(this)
  }

  componentDidMount() {
    this._targetNode = ReactDOM.findDOMNode(this)
    this._update()
  }

  componentDidUpdate() {
    this._update()
  }

  componentWillUnmount() {
    this._destroy()
  }

  _destroy() {
    if (this._elementParentNode) {
      ReactDOM.unmountComponentAtNode(this._elementParentNode)
      this._elementParentNode.parentNode.removeChild(this._elementParentNode)
    }

    if (this._tether) {
      this._tether.destroy()
    }

    this._elementParentNode = null
    this._tether = null
  }

  _update() {
    const {
      children,
      renderElementTag,
      renderElementTo
    } = this.props

    let elementComponent = children[1]

    // if no element component provided, bail out
    if (!elementComponent) {
      // destroy Tether elements if they have been created
      if (this._tether) {
        this._destroy()
      }
      return
    }

    // create element node container if it hasn't been yet
    if (!this._elementParentNode) {
      // create a node that we can stick our content Component in
      this._elementParentNode = document.createElement(renderElementTag)

      // append node to the end of the body
      const renderTo = renderElementTo || document.body
      renderTo.appendChild(this._elementParentNode)
    }

    // render element component into the DOM
    ReactDOM.unstable_renderSubtreeIntoContainer(
      this, elementComponent, this._elementParentNode, () => {
        // don't update Tether until the subtree has finished rendering
        this._updateTether()
      }
    )
  }

  _updateTether() {
    const {
      renderElementTag, // eslint-disable-line no-unused-vars
      renderElementTo, // eslint-disable-line no-unused-vars
      ...options
    } = this.props

    const tetherOptions = {
      target: this._targetNode,
      element: this._elementParentNode,
      ...options
    }

    if (!this._tether) {
      this._tether = new Tether(tetherOptions)
    }
    else {
      this._tether.setOptions(tetherOptions)
    }

    this._tether.position()
  }

  disable() {
    return this._tether.disable()
  }

  enable() {
    return this._tether.enable()
  }

  position() {
    return this._tether.position()
  }

  render() {
    const { children } = this.props
    let firstChild = null

    // we use forEach because the second child could be null
    // causing children to not be an array
    React.Children.forEach(children, (child, index) => {
      if (index === 0) {
        firstChild = child
        return false
      }
    })

    return firstChild
  }
}

TetherComponent.defaultProps = {
  renderElementTag: 'div',
  renderElementTo: null
}

TetherComponent.propTypes = {
  attachment: PropTypes.oneOf(attachmentPositions).isRequired,
  children: childrenPropType,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  classes: PropTypes.object,
  constraints: PropTypes.array,
  enabled: PropTypes.bool,
  id: PropTypes.string,
  offset: PropTypes.string,
  optimizations: PropTypes.object,
  renderElementTag: PropTypes.string,
  renderElementTo: PropTypes.any,
  style: PropTypes.object,
  targetAttachment: PropTypes.oneOf(attachmentPositions),
  targetModifier: PropTypes.string,
  targetOffset: PropTypes.string
}

export default TetherComponent
