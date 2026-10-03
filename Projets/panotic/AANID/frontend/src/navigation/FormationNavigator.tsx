import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Formations from '@aanid/beni-momo-adnan-frontend/src/screens/Formations';
import FormationDetail from '@aanid/beni-momo-adnan-frontend/src/screens/FormationDetail';
import CoursePlayer from '@aanid/beni-momo-adnan-frontend/src/screens/CoursePlayer';
import MesFormations from '@aanid/beni-momo-adnan-frontend/src/screens/MesFormations';
import PaiementMobile from '@aanid/beni-momo-adnan-frontend/src/screens/PaiementMobile';

const Stack = createNativeStackNavigator();

export default function FormationNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, freezeOnBlur: true }}>
      <Stack.Screen name="Formations" component={Formations} />
      <Stack.Screen name="FormationDetail" component={FormationDetail} />
      <Stack.Screen name="CoursePlayer" component={CoursePlayer} />
      <Stack.Screen name="MesFormations" component={MesFormations} />
      <Stack.Screen name="PaiementMobile" component={PaiementMobile} />
    </Stack.Navigator>
  );
}
