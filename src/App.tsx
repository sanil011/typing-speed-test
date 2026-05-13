
import { useEffect, useRef, useState } from 'react'
import useSound from 'use-sound';
import { cn } from './util/helper';
import { RotateCw } from 'lucide-react';
import './App.css'

const TARGET_TEXT = `Technology has changed the way we live, work, and communicate with each other. Every day millions of people use computers and smartphones to connect with friends, family, and colleagues around the world. The internet has made information available to anyone with a connection, allowing students to learn new skills and businesses to reach customers more easily than ever before.

In recent years, artificial intelligence and automation have started transforming industries such as healthcare, education, transportation, and finance.`



const VALID_KEYS = /^[a-zA-Z .,]$/// letters, space, period
const TEST_DURATION = 60;


function App() {
  const divRef = useRef(null);
  const allWords = useRef([]);

  const words = TARGET_TEXT.split("");

  const [timer, setTimer] = useState(TEST_DURATION);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cursorPos, setCursorPos] = useState({ left: 0, top: 0, width: 0 })
  const [typeCount, setTypeCount] = useState(0);
  const [typedChars, setTypedChars] = useState<string[]>([]);


  const [result, setResult] = useState({
    accuracy: 0,
    netWPM: 0,
    grossWPM: 0
  })

  const typedCharsRef = useRef<string[]>([]);

  const [playSpace] = useSound('/space.mp3');
  const [playWrong] = useSound('/wrong-type.mp3');
  const [playCorrect] = useSound('/correct-type.mp3');
  const timerRef = useRef(null);

  const timeCompleted = () => {
    const chars = typedCharsRef.current;

    const correctCount = words.filter(
      (char, index) => char === chars[index]
    ).length;

    const incorrectCount = chars.length - correctCount;

    const minutes = TEST_DURATION / 60;

    const grossWPM = Math.round((chars.length / 5) / minutes);
    const netWPM = Math.max(0, Math.round(grossWPM - (incorrectCount / minutes)));
    const accuracy = Math.round((correctCount / chars.length) * 100) || 0;
    setResult({
      accuracy,
      grossWPM,
      netWPM
    })

    setIsCompleted(true);
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  const startTimer = () => {
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          timeCompleted();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const handleClick = (e: React.KeyboardEvent<HTMLDivElement>) => {

    if (isCompleted) return;

    startTimer()

    if (e.code == 'Backspace') {
      setTypedChars((prev) => {
        const updated = prev.slice(0, -1);
        typedCharsRef.current = updated;
        return updated;
      });
      setTypeCount((prev) => Math.max(0, prev - 1));
      playSpace();
      return;
    }

    if (!VALID_KEYS.test(e.key)) return

    setTypedChars((prev) => {
      const updated = [...prev, e.key];
      typedCharsRef.current = updated;
      return updated;
    });
    const elem = allWords.current[typeCount];
    const keyWord = e.key;

    setTypeCount((prev) => prev + 1);

    if (keyWord == elem?.innerText) {
      elem.classList.remove('text-error');
      elem.classList.add('text-primary');
      if (e.code === 'Space') {
        playSpace();
      } else {
        playCorrect();
      }

    } else {
      elem.classList.remove('text-primary');
      elem.classList.add('text-error');
      playWrong();
    }
  }

  const handleTryAgain = () => {
    setIsCompleted((prev) => !prev);
    setTimer(TEST_DURATION);
    setTypeCount(0);
    setTypedChars([]);
  };


  useEffect(() => {
    const el = allWords.current[typeCount];

    if (!el) return;

    const left = el.offsetLeft;
    const top = el.offsetTop;
    const height = el.offsetHeight;
    const width = el.offsetWidth;

    setCursorPos({
      left,
      top: top + height,
      width,
    });
  }, [typeCount]);


  useEffect(() => {
    if (!isCompleted) {
      divRef.current.focus();
    }
  }, [isCompleted])



  return (
    <div
      ref={divRef}
      tabIndex={0}
      onKeyDown={handleClick}
      className='p-4 h-screen w-screen  outline-none bg-[#1A1A1E] text-[#c1c2c6]'>

      <h1 className='text-center text-2xl'>Practice Mode</h1>

      <div className='w-9/12 mx-auto mt-8 max-w-5xl'>

        {!isCompleted ?
          <div
            className='relative text-2xl leading-[40px]' style={{
              letterSpacing: "2px"
            }}>
            <p className='mb-4'>{timer}</p>
            <div
              className="absolute w-3 h-[2px] bg-white"
              style={{
                top: `${cursorPos.top}px`,
                left: `${cursorPos.left}px`,
                width: `${cursorPos.width}px`,
                animation: 'pulse 1s infinite'
              }}
            ></div>

            {words?.map((word, index) => {
              const typedChar = typedChars[index];

              return (
                <span
                  ref={(i) => {
                    if (i) allWords.current[index] = i;
                  }}
                  key={index}
                  className={cn('opacity-70 transition-all',
                    word == ' ' && "border-r w-10 border-transparent",
                    typedChar != null && typedChar === word && "text-primary",
                    typedChar != null && typedChar !== word && "text-error")}
                  id={`letter-${index}`}>
                  {word}
                </span>
              )
            })}
          </div>
          :
          <div >
            <div className='w-full mt-20'>
              <h1 className='text-lg font-bold mb-10'>Results</h1>

              <div className='flex items-center gap-4 justify-between'>
                <div>
                  <h1 className=''>Gross WPM</h1>
                  <h1 className='text-5xl font-bold'>{result?.grossWPM}</h1>
                </div>
                <div>
                  <h1>Net WPM</h1>
                  <h1 className='text-5xl font-bold'>{result?.netWPM}</h1>
                </div>
                <div>
                  <h1>Accuracy</h1>
                  <h1 className='text-5xl font-bold'>{result?.accuracy}%</h1>
                </div>
                <div>
                  <h1>Keystrokes</h1>
                  <h1 className='text-5xl font-bold'>{typedChars.length}</h1>
                </div>
              </div>

              <div className='flex items-center mt-20'>
                <button
                  onClick={handleTryAgain}
                  className='mx-auto flex items-center gap-2 hover:bg-[#c1c2c6] hover:text-[#1A1A1E] cursor-pointer transition-all  p-1 px-2 text-xs rounded-sm'>
                  <RotateCw size={15} />
                  Try again
                </button>
              </div>
            </div>
          </div>}
      </div>
    </div>
  )
}

export default App
