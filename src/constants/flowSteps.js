import Landing from '../components/screens/Landing';
import MainMenu from '../components/screens/MainMenu';
import StartConfig from '../components/screens/StartConfig';
import FighterSelect from '../components/screens/FighterSelect';
import StageSelect from '../components/screens/StageSelect';
import MatchPreview from '../components/screens/MatchPreview';

export const FLOW_STEPS = [
  { id: 'Landing', component: Landing },
  { id: 'MainMenu', component: MainMenu },
  { id: 'Start_Config', component: StartConfig },
  { id: 'Start_Fighter', component: FighterSelect },
  { id: 'Start_Stage', component: StageSelect },
  { id: 'Start_Preview', component: MatchPreview },
];

export default FLOW_STEPS;
