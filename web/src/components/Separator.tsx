interface SeparatorProps {
    style?: "subtle" | "prominent";
    showLine?: boolean;
}

export function Separator({ style = "subtle", showLine = true }: SeparatorProps) {
    const spacingClass = style === "prominent" ? "my-12" : "my-6";
    
    return (
        <div className={spacingClass}>
            {showLine && (
                <hr
                    className={
                        style === "prominent"
                            ? "border-t-2 border-gray-400 dark:border-gray-500"
                            : "border-t border-gray-300 dark:border-gray-600"
                    }
                />
            )}
        </div>
    );
}
