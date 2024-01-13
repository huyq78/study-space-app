import React from 'react';
import './index.css';
import App from './App';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowRotateRight, faArrowUpFromBracket, faClock, faGear, faListCheck, faMountainSun, faTrash, faUpRightAndDownLeftFromCenter, faVolumeHigh, faVolumeXmark, fas } from '@fortawesome/free-solid-svg-icons'
import { faCalendarCheck, faCirclePlay, faSnowflake, faUser } from '@fortawesome/free-regular-svg-icons';
import { Provider } from 'react-redux';
import { store, persistor } from "./redux/store";
import { PersistGate } from 'redux-persist/integration/react'
import { createRoot } from 'react-dom/client';


library.add(faCalendarCheck, faListCheck, faClock, faMountainSun, faCirclePlay, faArrowUpFromBracket, faVolumeHigh,
  faUpRightAndDownLeftFromCenter, faUser, faVolumeXmark, faTrash, faSnowflake, faArrowRotateRight, faGear)
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);
