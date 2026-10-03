import React from 'react';

// Remplacement web de react-native-webview : rend une iframe.
type Props = {
  source?: { uri?: string; html?: string };
  style?: any;
  [key: string]: any;
};

export function WebView({ source, style }: Props) {
  return (
    <iframe
      src={source?.uri}
      srcDoc={source?.html}
      style={{ border: 0, width: '100%', height: '100%', flex: 1, ...style }}
      allow="payment"
    />
  );
}

export default WebView;
