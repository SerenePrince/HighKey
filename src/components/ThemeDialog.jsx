import { useEffect } from "react";
import themes from "../assets/themes.json";
import fonts from "../assets/fonts";
import PropTypes from "prop-types";

function ThemeDialog({ dialogRef, setTheme, theme, setFont, font }) {
  const { card, header, text } = themes[theme];

  // Trap focus inside the modal when it's open
  useEffect(() => {
    const dialogElement = dialogRef.current;

    if (dialogElement && dialogElement.open) {
      const focusableElements = dialogElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e) => {
        if (e.key === "Tab") {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      dialogElement.addEventListener("keydown", handleTabKey);

      // Focus the first element when the modal opens
      firstElement.focus();

      return () => {
        dialogElement.removeEventListener("keydown", handleTabKey);
      };
    }
  }, [dialogRef]);

  // Close the modal on Escape key press
  useEffect(() => {
    const dialogElement = dialogRef.current;

    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        dialogElement.close();
      }
    };

    if (dialogElement) {
      dialogElement.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      if (dialogElement) {
        dialogElement.removeEventListener("keydown", handleEscapeKey);
      }
    };
  }, [dialogRef]);

  return (
    <dialog
      ref={dialogRef}
      className="bg-transparent p-0"
      role="dialog"
      aria-labelledby="dialog-title"
      aria-modal="true"
    >
      <div className="fixed inset-0 flex items-center justify-center bg-black/25 backdrop-blur-sm">
        <div className="w-1/3 text-center">
          <h1
            id="dialog-title"
            className={`${header} mb-3 text-xl font-bold tracking-widest`}
          >
            Select a Theme
          </h1>
          <div className="grid grid-cols-3 gap-3">
            {Object.keys(themes).map((themeKey) => (
              <button
                key={themeKey}
                disabled={theme === themeKey}
                className={`${themes[themeKey].background} ${themes[themeKey].header} w-full cursor-pointer rounded-md px-3 py-2 font-semibold disabled:pointer-events-none`}
                onClick={() => {
                  setTheme(themeKey);
                  localStorage.setItem("theme", themeKey);
                }}
                aria-label={`Set theme to ${themeKey}`}
              >
                {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
              </button>
            ))}
          </div>
          <h2 className={`${header} my-3 text-xl font-bold tracking-widest`}>
            Select a Font
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {fonts.map((fontName) => (
              <button
                key={fontName}
                disabled={font === fontName}
                className={`${card} ${text} w-full cursor-pointer rounded-md px-3 py-2 font-semibold disabled:pointer-events-none`}
                style={{ fontFamily: `"${fontName}", sans-serif` }}
                onClick={() => {
                  setFont(fontName);
                  localStorage.setItem("font", fontName);
                }}
                aria-label={`Set font to ${fontName}`}
              >
                {fontName}
              </button>
            ))}
          </div>

          <button
            className={`${text} mt-3 cursor-pointer text-lg font-semibold tracking-wider hover:underline`}
            onClick={() => dialogRef.current?.close()}
            aria-label="Close theme settings"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

ThemeDialog.propTypes = {
  dialogRef: PropTypes.object.isRequired,
  setTheme: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  setFont: PropTypes.func.isRequired,
  font: PropTypes.string.isRequired,
};

export default ThemeDialog;
