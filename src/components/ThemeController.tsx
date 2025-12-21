import { Moon, SunIcon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { Button } from "./ui/button";
import ContractMetadataHelper from "./dev/ContractMetadataHelper";

export default function ThemeController() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div>
            <ContractMetadataHelper />
            <Button
                onClick={toggleTheme}
                variant={theme === "dark" ? "secondary" : "default"}
                aria-label="Toggle theme"
                size={"icon-lg"}
            >
                {theme === "light" ? <SunIcon size={16} /> : <Moon size={16} />}
            </Button>

        </div>
    );
}
