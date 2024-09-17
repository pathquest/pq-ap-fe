export default {
    control: {
      backgroundColor: '#fff',
      fontSize: 14,
      fontWeight: 'normal',
    },
  
    '&multiLine': {
      control: {
        // fontFamily: 'monospace',
        // minHeight: 63,
      },
      highlighter: {
        padding: 9,
        overflow: 'hidden',
        height: 100,
        border: '1px solid transparent',
      },
      input: {
        overflow: 'auto',
        padding: 9,
        border: '1px solid silver',
      },
    },
  
    '&singleLine': {
      display: 'inline-block',
      width: 180,
  
      highlighter: {
        overflow: 'hidden',
        height: 100,
        padding: 1,
        border: '2px inset transparent',
      },
      input: {
        overflow: 'auto',
        padding: 1,
        border: '2px inset',
      },
    },
  
    suggestions: {
      list: {
        backgroundColor: 'white',
        border: '1px solid rgba(0,0,0,0.15)',
        fontSize: 14,
        position: 'absolute',
        bottom: '18px',
        width: 'max-content',
      },
      item: {
        padding: '5px 15px',
        borderBottom: '1px solid rgba(0,0,0,0.15)',
        '&focused': {
          backgroundColor: '#cee4e5',
        },
      },
    },
  }