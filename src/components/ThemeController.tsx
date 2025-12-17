import { Moon, SunIcon } from "lucide-react";
import { useState, useEffect } from "react";

export default function ThemeController() {
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        if (storedTheme) {
            return storedTheme;
        }
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? "dark" : "light";
    });

    useEffect(() => {
        // Apply theme to DOM and save to localStorage
        changeTheme(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);


    return (
        <div>
            <button onClick={() => {
                const newTheme = theme === "light" ? "dark" : "light";
                setTheme(newTheme);
                changeTheme(newTheme);
            }}>
                {theme === "light" ? <SunIcon size={16} /> : <Moon size={16} />}
            </button>
        </div>
    )
}


function changeTheme(theme: "light" | "dark" | "system") {
    if (theme === "light") {
        document.documentElement.classList.remove("dark")
    } else if (theme === "dark") {
        document.documentElement.classList.add("dark")
    } else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }
}
