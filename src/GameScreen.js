import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, useWindowDimensions, ImageBackground } from 'react-native';
import { PanResponder, Animated } from 'react-native';
import { ActivityIndicator } from 'react-native'; //로딩

const GRID_WIDTH = 10;
const GRID_HEIGHT = 17;
const GAME_DURATION = 120; // 2분 = 120초

const GameScreen = ({ onGoToTitle }) => {
  const { width: windowWidth } = useWindowDimensions(); // 윈도우 너비 가져오기
  const CELL_SIZE = windowWidth / GRID_WIDTH; // 컴포넌트 내부에서 CELL_SIZE 계산

  const [grid, setGrid] = useState([]);
  const gridRef = useRef([]); // grid 상태를 useRef로도 관리
  const [score, setScore] = useState(0);
  const [selectedCells, setSelectedCells] = useState([]); // 드래그로 선택된 셀들
  const gridContainerRef = useRef(null); // 그리드 컨테이너 참조
  const gridContainerLayoutRef = useRef(null); 

  const [timer, setTimer] = useState(GAME_DURATION); // 타이머 상태 (초)
  const [gameOver, setGameOver] = useState(false); // 게임 오버 상태
  const [loading, setLoading] = useState(true); //로딩

  // 그리드 초기화 함수
  const initializeGrid = () => {
  console.log('Initializing fixed grid...');
  const newGrid = Array.from({ length: GRID_HEIGHT }, () =>
    Array.from({ length: GRID_WIDTH }, () => Math.floor(Math.random() * 9) + 1)
  );
  setGrid(newGrid);
  gridRef.current = newGrid;
  console.log('Fixed Grid initialized:', newGrid);
  setLoading(false); // ✅ 로딩 완료
};


  // 게임 재시작 함수
  const handleRestart = () => {
    console.log('Restarting game...');
    setGameOver(false);
    setScore(0);
    setTimer(GAME_DURATION);
    initializeGrid(); // 그리드 초기화
  };

  // 게임 종료 (타이틀로 이동)
  const handleGoToTitleFromGame = () => {
    console.log('Going to title screen from game over panel...');
    onGoToTitle(); // App.js에서 전달받은 함수 호출
  };

  useEffect(() => {
    initializeGrid();
  }, []);

  // grid 상태가 변경될 때마다 gridRef.current 업데이트
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  // 타이머 로직
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setGameOver(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver]);

  // 타이머 표시 형식 (분:초)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 드래그 로직 (PanResponder)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        if (gameOver) return false; 
        console.log('onStartShouldSetPanResponder: true');
        return true;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (gameOver) return false;
        console.log('onMoveShouldSetPanResponder: true');
        return true;
      },
      onPanResponderGrant: (evt, gestureState) => {
        if (gameOver) return;
        console.log('PanResponderGrant: Drag started. gestureState:', gestureState);
        setSelectedCells([]); // 드래그 시작 시 선택된 셀 초기화
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gameOver || !gridContainerLayoutRef.current) {
          return; // 게임 오버 상태거나 레이아웃 정보 없으면 처리 안함
        }

        // 그리드 컨테이너 내부에서의 상대 좌표 계산
        const relativeX0 = gestureState.x0 - gridContainerLayoutRef.current.x;
        const relativeY0 = gestureState.y0 - gridContainerLayoutRef.current.y;
        const relativeMoveX = gestureState.moveX - gridContainerLayoutRef.current.x;
        const relativeMoveY = gestureState.moveY - gridContainerLayoutRef.current.y;

        const startCol = Math.floor(relativeX0 / CELL_SIZE);
        const startRow = Math.floor(relativeY0 / CELL_SIZE);
        const endCol = Math.floor(relativeMoveX / CELL_SIZE);
        const endRow = Math.floor(relativeMoveY / CELL_SIZE);

        const minCol = Math.max(0, Math.min(startCol, endCol));
        const maxCol = Math.min(GRID_WIDTH - 1, Math.max(startCol, endCol));
        const minRow = Math.max(0, Math.min(startRow, endRow));
        const maxRow = Math.min(GRID_HEIGHT - 1, Math.max(startRow, endRow));

        const currentSelectedForVisual = []; // 시각적 피드백을 위한 선택된 셀
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            // 그리드 범위 내의 유효한 셀만 추가
            if (r >= 0 && r < GRID_HEIGHT && c >= 0 && c < GRID_WIDTH) {
              currentSelectedForVisual.push({ x: c, y: r });
            }
          }
        }
        setSelectedCells(currentSelectedForVisual); // 시각적 피드백을 위해 상태 업데이트
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gameOver) return;
        console.log('PanResponderRelease: Drag ended. gestureState:', gestureState);
        
        if (!gridContainerLayoutRef.current) {
            console.log('PanResponderRelease: gridContainerLayoutRef.current is null, cannot process release.');
            setSelectedCells([]);
            return;
        }

        // onPanResponderRelease에서 최종 드래그 좌표를 사용하여 selectedCells 다시 계산
        const relativeX0 = gestureState.x0 - gridContainerLayoutRef.current.x;
        const relativeY0 = gestureState.y0 - gridContainerLayoutRef.current.y;
        const relativeMoveX = gestureState.moveX - gridContainerLayoutRef.current.x;
        const relativeMoveY = gestureState.moveY - gridContainerLayoutRef.current.y;

        const startCol = Math.floor(relativeX0 / CELL_SIZE);
        const startRow = Math.floor(relativeY0 / CELL_SIZE);
        const endCol = Math.floor(relativeMoveX / CELL_SIZE);
        const endRow = Math.floor(relativeMoveY / CELL_SIZE);

        const minCol = Math.max(0, Math.min(startCol, endCol));
        const maxCol = Math.min(GRID_WIDTH - 1, Math.max(startCol, endCol));
        const minRow = Math.max(0, Math.min(startRow, endRow));
        const maxRow = Math.min(GRID_HEIGHT - 1, Math.max(startRow, endRow));

        const finalSelectedCells = []; // 실제 게임 로직에 사용할 최종 선택된 셀
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            if (r >= 0 && r < GRID_HEIGHT && c >= 0 && c < GRID_WIDTH) {
              finalSelectedCells.push({ x: c, y: r });
            }
          }
        }
        console.log('Final selected cells for logic:', finalSelectedCells); // 최종 선택된 셀 확인

        if (finalSelectedCells.length > 0) {
          let sum = 0;
          console.log('Current grid state before sum calculation:', JSON.stringify(gridRef.current)); 
          finalSelectedCells.forEach(cell => {
            console.log(`Processing cell: {x: ${cell.x}, y: ${cell.y}}`);
            const row = gridRef.current[cell.y]; 
            if (row) {
                const cellValue = row[cell.x];
                console.log(`Row ${cell.y} exists. Value at grid[${cell.y}][${cell.x}]: ${cellValue}, type: ${typeof cellValue}`);
                if (typeof cellValue === 'number' && cellValue > 0) { 
                    sum += cellValue;
                    console.log(`Adding cell [${cell.y}][${cell.x}] value: ${cellValue}, current sum: ${sum}`);
                } else if (cellValue === 0) {
                    console.log(`Skipping empty cell at [${cell.y}][${cell.x}]`);
                } else {
                    console.warn('Unexpected cell value encountered:', cellValue, 'at', cell);
                }
            } else {
                console.warn('Row undefined for cell:', cell);
            }
          });
          console.log('Calculated sum:', sum);

          if (sum === 10) {
            console.log('Sum is 10! Removing apples...');
            let newGrid = gridRef.current.map(row => [...row]); 
            let applesRemoved = 0;
            finalSelectedCells.forEach(cell => {
              if (newGrid[cell.y] && newGrid[cell.y][cell.x] !== 0) { 
                newGrid[cell.y][cell.x] = 0; // 사과 제거 (0으로 설정)
                applesRemoved++;
                console.log(`Removed apple at [${cell.y}][${cell.x}]`);
              }
            });
            console.log('Grid state after removal (showing 0s):', JSON.stringify(newGrid));
            setScore(prevScore => prevScore + applesRemoved);
            console.log('New score:', score + applesRemoved);
            setGrid(newGrid); // 그리드 상태 업데이트
            
          } else {
            console.log('Sum is not 10. Sum:', sum);
          }
        }
        setSelectedCells([]); // 선택된 셀 초기화 (시각적 피드백 제거)
      },
    })
  ).current;


