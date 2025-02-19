import { useEffect, useRef, useState } from "react";
import themes from "./assets/themes.json";
import common from "./assets/common.json";
import ThemeDialog from "./components/ThemeDialog";

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const getUserTheme = () => localStorage.getItem("theme") || getSystemTheme();

const getUserFont = () => localStorage.getItem("font") || "Ubuntu";

const getUserCount = () => Number(localStorage.getItem("count")) || 50;

function App() {
  const [theme, setTheme] = useState(getUserTheme);
  const [font, setFont] = useState(getUserFont);
  const [words, setWords] = useState([]);
  const [input, setInput] = useState("");
  const [inputs, setInputs] = useState([]);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(getUserCount);
  const [startTime, setStartTime] = useState(null);
  const [accuracy, setAccuracy] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const dialogRef = useRef(null);
  const countRef = useRef(count);

  const { background, header, card, button, text } = themes[theme];

  useEffect(() => {
    generateWords(countRef.current);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("font", font);
    document.documentElement.style.setProperty(
      "--font-primary",
      `"${font}", sans-serif`,
    );
  }, [font]);

  useEffect(() => {
    localStorage.setItem("count", count);
  }, [count]);

  const generateWords = (count) => {
    const newWords = Array.from(
      { length: count },
      () => common.words[Math.floor(Math.random() * common.words.length)],
    );
    setWords(newWords);
  };

  const handleInputChange = (e) => {
    if (!isTestFinished) {
      setInput(e.target.value);
    }
  };

  const handleKeyDown = (e) => {
    if (isTestFinished) return;

    if (!startTime && inputs.length === 0 && e.key !== " ") {
      setStartTime(Date.now());
    }

    switch (e.key) {
      case " ":
        e.preventDefault();

        if (!input) return;

        var currentInputs = [...inputs];
        currentInputs[index] = input;
        setInputs(currentInputs);
        setInput("");
        var newIndex = index + 1;
        setIndex(newIndex);

        if (newIndex === words.length) {
          calculateStats(currentInputs);
        }
        break;

      case "Tab":
        e.preventDefault();
        reset(count);
        break;

      default:
        break;
    }
  };

  const calculateStats = (finalInputs = inputs) => {
    let totalLetters = 0;
    let correctLetters = 0;

    const length = Math.max(words.length, finalInputs.length);

    // Calculate total and correct letters
    for (let i = 0; i < length; i++) {
      const word = words[i] || "";
      const input = finalInputs[i] || "";

      totalLetters += Math.max(word.length, input.length);

      for (let j = 0; j < Math.min(word.length, input.length); j++) {
        if (word[j] === input[j]) {
          correctLetters++;
        }
      }
    }

    const accuracyValue =
      totalLetters > 0 ? Math.round((correctLetters / totalLetters) * 100) : 0;
    setAccuracy(accuracyValue);

    const endTime = Date.now();
    const timeInMinutes = (endTime - startTime) / 60000; // Convert ms to minutes

    const wpmValue =
      timeInMinutes > 0 ? Math.round(correctLetters / 5 / timeInMinutes) : 0;

    setWpm(wpmValue);
    setIsTestFinished(true); // Mark the test as finished
  };

  const reset = (value) => {
    setCount(value);
    setInput("");
    setIndex(0);
    setStartTime(null);
    setAccuracy(0);
    setWpm(0);
    setInputs([]);
    setIsTestFinished(false); // Reset the test finish status
    generateWords(value);
  };

  return (
    <div
      className={`${background} ${text} flex h-screen w-screen flex-col justify-between p-5`}
      role="main"
      aria-label="Typing speed test application"
    >
      <header
        className={`${header} inline-flex w-full justify-evenly`}
        role="banner"
      >
        <h1 className="text-xl font-bold tracking-widest">HighKey</h1>
        <span className="cursor-default text-xl font-semibold tracking-wider">
          {[10, 25, 50, 75, 100, 150].map((value) => (
            <span key={value}>
              <button
                onClick={() => {
                  reset(value);
                }}
                disabled={value === count}
                className={` ${value === count ? "underline" : "cursor-pointer"}`}
                aria-label={`Set word count to ${value}`}
              >
                {value}
              </button>
              {value === 150 ? "" : " / "}
            </span>
          ))}
        </span>
        <button
          onClick={() => dialogRef.current?.showModal()}
          className="cursor-pointer text-xl font-semibold tracking-wider hover:underline"
          aria-label="Open theme settings"
        >
          Themes
        </button>
      </header>

      <main
        className={`${background} mx-auto flex h-full w-4xl flex-col justify-center gap-3 text-center`}
      >
        <div>
          <span className={`${header} text-lg font-semibold tracking-wider`}>
            WPM: {wpm === 0 ? "__" : wpm} / ACC:{" "}
            {accuracy === 0 ? "__" : accuracy}%
          </span>
        </div>

        <div
          className={`${card} flex w-full flex-col gap-3 rounded-lg p-3`}
          role="region"
          aria-label="Typing area"
        >
          <div className="flex flex-wrap space-x-2">
            {words.map((word, index) => (
              <p
                key={index}
                className={`${words[index] === inputs[index] ? "text-green-400" : !inputs[index] ? "" : "text-red-400"} text-left text-lg tracking-wide`}
                aria-label={`Word ${index + 1}: ${word}`}
              >
                {word}
              </p>
            ))}
          </div>

          <div className="inline-flex w-full gap-2">
            <input
              type="text"
              className={`${background} ${header} ${(words[index] && words[index].startsWith(input)) || index === words.length ? "focus:outline-0" : "focus:outline-2 focus:outline-red-400"} w-full rounded-sm p-1 text-lg`}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus
              aria-label="Type the words here"
              disabled={isTestFinished} // Disable input after test completion
            />
            <button
              onClick={() => reset(count)}
              className={`${button} ${header} w-1/6 cursor-pointer rounded-sm text-lg font-semibold`}
              aria-label="Reset typing test"
            >
              Reset
            </button>
          </div>
        </div>
      </main>

      <footer
        className={`${header} inline-flex w-full justify-evenly`}
        role="contentinfo"
      >
        <h1 className="text-xl font-bold tracking-widest">
          Developed by SerenePrince
        </h1>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/SerenePrince/HighKey"
          className="text-xl font-semibold tracking-wide hover:underline"
          aria-label="Visit GitHub repository"
        >
          GitHub
        </a>
      </footer>
      <ThemeDialog
        dialogRef={dialogRef}
        setTheme={setTheme}
        theme={theme}
        setFont={setFont}
        font={font}
      />
    </div>
  );
}

export default App;
