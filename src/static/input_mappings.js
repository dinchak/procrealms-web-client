export function resetInputMappings () {
  return [
    {
      label: 'Move Forward',
      event: 'moveForward',
      inBattle: true,
      bindings: [{
        keyCode: 'Numpad6',
        modes: ['hotkey', 'input'],
      }, {
        keyCode: 'ArrowRight',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Move Backward',
      event: 'moveBackward',
      inBattle: true,
      bindings: [{
        keyCode: 'Numpad4',
        modes: ['hotkey', 'input'],
      }, {
        keyCode: 'ArrowLeft',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Move North',
      event: 'moveNorth',
      bindings: [{
        keyCode: 'Numpad8',
        modes: ['hotkey', 'input'],
      }, {
        keyCode: 'KeyW',
        modes: ['hotkey'],
      }, {
        keyCode: 'ArrowUp',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Move South',
      event: 'moveSouth',
      bindings: [{
        keyCode: 'Numpad2',
        modes: ['hotkey', 'input'],
      }, {
        keyCode: 'KeyS',
        modes: ['hotkey'],
      }, {
        keyCode: 'ArrowDown',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Move East',
      event: 'moveEast',
      bindings: [{
        keyCode: 'Numpad6',
        modes: ['hotkey', 'input'],
      }, {
        keyCode: 'KeyD',
        modes: ['hotkey'],
      }, {
        keyCode: 'ArrowRight',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Move West',
      event: 'moveWest',
      bindings: [{
        keyCode: 'Numpad4',
        modes: ['hotkey', 'input'],
      }, {
        keyCode: 'KeyA',
        modes: ['hotkey'],
      }, {
        keyCode: 'ArrowLeft',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Move Northeast',
      event: 'moveNorthEast',
      bindings: [{
        keyCode: 'Numpad9',
        modes: ['hotkey', 'input'],
      }, {
        keyCode: 'KeyE',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Move Northwest',
      event: 'moveNorthWest',
      bindings: [{
        keyCode: 'Numpad7',
        modes: ['hotkey', 'input'],
      }, {
        keyCode: 'KeyQ',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Move Southeast',
      event: 'moveSouthEast',
      bindings: [{
        keyCode: 'Numpad3',
        modes: ['hotkey', 'input'],
      }, {
        keyCode: 'KeyC',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Move Southwest',
      event: 'moveSouthWest',
      bindings: [{
        keyCode: 'Numpad1',
        modes: ['hotkey', 'input'],
      }, {
        keyCode: 'KeyZ',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Enter',
      event: 'enter',
      bindings: [{
        keyCode: 'Numpad5',
        modes: ['hotkey', 'input'],
      }, {
        keyCode: 'KeyX',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Toggle Collapsible Menu',
      event: 'toggleCollapsibleMenu',
      bindings: [{
        keyCode: 'Space',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Focus Text Input',
      event: 'focusTextInput',
      bindings: [{
        keyCode: 'Slash',
        modes: ['hotkey', 'modal'],
      }, {
        keyCode: 'Enter',
        modes: ['hotkey', 'modal'],
      }],
    },

    {
      label: 'Blur Text Input',
      event: 'blurTextInput',
      bindings: [{
        keyCode: 'Escape',
        modes: ['input', 'modal-input'],
      }],
    },

    {
      label: 'Send Command',
      event: 'sendCommand',
      bindings: [{
        keyCode: 'Enter',
        modes: ['input', 'modal-input'],
      }, {
        keyCode: 'Enter',
        shift: true,
        modes: ['input', 'modal-input'],
      }, {
        keyCode: 'Return',
        modes: ['input', 'modal-input'],
      }, {
        keyCode: 'Return',
        shift: true,
        modes: ['input', 'modal-input'],
      }],
    },

    {
      label: 'Previous Command',
      event: 'prevCommand',
      bindings: [{
        keyCode: 'ArrowUp',
        modes: ['input', 'modal-input'],
      }],
    },

    {
      label: 'Next Command',
      event: 'nextCommand',
      bindings: [{
        keyCode: 'ArrowDown',
        modes: ['input', 'modal-input'],
      }],
    },

    {
      label: 'Page Up',
      event: 'pageUp',
      bindings: [{
        keyCode: 'PageUp',
        modes: ['hotkey', 'input', 'modal-input'],
      }, {
        gamepadButton: 12,
        modes: ['hotkey', 'input', 'modal-input'],
      }],
    },

    {
      label: 'Page Down',
      event: 'pageDown',
      bindings: [{
        keyCode: 'PageDown',
        modes: ['hotkey', 'input', 'modal-input'],
      }, {
        gamepadButton: 13,
        modes: ['hotkey', 'input', 'modal-input'],
      }],
    },

    {
      label: 'Scroll Down',
      event: 'scrollDown',
      bindings: [{
        keyCode: 'End',
        modes: ['hotkey'],
      }, {
        gamepadButton: 15,
        modes: ['hotkey', 'input', 'modal-input'],
      }],
    },

    {
      label: 'Open Help Modal',
      event: 'openHelpModal',
      bindings: [{
        keyCode: 'Slash',
        shift: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Show Debug',
      event: 'showDebug',
      bindings: [{
        keyCode: 'Backquote',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot 1',
      event: 'quickSlot1',
      bindings: [{
        keyCode: 'Digit1',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot 2',
      event: 'quickSlot2',
      bindings: [{
        keyCode: 'Digit2',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot 3',
      event: 'quickSlot3',
      bindings: [{
        keyCode: 'Digit3',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot 4',
      event: 'quickSlot4',
      bindings: [{
        keyCode: 'Digit4',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot 5',
      event: 'quickSlot5',
      bindings: [{
        keyCode: 'Digit5',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot 6',
      event: 'quickSlot6',
      bindings: [{
        keyCode: 'Digit6',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot 7',
      event: 'quickSlot7',
      bindings: [{
        keyCode: 'Digit7',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot 8',
      event: 'quickSlot8',
      bindings: [{
        keyCode: 'Digit8',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot 9',
      event: 'quickSlot9',
      bindings: [{
        keyCode: 'Digit9',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot 0',
      event: 'quickSlot0',
      bindings: [{
        keyCode: 'Digit0',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot -',
      event: 'quickSlotMinus',
      bindings: [{
        keyCode: 'Minus',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot =',
      event: 'quickSlotEqual',
      bindings: [{
        keyCode: 'Equal',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Ctrl+1',
      event: 'quickSlotCtrl1',
      bindings: [{
        keyCode: 'Digit1',
        ctrl: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Ctrl+2',
      event: 'quickSlotCtrl2',
      bindings: [{
        keyCode: 'Digit2',
        ctrl: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Ctrl+3',
      event: 'quickSlotCtrl3',
      bindings: [{
        keyCode: 'Digit3',
        ctrl: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Ctrl+4',
      event: 'quickSlotCtrl4',
      bindings: [{
        keyCode: 'Digit4',
        ctrl: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Ctrl+5',
      event: 'quickSlotCtrl5',
      bindings: [{
        keyCode: 'Digit5',
        ctrl: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Ctrl+6',
      event: 'quickSlotCtrl6',
      bindings: [{
        keyCode: 'Digit6',
        ctrl: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Ctrl+7',
      event: 'quickSlotCtrl7',
      bindings: [{
        keyCode: 'Digit7',
        ctrl: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Ctrl+8',
      event: 'quickSlotCtrl8',
      bindings: [{
        keyCode: 'Digit8',
        ctrl: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Ctrl+9',
      event: 'quickSlotCtrl9',
      bindings: [{
        keyCode: 'Digit9',
        ctrl: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Ctrl+0',
      event: 'quickSlotCtrl0',
      bindings: [{
        keyCode: 'Digit0',
        ctrl: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Ctrl+-',
      event: 'quickSlotCtrlMinus',
      bindings: [{
        keyCode: 'Minus',
        ctrl: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Ctrl+=',
      event: 'quickSlotCtrlEqual',
      bindings: [{
        keyCode: 'Equal',
        ctrl: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Alt+1',
      event: 'quickSlotAlt1',
      bindings: [{
        keyCode: 'Digit1',
        alt: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Alt+2',
      event: 'quickSlotAlt2',
      bindings: [{
        keyCode: 'Digit2',
        alt: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Alt+3',
      event: 'quickSlotAlt3',
      bindings: [{
        keyCode: 'Digit3',
        alt: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Alt+4',
      event: 'quickSlotAlt4',
      bindings: [{
        keyCode: 'Digit4',
        alt: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Alt+5',
      event: 'quickSlotAlt5',
      bindings: [{
        keyCode: 'Digit5',
        alt: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Alt+6',
      event: 'quickSlotAlt6',
      bindings: [{
        keyCode: 'Digit6',
        alt: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Alt+7',
      event: 'quickSlotAlt7',
      bindings: [{
        keyCode: 'Digit7',
        alt: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Alt+8',
      event: 'quickSlotAlt8',
      bindings: [{
        keyCode: 'Digit8',
        alt: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Alt+9',
      event: 'quickSlotAlt9',
      bindings: [{
        keyCode: 'Digit9',
        alt: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Alt+0',
      event: 'quickSlotAlt0',
      bindings: [{
        keyCode: 'Digit0',
        alt: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Alt+-',
      event: 'quickSlotAltMinus',
      bindings: [{
        keyCode: 'Minus',
        alt: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Quick Slot Alt+=',
      event: 'quickSlotAltEqual',
      bindings: [{
        keyCode: 'Equal',
        alt: true,
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Show Side Map',
      event: 'showSideMap',
      bindings: [{
        keyCode: 'KeyM',
        modes: ['hotkey'],
      }],
    },

    {
      label: 'Attack',
      event: 'attack',
      inBattle: true,
      bindings: [{
        keyCode: 'KeyA',
        modes: ['hotkey'],
      }, {
        gamepadButton: 2,
        modes: ['hotkey', 'input'],
      }],
    },

    {
      label: 'Defend',
      event: 'defend',
      inBattle: true,
      bindings: [{
        keyCode: 'KeyD',
        modes: ['hotkey'],
      }, {
        gamepadButton: 3,
        modes: ['hotkey', 'input'],
      }],
    },

    {
      label: 'Flee',
      event: 'flee',
      inBattle: true,
      bindings: [{
        keyCode: 'KeyF',
        modes: ['hotkey'],
      }, {
        gamepadButton: 1,
        modes: ['hotkey', 'input'],
      }],
    },

    {
      label: 'Battle',
      event: 'battle',
      inBattle: false,
      bindings: [{
        keyCode: 'KeyB',
        modes: ['hotkey'],
      }, {
        gamepadButton: 2,
        modes: ['hotkey', 'input'],
      }],
    },

    {
      label: 'Harvest',
      event: 'harvest',
      inBattle: false,
      bindings: [{
        keyCode: 'KeyH',
        modes: ['hotkey'],
      }, {
        gamepadButton: 3,
        modes: ['hotkey', 'input'],
      }],
    },

    {
      label: 'Loot',
      event: 'loot',
      inBattle: false,
      bindings: [{
        keyCode: 'KeyL',
        modes: ['hotkey'],
      }, {
        gamepadButton: 1,
        modes: ['hotkey', 'input'],
      }],
    },

    {
      label: 'Close Modal',
      event: 'closeModal',
      bindings: [{
        keyCode: 'Escape',
        modes: ['modal'],
      }, {
        gamepadButton: 1,
        modes: ['modal'],
      }],
    },

    {
      label: 'Open Game Modal',
      event: 'openGameModal',
      bindings: [{
        keyCode: 'Escape',
        modes: ['hotkey'],
      }, {
        gamepadButton: 9,
        modes: ['hotkey', 'input'],
      }],
    },

    {
      label: 'Previous Modal Tab',
      event: 'prevModalTab',
      bindings: [{
        keyCode: 'ArrowLeft',
        modes: ['modal', 'modal-input'],
      }, {
        gamepadButton: 4,
        modes: ['modal', 'modal-input'],
      }],
    },

    {
      label: 'Next Modal Tab',
      event: 'nextModalTab',
      bindings: [{
        keyCode: 'ArrowRight',
        modes: ['modal', 'modal-input'],
      }, {
        gamepadButton: 5,
        modes: ['modal', 'modal-input'],
      }],
    },

    {
      label: 'Open Radial Menu',
      event: 'openRadialMenu',
      bindings: [{
        gamepadButton: 4,
        modes: ['hotkey', 'input'],
      }, {
        gamepadButton: 5,
        modes: ['hotkey', 'input'],
      }],
    },

    {
      label: 'Close Radial Menu',
      event: 'closeRadialMenu',
      bindings: [{
        gamepadButtonReleased: 1,
        modes: ['radial'],
      }],
    },

    {
      label: 'Select Radial Item',
      event: 'selectRadialItem',
      type: 'degree',
      bindings: [{
        gamepadAxis: 'left',
        modes: ['radial'],
      }],
    },

    {
      label: 'Perform Radial Action',
      event: 'performRadialAction',
      bindings: [{
        gamepadButton: 0,
        modes: ['radial'],
      }],
    },

    {
      label: 'Select Prev Radial Menu',
      event: 'selectPrevRadialMenu',
      bindings: [{
        gamepadButton: 4,
        modes: ['radial'],
      }],
    },

    {
      label: 'Select Next Radial Menu',
      event: 'selectNextRadialMenu',
      bindings: [{
        gamepadButton: 5,
        modes: ['radial'],
      }],
    },

    {
      label: 'Select Movement Direction',
      event: 'selectMovementDirection',
      type: 'degree',
      inBattle: false,
      bindings: [{
        gamepadAxis: 'left',
        modes: ['hotkey', 'input'],
      }],
    },

    {
      label: 'Move In Selected Direction',
      event: 'moveInSelectedDirection',
      inBattle: false,
      bindings: [{
        gamepadButton: 0,
        modes: ['hotkey', 'input'],
      }],
    },

    {
      label: 'Select Login Action',
      event: 'selectLoginAction',
      type: 'degree',
      bindings: [{
        gamepadAxis: 'left',
        modes: ['login'],
      }],
    },

    {
      label: 'Perform Login Action',
      event: 'performLoginAction',
      bindings: [{
        gamepadButton: 0,
        modes: ['login'],
      }],
    },

    {
      label: 'Select Modal Action',
      event: 'selectModalAction',
      type: 'degree',
      bindings: [{
        gamepadAxis: 'left',
        modes: ['modal', 'modal-input'],
      }],
    },

    {
      label: 'Perform Modal Action',
      event: 'performModalAction',
      bindings: [{
        gamepadButton: 0,
        modes: ['modal', 'modal-input'],
      }],
    },

    {
      label: 'Select Battle Action',
      event: 'selectBattleAction',
      type: 'degree',
      inBattle: true,
      bindings: [{
        gamepadAxis: 'left',
        modes: ['hotkey', 'input'],
      }],
    },

    {
      label: 'Perform Battle Action',
      event: 'performBattleAction',
      inBattle: true,
      bindings: [{
        gamepadButton: 0,
        modes: ['hotkey', 'input'],
      }],
    },
  ]
}