return (
  <View style={styles.container}>
    {/* ✅ 로딩 스피너 조건부 렌더링 */}
    {loading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>게임 불러오는 중...</Text>
      </View>
    ) : (
      <>
        {/* 기존 게임 화면 구성요소들 */}
        <View style={styles.topButtonsContainer}>
          <TouchableOpacity style={styles.topButton} onPress={handleGoToTitleFromGame}>
            <Text style={styles.topButtonText}>뒤로가기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topButton} onPress={handleRestart}>
            <Text style={styles.topButtonText}>재시작</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>

        <Text style={styles.scoreText}>Score: {score}</Text>
        
        <View
          ref={gridContainerRef}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            gridContainerLayoutRef.current = layout;
          }}
          style={styles.gridContainer}
          {...panResponder.panHandlers}
        >
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => {
                const isSelected = selectedCells.some(
                  (selected) => selected.x === colIndex && selected.y === rowIndex
                );
                return (
                  <View
                    key={`${rowIndex}-${colIndex}`}
                    style={[
                      styles.cell,
                      { width: CELL_SIZE, height: CELL_SIZE },
                      isSelected && styles.selectedCell,
                    ]}
                  >
                    {cell > 0 && (
                      <ImageBackground
                        source={require('./assets/images/grid.png')}
                        style={styles.cellImage}
                      >
                        <Text style={styles.appleText}>{cell}</Text>
                      </ImageBackground>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* 게임 오버 오버레이 */}
        {gameOver && (
          <View style={styles.gameOverOverlay}>
            <View style={styles.gameOverPanel}>
              <Text style={styles.gameOverText}>Game Over!</Text>
              <Text style={styles.finalScoreText}>Final Score: {score}</Text>
              <TouchableOpacity style={styles.button} onPress={handleRestart}>
                <Text style={styles.buttonText}>재시작</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleGoToTitleFromGame}>
                <Text style={styles.buttonText}>타이틀</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </>
    )}
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
  timerContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#333',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  timerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedCell: {
    backgroundColor: 'rgba(0, 255, 0, 0.3)', // 선택된 셀 배경색
  },
  appleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cellImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // 반투명 검은색 오버레이
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverPanel: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  finalScoreText: {
    fontSize: 24,
    marginBottom: 20,
    color: '#555',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  topButtonsContainer: {
  position: 'absolute',
  top: 20,
  left: 20,
  flexDirection: 'row',
  gap: 10,
  zIndex: 1000,
},
topButton: {
  backgroundColor: '#333',
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 6,
  marginRight: 10,
},
topButtonText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: 'bold',
},
loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f0f0f0',
},
loadingText: {
  marginTop: 10,
  fontSize: 18,
  color: '#333',
},
});

export default GameScreen;