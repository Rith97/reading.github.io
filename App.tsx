import React, { useState, useCallback, useEffect } from 'react';
import { AppView, TestScore, EvaluatedWord } from './types';
import PassageSetup from './components/PassageSetup';
import ReadingTest from './components/ReadingTest';
import ResultsScreen from './components/ResultsScreen';
import CustomAlert from './components/CustomAlert';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SETUP);
  const [passage, setPassage] = useState<string>("The quick brown fox jumps over the lazy dog. Reading and typing accurately are important skills.");
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [score, setScore] = useState<TestScore | null>(null);
  const [finalEvaluatedWords, setFinalEvaluatedWords] = useState<EvaluatedWord[] | null>(null);
  
  const [alertInfo, setAlertInfo] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: "" });
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean | null>(null);

  const handleShowAlert = useCallback((message: string) => {
    setAlertInfo({ isOpen: true, message });
  }, []);

  const handleCloseAlert = useCallback(() => {
    setAlertInfo({ isOpen: false, message: "" });
  }, []);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSpeechSupported(false);
      handleShowAlert("កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រការស្គាល់ការនិយាយទេ។ សូមសាកល្បងជាមួយ Google Chrome។");
    } else {
      setIsSpeechSupported(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleStartTest = useCallback((selectedPassage: string, limitInSeconds?: number) => {
    setPassage(selectedPassage);
    setTimeLimit(limitInSeconds && limitInSeconds > 0 ? limitInSeconds : undefined);
    setCurrentView(AppView.TESTING);
    setScore(null);
    setFinalEvaluatedWords(null);
  }, []);

  const handleTestComplete = useCallback((calculatedScore: TestScore, evaluatedWords: EvaluatedWord[]) => {
    setScore(calculatedScore);
    setFinalEvaluatedWords(evaluatedWords);
    setCurrentView(AppView.RESULTS);
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentView(AppView.SETUP);
    // Optionally reset timeLimit here if desired, or let PassageSetup repopulate it
    // setTimeLimit(undefined); 
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        {currentView === AppView.SETUP && (
          <PassageSetup 
            onStartTest={handleStartTest} 
            initialPassage={passage}
            initialTimeLimit={timeLimit}
            isSpeechSupported={isSpeechSupported}
          />
        )}
        {currentView === AppView.TESTING && isSpeechSupported === true && (
          <ReadingTest
            passageToRead={passage}
            timeLimitInSeconds={timeLimit}
            onTestComplete={handleTestComplete}
            onShowAlert={handleShowAlert}
            key={`${passage}-${timeLimit ?? 'no-limit'}`} 
          />
        )}
        {currentView === AppView.RESULTS && score && finalEvaluatedWords && (
          <ResultsScreen
            score={score}
            evaluatedWords={finalEvaluatedWords}
            onRestart={handleRestart}
          />
        )}
        {(isSpeechSupported === false && (currentView === AppView.TESTING || currentView === AppView.SETUP && isSpeechSupported !== null )) && (
           <div className="text-center text-red-500 py-10">
             <p className="font-koulen text-xl mb-4">ការស្គាល់ការនិយាយមិនត្រូវបានគាំទ្រ ឬមិនត្រូវបានអនុញ្ញាតទេ។</p>
             { currentView === AppView.TESTING && 
                <button 
                  onClick={handleRestart}
                  className="mt-4 bg-blue-600 text-white font-koulen py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  ត្រលប់ទៅការរៀបចំ
                </button>
             }
           </div>
        )}
      </div>
      <CustomAlert
        isOpen={alertInfo.isOpen}
        message={alertInfo.message}
        onClose={handleCloseAlert}
      />
    </div>
  );
};

export default App;