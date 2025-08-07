import React, { useState } from 'react';
import { BackHandler, Alert, Platform } from 'react-native'; // BackHandler, Platform 추가
import GameScreen from './src/GameScreen';
import TitleScreen from './src/TitleScreen';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('title'); // 'title' 또는 'game'

  const handleStartGame = () => {
    setCurrentScreen('game');
  };

  const handleExitGame = () => {
    // Android에서 앱 종료
    if (Platform.OS === 'android') {
      Alert.alert(
        "앱 종료",
        "정말로 앱을 종료하시겠습니까?",
        [
          {
            text: "취소",
            onPress: () => console.log("앱 종료 취소"),
            style: "cancel"
          },
          {
            text: "종료",
            onPress: () => BackHandler.exitApp()
          }
        ],
        { cancelable: false }
      );
    } else {
      // iOS 또는 다른 플랫폼에서는 타이틀 화면으로 돌아가거나 다른 처리
      console.log("Exit game requested (non-Android). Returning to title screen.");
      setCurrentScreen('title');
    }
  };

  const handleGoToTitle = () => {
    setCurrentScreen('title');
  };

  return (
    <>
      {currentScreen === 'title' ? (
        <TitleScreen onStartGame={handleStartGame} onExitGame={handleExitGame} />
      ) : (
        <GameScreen onGoToTitle={handleGoToTitle} />
      )}
    </>
  );
};

export default App;