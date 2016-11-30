'use strict'

const React = require('react')
const classNames = require('classnames')

const NativeEventsBlocker = require('../components/fake-ui-lib/nativeEventsBlocker')
const Tooltip = require('../components/fake-ui-lib/tooltip')
const boolean = require('./boolean/booleanRenderer')
const number = require('./number/numberRenderer')
const richtext = require('./richtext/richtextRenderer')
const datetime = require('./datetime/datetimeRenderer')
const text = require('./text/textRenderer')
const image = require('./image/imageRenderer')
const json = require('./json/jsonRenderer')
const styles = require('./rendererContainer.scss')

const DEFAULT_RENDERER_TYPE = 'text'

const renderers = {
  boolean,
  number,
  richtext,
  datetime,
  text,
  image,
  json
}

const TOOLTIP_EVENTS_TO_BLOCK = ['mousedown', 'dblclick']

const RendererContainer = ({
  rendererType,
  value,
  startEditingWithCustomParams,
  startEditingWithCorrectType,
  parentNode,
  subscribeOnCellsFocused,
  unsubscribeOnCellsFocused,
  context,
  isValueTypeValid,
  fieldType,
  serverValidationError
}) => {
  const Component = renderers[rendererType] || renderers[DEFAULT_RENDERER_TYPE]
  const rendererTypeClass = rendererType + 'Container'
  return (
    <div>
      <div className={classNames(styles.innerContainer, styles[rendererTypeClass])}>
        <Component
          value={value}
          startEditingWithCustomParams={startEditingWithCustomParams}
          parent={parentNode}
          subscribeOnCellsFocused={subscribeOnCellsFocused}
          unsubscribeOnCellsFocused={unsubscribeOnCellsFocused}
          mediaManagerSupport={context.services.mediaManagerSupport}
        />
      </div>
      {!isValueTypeValid || serverValidationError ?
        <NativeEventsBlocker events={TOOLTIP_EVENTS_TO_BLOCK}>
          <Tooltip
            text={serverValidationError || 'Cell type is invalid.'}
            showButton={!serverValidationError}
            buttonText={`Change to ${fieldType}`}
            onButtonClick={startEditingWithCorrectType} />
        </NativeEventsBlocker> : null
      }
    </div>
  )
}

module.exports = RendererContainer
