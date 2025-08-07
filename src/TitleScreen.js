import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';

const TitleScreen = ({ onStartGame, onExitGame }) => {
  const [showRules, setShowRules] = useState(false);

  const gameRules = `
  [게임 규칙]

  1. 게임 목표: 10x17 그리드에 있는 숫자 사과들을 드래그하여 합이 10이 되도록 만들고 제거하여 가장 높은 점수를 얻는 게임입니다.

  2. 게임 시작: "게임 시작" 버튼을 누르면 2분 타이머가 시작됩니다.

  3. 사과 제거:
     - 화면에 1부터 9까지의 숫자가 적힌 사과들이 그리드에 배치됩니다.
     - 마우스(또는 터치)로 드래그하여 직사각형 영역을 선택합니다.
     - 선택된 직사각형 안의 모든 사과 숫자의 합이 정확히 10이 되면, 해당 사과들은 그리드에서 제거되고 빈 공간으로 남습니다.
     - 제거된 사과의 개수만큼 점수가 올라갑니다.

  4. 보드 고정: 사과가 제거되어도 중력 효과나 새로운 사과 생성은 없습니다. 숫자의 위치는 게임 시작 시 고정되며, 제거된 칸은 계속 비어있습니다.

  5. 게임 종료:
     - 2분 타이머가 0이 되면 게임이 종료됩니다.
     - 게임 오버 패널이 나타나 최종 점수를 보여주고, 게임을 재시작하거나 타이틀 화면으로 돌아갈 수 있습니다.

  6. 점수: 제거된 사과의 총 개수가 최종 점수가 됩니다.

  최대한 많은 사과를 제거하여 최고 점수를 달성하세요!
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apple Game</Text>

      <TouchableOpacity style={styles.button} onPress={onStartGame}>
        <Text style={styles.buttonText}>게임 시작</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setShowRules(true)}>
        <Text style={styles.buttonText}>게임 규칙</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onExitGame}>
        <Text style={styles.buttonText}>게임 종료</Text>
      </TouchableOpacity>

      {/* 게임 규칙 팝업 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRules}
        onRequestClose={() => setShowRules(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>게임 규칙</Text>
            <ScrollView style={styles.rulesScrollView}>
              <Text style={styles.modalText}>{gameRules}</Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setShowRules(false)}
            >
              <Text style={styles.buttonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 50,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // 반투명 배경
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%', // 팝업 최대 높이
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  rulesScrollView: {
    maxHeight: Dimensions.get('window').height * 0.6, // 화면 높이의 60%
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'left',
    fontSize: 16,
    lineHeight: 24,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
});

export default TitleScreen;
