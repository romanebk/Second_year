import React from 'react';
// Import direct du fichier réel (avec extension) pour échapper à l'alias Metro
// qui redirige 'react-native-vector-icons/FontAwesome6' vers ce wrapper.
import RealFA6 from 'react-native-vector-icons/FontAwesome6.js';

// La police FA6 Free "Regular" ne contient que ~160 glyphes : une icône
// solid-only rendue sans la prop `solid` disparaît sur Android. Ce wrapper
// choisit automatiquement le bon style quand aucun n'est précisé.
const meta = require('react-native-vector-icons/glyphmaps/FontAwesome6Free_meta.json');
const regularSet = new Set<string>(meta.regular);
const brandsSet = new Set<string>(meta.brands);

type Props = {
  name: string;
  solid?: boolean;
  regular?: boolean;
  brand?: boolean;
  [key: string]: any;
};

function FA6AutoIcon({ name, solid, regular, brand, ...rest }: Props) {
  if (solid === undefined && regular === undefined && brand === undefined) {
    if (brandsSet.has(name)) {
      return <RealFA6 name={name} brand {...rest} />;
    }
    if (!regularSet.has(name)) {
      return <RealFA6 name={name} solid {...rest} />;
    }
    return <RealFA6 name={name} {...rest} />;
  }
  // `solid={false}` (ex. toggles) : retomber sur regular seulement s'il existe
  if (solid === false && !regular && !brand && !regularSet.has(name)) {
    return <RealFA6 name={name} solid {...rest} />;
  }
  return <RealFA6 name={name} solid={solid} regular={regular} brand={brand} {...rest} />;
}

// Conserver les méthodes statiques (getImageSource, etc.)
Object.assign(FA6AutoIcon, RealFA6);

export default FA6AutoIcon;
