interface ButtonProps{
    label: string;
    onClick: () => void;
}

export const Button = ({label, onClick}: ButtonProps) => {
    return (
        <button className = " bg-blue-400 rounded-md py-2 px-2" onClick = {onClick}>
            {label}
        </button>
    )
}