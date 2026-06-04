/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mission: {
          night: "#282c34",
          panel: "#111111",
          bg2: "#1e2228",
          elevated: "#20242c",
          glass: "rgba(17, 17, 17, 0.88)",
          line: "#355a66",
          accent: "#fc3d21",
          accent2: "#ff6a4f",
          cyan: "#9cdef2",
          muted: "#6b8a94",
          text: "#9cdef2",
          hud: "#fc3d21"
        },
        disaster: {
          fire: "#FF4500",
          storm: "#00BFFF",
          volcano: "#FF1744",
          flood: "#2979FF",
          drought: "#A1887F",
          ice: "#E0F7FA",
          other: "#B6E3FF"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Fira Code", "JetBrains Mono", "ui-monospace", "monospace"],
        mono: ["Fira Code", "JetBrains Mono", "ui-monospace", "monospace"]
      },
      boxShadow: {
        glow: "0 24px 60px rgba(0, 0, 0, 0.4)",
        "glow-sm": "0 0 24px rgba(252, 61, 33, 0.28)",
        panel: "0 18px 50px rgba(0, 0, 0, 0.35)"
      },
      letterSpacing: {
        hud: "0.12em",
        wide: "0.28em"
      }
    }
  },
  plugins: []
};
